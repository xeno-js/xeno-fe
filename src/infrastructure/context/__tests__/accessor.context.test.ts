import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { RequestContextAccessor } from '../accessor.context'

describe('RequestContextAccessor', () => {
  beforeEach(() => {
    vi.stubGlobal('navigator', {
      userAgent: `${String.fromCharCode(0)}Test Browser`,
    })
    vi.stubGlobal('window', {
      location: {
        pathname: '/dashboard',
        origin: 'https://example.test',
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('should create a guest request context from browser globals', () => {
    const accessor = new RequestContextAccessor()

    const context = accessor.getContext()

    expect(context).toBeDefined()
    expect(context?.identity).toBeDefined()
    expect(context?.network).toMatchObject({
      clientIp: undefined,
      userAgent: 'Test Browser',
      formatIndicator: 'browser',
      path: '/dashboard',
      origin: 'https://example.test',
    })
    expect(context?.network.requestId).toEqual(expect.any(String))
    expect(context?.tracing.correlationId).toEqual(expect.any(String))
    expect(context?.tracing.startTime).toEqual(expect.any(Number))
  })

  it('should return the current identity', () => {
    const accessor = new RequestContextAccessor()

    const identity = accessor.getIdentity()
    const context = accessor.getContext()

    expect(identity).toBe(context?.identity)
  })

  it('should return the current network context', () => {
    const accessor = new RequestContextAccessor()
    const context = accessor.getContext()
    vi.spyOn(accessor, 'getContext').mockReturnValue(context)

    const network = accessor.getNetworkContext()

    expect(network).toEqual(context?.network)
  })
})
