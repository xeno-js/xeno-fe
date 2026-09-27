import type { ICache, ICacheKeyBuilder, ILogger, Optional } from '@xeno-js/shared'

import type { IClientMediator, IPipeline } from '@/domain'

import type { PipelineConfig } from './config'

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
export class PipelineModule {
  /**
   * Assembles logging clients on-demand and returns a fully initialized BaseLogger instance.
   *
   * @param config The module configuration.
   * @returns Configured BaseLogger instance.
   */
  public static async create(
    config: PipelineConfig,
    logger: Optional<ILogger>,
    cache: Optional<ICache>,
    cahceKeyBuilder: Optional<ICacheKeyBuilder>,
  ): Promise<IClientMediator> {
    const { Guards } = await import('@xeno-js/shared')
    if (!Guards.isDefined(logger)) throw new Error('At least must provide a logger service')
    if (!Guards.isDefined(cache)) throw new Error('At least must provide a cache service')
    if (!Guards.isDefined(cahceKeyBuilder))
      throw new Error('At least must provide a cache key builder')

    Guards.throwIfNotInteger(config.threshold, 'The threshold value must be an integer')
    Guards.throwIfNegative(config.threshold, 'The threshold value must be positive')
    Guards.throwIfNullOrEmpty(config.threshold, 'The threshold value must not be null or empty')

    const pipelines: IPipeline[] = []

    const { ExceptionPipeline } = await import('@/application')
    pipelines.push(new ExceptionPipeline())
    const { LoggingPipeline } = await import('@/application')
    pipelines.push(new LoggingPipeline(logger))
    const { PerformancePipeline } = await import('@/application')
    pipelines.push(new PerformancePipeline(logger, config.threshold))

    if (Guards.isDefined(config.schemas)) {
      const { ZodValidatorService } = await import('@xeno-js/shared')
      const validatorService = new ZodValidatorService(new Map(), logger)
      for (const [intent, schema] of Object.entries(config.schemas)) {
        if (Guards.isDefined(schema)) {
          validatorService.addSchema(intent, schema)
        }
      }
      const { ValidationPipeline } = await import('@/application')
      pipelines.push(new ValidationPipeline(validatorService))
    }

    const queryPipelines: IPipeline[] = pipelines
    if (config.queryCaching) {
      const { QueryCachingPipeline } = await import('@/application')
      queryPipelines.push(new QueryCachingPipeline(cache, cahceKeyBuilder, logger))
    }

    const { ClientMediator } = await import('@/application')
    const { CompositePipeline } = await import('@/application')
    return new ClientMediator(
      new CompositePipeline(pipelines),
      new CompositePipeline(queryPipelines),
    )
  }
}
