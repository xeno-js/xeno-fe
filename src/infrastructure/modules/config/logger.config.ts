// infrastructure/loggers/logger.config.ts
import type { ILoggerClient, LogLevel, Optional } from '@xeno-js/shared'
import type { App } from 'vue'
import type { Router } from 'vue-router'

/**
 * @description Configuration options required to initialize the Sentry Vue SDK and its logging client.
 *
 * @author Xeno
 * @version 1.0.0
 * @since 2025-09-30
 * @link https://github.com/xeno-js/xeno-js
 */
export interface SentryConfig {
  /** Sentry Data Source Name. */
  readonly dsn: string
  /** Environment name (e.g. 'production', 'staging', 'development'). */
  readonly env: string
  /** The root Vue application instance. */
  readonly app?: Optional<App | App[]>
  /** The Vue Router instance for distributed navigation tracing. */
  readonly router?: Optional<Router>
  /** Sample rate for performance transactions (0.0 to 1.0). Default is 0.2. */
  readonly tracesSampleRate?: Optional<number>
  /** Session sample rate for Session Replays (0.0 to 1.0). Default is 0.1. */
  readonly replaysSessionSampleRate?: Optional<number>
  /** Error sample rate for Session Replays when an error occurs (0.0 to 1.0). Default is 1.0. */
  readonly replaysOnErrorSampleRate?: Optional<number>
  /** Application release version string. */
  readonly release?: Optional<string>
  /** Minimum log level to capture with Sentry. Default is LOG_LEVEL.WARN. */
  readonly level?: Optional<LogLevel>
}

/**
 * @description Configuration object used to initialize the frontend logging module and its clients.
 *
 * @author Xeno
 * @version 1.0.0
 * @since 2025-09-30
 * @link https://github.com/xeno-js/xeno-js
 */
export interface LoggerConfig {
  /** Enables or disables the console logging client. */
  console: boolean

  /** Optional configuration for Sentry Vue SDK integration. */
  sentry?: Optional<SentryConfig>

  /** Optional factory callback that provides an array of custom ILoggerClient instances. */
  customLogger?: Optional<() => ILoggerClient[]>

  /** Minimum log level captured by the base logger. Defaults to LOG_LEVEL.DEBUG. */
  level?: Optional<LogLevel>
}
