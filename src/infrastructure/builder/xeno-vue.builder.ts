// infrastructure/builder/xeno-app.builder.ts
import type { SupabaseClientOptions } from '@supabase/supabase-js'
import type { AuthConfig, IConfigurationService, SetupAction } from '@xeno-js/shared'
import { Guards } from '@xeno-js/shared'
import type { InjectionKey } from 'vue'

import type { XenoVueRegistry } from '@/domain'

import { ViteConfigurationService } from '../configuration/vite-env.configuration'
import type {
  CacheConfig,
  ContextConfig,
  HttpCoreVueConfig,
  LoggerConfig,
  PipelineConfig,
} from '../modules'

/**
 * @description Injection key for accessing the XenoVueRegistry instance.
 * @type {InjectionKey<XenoVueRegistry>}
 * @author Xeno
 * @version 1.0.0
 * @since 2025-09-30
 * @link https://github.com/xeno-js/xeno-fe
 */
export const XENO_SERVICES_KEY: InjectionKey<XenoVueRegistry> = Symbol('XENO_SERVICES')

/**
 * @description Fluent composition root for configuring and bootstrapping frontend services.
 * Implements code-splitting and Pure Dependency Injection for browser runtimes.
 *
 * @author Xeno
 * @version 1.0.0
 * @since 2025-09-30
 * @link https://github.com/xeno-js/xeno-fe
 */
export class XenoAppBuilder<TRegistry extends XenoVueRegistry = XenoVueRegistry> {
  private readonly _configService: IConfigurationService
  private readonly _tasks: ((srv: Partial<TRegistry>) => Promise<void>)[] = []

  private readonly _loggerConfig: LoggerConfig = {
    console: true,
    sentry: undefined,
    customLogger: undefined,
    level: undefined,
  }
  private readonly _configCache: CacheConfig = {
    inMemory: true,
    indexedDb: false,
  }
  private readonly _pipelineConfig: PipelineConfig = {
    queryCaching: false,
    threshold: 500,
    schemas: undefined,
  }
  private readonly _contextConfig: ContextConfig = {
    contextAccessor: undefined,
  }
  private readonly _authConfig: AuthConfig<SupabaseClientOptions<'public'>> = {
    url: '',
    key: '',
    opts: undefined,
    storageOpts: {
      type: undefined,
      storage: undefined,
      cookieOpts: undefined,
    },
    redirectTo: undefined,
  }

  private _isAuthConfigured = false
  private _isCacheConfigured = false
  private _isContextConfigured = false
  private _isLoggerConfigured = false
  private _isPipelineConfigured = false

  private constructor(configService?: IConfigurationService) {
    this._configService = configService ?? new ViteConfigurationService()
    this._tasks.push(async (services) => {
      services.envService = this._configService
    })
  }

  /**
   * @description Configures the cache module with fluent callback.
   * @param setup - A callback function that takes the cache configuration and the configuration service as arguments.
   * @returns The current instance of the XenoBuilder.
   */
  public addCache(setup: SetupAction<CacheConfig, IConfigurationService>): this {
    setup(this._configCache, this._configService)

    this._queueCache()
    return this
  }

  /**
   * @description Configures the pipeline module with fluent callback.
   * @param setup - A callback function that takes the pipeline configuration and the configuration service as arguments.
   * @returns The current instance of the XenoBuilder.
   */
  public addPipeline(setup: SetupAction<PipelineConfig, IConfigurationService>): this {
    if (this._isPipelineConfigured) return this

    this._queueCache()
    this._queueLogger()

    setup(this._pipelineConfig, this._configService)
    this._tasks.push(async (services) => {
      const { PipelineModule } = await import('../modules/pipeline.module')
      const mediator = await PipelineModule.create(
        this._pipelineConfig,
        services.logger,
        services.cache,
        services.cacheKeyBuilder,
      )
      services.mediator = mediator
    })

    this._isPipelineConfigured = true
    return this
  }

  /**
   * @description Configures the logging module with fluent callback.
   * Defers dynamic import of LoggerModule until build() execution.
   */
  public addLogger(setup: SetupAction<LoggerConfig, IConfigurationService>): this {
    setup(this._loggerConfig, this._configService)

    this._queueLogger()
    return this
  }

  /**
   * @description Configures the context module with fluent callback.
   * Defers dynamic import of ContextModule until build() execution.
   */
  public addContext(setup: SetupAction<ContextConfig, IConfigurationService>): this {
    if (this._isContextConfigured) return this

    setup(this._contextConfig, this._configService)
    this._tasks.push(async (services) => {
      const { ContextModule } = await import('../modules/context.module')
      const ctxAccessor = await ContextModule.create(this._contextConfig)
      services.contextAccessor = ctxAccessor
      services.identityAccessor = ctxAccessor
    })

    this._isContextConfigured = true
    return this
  }

