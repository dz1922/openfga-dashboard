"use client"

import { useState, useCallback } from 'react'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Loader2, Save, AlertCircle, CheckCircle2 } from 'lucide-react'

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-[400px] flex items-center justify-center border rounded-md bg-muted">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    ),
  }
)

interface ModelEditorProps {
  onSave: (modelJson: string) => Promise<string | null>
  loading?: boolean
}

const DEFAULT_MODEL = `{
  "schema_version": "1.1",
  "type_definitions": [
    {
      "type": "user"
    },
    {
      "type": "document",
      "relations": {
        "reader": {
          "this": {}
        },
        "writer": {
          "this": {}
        },
        "owner": {
          "this": {}
        }
      },
      "metadata": {
        "relations": {
          "reader": {
            "directly_related_user_types": [
              { "type": "user" }
            ]
          },
          "writer": {
            "directly_related_user_types": [
              { "type": "user" }
            ]
          },
          "owner": {
            "directly_related_user_types": [
              { "type": "user" }
            ]
          }
        }
      }
    }
  ]
}`

export function ModelEditor({ onSave, loading = false }: ModelEditorProps) {
  const [value, setValue] = useState(DEFAULT_MODEL)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [saving, setSaving] = useState(false)

  const handleSave = useCallback(async () => {
    setError(null)
    setSuccess(false)

    // Validate JSON
    try {
      JSON.parse(value)
    } catch (e) {
      setError('Invalid JSON: ' + (e instanceof Error ? e.message : 'Parse error'))
      return
    }

    setSaving(true)
    const modelId = await onSave(value)
    setSaving(false)

    if (modelId) {
      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } else {
      setError('Failed to save model')
    }
  }, [value, onSave])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Model</CardTitle>
        <CardDescription>
          Define your authorization model in JSON format. The model follows the OpenFGA
          schema specification.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="border rounded-md overflow-hidden">
          <Editor
            height="400px"
            defaultLanguage="json"
            value={value}
            onChange={(v) => setValue(v || '')}
            theme="vs-dark"
            options={{
              minimap: { enabled: false },
              fontSize: 14,
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              formatOnPaste: true,
              formatOnType: true,
              tabSize: 2,
            }}
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>Authorization model saved successfully!</AlertDescription>
          </Alert>
        )}
      </CardContent>
      <CardFooter>
        <Button onClick={handleSave} disabled={saving || loading}>
          {saving ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Save className="mr-2 h-4 w-4" />
          )}
          Save Model
        </Button>
      </CardFooter>
    </Card>
  )
}
