import type { Delegate, ILogger, IRequest, ResultType } from '@xeno-js/shared'
import { Guards } from '@xeno-js/shared'

import type { IPipeline } from '@/domain'

/**
 * @description Default threshold in milliseconds for logging performance warnings. If a request takes longer than this threshold to execute, a warning will be logged. This value can be overridden by providing a different thresholdMs value when constructing the PerformancePipeline instance.

   * 
   * @author Xeno
   * @version 1.0.0
   * @since 2025-09-30
   * @link https://github.com/Mattia-Carcione/xeno-js 
   */
const defaultThresholdMs = 500

/**
 * @description A pipeline behavior that measures the execution time of commands and queries, logging a warning if the execution time exceeds a specified threshold. This pipeline can be used to identify performance bottlenecks in the application and ensure that requests are processed within acceptable time limits.
 *
 * @template TInput - The type of the input request, which must extend the IRequest interface.
 * @template TResult - The type of the result returned by the request handler.

   * 
   * @author Xeno
   * @version 1.0.0
   * @since 2025-09-30
   * @link https://github.com/Mattia-Carcione/xeno-js 
   */
export class PerformancePipeline implements IPipeline {
    /**
     * @description Threshold in milliseconds for logging performance warnings. If a request takes longer than this threshold to execute, a warning will be logged. This value is set through the constructor and must be a positive integer.
    
     * 
     * @author Xeno
     * @version 1.0.0
     * @since 2025-09-30
     * @link https://github.com/Mattia-Carcione/xeno-js 
     */
    private readonly _thresholdMs: number

    /**
     * @description Constructs a new instance of the PerformancePipeline class, which requires an ILogger for logging. The pipeline will use this dependency to log performance-related information about each request being handled, including any warnings when execution times exceed the specified threshold.
     * @param _logger An instance of ILogger used for logging performance warnings related to the handling of requests.
     * @param thresholdMs An optional parameter that specifies the execution time threshold in milliseconds. If a request takes longer than this threshold to execute, a warning will be logged. The default value is 500ms.
     * @throws Will throw an error if the provided thresholdMs value is not a positive integer.
    
     * 
     * @author Xeno
     * @version 1.0.0
     * @since 2025-09-30
     * @link https://github.com/Mattia-Carcione/xeno-js 
     */
    constructor(
        private readonly _logger: ILogger,
        thresholdMs: number = defaultThresholdMs,
    ) {
        const message = `Invalid thresholdMs value: ${thresholdMs}. It must be a positive integer.`
        Guards.throwIfNegative(thresholdMs, message)
        if (thresholdMs === 0) {
            throw new Error(message)
        }
        this._thresholdMs = thresholdMs
    }

    public async handle<TResult>(request: IRequest<TResult>, next: Delegate<TResult>): Promise<ResultType<TResult>> {
        const startTime = performance.now()
        try {
            return await next()
        } finally {
            const endTime = performance.now()
            const duration = endTime - startTime

            if (duration > this._thresholdMs) {
                this._logger.warn(`Performance warning: ${request.intent} took ${duration.toFixed(2)}ms`)
            }
        }
    }
}