  /**
   * @description Configures the authentication module with fluent callback.
   * Defers dynamic import of AuthModule until build() execution.
   * @param setup A callback function that configures the authentication module
   */
  public addAuth(
    setup: SetupAction<AuthConfig<SupabaseClientOptions<'public'>>, IConfigurationService>,
  ): this {
    if (this._isAuthConfigured) return this

    setup(this._authConfig, this._configService)
    this._tasks.push(async (services) => {
      const { AuthModule } = await import('../modules/auth.module')
      services.authService = await AuthModule.create(this._authConfig)
    })

    this._isAuthConfigured = true
    return this
  }

  /**
   * @description Registra un DataSource remoto con un ecosistema Axios/Cockatiel completamente isolato.
   * @param token Il token di registrazione type-safe dal Registry.
   * @param setup Callback per configurare client, resilienza e la factory del DataSource.
   */
  public addHttpCore<K extends keyof TRegistry>(
    token: K,
    setup: SetupAction<HttpCoreVueConfig<TRegistry, K>, IConfigurationService>,
  ): this {
    const config = {
      client: {
        baseURL: undefined,
        defaultHeaders: undefined,
        timeoutMs: 5000,
        keepAlive: true,
        maxSockets: 100,
        maxRedirects: 5,
        decompress: true,
      },
      factory: undefined as unknown as HttpCoreVueConfig<TRegistry, K>['factory'],
    } as HttpCoreVueConfig<TRegistry, K>

    setup(config, this._configService)

    if (!Guards.isDefined(config.factory)) {
      throw new Error(
        `[XenoAppBuilder Error]: factory is required for HttpCore token '${String(token)}'`,
      )
    }

    this._tasks.push(async (services) => {
      const { AxiosFactory } = await import('../factories')

      const httpClient = new AxiosFactory().create(config.client)

      const dataSource = config.factory(httpClient)

      services[token] = dataSource
    })

    return this
  }

  /**
   * @description Permette la registrazione massiva di più servizi in un unico blocco,
   * garantendo la type-safety tramite il parametro `register` iniettato.
   * @param setup Callback per orchestrare le registrazioni.
   * @returns L'istanza di XenoAppBuilder per la costruzione successiva.
   */
  public addServices(
    setup: (
      config: IConfigurationService,
      register: <K extends keyof TRegistry>(token: K, instance: TRegistry[K]) => void,
      services: Partial<TRegistry>,
    ) => void | Promise<void>,
  ): this {
    this._tasks.push(async (services) => {
      const registerFn = <K extends keyof TRegistry>(token: K, instance: TRegistry[K]) => {
        services[token] = instance
      }

      await setup(this._configService, registerFn, services)
    })

    return this
  }

  /**
   * @description Creates a new instance of the XenoBuilder class with the provided configuration service.
   * @param configService - The configuration service to use for the builder.
   * @returns A new instance of the XenoBuilder class.
   */
  public static create<T extends XenoVueRegistry = XenoVueRegistry>(
    configService?: IConfigurationService,
  ): XenoAppBuilder<T> {
    return new XenoAppBuilder<T>(configService)
  }

  /**
   * @description Builds the application by executing all the registered tasks and returning the resulting services.
   * @returns A promise that resolves to the resulting services.
   */
  public async build(): Promise<TRegistry> {
    try {
      const services: Partial<TRegistry> = {}

      for (const task of this._tasks) {
        await task(services)
      }

      return Object.freeze(services as TRegistry)
    } catch (error: unknown) {
      throw new Error(`Error during application bootstrap: ${(error as Error).message}.`, {
        cause: error,
      })
    }
  }

  //===============================================
  // PRIVATE REGION
  //===============================================

  private _queueCache() {
    if (this._isCacheConfigured) return this

    this._tasks.push(async (services) => {
      const { CacheModule } = await import('../modules/cache.module')
      const { cache, cacheKeyBuilder } = await CacheModule.create(
        this._configCache,
        services.identityAccessor,
      )
      services.cache = cache
      services.cacheKeyBuilder = cacheKeyBuilder
    })
    this._isCacheConfigured = true
  }

  private _queueLogger() {
    if (this._isLoggerConfigured) return this

    this._tasks.push(async (services) => {
      const { LoggerModule } = await import('../modules/logger.module')
      const logger = await LoggerModule.create(this._loggerConfig, services.contextAccessor)
      services.logger = logger
    })
    this._isLoggerConfigured = true
  }
}
