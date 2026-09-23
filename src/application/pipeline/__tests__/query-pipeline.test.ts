import type { Delegate, ICache, ICacheKeyBuilder, ILogger, IQuery, IRequest } from '@xeno-js/shared'
import { AppError, Result } from '@xeno-js/shared'
import { describe, expect, it, vi } from 'vitest'

import { QueryCachingPipeline } from '../query.pipeline'

describe('QueryCachingPipeline', () => {
  const createLogger = () => {
    const info = vi.fn<ILogger['info']>()
    const warn = vi.fn<ILogger['warn']>()
    const error = vi.fn<ILogger['error']>()
    const debug = vi.fn<ILogger['debug']>()

    return {
      logger: { info, warn, error, debug } satisfies ILogger,
      warn,
      debug,
    }
  }

  const createCache = (cachedResponse?: string) => {
    const cache: ICache = {
      async get<T>() {
        return cachedResponse as unknown as T | undefined
      },
      async set() {
        return
      },
      async setIfAbsent() {
        return true
      },
      async remove() {
        return
      },
      async has() {
        return false
      },
      async clear() {
        return
      },
    }
    return {
      cache,
      get: vi.spyOn(cache, 'get'),
      set: vi.spyOn(cache, 'set'),
    }
  }

  const createKeyBuilder = () => {
    const contextual = vi.fn((key: string) => `context:${key}`)
    const userScoped = vi.fn((key: string) => `user:${key}`)
    const keyBuilder: ICacheKeyBuilder = {
      buildContextualKey: contextual,
      buildUserScopedKey: userScoped,
    }
    return { keyBuilder, contextual, userScoped }
  }

  const createQuery = (overrides: Partial<IQuery<string>> = {}): IQuery<string> => ({
    intent: 'FindItem',
    type: 'QUERY',
    cacheOptions: {
      cacheKey: 'items:1',
      ttl: 60,
      bypassCache: false,
      consistentRead: false,
      isUserScoped: false,
    },
    ...overrides,
  })

  it('should delegate non-query requests without using the cache', async () => {
    const cache = createCache()
    const keys = createKeyBuilder()
    const { logger } = createLogger()
    const pipeline = new QueryCachingPipeline(cache.cache, keys.keyBuilder, logger)
    const request: IRequest<string> = { intent: 'RunCommand', type: 'COMMAND' }
    const next: Delegate<string> = vi.fn().mockResolvedValue(Result.ok('command-result'))

    const result = await pipeline.handle(request, next)

    expect(result.getValueOrThrow()).toBe('command-result')
    expect(next).toHaveBeenCalledOnce()
    expect(cache.get).not.toHaveBeenCalled()
  })

  it('should delegate queries without cache options', async () => {
    const cache = createCache()
    const keys = createKeyBuilder()
    const { logger } = createLogger()
    const pipeline = new QueryCachingPipeline(cache.cache, keys.keyBuilder, logger)
    const request: IRequest<string> = { intent: 'FindItem', type: 'QUERY' }
    const next: Delegate<string> = vi.fn().mockResolvedValue(Result.ok('database-result'))

    const result = await pipeline.handle(request, next)

    expect(result.getValueOrThrow()).toBe('database-result')
    expect(next).toHaveBeenCalledOnce()
    expect(cache.get).not.toHaveBeenCalled()
  })

  it('should return a cached response for a cache hit', async () => {
    const cache = createCache('cached-result')
    const keys = createKeyBuilder()
    const { logger, debug } = createLogger()
    const pipeline = new QueryCachingPipeline(cache.cache, keys.keyBuilder, logger)
    const next: Delegate<string> = vi.fn()

    const result = await pipeline.handle(createQuery(), next)

    expect(result.getValueOrThrow()).toBe('cached-result')
    expect(cache.get).toHaveBeenCalledWith('context:items:1')
    expect(next).not.toHaveBeenCalled()
    expect(debug).toHaveBeenCalledWith('[Cache HIT] Returning data from cache for: items:1')
  })

  it('should use a user-scoped key and save a cache miss result', async () => {
    const cache = createCache()
    const keys = createKeyBuilder()
    const { logger, debug } = createLogger()
    const pipeline = new QueryCachingPipeline(cache.cache, keys.keyBuilder, logger)
    const next: Delegate<string> = vi.fn().mockResolvedValue(Result.ok('database-result'))

    const result = await pipeline.handle(
      createQuery({
        cacheOptions: {
          cacheKey: 'items:1',
          ttl: 60,
          bypassCache: false,
          consistentRead: false,
          isUserScoped: true,
        },
      }),
      next,
    )

    expect(result.getValueOrThrow()).toBe('database-result')
    expect(keys.userScoped).toHaveBeenCalledWith('items:1')
    expect(cache.set).toHaveBeenCalledWith('user:items:1', 'database-result', 60)
    expect(debug).toHaveBeenCalledWith('[Cache SET] Data saved in cache for: user:items:1')
  })

  it('should bypass reads and save successful results when requested', async () => {
    const cache = createCache()
    const keys = createKeyBuilder()
    const { logger } = createLogger()
    const pipeline = new QueryCachingPipeline(cache.cache, keys.keyBuilder, logger)
    const next: Delegate<string> = vi.fn().mockResolvedValue(Result.ok('fresh-result'))

    await pipeline.handle(
      createQuery({
        cacheOptions: {
          cacheKey: 'items:1',
          ttl: undefined,
          bypassCache: true,
          consistentRead: false,
          isUserScoped: false,
        },
      }),
      next,
    )

    expect(cache.get).not.toHaveBeenCalled()
    expect(cache.set).toHaveBeenCalledWith('context:items:1', 'fresh-result', undefined)
  })

  it('should bypass reads when consistent read is requested', async () => {
    const cache = createCache()
    const keys = createKeyBuilder()
    const { logger } = createLogger()
    const pipeline = new QueryCachingPipeline(cache.cache, keys.keyBuilder, logger)
    const next: Delegate<string> = vi.fn().mockResolvedValue(Result.ok('fresh-result'))

    await pipeline.handle(
      createQuery({
        cacheOptions: {
          cacheKey: 'items:1',
          ttl: undefined,
          bypassCache: false,
          consistentRead: true,
          isUserScoped: false,
        },
      }),
      next,
    )

    expect(cache.get).not.toHaveBeenCalled()
  })

  it('should return failed results without writing them to cache', async () => {
    const cache = createCache()
    const keys = createKeyBuilder()
    const { logger } = createLogger()
    const pipeline = new QueryCachingPipeline(cache.cache, keys.keyBuilder, logger)
    const failure = AppError.aborted('QueryFailure')
    const next: Delegate<string> = vi.fn().mockResolvedValue(Result.fail<string, AppError>(failure))

    const result = await pipeline.handle(createQuery(), next)

    expect(result.getErrorOrThrow()).toBe(failure)
    expect(cache.set).not.toHaveBeenCalled()
  })

  it('should continue to the handler when reading the cache fails', async () => {
    const cache = createCache()
    cache.get.mockRejectedValueOnce(new Error('read failed'))
    const keys = createKeyBuilder()
    const { logger, warn } = createLogger()
    const pipeline = new QueryCachingPipeline(cache.cache, keys.keyBuilder, logger)
    const next: Delegate<string> = vi.fn().mockResolvedValue(Result.ok('database-result'))

    await pipeline.handle(createQuery(), next)

    expect(next).toHaveBeenCalledOnce()
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('read failed'))
  })

  it('should stringify non-Error cache read failures', async () => {
    const cache = createCache()
    cache.get.mockRejectedValueOnce('read failed')
    const keys = createKeyBuilder()
    const { logger, warn } = createLogger()
    const pipeline = new QueryCachingPipeline(cache.cache, keys.keyBuilder, logger)
    const next: Delegate<string> = vi.fn().mockResolvedValue(Result.ok('database-result'))

    await pipeline.handle(createQuery(), next)

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('read failed'))
  })

  it('should warn and return the result when writing the cache fails', async () => {
    const cache = createCache()
    cache.set.mockRejectedValueOnce(new Error('write failed'))
    const keys = createKeyBuilder()
    const { logger, warn } = createLogger()
    const pipeline = new QueryCachingPipeline(cache.cache, keys.keyBuilder, logger)
    const next: Delegate<string> = vi.fn().mockResolvedValue(Result.ok('database-result'))

    const result = await pipeline.handle(createQuery(), next)

    expect(result.getValueOrThrow()).toBe('database-result')
    expect(warn).toHaveBeenCalledWith(expect.stringContaining('write failed'))
  })

  it('should stringify non-Error cache write failures', async () => {
    const cache = createCache()
    cache.set.mockRejectedValueOnce('write failed')
    const keys = createKeyBuilder()
    const { logger, warn } = createLogger()
    const pipeline = new QueryCachingPipeline(cache.cache, keys.keyBuilder, logger)
    const next: Delegate<string> = vi.fn().mockResolvedValue(Result.ok('database-result'))

    await pipeline.handle(createQuery(), next)

    expect(warn).toHaveBeenCalledWith(expect.stringContaining('write failed'))
  })
})
