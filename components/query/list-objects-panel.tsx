"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, Play } from 'lucide-react'
import type { ListObjectsResponse } from '@/lib/openfga/types'

const STORAGE_KEY = 'openfga-query-list-objects'

interface ListObjectsPanelProps {
  onListObjects: (
    user: string,
    relation: string,
    type: string
  ) => Promise<{ data: ListObjectsResponse | null; error: string | null }>
  loading?: boolean
}

export function ListObjectsPanel({ onListObjects, loading = false }: ListObjectsPanelProps) {
  const [user, setUser] = useState('')
  const [relation, setRelation] = useState('')
  const [type, setType] = useState('')
  const [result, setResult] = useState<ListObjectsResponse | null>(null)
  const [error, setError] = useState('')
  const [querying, setQuerying] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const { user: u, relation: r, type: t } = JSON.parse(saved)
        if (u) setUser(u)
        if (r) setRelation(r)
        if (t) setType(t)
      } catch {}
    }
    setInitialized(true)
  }, [])

  useEffect(() => {
    if (initialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, relation, type }))
    }
  }, [user, relation, type, initialized])

  const handleQuery = async () => {
    if (!user.trim() || !relation.trim() || !type.trim()) {
      setError('All fields are required')
      return
    }

    setError('')
    setResult(null)
    setQuerying(true)

    const { data, error: queryError } = await onListObjects(user.trim(), relation.trim(), type.trim())

    if (data) {
      setResult(data)
    } else {
      setError(queryError || 'List objects query failed')
    }

    setQuerying(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>List Objects</CardTitle>
        <CardDescription>
          Find all objects of a specific type that a user has a relation with
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="list-objects-user">User</Label>
            <Input
              id="list-objects-user"
              placeholder="user:anne"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="list-objects-relation">Relation</Label>
            <Input
              id="list-objects-relation"
              placeholder="reader"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="list-objects-type">Object Type</Label>
            <Input
              id="list-objects-type"
              placeholder="document"
              value={type}
              onChange={(e) => setType(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {result && (
          <div className="bg-muted/50 rounded-md p-4">
            <h4 className="font-medium mb-2">
              Objects ({result.objects.length})
            </h4>
            {result.objects.length === 0 ? (
              <p className="text-muted-foreground text-sm">No objects found</p>
            ) : (
              <div className="flex flex-wrap gap-2">
                {result.objects.map((obj, i) => (
                  <Badge key={i} variant="outline" className="font-mono">
                    {obj}
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
