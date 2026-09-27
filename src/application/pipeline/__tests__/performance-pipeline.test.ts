import type { Delegate, ILogger, IRequest } from '@xeno-js/shared'
import { Result } from '@xeno-js/shared'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { PerformancePipeline } from '../performance.pipeline'

describe('PerformancePipeline', () => {
  const request: IRequest<string> = {
    intent: 'TestIntent',
    type: 'QUERY',
  }

  const createLogger = () => {
    const info = vi.fn<ILogger['info']>()
    const warn = vi.fn<ILogger['warn']>()
    const error = vi.fn<ILogger['error']>()
    const debug = vi.fn<ILogger['debug']>()

    return {
      logger: { info, warn, error, debug } satisfies ILogger,
      warn,
    }
  }

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should reject negative thresholds', () => {
    const { logger } = createLogger()

    expect(() => new PerformancePipeline(logger, -1)).toThrow(
      'Invalid thresholdMs value: -1. It must be a positive integer.',
    )
  })

  it('should reject a zero threshold', () => {
    const { logger } = createLogger()

    expect(() => new PerformancePipeline(logger, 0)).toThrow(
      'Invalid thresholdMs value: 0. It must be a positive integer.',
    )
  })

  it('should return the result without warning when execution is within the default threshold', async () => {
    const { logger, warn } = createLogger()
    const pipeline = new PerformancePipeline(logger)
    vi.spyOn(performance, 'now').mockReturnValueOnce(100).mockReturnValueOnce(600)
    const next: Delegate<string> = vi.fn().mockResolvedValue(Result.ok('success'))

    const result = await pipeline.handle(request, next)

    expect(result.getValueOrThrow()).toBe('success')
    expect(warn).not.toHaveBeenCalled()
  })

  it('should warn when execution exceeds a custom threshold', async () => {
    const { logger, warn } = createLogger()
    const pipeline = new PerformancePipeline(logger, 100)
    vi.spyOn(performance, 'now').mockReturnValueOnce(0).mockReturnValueOnce(150)
    const next: Delegate<string> = vi.fn().mockResolvedValue(Result.ok('success'))

    const result = await pipeline.handle(request, next)

    expect(result.getValueOrThrow()).toBe('success')
    expect(warn).toHaveBeenCalledWith('Performance warning: TestIntent took 150.00ms')
  })

  it('should warn in finally and rethrow when next fails', async () => {
    const { logger, warn } = createLogger()
    const pipeline = new PerformancePipeline(logger, 10)
    vi.spyOn(performance, 'now').mockReturnValueOnce(20).mockReturnValueOnce(45)
    const exception = new Error('request failed')
    const next: Delegate<string> = vi.fn().mockRejectedValue(exception)

    await expect(pipeline.handle(request, next)).rejects.toBe(exception)

    expect(warn).toHaveBeenCalledWith('Performance warning: TestIntent took 25.00ms')
  })
})
