import type { Delegate, ICommand, IQuery, IRequest } from '@xeno-js/shared'
import { Result } from '@xeno-js/shared'
import { describe, expect, it, vi } from 'vitest'

import type { IPipeline } from '@/domain'

import { ClientMediator } from '../mediator'

describe('ClientMediator', () => {
  const command: ICommand<string> = {
    intent: 'CreateItem',
    type: 'COMMAND',
  }
  const query: IQuery<string> = {
    intent: 'FindItem',
    type: 'QUERY',
    cacheOptions: {
      cacheKey: 'items:1',
      ttl: undefined,
      bypassCache: undefined,
      consistentRead: undefined,
      isUserScoped: false,
    },
  }

  const createPipeline = () => {
    const pipeline: IPipeline = {
      async handle<TResult>(_request: IRequest<TResult>, action: Delegate<TResult>) {
        return action()
      },
    }
    const handle = vi.spyOn(pipeline, 'handle')
    return { pipeline, handle }
  }

  it('should send commands through the command pipeline', async () => {
    const commandPipeline = createPipeline()
    const queryPipeline = createPipeline()
    const mediator = new ClientMediator(commandPipeline.pipeline, queryPipeline.pipeline)
    const action: Delegate<string> = vi.fn().mockResolvedValue(Result.ok('command-result'))

    const result = await mediator.send(command, action)

    expect(result.getValueOrThrow()).toBe('command-result')
    expect(commandPipeline.handle).toHaveBeenCalledOnce()
    expect(commandPipeline.handle).toHaveBeenCalledWith(command, action)
    expect(queryPipeline.handle).not.toHaveBeenCalled()
  })

  it('should send queries through the query pipeline', async () => {
    const commandPipeline = createPipeline()
    const queryPipeline = createPipeline()
    const mediator = new ClientMediator(commandPipeline.pipeline, queryPipeline.pipeline)
    const action: Delegate<string> = vi.fn().mockResolvedValue(Result.ok('query-result'))

    const result = await mediator.query(query, action)

    expect(result.getValueOrThrow()).toBe('query-result')
    expect(queryPipeline.handle).toHaveBeenCalledOnce()
    expect(queryPipeline.handle).toHaveBeenCalledWith(query, action)
    expect(commandPipeline.handle).not.toHaveBeenCalled()
  })
})
