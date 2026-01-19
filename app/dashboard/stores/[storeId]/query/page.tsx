"use client"

import { useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckPanel } from '@/components/query/check-panel'
import { ExpandPanel } from '@/components/query/expand-panel'
import { ListObjectsPanel } from '@/components/query/list-objects-panel'
import { ListUsersPanel } from '@/components/query/list-users-panel'
import { useQueries } from '@/hooks/use-openfga'
import { useConnectionStore } from '@/lib/store/connection-store'
import { Search, Sparkles } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import type { CheckResponse, ExpandResponse, ListObjectsResponse, ListUsersResponse } from '@/lib/openfga/types'

export default function QueryPage() {
  const params = useParams()
  const storeId = params.storeId as string
  const playgroundMode = useConnectionStore((state) => state.playgroundMode)

  const { loading, check, expand, listObjects, listUsers } = useQueries(storeId)

  const handleCheck = useCallback(
    async (user: string, relation: string, object: string): Promise<CheckResponse | null> => {
      return await check({
        tuple_key: { user, relation, object },
      })
    },
    [check]
  )

  const handleExpand = useCallback(
    async (relation: string, object: string): Promise<ExpandResponse | null> => {
      return await expand({
        tuple_key: { relation, object },
      })
    },
    [expand]
  )

  const handleListObjects = useCallback(
    async (
      user: string,
      relation: string,
      type: string
    ): Promise<{ data: ListObjectsResponse | null; error: string | null }> => {
      return await listObjects({
        user,
        relation,
        type,
      })
    },
    [listObjects]
  )

  const handleListUsers = useCallback(
    async (
      objectType: string,
      objectId: string,
      relation: string,
      userFilterType: string
    ): Promise<{ data: ListUsersResponse | null; error: string | null }> => {
      return await listUsers({
        object: { type: objectType, id: objectId },
        relation,
        user_filters: [{ type: userFilterType }],
      })
    },
    [listUsers]
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className="p-3 rounded-2xl shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 shadow-amber-500/25">
          <Search className="h-6 w-6 text-white" />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
              Query Operations
            </h1>
            {playgroundMode && (
              <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                <Sparkles className="h-3 w-3 mr-1" />
                Playground
              </Badge>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Test your authorization model with different query operations
          </p>
        </div>
      </div>

      <Tabs defaultValue="check" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="check">Check</TabsTrigger>
          <TabsTrigger value="expand">Expand</TabsTrigger>
          <TabsTrigger value="list-objects">List Objects</TabsTrigger>
          <TabsTrigger value="list-users">List Users</TabsTrigger>
        </TabsList>

        <TabsContent value="check">
          <CheckPanel onCheck={handleCheck} loading={loading} />
        </TabsContent>

        <TabsContent value="expand">
          <ExpandPanel onExpand={handleExpand} loading={loading} />
        </TabsContent>

        <TabsContent value="list-objects">
          <ListObjectsPanel onListObjects={handleListObjects} loading={loading} />
        </TabsContent>

        <TabsContent value="list-users">
          <ListUsersPanel onListUsers={handleListUsers} loading={loading} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
