import type { Delegate, ICommand, IQuery, ResultType } from '@xeno-js/shared'

/**
 * @description An interface that defines the contract for a client mediator in a CQRS architecture. This interface requires the implementation of two methods: send and query, which are responsible for sending commands and queries to the server and receiving the corresponding results. The send method takes an ICommand instance and a Delegate instance as parameters and returns a Promise that resolves to a ResultType instance. The query method takes an IQuery instance and a Delegate instance as parameters and returns a Promise that resolves to a ResultType instance. The client mediator acts as a bridge between the client and the server, allowing for the execution of commands and queries in a CQRS architecture.
 *
 * @author Xeno
 * @version 1.0.0
 * @since 2025-09-30
 * @link https://github.com/xeno-js/xeno-fe
 */
export interface IClientMediator {
  /**
   * @description Sends a command to the server and receives the corresponding result.
   *
   * @param data - The command to be sent to the server.
   * @param action - A delegate function that is invoked with the result of the command.
   * @returns A promise that resolves to the result of the command.
   *
   * @author Xeno
   * @version 1.0.0
   * @since 2025-09-30
   * @link https://github.com/xeno-js/xeno-fe
   */
  send<TResult>(data: ICommand<TResult>, action: Delegate<TResult>): Promise<ResultType<TResult>>

  /**
   * @description Sends a query to the server and receives the corresponding result.
   *
   * @param data - The query to be sent to the server.
   * @param action - A delegate function that is invoked with the result of the query.
   * @returns A promise that resolves to the result of the query.
   *
   * @author Xeno
   * @version 1.0.0
   * @since 2025-09-30
   * @link https://github.com/xeno-js/xeno-fe
   */
  query<TResult>(data: IQuery<TResult>, action: Delegate<TResult>): Promise<ResultType<TResult>>
}
