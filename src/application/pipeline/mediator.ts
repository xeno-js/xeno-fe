import type { Delegate, IQuery, IRequest, ResultType } from "@xeno-js/shared"

import type { IClientMediator, IPipeline } from "@/domain"

export class ClientMediator implements IClientMediator {
    constructor(
        private readonly _commandPipeline: IPipeline,
        private readonly _queryPipeline: IPipeline,
    ) { }

    public async send<TResult>(
        data: IRequest<TResult>,
        action: Delegate<TResult>
    ): Promise<ResultType<TResult>> {
        return this._commandPipeline.handle<TResult>(data, action)
    }

    public async query<TResult>(
        data: IQuery<TResult>,
        action: Delegate<TResult>
    ): Promise<ResultType<TResult>> {
        return this._queryPipeline.handle(data, action)
    }
}