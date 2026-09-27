import type { Delegate, IRequest, ResultType } from '@xeno-js/shared'

/**
 * @description An interface that defines the contract for a pipeline behavior in a CQRS architecture. This interface requires the implementation of a handle method that takes an IRequest instance and a Delegate instance as parameters and returns a Promise that resolves to a ResultType instance. The handle method is responsible for processing the request and invoking the next behavior in the pipeline.
 *
 * @author Xeno
 * @version 1.0.0
 * @since 2025-09-30
 * @link https://github.com/xeno-js/xeno-js
 */
export interface IPipeline {
  /**
   * @description A method that handles the request and invokes the next behavior in the pipeline.
   *
   * @param req - The request to be handled.
   * @param next - The delegate to invoke the next behavior in the pipeline.
   * @returns A Promise that resolves to a ResultType instance.
   *
   * @author Xeno
   * @version 1.0.0
   * @since 2025-09-30
   * @link https://github.com/xeno-js/xeno-js
   */
  handle<TResult>(req: IRequest<TResult>, next: Delegate<TResult>): Promise<ResultType<TResult>>
}
