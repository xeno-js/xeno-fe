import type { HttpClientConfig, IFactory, IHttpClient, Optional } from '@xeno-js/shared'
import { AxiosHttpClient, Guards } from '@xeno-js/shared'
import axios from 'axios'

import type { CookieConfig } from '../modules'

/**
 * @description Factory class responsible for creating instances of AxiosHttpClient based on the provided configuration. It implements the IFactory interface, allowing for easy integration with dependency injection systems. The factory encapsulates the creation logic for the AxiosHttpClient, including the initialization of the underlying Axios instance with the specified configuration options such as base URL, default headers, and timeout settings. This design promotes separation of concerns and allows for flexibility in managing AxiosHttpClient instances across the application.

   * 
   * @author Xeno
   * @version 1.0.0
   * @since 2025-09-30
   * @link https://github.com/xeno-js/xeno-js 
   */
export class AxiosFactory implements IFactory<
  HttpClientConfig & { cookie: Optional<CookieConfig> },
  IHttpClient
> {
  public create(config: HttpClientConfig & { cookie: Optional<CookieConfig> }): IHttpClient {
    const axiosInstance = axios.create({
      baseURL: config.baseURL,
      headers: config.defaultHeaders,
      timeout: config.timeoutMs,
      maxRedirects: config.maxRedirects ?? 5,
      decompress: config.decompress ?? true,
      proxy: config.proxy,
      withCredentials: config.withCredentials,
    })

    const cookieConfig = config.cookie
    if (Guards.isDefined(cookieConfig) && typeof document !== 'undefined') {
      axiosInstance.interceptors.request.use((requestConfig) => {
        const cookieName = cookieConfig.name ?? '__Host-xeno-csrf'
        const headerName = cookieConfig.header ?? 'x-csrf-token'

        const regex = new RegExp(`(^| )${cookieName}=([^;]+)`)
        const match = regex.exec(document.cookie)

        if (Guards.isDefined(match) && Guards.isDefined(match[2])) {
          requestConfig.headers[headerName] = decodeURIComponent(match[2])
        }
        return requestConfig
      })
    }
    return new AxiosHttpClient(axiosInstance)
  }
}
