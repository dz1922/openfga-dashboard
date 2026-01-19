"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Play } from 'lucide-react'
import type { ListUsersResponse, User } from '@/lib/openfga/types'

const STORAGE_KEY = 'openfga-query-list-users'

interface ListUsersPanelProps {
  onListUsers: (
    objectType: string,
    objectId: string,
    relation: string,
    userFilterType: string
  ) => Promise<{ data: ListUsersResponse | null; error: string | null }>
  loading?: boolean
}

function formatUser(user: User): string {
  if (user.object) {
    return `${user.object.type}:${user.object.id}`
  }
  if (user.userset) {
    return `${user.userset.type}:${user.userset.id}#${user.userset.relation}`
  }
  if (user.wildcard) {
    return `${user.wildcard.type}:*`
  }
  return 'unknown'
}

export function ListUsersPanel({ onListUsers, loading = false }: ListUsersPanelProps) {
  const [objectType, setObjectType] = useState('')
  const [objectId, setObjectId] = useState('')
  const [relation, setRelation] = useState('')
  const [userFilterType, setUserFilterType] = useState('')
  const [result, setResult] = useState<ListUsersResponse | null>(null)
  const [error, setError] = useState('')
  const [querying, setQuerying] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const { objectType: ot, objectId: oi, relation: r, userFilterType: uft } = JSON.parse(saved)
        if (ot) setObjectType(ot)
        if (oi) setObjectId(oi)
        if (r) setRelation(r)
        if (uft) setUserFilterType(uft)
      } catch {}
    }
    setInitialized(true)
  }, [])

  useEffect(() => {
    if (initialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ objectType, objectId, relation, userFilterType }))
    }
  }, [objectType, objectId, relation, userFilterType, initialized])

  const handleQuery = async () => {
    if (!objectType.trim() || !objectId.trim() || !relation.trim() || !userFilterType.trim()) {
      setError('All fields are required')
      return
    }

    setError('')
    setResult(null)
    setQuerying(true)

    const { data, error: queryError } = await onListUsers(
      objectType.trim(),
      objectId.trim(),
      relation.trim(),
      userFilterType.trim()
    )

    if (data) {
      setResult(data)
    } else {
      setError(queryError || 'List users query failed')
    }

    setQuerying(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>List Users</CardTitle>
        <CardDescription>
          Find all users that have a specific relation with an object
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="list-users-object-type">Object Type</Label>
            <Input
              id="list-users-object-type"
              placeholder="document"
              value={objectType}
              onChange={(e) => setObjectType(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="list-users-object-id">Object ID</Label>
            <Input
              id="list-users-object-id"
              placeholder="budget"
              value={objectId}
              onChange={(e) => setObjectId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="list-users-relation">Relation</Label>
            <Input
              id="list-users-relation"
              placeholder="reader"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="list-users-filter-type">User Filter Type</Label>
            <Input
              id="list-users-filter-type"
              placeholder="user"
              value={userFilterType}
              onChange={(e) => setUserFilterType(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {result && (
          <div className="bg-muted/50 rounded-md p-4">
            <h4 className="font-medium mb-2">
              Users ({result.users.length})
            </h4>
            {result.users.length === 0 ? (
              <p className="text-muted-foreground text-sm">No users found</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {result.users.map((user, i) => (
                  <Badge key={i} variant="outline" className="font-mono">
                    {formatUser(user)}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleQuery} disabled={querying || loading}>
          {querying ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          Run Query
        </Button>
      </CardFooter>
    </Card>
  )
}
