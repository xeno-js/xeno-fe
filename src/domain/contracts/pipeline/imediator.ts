import type { Delegate, ICommand, IQuery, ResultType } from "@xeno-js/shared"

export interface IClientMediator {
    send<TResult>(data: ICommand<TResult>, action: Delegate<TResult>): Promise<ResultType<TResult>>

    query<TResult>(
        data: IQuery<TResult>,
        action: Delegate<TResult>
    ): Promise<ResultType<TResult>>
}