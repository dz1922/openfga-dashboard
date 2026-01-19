"use client"

import { useCallback } from 'react'
import { useParams } from 'next/navigation'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { CheckPanel } from '@/components/query/check-panel'
import { ExpandPanel } from '@/components/query/expand-panel'
import { ListObjectsPanel } from '@/components/query/list-objects-panel'
import { ListUsersPanel } from '@/components/query/list-users-panel'
import { useQueries } from '@/hooks/use-openfga'
import type { CheckResponse, ExpandResponse, ListObjectsResponse, ListUsersResponse } from '@/lib/openfga/types'

export default function QueryPage() {
  const params = useParams()
  const storeId = params.storeId as string

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
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Query Operations</h1>
        <p className="text-muted-foreground">
          Test your authorization model with different query operations
        </p>
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
