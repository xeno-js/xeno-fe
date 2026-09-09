import type { Delegate, IRequest, IValidatorService, ResultType } from '@xeno-js/shared'
import { Result } from '@xeno-js/shared'

import type { IPipeline } from '@/domain'

/**
 * @description A pipeline behavior that performs validation on the incoming request in a CQRS architecture. It checks if the request has a validate method and, if so, invokes it to perform validation. If the validation fails, it returns a failed Result containing the validation error. If the validation succeeds or if there is no validate method, it proceeds to the next behavior in the pipeline. This allows for a structured approach to ensuring that requests meet certain criteria before being processed further in the CQRS pipeline.

   * 
   * @author Xeno
   * @version 1.0.0
   * @since 2025-09-30
   * @link https://github.com/Mattia-Carcione/xeno-js 
   */
export class ValidationPipeline implements IPipeline {
    /** @description Constructs a new instance of the ValidationPipeline class, which takes an array of IStrategy instances as validators. These validators are used to perform validation checks on the incoming requests. The constructor initializes the pipeline with the provided validators, allowing it to execute the validation logic when handling requests in the CQRS pipeline.
     * @param _validators An array of IStrategy instances that represent the validation strategies to be applied to incoming requests. Each strategy should implement the isApplicable method to determine if it should be applied to a given request and the execute method to perform the actual validation logic, returning a Result indicating the success or failure of the validation.
    
     * 
     * @author Xeno
     * @version 1.0.0
     * @since 2025-09-30
     * @link https://github.com/Mattia-Carcione/xeno-js 
     */
    constructor(private readonly _validator: IValidatorService) { }

    public async handle<TResult>(request: IRequest<TResult>, next: Delegate<TResult>): Promise<ResultType<TResult>> {
        const result = await this._validator.validate(request.intent, request)
        if (!result.isOk())
            return Result.fail(result.getErrorOrThrow())
        return next()
    }
}