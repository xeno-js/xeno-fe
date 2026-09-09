import type { Delegate, ILogger, IRequest, ResultType } from '@xeno-js/shared'

import type { IPipeline } from '@/domain'

/**
 * @description A pipeline behavior that logs the handling of commands and queries, including their success or failure, along with contextual information such as request ID, correlation ID, and user ID.
 * This pipeline can be used to enhance observability and debugging capabilities in the application by providing detailed logs for each request processed through the CQRS pipeline.
 *
 * @template TInput - The type of the input request, which must extend the IRequest interface.
 * @template TResult - The type of the result returned by the request handler.

   * 
   * @author Xeno
   * @version 1.0.0
   * @since 2025-09-30
   * @link https://github.com/Mattia-Carcione/xeno-js 
   */
export class LoggingPipeline implements IPipeline {
    /**
     * @description Constructs a new instance of the LoggingPipeline class, which requires an ILogger for logging. The pipeline will use this dependency to log relevant information about each request being handled, including any errors that occur during processing.
     * @param _logger An instance of ILogger used for logging informational messages and errors related to the handling of requests.
    
     * 
     * @author Xeno
     * @version 1.0.0
     * @since 2025-09-30
     * @link https://github.com/Mattia-Carcione/xeno-js 
     */
    constructor(private readonly _logger: ILogger) { }

    public async handle<TResult>(request: IRequest<TResult>, next: Delegate<TResult>): Promise<ResultType<TResult>> {
        this._logger.info(`Handling ${request.type} ${request.intent}`)

        try {
            const result = await next()

            if (!result.isOk()) {
                const error = result.getErrorOrThrow()
                this._logger.error(
                    `Failed to handle ${request.intent}: ${error.message}`,
                    error,
                )
            } else {
                this._logger.info(`Successfully handled ${request.intent}`)
            }

            return result
        } catch (error: unknown) {
            this._logger.error(`Exception while handling ${request.intent}`, error)
            throw error
        }
    }
}