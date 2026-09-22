import type { ILoggerClient, LogLevel, Optional } from '@xeno-js/shared'
import { Guards, LOG_LEVEL } from '@xeno-js/shared'

/**
 * @description Concrete implementation of ILoggerClient that uses the built-in console for logging. This class serves as a simple logging provider that can be used for development and debugging purposes, allowing log messages to be output to the console with different log levels (e.g., error, warning, info, debug) and optional context and error information.

   * 
   * @author Xeno
   * @version 1.0.0
   * @since 2025-09-30
   * @link https://github.com/xeno-js/xeno-js 
   */
export class ConsoleLogger implements ILoggerClient {
  /**
   * Constructs a new instance of the ConsoleLogger class, which takes an optional minimum log level. The minimum log level determines the threshold for logging messages, where messages with a log level below the specified minimum will be ignored.
   * @param _minLevel The minimum log level for logging messages. Messages with a log level below this threshold will not be logged. Default is LOG_LEVEL.DEBUG.
  
   * 
   * @author Xeno
   * @version 1.0.0
   * @since 2025-09-30
   * @link https://github.com/xeno-js/xeno-js 
   */
  constructor(private readonly _minLevel: LogLevel = LOG_LEVEL.DEBUG) {}

  public track<T>(
    level: LogLevel,
    message: string,
    context: T,
    error: Optional<unknown> = undefined,
  ): void {
    if (level < this._minLevel) return

    const logMessage = `[${level}] ${message}`
    const payload = Guards.isDefined(error) ? { ...context, error } : context
    switch (level) {
      case LOG_LEVEL.ERROR:
        console.error(logMessage, payload ?? {})
        break
      case LOG_LEVEL.WARN:
        console.warn(logMessage, payload ?? {})
        break
      case LOG_LEVEL.DEBUG:
        console.debug(logMessage, payload ?? {})
        break
      default:
        console.info(logMessage, payload ?? {})
        break
    }
  }
}
