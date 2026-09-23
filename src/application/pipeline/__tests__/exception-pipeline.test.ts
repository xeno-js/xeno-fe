import type { Delegate, IRequest } from '@xeno-js/shared'
import { AppError, ERROR_CODE_MESSAGES, ERROR_CODES, Result, STATUS_CODES } from '@xeno-js/shared'
import { describe, expect, it, vi } from 'vitest'

import { ExceptionPipeline } from '../exception.pipeline'

describe('ExceptionPipeline', () => {
  const request: IRequest<string> = {
    intent: 'TestIntent',
    type: 'QUERY',
  }

  it('should return the result from next when no exception is thrown', async () => {
    const pipeline = new ExceptionPipeline()
    const next: Delegate<string> = vi.fn().mockResolvedValue(Result.ok('success'))

    const result = await pipeline.handle(request, next)

    expect(next).toHaveBeenCalledOnce()
    expect(result.isOk()).toBe(true)
    expect(result.getValueOrThrow()).toBe('success')
  })

  it('should return the original AppError when next throws one', async () => {
    const pipeline = new ExceptionPipeline()
    const error = AppError.aborted('ExistingError')
    const next: Delegate<string> = vi.fn().mockRejectedValue(error)

    const result = await pipeline.handle(request, next)

    expect(result.isOk()).toBe(false)
    expect(result.getErrorOrThrow()).toBe(error)
  })

  it('should wrap unknown exceptions in a system AppError', async () => {
    const pipeline = new ExceptionPipeline()
    const cause = new Error('unexpected failure')
    const next: Delegate<string> = vi.fn().mockRejectedValue(cause)

    const result = await pipeline.handle(request, next)
    const error = result.getErrorOrThrow()

    expect(result.isOk()).toBe(false)
    expect(error).toMatchObject({
      code: ERROR_CODES.SYSTEM_ERROR,
      message: ERROR_CODE_MESSAGES[ERROR_CODES.SYSTEM_ERROR],
      status: STATUS_CODES.INTERNAL_SERVER_ERROR,
      name: request.intent,
      cause,
    })
  })
})
