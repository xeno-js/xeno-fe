import type { Delegate, ICommand, IQuery, ResultType } from '@xeno-js/shared'

import type { IClientMediator, IPipeline } from '@/domain'

/**
 * @description A client-side mediator implementation that handles both commands and queries in a CQRS architecture. It uses two separate pipelines, one for commands and one for queries, to ensure that each type of request is handled appropriately. The mediator also provides a way to send commands and queries to the server-side mediator for processing.
 *
 * @author Xeno
 * @version 1.0.0
 * @since 2025-09-30
 * @link https://github.com/xeno-js/xeno-fe
 */
export class ClientMediator implements IClientMediator {
  constructor(
    private readonly _commandPipeline: IPipeline,
    private readonly _queryPipeline: IPipeline,
  ) {}

  public async send<TResult>(
    data: ICommand<TResult>,
    action: Delegate<TResult>,
  ): Promise<ResultType<TResult>> {
    return this._commandPipeline.handle<TResult>(data, action)
  }

  public async query<TResult>(
    data: IQuery<TResult>,
    action: Delegate<TResult>,
  ): Promise<ResultType<TResult>> {
    return this._queryPipeline.handle(data, action)
  }
}
