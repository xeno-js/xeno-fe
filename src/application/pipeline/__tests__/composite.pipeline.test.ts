import type { Delegate, IRequest } from '@xeno-js/shared'
import { Result } from '@xeno-js/shared'
import { describe, expect, it, vi } from 'vitest'

import type { IPipeline } from '@/domain'

import { CompositePipeline } from '../composite.pipeline'

describe('CompositePipeline', () => {
  const mockRequest: IRequest<string> = {
    intent: 'TestIntent',
    type: 'QUERY',
  }

  it('should execute next directly when pipelines array is empty', async () => {
    const pipeline = new CompositePipeline([])
    const next: Delegate<string> = vi.fn().mockResolvedValue(Result.ok('success'))

    const result = await pipeline.handle(mockRequest, next)

    expect(next).toHaveBeenCalledOnce()
    expect(result.isOk()).toBe(true)
    expect(result.getValueOrThrow()).toBe('success')
  })

  it('should execute a single pipeline behavior before calling next', async () => {
    const behavior: IPipeline = {
      async handle<TResult>(_req: IRequest<TResult>, nextFn: Delegate<TResult>) {
        return nextFn()
      },
    }
    const handle = vi.spyOn(behavior, 'handle')
    const pipeline = new CompositePipeline([behavior])
    const next: Delegate<string> = vi.fn().mockResolvedValue(Result.ok('result-single'))

    const result = await pipeline.handle(mockRequest, next)

    expect(handle).toHaveBeenCalledOnce()
    expect(handle).toHaveBeenCalledWith(mockRequest, expect.any(Function))
    expect(next).toHaveBeenCalledOnce()
    expect(result.isOk()).toBe(true)
    expect(result.getValueOrThrow()).toBe('result-single')
  })

  it('should execute multiple pipeline behaviors in the correct order', async () => {
    const executionOrder: string[] = []

    const behavior1: IPipeline = {
      async handle<TResult>(_req: IRequest<TResult>, nextFn: Delegate<TResult>) {
        executionOrder.push('b1-start')
        const res = await nextFn()
        executionOrder.push('b1-end')
        return res
      },
    }

    const behavior2: IPipeline = {
      async handle<TResult>(_req: IRequest<TResult>, nextFn: Delegate<TResult>) {
        executionOrder.push('b2-start')
        const res = await nextFn()
        executionOrder.push('b2-end')
        return res
      },
    }

    const pipeline = new CompositePipeline([behavior1, behavior2])
    const next: Delegate<string> = vi.fn().mockImplementation(async () => {
      executionOrder.push('next')
      return Result.ok('multi-success')
    })

    const result = await pipeline.handle(mockRequest, next)

    expect(executionOrder).toEqual(['b1-start', 'b2-start', 'next', 'b2-end', 'b1-end'])
    expect(result.isOk()).toBe(true)
    expect(result.getValueOrThrow()).toBe('multi-success')
  })
})
