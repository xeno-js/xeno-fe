// infrastructure/loggers/sentry-logger.factory.ts
import * as Sentry from '@sentry/vue'
import type { IFactory, ILoggerClient, LogLevel } from '@xeno-js/shared'
import { Guards, LOG_LEVEL } from '@xeno-js/shared'

import { SentryLogger } from '../loggers/sentry.logger'
import type { SentryConfig } from '../modules'

/**
 * @description Factory responsible for initializing the Sentry Vue SDK and creating an instance of SentryLogger.
 * Implements the agnostic IFactory contract to allow seamless dependency injection and decoupling.
 *
 * @author Xeno
 * @version 1.0.0
 * @since 2025-09-30
 * @link https://github.com/xeno-js/xeno-js
 */
export class SentryLoggerFactory implements IFactory<SentryConfig, ILoggerClient> {
  /**
   * @description Initializes the Sentry Vue SDK with the provided options and returns an ILoggerClient.
   * @param config The Sentry configuration settings.
   * @returns An initialized ILoggerClient adapter.
   */
  public create(config: SentryConfig): ILoggerClient {
    const minLevel: LogLevel = config.level ?? LOG_LEVEL.WARN

    const integrations = [
      Guards.isDefined(config.router)
        ? Sentry.browserTracingIntegration({ router: config.router })
        : Sentry.browserTracingIntegration(),
      Sentry.replayIntegration(),
    ]

    Sentry.init({
      app: config.app,
      dsn: config.dsn,
      environment: config.env,
      release: config.release ?? undefined,
      integrations,
      tracesSampleRate: config.tracesSampleRate ?? 0.2,
      replaysSessionSampleRate: config.replaysSessionSampleRate ?? 0.1,
      replaysOnErrorSampleRate: config.replaysOnErrorSampleRate ?? 1.0,
    })

    return new SentryLogger(Sentry, minLevel)
  }
}
