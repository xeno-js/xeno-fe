import type {
  HttpBaseRequest,
  HttpRequest,
  IHttpClient,
  IRemoteDataSource,
  ResultType,
} from '@xeno-js/shared'
import { Result } from '@xeno-js/shared'

/**
 * @description Concrete implementation of the IRemoteDataSource contract that utilizes an agnostic HTTP client and a resilience service to fetch data from remote endpoints. The RemoteDataSource class is responsible for sending HTTP requests based on the provided HttpClientRequest parameters, while leveraging the resilience features of the IServiceResilience to ensure reliable communication with external services. This implementation abstracts away the details of how HTTP requests are made and how resilience is handled, allowing for flexibility in choosing different HTTP clients and resilience strategies without affecting the consumers of the IRemoteDataSource interface.
 *
 * @author Xeno
 * @version 1.0.0
 * @since 2025-09-30
 * @link https://github.com/xeno-js/xeno-js
 */
export abstract class RemoteDataSource implements IRemoteDataSource {
  /** The constructor of the RemoteDataSource class takes two dependencies: an instance of an agnostic HTTP client that implements the IHttpClient interface, and an instance of a resilience service that implements the IServiceResilience interface.
   * These dependencies are injected into the class, allowing for greater flexibility and testability.
   * The HTTP client is used to send requests to remote endpoints, while the resilience service is used to execute these requests with built-in support for retries, timeouts, and circuit breakers, ensuring that the remote calls are more resilient to failures and can recover gracefully from errors.
   * @param _httpClient An instance of an agnostic HTTP client that implements the IHttpClient interface, used for sending HTTP requests to remote endpoints.
   *
   * @author Xeno
   * @version 1.0.0
   * @since 2025-09-30
   * @link https://github.com/xeno-js/xeno-js
   */
  constructor(private readonly _httpClient: IHttpClient) {}

  public async get<TResponse>(
    endpoint: string,
    request?: HttpBaseRequest,
  ): Promise<ResultType<TResponse>> {
    const options: HttpRequest = {
      query: request?.query,
      signal: request?.signal,
      timeoutMs: request?.timeoutMs,
      headers: request?.headers,
      method: 'GET',
    }

    const response = await this._httpClient.get<TResponse>(endpoint, options)
    return Result.ok(response.data)
  }

  public async post<TResponse, TBody = unknown>(
    endpoint: string,
    body: TBody,
    request?: HttpBaseRequest,
  ): Promise<ResultType<TResponse>> {
    const options: HttpRequest<TBody> = {
      query: request?.query,
      signal: request?.signal,
      timeoutMs: request?.timeoutMs,
      headers: request?.headers,
      method: 'POST',
      body,
    }

    const response = await this._httpClient.post<TResponse, TBody>(endpoint, options.body, options)
    return Result.ok(response.data)
  }

  public async put<TResponse, TBody = unknown>(
    endpoint: string,
    body: TBody,
    request?: HttpBaseRequest,
  ): Promise<ResultType<TResponse>> {
    const options: HttpRequest<TBody> = {
      query: request?.query,
      signal: request?.signal,
      timeoutMs: request?.timeoutMs,
      headers: request?.headers,
      method: 'PUT',
      body,
    }

    const response = await this._httpClient.put<TResponse, TBody>(endpoint, options.body, options)
    return Result.ok(response.data)
  }

  public async patch<TResponse, TBody = unknown>(
    endpoint: string,
    body: TBody,
    request?: HttpBaseRequest,
  ): Promise<ResultType<TResponse>> {
    const options: HttpRequest<TBody> = {
      query: request?.query,
      signal: request?.signal,
      timeoutMs: request?.timeoutMs,
      headers: request?.headers,
      method: 'PATCH',
      body,
    }

    const response = await this._httpClient.patch<TResponse, TBody>(endpoint, options.body, options)
    return Result.ok(response.data)
  }

  public async delete<TResponse>(
    endpoint: string,
    request?: HttpBaseRequest,
  ): Promise<ResultType<TResponse>> {
    const options: HttpRequest = {
      query: request?.query,
      signal: request?.signal,
      timeoutMs: request?.timeoutMs,
      headers: request?.headers,
      method: 'DELETE',
    }

    const response = await this._httpClient.delete<TResponse>(endpoint, options)
    return Result.ok(response.data)
  }
}
