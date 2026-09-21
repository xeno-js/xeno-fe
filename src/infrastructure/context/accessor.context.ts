import type {
  IContextAccessor,
  Identity,
  IIdentityAccessor,
  INetworkContextAccessor,
  NetworkContext,
  Optional,
  RequestContext,
} from '@xeno-js/shared'
import { Guards, GUEST, GuidHelper, SanitizeHelper } from '@xeno-js/shared'

export class RequestContextAccessor
  implements IContextAccessor<RequestContext>, IIdentityAccessor, INetworkContextAccessor
{
  public getContext(): Optional<RequestContext> {
    return {
      identity: GUEST as unknown as Identity,
      network: {
        requestId: GuidHelper.generate(),
        clientIp: undefined,
        userAgent: Guards.isDefined(navigator)
          ? SanitizeHelper.stripControlChars(navigator.userAgent, 256)
          : 'unknown',
        formatIndicator: 'browser',
        path: Guards.isDefined(window)
          ? SanitizeHelper.sanitizePath(window.location.pathname)
          : '/',
        transport: {
          req: '',
          res: '',
        },
        csrf: '',
        origin: window.location.origin,
      },
      tracing: {
        correlationId: GuidHelper.generate(),
        startTime: Date.now(),
        spanId: undefined,
        parentSpanId: undefined,
      },
      messaging: undefined,
    }
  }

  public getIdentity(): Optional<Identity> {
    return this.getContext()?.identity
  }

  public getNetworkContext(): Optional<NetworkContext> {
    return this.getContext()?.network
  }
}
