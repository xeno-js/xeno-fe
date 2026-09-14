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

export type XenoVueRegistry<TExtensions = object> = {
  envService: IConfigurationService
  contextAccessor: IContextAccessor<RequestContext>
  identityAccessor: IIdentityAccessor
  logger: ILogger
  mediator: IClientMediator
  cache: ICache
  cacheKeyBuilder: ICacheKeyBuilder
  authService: IExtendendService
} & TExtensions
