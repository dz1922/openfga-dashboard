"use client"

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ConnectionConfig, AuthConfig, Store, AuthorizationModel } from '@/lib/openfga/types'
import { OpenFGAClient, clearTokenCache } from '@/lib/openfga/client'

// Sample model for Playground Mode
export const PLAYGROUND_SAMPLE_MODEL: AuthorizationModel = {
  id: 'playground-sample-model',
  schema_version: '1.1',
  type_definitions: [
    {
      type: 'user',
    },
    {
      type: 'group',
      relations: {
        member: { this: {} },
      },
      metadata: {
        relations: {
          member: {
            directly_related_user_types: [{ type: 'user' }],
          },
        },
      },
    },
    {
      type: 'folder',
      relations: {
        owner: { this: {} },
        parent: { this: {} },
        viewer: {
          union: {
            child: [
              { this: {} },
              { computedUserset: { relation: 'owner' } },
              {
                tupleToUserset: {
                  tupleset: { relation: 'parent' },
                  computedUserset: { relation: 'viewer' },
                },
              },
            ],
          },
        },
      },
      metadata: {
        relations: {
          owner: {
            directly_related_user_types: [{ type: 'user' }],
          },
          parent: {
            directly_related_user_types: [{ type: 'folder' }],
          },
          viewer: {
            directly_related_user_types: [
              { type: 'user' },
              { type: 'user', wildcard: {} },
              { type: 'group', relation: 'member' },
            ],
          },
        },
      },
    },
    {
      type: 'document',
      relations: {
        owner: { this: {} },
        parent: { this: {} },
        writer: {
          union: {
            child: [
              { this: {} },
              { computedUserset: { relation: 'owner' } },
            ],
          },
        },
        reader: {
          union: {
            child: [
              { this: {} },
              { computedUserset: { relation: 'writer' } },
              {
                tupleToUserset: {
                  tupleset: { relation: 'parent' },
                  computedUserset: { relation: 'viewer' },
                },
              },
            ],
          },
        },
      },
      metadata: {
        relations: {
          owner: {
            directly_related_user_types: [{ type: 'user' }],
          },
          parent: {
            directly_related_user_types: [{ type: 'folder' }],
          },
          writer: {
            directly_related_user_types: [
              { type: 'user' },
              { type: 'group', relation: 'member' },
            ],
          },
          reader: {
            directly_related_user_types: [
              { type: 'user' },
              { type: 'user', wildcard: {} },
              { type: 'group', relation: 'member' },
            ],
          },
        },
      },
    },
  ],
}

// Sample store for Playground Mode
export const PLAYGROUND_STORE: Store = {
  id: 'playground-store',
  name: 'Playground Store',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

interface ConnectionState {
  // Connection configuration
  config: ConnectionConfig | null
  isConnected: boolean

  // Playground mode
  playgroundMode: boolean

  // Current selection
  currentStoreId: string | null
  currentStore: Store | null

  // Client instance
  client: OpenFGAClient | null

  // Actions
  setConfig: (config: ConnectionConfig) => void
  testConnection: (config: ConnectionConfig) => Promise<boolean>
  connect: (config: ConnectionConfig) => Promise<boolean>
  disconnect: () => void
  setCurrentStore: (store: Store | null) => void
  clearCurrentStore: () => void

  // Playground actions
  enterPlaygroundMode: () => void
  exitPlaygroundMode: () => void
}

export const useConnectionStore = create<ConnectionState>()(
  persist(
    (set, get) => ({
      config: null,
      isConnected: false,
      playgroundMode: false,
      currentStoreId: null,
      currentStore: null,
      client: null,

      setConfig: (config: ConnectionConfig) => {
        set({ config })
      },

      testConnection: async (config: ConnectionConfig) => {
        const client = new OpenFGAClient(config)
        try {
          return await client.testConnection()
        } catch (error) {
          console.error('Test connection failed:', error)
          return false
        }
      },

      connect: async (config: ConnectionConfig) => {
        const client = new OpenFGAClient(config)
        try {
          const success = await client.testConnection()
          if (success) {
            set({ config, client, isConnected: true, playgroundMode: false })
            return true
          }
          return false
        } catch (error) {
          console.error('Connection failed:', error)
          return false
        }
      },

      disconnect: () => {
        clearTokenCache()
        set({
          isConnected: false,
          playgroundMode: false,
          client: null,
          currentStoreId: null,
          currentStore: null,
        })
      },

      setCurrentStore: (store: Store | null) => {
        set({
          currentStore: store,
          currentStoreId: store?.id || null,
        })
      },

      clearCurrentStore: () => {
        set({
          currentStore: null,
          currentStoreId: null,
        })
      },

      enterPlaygroundMode: () => {
        set({
          playgroundMode: true,
          isConnected: true,
          client: null,
          currentStore: PLAYGROUND_STORE,
          currentStoreId: PLAYGROUND_STORE.id,
        })
      },

      exitPlaygroundMode: () => {
        set({
          playgroundMode: false,
          isConnected: false,
          client: null,
          currentStore: null,
          currentStoreId: null,
        })
      },
    }),
    {
      name: 'openfga-connection',
      partialize: (state) => ({
        config: state.config,
        currentStoreId: state.currentStoreId,
        playgroundMode: state.playgroundMode,
      }),
      skipHydration: true,
      onRehydrateStorage: () => (state) => {
        // Recreate client instance after rehydration
        if (state?.config && !state.playgroundMode) {
          const client = new OpenFGAClient(state.config)
          state.client = client
        }
        // Restore playground store if in playground mode
        if (state?.playgroundMode) {
          state.currentStore = PLAYGROUND_STORE
          state.isConnected = true
        }
      },
    }
  )
)

// Hydrate the store on client side
if (typeof window !== 'undefined') {
  useConnectionStore.persist.rehydrate()
}

// Hook to get a connected client or throw
export function useOpenFGAClient(): OpenFGAClient {
  const client = useConnectionStore((state) => state.client)
  if (!client) {
    throw new Error('Not connected to OpenFGA server')
  }
  return client
}
