import type {
  BaseLogger,
  IContextAccessor,
  ILoggerClient,
  LogLevel,
  Optional,
  RequestContext,
} from '@xeno-js/shared'

import type { LoggerConfig } from './config/logger.config'

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
export class LoggerModule {
  /**
   * Assembles logging clients on-demand and returns a fully initialized BaseLogger instance.
   *
   * @param config The module configuration.
   * @returns Configured BaseLogger instance.
   */
  public static async create(
    config: LoggerConfig,
    ctx: Optional<IContextAccessor<RequestContext>>,
  ): Promise<BaseLogger> {
    const { Guards, LOG_LEVEL } = await import('@xeno-js/shared')
    const { RequestContextAccessor } = await import('../context')
    const contexAccessor = ctx ?? new RequestContextAccessor()

    const minLevel: LogLevel = config.level ?? LOG_LEVEL.DEBUG
    const clients: ILoggerClient[] = []

    if (config.console) {
      const { ConsoleLogger } = await import('../loggers/console.logger')
      clients.push(new ConsoleLogger(minLevel))
    }

    if (Guards.isDefined(config.sentry)) {
      const { SentryLoggerFactory } = await import('../factories/sentry-logger.factory')
      const sentryFactory = new SentryLoggerFactory()
      clients.push(sentryFactory.create(config.sentry))
    }

    if (Guards.isDefined(config.customLogger) && Guards.isFunction(config.customLogger)) {
      const customClients = config.customLogger()
      if (Guards.isArray(customClients)) {
        clients.push(...customClients)
      }
    }

    const { BaseLogger } = await import('@xeno-js/shared')
    return new BaseLogger(contexAccessor, minLevel, clients)
  }
}
