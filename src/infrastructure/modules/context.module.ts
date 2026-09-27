import type { IBaseAccessor, RequestContext } from '@xeno-js/shared'

import type { ContextConfig } from './config/context.config'

/**
 * @description Module responsible for configuring and instantiating the frontend BaseLogger.
 * Employs code-splitting via dynamic import() to ensure unused logging drivers (like Sentry)
 * are excluded from the initial browser bundle.
 *
 * @author Xeno
 * @version 1.0.0
 * @since 2025-09-30
 * @link https://github.com/xeno-js/xeno-js
 */
export class ContextModule {
  /**
   * Assembles context accessor on-demand and returns a fully initialized ContextAccessor instance.
   *
   * @param config The module configuration.
   * @returns Configured contextAccessor instance.
   */
  public static async create(config: ContextConfig): Promise<IBaseAccessor<RequestContext>> {
    const { Guards } = await import('@xeno-js/shared')

    if (!Guards.isDefined(config.contextAccessor)) {
      const { RequestContextAccessor } = await import('../context')
      return new RequestContextAccessor()
    }

    return config.contextAccessor
  }
}
