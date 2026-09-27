import type { HttpClientConfig, IHttpClient, Optional } from '@xeno-js/shared'

/**
 * @description Interface that represents the configuration for the cookie.
 * @author Xeno
 * @version 1.0.0
 * @since 2025-09
 * @link https://github.com/xeno-js/xeno-js
 */
export interface CookieConfig {
  /**
   * @description The name of the cookie.
   */
  name: string
  /**
   * @description The header name of the cookie.
   */
  header: string
}

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
  client: HttpClientConfig & { cookie: Optional<CookieConfig> }
  /**
   * @description The factory function that creates the http client.
   */
  factory: (http: IHttpClient) => TRegistry[K]
}
