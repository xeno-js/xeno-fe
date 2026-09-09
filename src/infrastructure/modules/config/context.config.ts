import type { IBaseAccessor, Optional, RequestContext } from "@xeno-js/shared";

export interface ContextConfig {
    contextAccessor: Optional<IBaseAccessor<RequestContext>>
}