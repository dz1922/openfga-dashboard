"use client"

import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { TupleTable } from './tuple-table'
import { RefreshCw, Search, Loader2, Filter } from 'lucide-react'
import type { Tuple, TupleKey, ReadRequest } from '@/lib/openfga/types'

interface TupleListProps {
  tuples: Tuple[]
  loading: boolean
  error: string | null
  onFetch?: (request?: ReadRequest) => Promise<Tuple[]>
  onDelete: (tupleKey: TupleKey) => Promise<boolean>
  continuationToken?: string
}

export function TupleList({
  tuples,
  loading,
  error,
  onFetch,
  onDelete,
  continuationToken,
}: TupleListProps) {
  const [filterUser, setFilterUser] = useState('')
  const [filterRelation, setFilterRelation] = useState('')
  const [filterObject, setFilterObject] = useState('')

  // For playground mode (no onFetch), filter tuples locally
  const isPlaygroundMode = !onFetch

  const filteredTuples = useMemo(() => {
    if (!isPlaygroundMode) return tuples

    return tuples.filter(tuple => {
      const userMatch = !filterUser.trim() ||
        tuple.key.user.toLowerCase().includes(filterUser.trim().toLowerCase())
      const relationMatch = !filterRelation.trim() ||
        tuple.key.relation.toLowerCase().includes(filterRelation.trim().toLowerCase())
      const objectMatch = !filterObject.trim() ||
        tuple.key.object.toLowerCase().includes(filterObject.trim().toLowerCase())
      return userMatch && relationMatch && objectMatch
    })
  }, [tuples, filterUser, filterRelation, filterObject, isPlaygroundMode])

  const handleSearch = () => {
    if (!onFetch) return // Playground mode uses local filtering

    const tupleKey: Partial<TupleKey> = {}
    if (filterUser.trim()) tupleKey.user = filterUser.trim()
    if (filterRelation.trim()) tupleKey.relation = filterRelation.trim()
    if (filterObject.trim()) tupleKey.object = filterObject.trim()

    onFetch({
      tuple_key: Object.keys(tupleKey).length > 0 ? tupleKey : undefined,
      page_size: 50,
    })
  }

  const handleRefresh = () => {
    if (onFetch) {
      handleSearch()
    }
  }

  const handleLoadMore = () => {
    if (continuationToken && onFetch) {
      const tupleKey: Partial<TupleKey> = {}
      if (filterUser.trim()) tupleKey.user = filterUser.trim()
      if (filterRelation.trim()) tupleKey.relation = filterRelation.trim()
      if (filterObject.trim()) tupleKey.object = filterObject.trim()

      onFetch({
        tuple_key: Object.keys(tupleKey).length > 0 ? tupleKey : undefined,
        page_size: 50,
        continuation_token: continuationToken,
      })
    }
  }

  const handleClearFilters = () => {
    setFilterUser('')
    setFilterRelation('')
    setFilterObject('')
    if (onFetch) {
      onFetch({ page_size: 50 })
    }
  }

  const displayTuples = isPlaygroundMode ? filteredTuples : tuples

  return (
    <div className="space-y-4">
      {/* Filter Section */}
      <div className="rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30 p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-slate-500" />
          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Filter Tuples</span>
          {isPlaygroundMode && (
            <span className="text-xs text-muted-foreground">(local filtering)</span>
          )}
        </div>
        <div className="grid gap-4 sm:grid-cols-3 mb-4">
          <div className="space-y-1.5">
            <Label htmlFor="filter-user" className="text-xs text-muted-foreground">User</Label>
            <Input
              id="filter-user"
              placeholder="user:anne"
              value={filterUser}
              onChange={(e) => setFilterUser(e.target.value)}
              className="h-9 bg-white dark:bg-slate-900"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filter-relation" className="text-xs text-muted-foreground">Relation</Label>
            <Input
              id="filter-relation"
              placeholder="reader"
              value={filterRelation}
              onChange={(e) => setFilterRelation(e.target.value)}
              className="h-9 bg-white dark:bg-slate-900"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="filter-object" className="text-xs text-muted-foreground">Object</Label>
            <Input
              id="filter-object"
              placeholder="document:budget"
              value={filterObject}
              onChange={(e) => setFilterObject(e.target.value)}
              className="h-9 bg-white dark:bg-slate-900"
            />
          </div>
        </div>
        <div className="flex gap-2">
          {!isPlaygroundMode && (
            <>
              <Button size="sm" onClick={handleSearch} disabled={loading}>
                {loading ? (
                  <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Search className="mr-2 h-3.5 w-3.5" />
                )}
                Search
              </Button>
              <Button size="sm" variant="outline" onClick={handleRefresh} disabled={loading}>
                <RefreshCw className={`mr-2 h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </>
          )}
          <Button size="sm" variant="outline" onClick={handleClearFilters} disabled={loading}>
            Clear Filters
          </Button>
        </div>
      </div>

      {error && (
        <div className="text-destructive text-sm">{error}</div>
      )}

      <TupleTable tuples={displayTuples} onDelete={onDelete} loading={loading} />

      {continuationToken && !isPlaygroundMode && (
        <div className="flex justify-center">
          <Button variant="outline" size="sm" onClick={handleLoadMore} disabled={loading}>
            {loading ? (
              <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" />
            ) : null}
            Load More
          </Button>
        </div>
      )}
    </div>
  )
}
