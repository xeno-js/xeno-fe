import type { HttpClientConfig, IHttpClient } from '@xeno-js/shared'

export interface HttpCoreVueConfig<TRegistry, K extends keyof TRegistry> {
  client: HttpClientConfig
  factory: (http: IHttpClient) => TRegistry[K]
}
