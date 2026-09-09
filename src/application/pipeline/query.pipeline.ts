import type {
    Delegate,
    ICache,
    ICacheKeyBuilder,
    ILogger,
    IQuery,
    IRequest,
    ResultType,
} from '@xeno-js/shared'
import { Guards, Result } from '@xeno-js/shared'

import type { IPipeline } from '@/domain'

/**
 * @description A pipeline behavior that implements caching for query requests in the CQRS architecture. This behavior checks if the incoming request is a query and if it implements the IQuery interface. If so, it attempts to retrieve the response from the cache using the provided cache key. If a cached response is found, it returns it immediately. If not, it delegates control to the next handler in the pipeline to execute the query and retrieve the data from the database. After successfully retrieving the data, it stores the result in the cache with the specified TTL (time-to-live) for future requests. This behavior also includes error handling for cache read/write operations, ensuring that any cache-related errors do not disrupt the normal flow of query execution and that appropriate warnings are logged.

   * 
   * @author Xeno
   * @version 1.0.0
   * @since 2025-09-30
   * @link https://github.com/Mattia-Carcione/xeno-js 
   */
export class QueryCachingPipeline implements IPipeline {
    /**
     * @description Constructs a new instance of the QueryCachingPipeline class, which requires an ICache implementation for interacting with the cache and an ILogger for logging cache-related operations and errors. The constructor initializes the dependencies needed for the caching behavior to function properly within the CQRS pipeline.
     * @param _cacheService An instance of ICache used for interacting with the cache, including retrieving and storing cached responses based on cache keys.
     * @param _logger An instance of ILogger used for logging cache-related operations, such as cache hits, cache misses, and any errors that occur during cache read/write operations.
    
     * 
     * @author Xeno
     * @version 1.0.0
     * @since 2025-09-30
     * @link https://github.com/Mattia-Carcione/xeno-js 
     */
    constructor(
        private readonly _cacheService: ICache,
        private readonly _cacheKeyBuilder: ICacheKeyBuilder,
        private readonly _logger: ILogger,
    ) { }

    public async handle<TResult>(request: IRequest<TResult>, next: Delegate<TResult>): Promise<ResultType<TResult>> {
        const query = (request as IQuery)
        if (Guards.isNullOrEmpty(query.cacheOptions) ||
            Guards.isNullOrEmpty(query.cacheOptions.cacheKey))
            return next()

        const bypass =
            query.cacheOptions.bypassCache === true || query.cacheOptions.consistentRead === true

        const key = query.cacheOptions.isUserScoped
            ? this._cacheKeyBuilder.buildUserScopedKey(query.cacheOptions.cacheKey)
            : this._cacheKeyBuilder.buildContextualKey(query.cacheOptions.cacheKey)
        // 1. Read (Cache Hit)
        if (!bypass) {
            try {
                const cachedResponse = await this._cacheService.get<TResult>(key)
                if (Guards.isDefined(cachedResponse)) {
                    this._logger.debug(
                        `[Cache HIT] Returning data from cache for: ${query.cacheOptions.cacheKey}`,
                    )
                    return Result.ok(cachedResponse)
                }
            } catch (error) {
                // If Redis fails, we don't crash the app. Log and proceed to the DB.
                this._logger.warn(
                    `[Cache ERROR] Unable to read cache for: ${query.cacheOptions.cacheKey}. Proceeding to DB. Error: ${error instanceof Error ? error.message : String(error)}`,
                )
            }
        }

        // 2. Cache Miss: Delegate control to the Handler that queries the DB
        const result = await next()

        // 3. Write: If the Handler succeeded, save the result in cache
        if (result.isOk()) {
            try {
                await this._cacheService.set(key, result.getValueOrThrow(), query.cacheOptions.ttl)
                this._logger.debug(`[Cache SET] Data saved in cache for: ${key}`)
            } catch (error) {
                this._logger.warn(
                    `[Cache ERROR] Unable to save cache for: ${key}. Error: ${error instanceof Error ? error.message : String(error)}`,
                )
            }
        }

        return result
    }
}