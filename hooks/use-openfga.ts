"use client"

import { useState, useCallback } from 'react'
import { useConnectionStore } from '@/lib/store/connection-store'
import type {
  Store,
  AuthorizationModel,
  Tuple,
  TupleKey,
  CheckResponse,
  ExpandResponse,
  ListObjectsResponse,
  ListUsersResponse,
  WriteAuthorizationModelRequest,
  ReadRequest,
  CheckRequest,
  ExpandRequest,
  ListObjectsRequest,
  ListUsersRequest,
} from '@/lib/openfga/types'

interface UseOpenFGAResult<T> {
  data: T | null
  loading: boolean
  error: string | null
  execute: () => Promise<T | null>
}

export function useStores() {
  const client = useConnectionStore((state) => state.client)
  const [stores, setStores] = useState<Store[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStores = useCallback(async () => {
    if (!client) return []
    setLoading(true)
    setError(null)
    try {
      const response = await client.listStores()
      setStores(response.stores)
      return response.stores
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch stores'
      setError(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [client])

  const createStore = useCallback(
    async (name: string) => {
      if (!client) return null
      setLoading(true)
      setError(null)
      try {
        const store = await client.createStore({ name })
        setStores((prev) => [...prev, store])
        return store
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to create store'
        setError(message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [client]
  )

  const deleteStore = useCallback(
    async (storeId: string) => {
      if (!client) return false
      setLoading(true)
      setError(null)
      try {
        await client.deleteStore(storeId)
        setStores((prev) => prev.filter((s) => s.id !== storeId))
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete store'
        setError(message)
        return false
      } finally {
        setLoading(false)
      }
    },
    [client]
  )

  return {
    stores,
    loading,
    error,
    fetchStores,
    createStore,
    deleteStore,
  }
}

export function useAuthorizationModels(storeId: string | null) {
  const client = useConnectionStore((state) => state.client)
  const [models, setModels] = useState<AuthorizationModel[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchModels = useCallback(async () => {
    if (!client || !storeId) return []
    setLoading(true)
    setError(null)
    try {
      const response = await client.listAuthorizationModels(storeId)
      setModels(response.authorization_models)
      return response.authorization_models
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch models'
      setError(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [client, storeId])

  const getModel = useCallback(
    async (modelId: string) => {
      if (!client || !storeId) return null
      try {
        const response = await client.getAuthorizationModel(storeId, modelId)
        return response.authorization_model
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch model'
        setError(message)
        return null
      }
    },
    [client, storeId]
  )

  const writeModel = useCallback(
    async (request: WriteAuthorizationModelRequest) => {
      if (!client || !storeId) return null
      setLoading(true)
      setError(null)
      try {
        const response = await client.writeAuthorizationModel(storeId, request)
        await fetchModels() // Refresh the list
        return response.authorization_model_id
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to write model'
        setError(message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [client, storeId, fetchModels]
  )

  return {
    models,
    loading,
    error,
    fetchModels,
    getModel,
    writeModel,
  }
}

export function useTuples(storeId: string | null) {
  const client = useConnectionStore((state) => state.client)
  const [tuples, setTuples] = useState<Tuple[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [continuationToken, setContinuationToken] = useState<string | undefined>()

  const fetchTuples = useCallback(
    async (request: ReadRequest = {}) => {
      if (!client || !storeId) return []
      setLoading(true)
      setError(null)
      try {
        const response = await client.read(storeId, request)
        setTuples(response.tuples)
        setContinuationToken(response.continuation_token)
        return response.tuples
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to fetch tuples'
        setError(message)
        return []
      } finally {
        setLoading(false)
      }
    },
    [client, storeId]
  )

  const writeTuples = useCallback(
    async (tupleKeys: TupleKey[]) => {
      if (!client || !storeId) return false
      setLoading(true)
      setError(null)
      try {
        await client.write(storeId, { writes: { tuple_keys: tupleKeys } })
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to write tuples'
        setError(message)
        return false
      } finally {
        setLoading(false)
      }
    },
    [client, storeId]
  )

  const deleteTuples = useCallback(
    async (tupleKeys: TupleKey[]) => {
      if (!client || !storeId) return false
      setLoading(true)
      setError(null)
      try {
        await client.write(storeId, { deletes: { tuple_keys: tupleKeys } })
        return true
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Failed to delete tuples'
        setError(message)
        return false
      } finally {
        setLoading(false)
      }
    },
    [client, storeId]
  )

  return {
    tuples,
    loading,
    error,
    continuationToken,
    fetchTuples,
    writeTuples,
    deleteTuples,
  }
}

export function useQueries(storeId: string | null) {
  const client = useConnectionStore((state) => state.client)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const check = useCallback(
    async (request: CheckRequest): Promise<CheckResponse | null> => {
      if (!client || !storeId) return null
      setLoading(true)
      setError(null)
      try {
        return await client.check(storeId, request)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Check failed'
        setError(message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [client, storeId]
  )

  const expand = useCallback(
    async (request: ExpandRequest): Promise<ExpandResponse | null> => {
      if (!client || !storeId) return null
      setLoading(true)
      setError(null)
      try {
        return await client.expand(storeId, request)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Expand failed'
        setError(message)
        return null
      } finally {
        setLoading(false)
      }
    },
    [client, storeId]
  )

  const listObjects = useCallback(
    async (request: ListObjectsRequest): Promise<{ data: ListObjectsResponse | null; error: string | null }> => {
      if (!client || !storeId) return { data: null, error: 'Not connected' }
      setLoading(true)
      setError(null)
      try {
        const data = await client.listObjects(storeId, request)
        return { data, error: null }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'List objects failed'
        setError(message)
        return { data: null, error: message }
      } finally {
        setLoading(false)
      }
    },
    [client, storeId]
  )

  const listUsers = useCallback(
    async (request: ListUsersRequest): Promise<{ data: ListUsersResponse | null; error: string | null }> => {
      if (!client || !storeId) return { data: null, error: 'Not connected' }
      setLoading(true)
      setError(null)
      try {
        const data = await client.listUsers(storeId, request)
        return { data, error: null }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'List users failed'
        setError(message)
        return { data: null, error: message }
      } finally {
        setLoading(false)
      }
    },
    [client, storeId]
  )

  return {
    loading,
    error,
    check,
    expand,
    listObjects,
    listUsers,
  }
}
