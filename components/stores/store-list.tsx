"use client"

import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useConnectionStore } from '@/lib/store/connection-store'
import type { Store } from '@/lib/openfga/types'
import { Store as StoreIcon, Trash2, RefreshCw, Loader2, AlertCircle } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useState } from 'react'

interface StoreListProps {
  stores: Store[]
  loading: boolean
  error: string | null
  onDeleteStore: (storeId: string) => Promise<boolean>
  onRefresh: () => void
}

export function StoreList({
  stores,
  loading,
  error,
  onDeleteStore,
  onRefresh,
}: StoreListProps) {
  const router = useRouter()
  const setCurrentStore = useConnectionStore((state) => state.setCurrentStore)
  const currentStoreId = useConnectionStore((state) => state.currentStoreId)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null)

  const handleSelectStore = (store: Store) => {
    setCurrentStore(store)
    router.push(`/dashboard/stores/${store.id}`)
  }

  const handleDeleteClick = (e: React.MouseEvent, store: Store) => {
    e.stopPropagation()
    setStoreToDelete(store)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!storeToDelete) return

    setDeletingId(storeToDelete.id)
    const success = await onDeleteStore(storeToDelete.id)

    if (success && currentStoreId === storeToDelete.id) {
      useConnectionStore.getState().clearCurrentStore()
    }

    setDeletingId(null)
    setDeleteDialogOpen(false)
    setStoreToDelete(null)
  }

  if (loading && stores.length === 0) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription className="flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={onRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  if (stores.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <StoreIcon className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">No stores found</h3>
          <p className="text-muted-foreground text-center mb-4">
            Create your first store to get started with OpenFGA
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Button variant="outline" size="sm" onClick={onRefresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stores.map((store) => (
          <Card
            key={store.id}
            className={`cursor-pointer transition-colors hover:border-primary ${
              currentStoreId === store.id ? 'border-primary' : ''
            }`}
            onClick={() => handleSelectStore(store)}
          >
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg truncate" title={store.name}>
                  {store.name}
                </CardTitle>
                {currentStoreId === store.id && (
                  <Badge variant="secondary">Selected</Badge>
                )}
              </div>
              <CardDescription className="font-mono text-xs truncate" title={store.id}>
                {store.id}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>
                  Created: {new Date(store.created_at).toLocaleDateString()}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={(e) => handleDeleteClick(e, store)}
                  disabled={deletingId === store.id}
                >
                  {deletingId === store.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Store</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the store &quot;{storeToDelete?.name}&quot;?
              This action cannot be undone and will delete all authorization models
              and relationship tuples in this store.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deletingId !== null}
            >
              {deletingId !== null && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
