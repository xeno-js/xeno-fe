import type { Delegate, ILogger, IRequest } from '@xeno-js/shared'
import { AppError, Result } from '@xeno-js/shared'
import { describe, expect, it, vi } from 'vitest'

import { LoggingPipeline } from '../logging.pipeline'

describe('LoggingPipeline', () => {
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
      info,
      warn,
      error,
      debug,
    }
  }

  it('should log and return a successful result', async () => {
    const { logger, info, error } = createLogger()
    const pipeline = new LoggingPipeline(logger)
    const next: Delegate<string> = vi.fn().mockResolvedValue(Result.ok('success'))

    const result = await pipeline.handle(request, next)

    expect(result.isOk()).toBe(true)
    expect(result.getValueOrThrow()).toBe('success')
    expect(info).toHaveBeenNthCalledWith(1, 'Handling QUERY TestIntent')
    expect(info).toHaveBeenNthCalledWith(2, 'Successfully handled TestIntent')
    expect(error).not.toHaveBeenCalled()
  })

  it('should log and return a failed result', async () => {
    const { logger, info, error } = createLogger()
    const pipeline = new LoggingPipeline(logger)
    const failure = AppError.aborted('TestFailure')
    const next: Delegate<string> = vi.fn().mockResolvedValue(Result.fail<string, AppError>(failure))

    const result = await pipeline.handle(request, next)

    expect(result.isOk()).toBe(false)
    expect(result.getErrorOrThrow()).toBe(failure)
    expect(info).toHaveBeenCalledWith('Handling QUERY TestIntent')
    expect(error).toHaveBeenCalledWith('Failed to handle TestIntent: errors.aborted', failure)
  })

  it('should log and rethrow exceptions from next', async () => {
    const { logger, info, error } = createLogger()
    const pipeline = new LoggingPipeline(logger)
    const exception = new Error('unexpected failure')
    const next: Delegate<string> = vi.fn().mockRejectedValue(exception)

    await expect(pipeline.handle(request, next)).rejects.toBe(exception)

    expect(info).toHaveBeenCalledWith('Handling QUERY TestIntent')
    expect(error).toHaveBeenCalledWith('Exception while handling TestIntent', exception)
  })
})
