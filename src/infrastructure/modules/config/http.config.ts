import type { HttpClientConfig, IHttpClient } from '@xeno-js/shared'

/**
 * @description Interface that represents the configuration for the http module.
 * @author Xeno
 * @version 1.0.0
 * @since 2025-09-30
 * @link https://github.com/xeno-js/xeno-js
 */
export interface HttpCoreVueConfig<TRegistry, K extends keyof TRegistry> {
  /**
   * @description The configuration for the http client.
   */
  client: HttpClientConfig
  /**
   * @description The factory function that creates the http client.
   */
  factory: (http: IHttpClient) => TRegistry[K]
}
