
import type { Delegate, IRequest, ResultType } from '@xeno-js/shared'
import { AppError, ERROR_CODE_MESSAGES, ERROR_CODES, Result, STATUS_CODES } from '@xeno-js/shared'

import type { IPipeline } from '@/domain'

/**
 * @description A pipeline behavior that handles exceptions thrown during the execution of a request in the CQRS pattern. It catches any unhandled exceptions, wraps them in an AppError with a standardized error code and message, and returns a failed Result containing the AppError. This ensures that exceptions are consistently handled and logged across the application, providing a clear mechanism for error reporting and debugging in the context of CQRS pipelines.
 * @template TInput - The type of the input request, which must extend IRequest.
 * @template TResult - The type of the result returned by the pipeline, which can be any type.
 *
 * @author Xeno
 * @version 1.0.0
 * @since 2025-09-30
 * @link https://github.com/Mattia-Carcione/xeno-js
 */
export class ExceptionPipeline implements IPipeline {
    public async handle<TResult>(request: IRequest<TResult>, next: Delegate<TResult>): Promise<ResultType<TResult>> {
        try {
            return await next()
        } catch (error: unknown) {
            if (error instanceof AppError) return Result.fail(error)

            const appError = AppError.create({
                code: ERROR_CODES.SYSTEM_ERROR,
                message: ERROR_CODE_MESSAGES[ERROR_CODES.SYSTEM_ERROR],
                status: STATUS_CODES.INTERNAL_SERVER_ERROR,
                name: request.intent,
                cause: error,
            })
            return Result.fail(appError)
        }
    }
}