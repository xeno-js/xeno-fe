import { LOG_LEVEL } from '@xeno-js/shared'
import { afterEach, describe, expect, it, vi } from 'vitest'

import { ConsoleLogger } from '../console.logger'

describe('ConsoleLogger', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('does not log when level is below configured minimum', () => {
    const logger = new ConsoleLogger(LOG_LEVEL.WARN)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined)
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    logger.track(LOG_LEVEL.INFO, 'ignored', { reqId: '1' })

    expect(errorSpy).not.toHaveBeenCalled()
    expect(warnSpy).not.toHaveBeenCalled()
    expect(infoSpy).not.toHaveBeenCalled()
    expect(debugSpy).not.toHaveBeenCalled()
  })

  it('logs ERROR level using console.error and enriches payload with error details', () => {
    const logger = new ConsoleLogger(LOG_LEVEL.DEBUG)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    const err = new Error('boom')
    logger.track(LOG_LEVEL.ERROR, 'failure happened', { requestId: 'abc' }, err)

    expect(errorSpy).toHaveBeenCalledOnce()
    expect(errorSpy).toHaveBeenCalledWith(
      '[3] failure happened',
      expect.objectContaining({ requestId: 'abc', error: err }),
    )
  })

  it('logs WARN level using console.warn', () => {
    const logger = new ConsoleLogger(LOG_LEVEL.DEBUG)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    logger.track(LOG_LEVEL.WARN, 'warn message', { user: 'u1' })

    expect(warnSpy).toHaveBeenCalledOnce()
    expect(warnSpy).toHaveBeenCalledWith('[2] warn message', { user: 'u1' })
  })

  it('logs DEBUG level using console.debug', () => {
    const logger = new ConsoleLogger(LOG_LEVEL.DEBUG)
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    logger.track(LOG_LEVEL.DEBUG, 'debug message', { trace: 't1' })

    expect(debugSpy).toHaveBeenCalledOnce()
    expect(debugSpy).toHaveBeenCalledWith('[0] debug message', { trace: 't1' })
  })

  it('logs default branch using console.info for non-mapped level', () => {
    const logger = new ConsoleLogger(LOG_LEVEL.DEBUG)
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined)

    logger.track(1, 'info message', { ok: true })

    expect(infoSpy).toHaveBeenCalledOnce()
    expect(infoSpy).toHaveBeenCalledWith('[1] info message', { ok: true })
  })

  it('uses empty object payload when context is undefined in default branch', () => {
    const logger = new ConsoleLogger(LOG_LEVEL.DEBUG)
    const infoSpy = vi.spyOn(console, 'info').mockImplementation(() => undefined)

    logger.track(1, 'no context', undefined)

    expect(infoSpy).toHaveBeenCalledWith('[1] no context', {})
  })

  it('uses empty object payload for ERROR level when context and error are undefined', () => {
    const logger = new ConsoleLogger(LOG_LEVEL.DEBUG)
    const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined)

    logger.track(LOG_LEVEL.ERROR, 'error no context', undefined)

    expect(errorSpy).toHaveBeenCalledWith('[3] error no context', {})
  })

  it('uses empty object payload for WARN level when context is undefined', () => {
    const logger = new ConsoleLogger(LOG_LEVEL.DEBUG)
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => undefined)

    logger.track(LOG_LEVEL.WARN, 'warn no context', undefined)

    expect(warnSpy).toHaveBeenCalledWith('[2] warn no context', {})
  })

  it('uses empty object payload for DEBUG level when context is undefined', () => {
    const logger = new ConsoleLogger(LOG_LEVEL.DEBUG)
    const debugSpy = vi.spyOn(console, 'debug').mockImplementation(() => undefined)

    logger.track(LOG_LEVEL.DEBUG, 'debug no context', undefined)

    expect(debugSpy).toHaveBeenCalledWith('[0] debug no context', {})
  })
})
