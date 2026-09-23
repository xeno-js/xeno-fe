import type { HttpBaseRequest, HttpResponse, IHttpClient } from '@xeno-js/shared'
import { describe, expect, it, vi } from 'vitest'

import { RemoteDataSource } from '../remote.datasource'

class TestDataSource extends RemoteDataSource {}

describe('RemoteDataSource', () => {
  const request: HttpBaseRequest = {
    query: { page: '1' },
    signal: new AbortController().signal,
    timeoutMs: 1500,
    headers: { 'x-request-id': 'request-1' },
  }

  const createResponse = <T>(data: T): HttpResponse<T> => ({
    status: 200,
    ok: true,
    headers: {},
    data,
  })

  const createClient = () => {
    const client: IHttpClient = {
      async get<T>() {
        return createResponse({ id: 1 } as T)
      },
      async post<T>() {
        return createResponse({ id: 2 } as T)
      },
      async put<T>() {
        return createResponse({ id: 3 } as T)
      },
      async patch<T>() {
        return createResponse({ id: 4 } as T)
      },
      async delete<T>() {
        return createResponse({ id: 5 } as T)
      },
    }

    return {
      client,
      get: vi.spyOn(client, 'get'),
      post: vi.spyOn(client, 'post'),
      put: vi.spyOn(client, 'put'),
      patch: vi.spyOn(client, 'patch'),
      delete: vi.spyOn(client, 'delete'),
    }
  }

  it('should send GET requests and return response data', async () => {
    const client = createClient()
    const dataSource = new TestDataSource(client.client)

    const result = await dataSource.get<{ id: number }>('/items', request)

    expect(result.getValueOrThrow()).toEqual({ id: 1 })
    expect(client.get).toHaveBeenCalledWith('/items', {
      ...request,
      method: 'GET',
    })
  })

  it('should send POST requests with the request body', async () => {
    const client = createClient()
    const dataSource = new TestDataSource(client.client)
    const body = { name: 'item' }

    const result = await dataSource.post<{ id: number }, typeof body>('/items', body, request)

    expect(result.getValueOrThrow()).toEqual({ id: 2 })
    expect(client.post).toHaveBeenCalledWith('/items', body, {
      ...request,
      method: 'POST',
      body,
    })
  })

  it('should send PUT requests with the request body', async () => {
    const client = createClient()
    const dataSource = new TestDataSource(client.client)
    const body = { name: 'updated' }

    const result = await dataSource.put<{ id: number }, typeof body>('/items/1', body, request)

    expect(result.getValueOrThrow()).toEqual({ id: 3 })
    expect(client.put).toHaveBeenCalledWith('/items/1', body, {
      ...request,
      method: 'PUT',
      body,
    })
  })

  it('should send PATCH requests with the request body', async () => {
    const client = createClient()
    const dataSource = new TestDataSource(client.client)
    const body = { name: 'patched' }

    const result = await dataSource.patch<{ id: number }, typeof body>('/items/1', body, request)

    expect(result.getValueOrThrow()).toEqual({ id: 4 })
    expect(client.patch).toHaveBeenCalledWith('/items/1', body, {
      ...request,
      method: 'PATCH',
      body,
    })
  })

  it('should send DELETE requests and return response data', async () => {
    const client = createClient()
    const dataSource = new TestDataSource(client.client)

    const result = await dataSource.delete<{ id: number }>('/items/1', request)

    expect(result.getValueOrThrow()).toEqual({ id: 5 })
    expect(client.delete).toHaveBeenCalledWith('/items/1', {
      ...request,
      method: 'DELETE',
    })
  })
})
