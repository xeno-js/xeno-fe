import type { Delegate, IRequest, IValidatorService } from '@xeno-js/shared'
import { AppError, Result } from '@xeno-js/shared'
import { describe, expect, it, vi } from 'vitest'

import { ValidationPipeline } from '../validation.pipeline'

describe('ValidationPipeline', () => {
  const request: IRequest<string> = {
    intent: 'TestIntent',
    type: 'QUERY',
  }

  const createValidator = () => {
    const validator: IValidatorService = {
      async validate() {
        return Result.ok(true)
      },
      addSchema() {
        return undefined
      },
    }
    return {
      validator,
      validate: vi.spyOn(validator, 'validate'),
    }
  }

  it('should call next when validation succeeds', async () => {
    const { validator, validate } = createValidator()
    const pipeline = new ValidationPipeline(validator)
    const next: Delegate<string> = vi.fn().mockResolvedValue(Result.ok('success'))

    const result = await pipeline.handle(request, next)

    expect(validate).toHaveBeenCalledWith('TestIntent', request)
    expect(next).toHaveBeenCalledOnce()
    expect(result.getValueOrThrow()).toBe('success')
  })

  it('should return the validation error without calling next', async () => {
    const { validator, validate } = createValidator()
    const validationError = AppError.aborted('ValidationFailure')
    validate.mockResolvedValue(Result.fail<boolean, AppError>(validationError))
    const pipeline = new ValidationPipeline(validator)
    const next: Delegate<string> = vi.fn().mockResolvedValue(Result.ok('success'))

    const result = await pipeline.handle(request, next)

    expect(validate).toHaveBeenCalledWith('TestIntent', request)
    expect(next).not.toHaveBeenCalled()
    expect(result.isOk()).toBe(false)
    expect(result.getErrorOrThrow()).toBe(validationError)
  })
})
