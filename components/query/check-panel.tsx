"use client"

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Loader2, Play, CheckCircle2, XCircle } from 'lucide-react'
import type { CheckResponse } from '@/lib/openfga/types'

const STORAGE_KEY = 'openfga-query-check'

interface CheckPanelProps {
  onCheck: (user: string, relation: string, object: string) => Promise<CheckResponse | null>
  loading?: boolean
}

export function CheckPanel({ onCheck, loading = false }: CheckPanelProps) {
  const [user, setUser] = useState('')
  const [relation, setRelation] = useState('')
  const [object, setObject] = useState('')
  const [initialized, setInitialized] = useState(false)

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      try {
        const { user: u, relation: r, object: o } = JSON.parse(saved)
        if (u) setUser(u)
        if (r) setRelation(r)
        if (o) setObject(o)
      } catch {}
    }
    setInitialized(true)
  }, [])

  // Save to localStorage on change
  useEffect(() => {
    if (initialized) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ user, relation, object }))
    }
  }, [user, relation, object, initialized])
  const [result, setResult] = useState<CheckResponse | null>(null)
  const [error, setError] = useState('')
  const [checking, setChecking] = useState(false)

  const handleCheck = async () => {
    if (!user.trim() || !relation.trim() || !object.trim()) {
      setError('All fields are required')
      return
    }

    setError('')
    setResult(null)
    setChecking(true)

    const response = await onCheck(user.trim(), relation.trim(), object.trim())

    if (response) {
      setResult(response)
    } else {
      setError('Check query failed')
    }

    setChecking(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Check</CardTitle>
        <CardDescription>
          Test if a user has a specific relation with an object
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="check-user">User</Label>
            <Input
              id="check-user"
              placeholder="user:anne"
              value={user}
              onChange={(e) => setUser(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="check-relation">Relation</Label>
            <Input
              id="check-relation"
              placeholder="reader"
              value={relation}
              onChange={(e) => setRelation(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="check-object">Object</Label>
            <Input
              id="check-object"
              placeholder="document:budget"
              value={object}
              onChange={(e) => setObject(e.target.value)}
            />
          </div>
        </div>

        {error && <p className="text-sm text-destructive">{error}</p>}

        {result && (
          <Alert variant={result.allowed ? 'default' : 'destructive'}>
            {result.allowed ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle className="flex items-center gap-2">
              Result
              <Badge variant={result.allowed ? 'success' : 'destructive'}>
                {result.allowed ? 'ALLOWED' : 'DENIED'}
              </Badge>
            </AlertTitle>
            <AlertDescription>
              <code className="text-xs">
                {user} {result.allowed ? 'HAS' : 'DOES NOT HAVE'} {relation} on {object}
              </code>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleCheck} disabled={checking || loading}>
          {checking ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Play className="mr-2 h-4 w-4" />
          )}
          Run Check
        </Button>
      </CardFooter>
    </Card>
  )
}
