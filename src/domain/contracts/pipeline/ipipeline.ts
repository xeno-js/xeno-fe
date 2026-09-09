import type { Delegate, IRequest, ResultType } from "@xeno-js/shared";

export interface IPipeline {
    handle<TResult>(req: IRequest<TResult>, next: Delegate<TResult>): Promise<ResultType<TResult>>
}