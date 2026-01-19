"use client"

import { useEffect, useCallback, useState } from 'react'
import { useParams } from 'next/navigation'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { TupleForm } from '@/components/tuples/tuple-form'
import { TupleList } from '@/components/tuples/tuple-list'
import { useTuples } from '@/hooks/use-openfga'
import { useConnectionStore } from '@/lib/store/connection-store'
import { AlertCircle, Link2, Sparkles, Info } from 'lucide-react'
import type { TupleKey, Tuple } from '@/lib/openfga/types'

// Sample tuples for playground mode
const PLAYGROUND_TUPLES: Tuple[] = [
  { key: { user: 'user:alice', relation: 'owner', object: 'folder:root' }, timestamp: new Date().toISOString() },
  { key: { user: 'user:bob', relation: 'viewer', object: 'folder:root' }, timestamp: new Date().toISOString() },
  { key: { user: 'user:alice', relation: 'owner', object: 'document:readme' }, timestamp: new Date().toISOString() },
  { key: { user: 'folder:root', relation: 'parent', object: 'document:readme' }, timestamp: new Date().toISOString() },
  { key: { user: 'group:engineering#member', relation: 'viewer', object: 'document:readme' }, timestamp: new Date().toISOString() },
]

export default function TuplesPage() {
  const params = useParams()
  const storeId = params.storeId as string
  const playgroundMode = useConnectionStore((state) => state.playgroundMode)

  const {
    tuples,
    loading,
    error,
    continuationToken,
    fetchTuples,
    writeTuples,
    deleteTuples,
  } = useTuples(storeId)

  // Playground state
  const [playgroundTuples, setPlaygroundTuples] = useState<Tuple[]>(PLAYGROUND_TUPLES)

  useEffect(() => {
    if (!playgroundMode) {
      fetchTuples({ page_size: 50 })
    }
  }, [fetchTuples, playgroundMode])

  const handleAddTuple = useCallback(
    async (tuple: TupleKey) => {
      if (playgroundMode) {
        // In playground mode, add to local state
        setPlaygroundTuples(prev => [
          { key: tuple, timestamp: new Date().toISOString() },
          ...prev,
        ])
        return true
      }

      const success = await writeTuples([tuple])
      if (success) {
        await fetchTuples({ page_size: 50 })
      }
      return success
    },
    [writeTuples, fetchTuples, playgroundMode]
  )

  const handleDeleteTuple = useCallback(
    async (tupleKey: TupleKey) => {
      if (playgroundMode) {
        // In playground mode, remove from local state
        setPlaygroundTuples(prev =>
          prev.filter(t =>
            !(t.key.user === tupleKey.user &&
              t.key.relation === tupleKey.relation &&
              t.key.object === tupleKey.object)
          )
        )
        return true
      }

      const success = await deleteTuples([tupleKey])
      if (success) {
        await fetchTuples({ page_size: 50 })
      }
      return success
    },
    [deleteTuples, fetchTuples, playgroundMode]
  )

  const displayTuples = playgroundMode ? playgroundTuples : tuples

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl shadow-lg bg-gradient-to-br from-violet-500 to-purple-600 shadow-violet-500/25">
          <Link2 className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Relationship Tuples
            </h1>
            {playgroundMode && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                Playground
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            {playgroundMode
              ? 'Experiment with relationship tuples in sandbox mode'
              : 'Manage relationship tuples that define access permissions'
            }
          </p>
        </div>
      </div>

      {/* Playground Notice */}
      {playgroundMode && (
        <div className="flex items-start gap-3 px-4 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50">
          <Info className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-medium text-amber-800 dark:text-amber-300">Playground Mode</p>
            <p className="text-amber-700 dark:text-amber-400/80 mt-0.5">
              Changes are stored locally and won&apos;t persist. Connect to a real OpenFGA server to save your data.
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && !playgroundMode && (
        <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* Add Tuple Form */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Add Tuple</h2>
          <p className="text-sm text-muted-foreground">Create a new relationship tuple</p>
        </div>
        <div className="p-6">
          <TupleForm onSubmit={handleAddTuple} loading={!playgroundMode && loading} />
        </div>
      </div>

      {/* Tuple List */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Existing Tuples</h2>
              <p className="text-sm text-muted-foreground">
                {displayTuples.length} tuple{displayTuples.length !== 1 ? 's' : ''} found
              </p>
            </div>
            {!playgroundMode && continuationToken && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fetchTuples({ page_size: 50, continuation_token: continuationToken })}
                disabled={loading}
              >
                Load More
              </Button>
            )}
          </div>
        </div>
        <div className="p-6">
          <TupleList
            tuples={displayTuples}
            loading={!playgroundMode && loading}
            error={playgroundMode ? null : error}
            onFetch={playgroundMode ? undefined : fetchTuples}
            onDelete={handleDeleteTuple}
            continuationToken={playgroundMode ? undefined : continuationToken}
          />
        </div>
      </div>
    </div>
  )
}
