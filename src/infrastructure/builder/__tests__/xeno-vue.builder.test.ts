import { describe, expect, it, vi } from 'vitest'

import type { XenoVueRegistry } from '@/domain'

import { XenoAppBuilder } from '../xeno-vue.builder'

describe('XenoAppBuilder', () => {
  it('should create a builder and preserve fluent configuration', () => {
    const builder = XenoAppBuilder.create()
    const setup = vi.fn()

    expect(builder.addCache(setup)).toBe(builder)
    expect(builder.addLogger(setup)).toBe(builder)
    expect(builder.addContext(setup)).toBe(builder)
    expect(builder.addPipeline(setup)).toBe(builder)
    expect(builder.addAuth(setup)).toBe(builder)
    expect(setup).toHaveBeenCalledTimes(5)
  })

  it('should execute registered services and freeze the built registry', async () => {
    const builder = XenoAppBuilder.create<XenoVueRegistry<{ customService: string }>>()
    const register = vi.fn()

    builder.addServices((config, registerService) => {
      expect(config).toBeDefined()
      register('customService', 'registered')
      registerService('customService', 'registered')
    })

    const services = await builder.build()

    expect(register).toHaveBeenCalledWith('customService', 'registered')
    expect(services.customService).toBe('registered')
    expect(Object.isFrozen(services)).toBe(true)
  })

  it('should reject an HttpCore registration without a factory', () => {
    const builder = XenoAppBuilder.create<XenoVueRegistry<{ api: unknown }>>()

    expect(() => builder.addHttpCore('api', () => undefined)).toThrow(
      "[XenoAppBuilder Error]: factory is required for HttpCore token 'api'",
    )
  })

  it('should wrap errors thrown during bootstrap', async () => {
    const builder = XenoAppBuilder.create()
    const cause = new Error('bootstrap failed')
    builder.addServices(() => {
      throw cause
    })

    await expect(builder.build()).rejects.toMatchObject({
      message: 'Error during application bootstrap: bootstrap failed.',
      cause,
    })
  })
})
