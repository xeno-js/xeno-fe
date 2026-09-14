import type {
  HttpClientConfig,
  IHttpClient,
  IServiceResilience,
  ResilienceConfig,
} from '@xeno-js/shared'

export interface HttpCoreVueConfig<TRegistry, K extends keyof TRegistry> {
  client: HttpClientConfig
  resilience: ResilienceConfig
  factory: (http: IHttpClient, resilience: IServiceResilience) => TRegistry[K]
}
