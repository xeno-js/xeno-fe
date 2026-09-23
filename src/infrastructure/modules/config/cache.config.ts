/**
 * @description Interface that represents the configuration for the cache module.
 * @author Xeno
 * @version 1.0.0
 * @since 2025-09-30
 * @link https://github.com/xeno-js/xeno-js
 */
export interface CacheConfig {
  /**
   * @description a flag to enable or disable the in memory cache.
   */
  inMemory: boolean
  /**
   * @description a flag to enable or disable the indexed db cache.
   */
  indexedDb: boolean
}
