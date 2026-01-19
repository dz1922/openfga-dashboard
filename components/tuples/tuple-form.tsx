"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Loader2, Plus } from 'lucide-react'
import type { TupleKey } from '@/lib/openfga/types'

interface TupleFormProps {
  onSubmit: (tuple: TupleKey) => Promise<boolean>
  loading?: boolean
}

export function TupleForm({ onSubmit, loading = false }: TupleFormProps) {
  const [user, setUser] = useState('')
  const [relation, setRelation] = useState('')
  const [object, setObject] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user.trim() || !relation.trim() || !object.trim()) {
      setError('All fields are required')
      return
    }

    setSubmitting(true)
    const success = await onSubmit({
      user: user.trim(),
      relation: relation.trim(),
      object: object.trim(),
    })
    setSubmitting(false)

    if (success) {
      setUser('')
      setRelation('')
      setObject('')
    } else {
      setError('Failed to create tuple')
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Relationship Tuple</CardTitle>
        <CardDescription>
          Create a new relationship tuple to define access permissions
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="user">User</Label>
              <Input
                id="user"
                placeholder="user:anne"
                value={user}
                onChange={(e) => setUser(e.target.value)}
                disabled={submitting || loading}
              />
              <p className="text-xs text-muted-foreground">
                Format: type:id or type:id#relation
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="relation">Relation</Label>
              <Input
                id="relation"
                placeholder="reader"
                value={relation}
                onChange={(e) => setRelation(e.target.value)}
                disabled={submitting || loading}
              />
              <p className="text-xs text-muted-foreground">
                The relation name from your model
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="object">Object</Label>
              <Input
                id="object"
                placeholder="document:budget"
                value={object}
                onChange={(e) => setObject(e.target.value)}
                disabled={submitting || loading}
              />
              <p className="text-xs text-muted-foreground">
                Format: type:id
              </p>
            </div>
          </div>

          {error && <p className="text-sm text-destructive">{error}</p>}
        </CardContent>
        <CardFooter>
          <Button type="submit" disabled={submitting || loading}>
            {submitting ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Plus className="mr-2 h-4 w-4" />
            )}
            Add Tuple
          </Button>
        </CardFooter>
      </form>
    </Card>
  )
}
