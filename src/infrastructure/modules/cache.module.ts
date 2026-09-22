import type { ICache, ICacheKeyBuilder, IIdentityAccessor, Optional } from '@xeno-js/shared'

import type { CacheConfig } from './config/cache.config'

interface CacheResponse {
  cache: Optional<ICache>
  cacheKeyBuilder: ICacheKeyBuilder
}

/**
 * @description Module responsible for configuring and instantiating the frontend BaseLogger.
 * Employs code-splitting via dynamic import() to ensure unused logging drivers (like Sentry)
 * are excluded from the initial browser bundle.
 *
 * @author Xeno
 * @version 1.0.0
 * @since 2025-09-30
 * @link https://github.com/xeno-js/xeno-js
 */
export class CacheModule {
  /**
   * Assembles cache clients on-demand and returns a fully initialized Cache and CacheKeyBuilder instance.
   *
   * @param config The module configuration.
   * @returns Configured cache and cache key builder instance.
   */
  public static async create(
    config: CacheConfig,
    ctx: Optional<IIdentityAccessor>,
  ): Promise<CacheResponse> {
    const { RequestContextAccessor } = await import('../context')
    const contexAccessor = ctx ?? new RequestContextAccessor()

    const { CacheKeyBuilder } = await import('@xeno-js/shared')
    const cacheKeyBuilder = new CacheKeyBuilder(contexAccessor)

    const response: CacheResponse = {
      cache: undefined,
      cacheKeyBuilder,
    }

    if (config.inMemory) {
      const { InMemoryCache } = await import('@xeno-js/shared')
      response.cache = new InMemoryCache()
    }

    return response
  }
}
