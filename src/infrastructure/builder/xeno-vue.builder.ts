// infrastructure/builder/xeno-app.builder.ts
import type {
    IConfigurationService,
    SetupAction,
} from '@xeno-js/shared'
import type { InjectionKey } from 'vue'

import type { XenoVueRegistry } from '@/domain'

import { ViteConfigurationService } from '../configuration/vite-env.configuration'
import type { CacheConfig, ContextConfig, FrontendAuthConfig, LoggerConfig, PipelineConfig } from '../modules'

export const XENO_SERVICES_KEY: InjectionKey<XenoVueRegistry> = Symbol('XENO_SERVICES')

/**
 * @description Fluent composition root for configuring and bootstrapping frontend services.
 * Implements code-splitting and Pure Dependency Injection for browser runtimes.
 *
 * @author Xeno
 * @version 1.0.0
 * @since 2025-09-30
 * @link https://github.com/Mattia-Carcione/xeno-js
 */
export class XenoAppBuilder {
    private readonly _configService: IConfigurationService
    private readonly _tasks: ((srv: Partial<XenoVueRegistry>) => Promise<void>)[] = []

    private readonly _loggerConfig: LoggerConfig = {
        console: true,
        sentry: undefined,
        customLogger: undefined,
        level: undefined,
    }
    private readonly _configCache: CacheConfig = {
        inMemory: true,
        indexedDb: false
    }
    private readonly _pipelineConfig: PipelineConfig = {
        queryCaching: false,
        threshold: 500,
        schemas: undefined
    }
    private readonly _contextConfig: ContextConfig = {
        contextAccessor: undefined
    }
    private readonly _authConfig: FrontendAuthConfig = {
        url: '',
        key: '',
        opts: undefined,
        storageType: undefined,
        redirectTo: undefined,
        provider: 'google'
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

    public addCache(setup: SetupAction<CacheConfig, IConfigurationService>): XenoAppBuilder {
        setup(this._configCache, this._configService)

        this._queueCache()
        return this
    }

    public addPipeline(setup: SetupAction<PipelineConfig, IConfigurationService>): XenoAppBuilder {
        if (this._isPipelineConfigured)
            return this

        this._queueCache()
        this._queueLogger()

        setup(this._pipelineConfig, this._configService)
        this._tasks.push(async (services) => {
            const { PipelineModule } = await import('../modules/pipeline.module')
            const mediator = await PipelineModule.create(this._pipelineConfig, services.logger, services.cache, services.cacheKeyBuilder)
            services.mediator = mediator;
        })

        this._isPipelineConfigured = true
        return this
    }

    /**
     * Configures the logging module with fluent callback.
     * Defers dynamic import of LoggerModule until build() execution.
     */
    public addLogger(setup: SetupAction<LoggerConfig, IConfigurationService>): this {
        setup(this._loggerConfig, this._configService)

        this._queueLogger()
        return this
    }

    public addContext(setup: SetupAction<ContextConfig, IConfigurationService>): this {
        if(this._isContextConfigured)
            return this

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

    public addAuth(setup: SetupAction<FrontendAuthConfig, IConfigurationService>): this {
        if (this._isAuthConfigured)
            return this

        setup(this._authConfig, this._configService)
        this._tasks.push(async (services) => {
            const { AuthModule } = await import('../modules/auth.module')
            services.authService = await AuthModule.create(this._authConfig)
        })

        this._isAuthConfigured = true
        return this
    }

    /**
     * Static factory method to instantiate a new builder.
     */
    public static create(configService?: IConfigurationService): XenoAppBuilder {
        return new XenoAppBuilder(configService)
    }

    /**
     * Asynchronously resolves all configured modules via lazy dynamic imports,
     * assembles the dependency graph, and returns the frozen services container.
     */
    public async build(): Promise<XenoVueRegistry> {
        try {
            const services: Partial<XenoVueRegistry> = {}
    
            for (const task of this._tasks) {
                await task(services)
            }
    
            return Object.freeze(services as XenoVueRegistry)

        } catch(error: unknown) {
            throw new Error(`Error during application bootstrap: ${(error as Error).message}.`, error as Error)
        }
    }

    //===============================================
    // PRIVATE REGION
    //===============================================

    private _queueCache() {
        if (this._isCacheConfigured)
            return this

        this._tasks.push(async (services) => {
            const { CacheModule } = await import('../modules/cache.module')
            const { cache, cacheKeyBuilder } = await CacheModule.create(this._configCache, services.identityAccessor)
            services.cache = cache;
            services.cacheKeyBuilder = cacheKeyBuilder
        })
        this._isCacheConfigured = true
    }

    private _queueLogger() {
        if (this._isLoggerConfigured)
            return this

        this._tasks.push(async (services) => {
            const { LoggerModule } = await import('../modules/logger.module')
            const logger = await LoggerModule.create(this._loggerConfig, services.contextAccessor)
            services.logger = logger;
        })
        this._isLoggerConfigured = true
    }
}



