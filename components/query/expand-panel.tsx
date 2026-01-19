"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Play } from 'lucide-react'
import type { ExpandResponse, Node } from '@/lib/openfga/types'

const STORAGE_KEY = 'openfga-query-expand'

interface ExpandPanelProps {
  onExpand: (relation: string, object: string) => Promise<ExpandResponse | null>
  loading?: boolean
}

function TreeNode({ node, depth = 0 }: { node: Node; depth?: number }) {
  const indent = depth * 16

  if (node.leaf?.users) {
    return (
      <div style={{ marginLeft: indent }} className="py-1">
        <span className="text-muted-foreground">Users: </span>
        {node.leaf.users.users.length === 0 ? (
          <span className="text-muted-foreground italic">none</span>
        ) : (
          <span className="font-mono text-sm">
            {node.leaf.users.users.join(', ')}
          </span>
        )}
      </div>
    )
  }

  if (node.leaf?.computed) {
    return (
      <div style={{ marginLeft: indent }} className="py-1">
        <span className="text-muted-foreground">Computed: </span>
        <span className="font-mono text-sm">{node.leaf.computed.userset}</span>
      </div>
    )
  }

  if (node.union) {
    return (
      <div style={{ marginLeft: indent }}>
        <span className="font-medium text-blue-600 dark:text-blue-400">union</span>
        {node.union.nodes.map((child, i) => (
          <TreeNode key={i} node={child} depth={depth + 1} />
        ))}
      </div>
    )
  }

  if (node.intersection) {
    return (
      <div style={{ marginLeft: indent }}>
        <span className="font-medium text-green-600 dark:text-green-400">intersection</span>
        {node.intersection.nodes.map((child, i) => (
          <TreeNode key={i} node={child} depth={depth + 1} />
        ))}
      </div>
    )
  }

  if (node.difference) {
    return (
      <div style={{ marginLeft: indent }}>
        <span className="font-medium text-orange-600 dark:text-orange-400">difference</span>
        {node.difference.nodes.map((child, i) => (
          <TreeNode key={i} node={child} depth={depth + 1} />
        ))}
      </div>
    )
  }

  if (node.name) {
    return (
      <div style={{ marginLeft: indent }} className="py-1 font-mono text-sm">
        {node.name}
      </div>
    )
  }

  return null
}

export function ExpandPanel({ onExpand, loading = false }: ExpandPanelProps) {
  const [relation, setRelation] = useState('')
  const [object, setObject] = useState('')
  const [result, setResult] = useState<ExpandResponse | null>(null)
  const [error, setError] = useState('')
  const [expanding, setExpanding] = useState(false)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const { relation: r, object: o } = JSON.parse(saved)
        if (r) setRelation(r)
        if (o) setObject(o)
      } catch {}
    }
    setInitialized(true)
  }, [])

  useEffect(() => {
    if (initialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ relation, object }))
    }
  }, [relation, object, initialized])

  const handleExpand = async () => {
    if (!relation.trim() || !object.trim()) {
      setError('All fields are required')
      return
    }

    setError('')
    setResult(null)
    setExpanding(true)

    const response = await onExpand(relation.trim(), object.trim())

    if (response) {
      setResult(response)
    } else {
      setError('Expand query failed')
    }

    setExpanding(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expand</CardTitle>
        <CardDescription>
          View the relationship tree for a given relation and object
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="expand-relation">Relation</Label>
            <Input
              id="expand-relation"
              placeholder="reader"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="expand-object">Object</Label>
            <Input
              id="expand-object"
              placeholder="document:budget"
              value={object}
              onChange={(e) => setObject(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {result?.tree?.root && (
          <div className="bg-muted/50 rounded-md p-4 overflow-auto max-h-96">
            <h4 className="font-medium mb-2">Relationship Tree</h4>
            <TreeNode node={result.tree.root} />
          </div>
        )}

        {result && !result.tree?.root && (
          <div className="text-muted-foreground text-sm">
            No relationship tree available
          </div>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleExpand} disabled={expanding || loading}>
          {expanding ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          Run Expand
        </Button>
      </CardFooter>
    </Card>
  )
}
