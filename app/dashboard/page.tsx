"use client"

import { useEffect } from 'react'
import { StoreList } from '@/components/stores/store-list'
import { CreateStoreDialog } from '@/components/stores/create-store-dialog'
import { useStores } from '@/hooks/use-openfga'

export default function DashboardPage() {
  const { stores, loading, error, fetchStores, createStore, deleteStore } = useStores()

  useEffect(() => {
    fetchStores()
  }, [fetchStores])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stores</h1>
          <p className="text-muted-foreground">
            Manage your OpenFGA stores
          </p>
        </div>
        <CreateStoreDialog onCreateStore={createStore} />
      </div>

      <StoreList
        stores={stores}
        loading={loading}
        error={error}
        onDeleteStore={deleteStore}
        onRefresh={fetchStores}
      />
    </div>
  )
}
