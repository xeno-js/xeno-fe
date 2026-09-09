import type { ICache, ICacheKeyBuilder, IConfigurationService, IContextAccessor, IIdentityAccessor, ILogger, RequestContext } from "@xeno-js/shared";

import type { IClientMediator, IFrontendAuthService } from "../contracts";

export interface XenoVueRegistry {
    envService: IConfigurationService
    contextAccessor: IContextAccessor<RequestContext>
    identityAccessor: IIdentityAccessor
    logger: ILogger
    mediator: IClientMediator
    cache: ICache
    cacheKeyBuilder: ICacheKeyBuilder
    authService: IFrontendAuthService
}