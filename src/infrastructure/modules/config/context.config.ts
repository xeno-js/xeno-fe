import type { IBaseAccessor, Optional, RequestContext } from '@xeno-js/shared'

/**
 * @description Interface that represents the configuration for the context module.
 * @author Xeno
 * @version 1.0.0
 * @since 2025-09-30
 * @link https://github.com/xeno-js/xeno-js
 */
export interface ContextConfig {
  /**
   * @description An instance of the context accessor.
   */
  contextAccessor: Optional<IBaseAccessor<RequestContext>>
}
