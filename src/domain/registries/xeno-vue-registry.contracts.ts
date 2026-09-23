import type {
  ICache,
  ICacheKeyBuilder,
  IConfigurationService,
  IContextAccessor,
  IExtendendService,
  IIdentityAccessor,
  ILogger,
  RequestContext,
} from '@xeno-js/shared'

import type { IClientMediator } from '../contracts'

/**
 * @description An interface that defines the contract for a registry in a Xeno Vue application. This interface requires the implementation of several properties, including envService, contextAccessor, identityAccessor, logger, mediator, cache, cacheKeyBuilder, and authService. These properties are used to provide access to various services and utilities within the Xeno Vue framework. The Xeno Vue registry is used to configure and manage the various services and utilities used by the framework.
 *
 * @author Xeno
 * @version 1.0.0
 * @since 2025-09-30
 * @link https://github.com/xeno-js/xeno-fe
 */
export type XenoVueRegistry<TExtensions = object> = {
  /**
   * @description The configuration service used to retrieve configuration settings for the application.
   */
  envService: IConfigurationService
  /**
   * @description The context accessor used to retrieve the current request context.
   */
  contextAccessor: IContextAccessor<RequestContext>
  /**
   * @description The identity accessor used to retrieve the current user identity.
   */
  identityAccessor: IIdentityAccessor
  /**
   * @description The logger used to log messages and errors.
   */
  logger: ILogger
  /**
   * @description The mediator used to send commands and queries to the server.
   */
  mediator: IClientMediator
  /**
   * @description The cache used to store and retrieve data.
   */
  cache: ICache
  /**
   * @description The cache key builder used to build cache keys.
   */
  cacheKeyBuilder: ICacheKeyBuilder
  /**
   * @description The authentication service used to authenticate users.
   */
  authService: IExtendendService
} & TExtensions
