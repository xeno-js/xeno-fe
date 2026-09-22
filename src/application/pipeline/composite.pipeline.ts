import type { Delegate, IRequest, ResultType } from '@xeno-js/shared'

import type { IPipeline } from '@/domain'

/**
 * @description A composite pipeline behavior that allows for the combination of multiple pipeline behaviors into a single pipeline. This class takes an array of IPipelineBehavior instances and executes them in the order they were provided, allowing for a structured and modular approach to handling requests in a CQRS architecture. Each behavior can perform specific actions before and after invoking the next behavior in the pipeline, enabling cross-cutting concerns to be applied consistently across all requests.
 *
 * @author Xeno
 * @version 1.0.0
 * @since 2025-09-30
 * @link https://github.com/xeno-js/xeno-js
 */
export class CompositePipeline implements IPipeline {
  /**
   * @description Constructs a new instance of the CompositePipeline class, which takes an optional array of IPipelineBehavior instances. If no behaviors are provided, it initializes with an empty array. The composite pipeline will execute each behavior in the order they were provided, allowing for a flexible and modular approach to handling requests in a CQRS architecture.
   * @param _pipelines An optional array of IPipelineBehavior instances that represent the individual behaviors to be combined into the composite pipeline.
   *
   * @author Xeno
   * @version 1.0.0
   * @since 2025-09-30
   * @link https://github.com/xeno-js/xeno-js
   */
  constructor(private readonly _pipelines: readonly IPipeline[] = []) {}

  async handle<TResult>(
    request: IRequest<TResult>,
    next: Delegate<TResult>,
  ): Promise<ResultType<TResult>> {
    let currentNext = next

    for (let i = this._pipelines.length - 1; i >= 0; i--) {
      const currentBehavior = this._pipelines[i]
      const previousNext = currentNext

      currentNext = () => currentBehavior.handle(request, previousNext)
    }

    return currentNext()
  }
}
