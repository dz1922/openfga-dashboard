"use client"

import { useEffect, useState, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import dynamic from 'next/dynamic'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { ModelGraph } from '@/components/model/model-graph'
import { useAuthorizationModels } from '@/hooks/use-openfga'
import { useConnectionStore, PLAYGROUND_SAMPLE_MODEL } from '@/lib/store/connection-store'
import { Loader2, AlertCircle, Save, CheckCircle2, History, Code2, GitBranch, Sparkles, Play } from 'lucide-react'
import type { AuthorizationModel, WriteAuthorizationModelRequest } from '@/lib/openfga/types'

// Dynamically import Monaco Editor to avoid SSR issues
const Editor = dynamic(
  () => import('@monaco-editor/react').then((mod) => mod.default),
  {
    ssr: false,
    loading: () => (
      <div className="h-full flex items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
          <span className="text-sm text-slate-400">Loading editor...</span>
        </div>
      </div>
    ),
  }
)

function modelToJson(model: AuthorizationModel): string {
  const { id, ...rest } = model
  return JSON.stringify(rest, null, 2)
}

export default function ModelPage() {
  const params = useParams()
  const storeId = params.storeId as string

  // Check if in playground mode
  const playgroundMode = useConnectionStore((state) => state.playgroundMode)
  const currentStore = useConnectionStore((state) => state.currentStore)

  const { models, loading, error, fetchModels, writeModel } = useAuthorizationModels(storeId)

  const [selectedModelId, setSelectedModelId] = useState<string>('')
  const [editorValue, setEditorValue] = useState('')
  const [parseError, setParseError] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)
  const [saving, setSaving] = useState(false)
  const [initialized, setInitialized] = useState(false)

  // Initialize with sample model in playground mode
  useEffect(() => {
    if (playgroundMode && !initialized) {
      setEditorValue(modelToJson(PLAYGROUND_SAMPLE_MODEL))
      setSelectedModelId(PLAYGROUND_SAMPLE_MODEL.id)
      setInitialized(true)
    }
  }, [playgroundMode, initialized])

  // Fetch models on mount (only in non-playground mode)
  useEffect(() => {
    if (!playgroundMode) {
      fetchModels()
    }
  }, [fetchModels, playgroundMode])

  // Set initial selected model when models are loaded (non-playground mode)
  useEffect(() => {
    if (!playgroundMode && models.length > 0 && !selectedModelId) {
      setSelectedModelId(models[0].id)
      setEditorValue(modelToJson(models[0]))
      setInitialized(true)
    }
  }, [models, selectedModelId, playgroundMode])

  // Handle model selection change
  const handleModelSelect = useCallback((modelId: string) => {
    if (playgroundMode) {
      if (modelId === PLAYGROUND_SAMPLE_MODEL.id) {
        setEditorValue(modelToJson(PLAYGROUND_SAMPLE_MODEL))
      }
      setSelectedModelId(modelId)
    } else {
      setSelectedModelId(modelId)
      const model = models.find(m => m.id === modelId)
      if (model) {
        setEditorValue(modelToJson(model))
      }
    }
    setParseError(null)
    setSaveError(null)
    setSaveSuccess(false)
  }, [models, playgroundMode])

  // Parse editor value to get current model for visualization
  const currentModel = useMemo((): AuthorizationModel | null => {
    try {
      const parsed = JSON.parse(editorValue) as WriteAuthorizationModelRequest
      setParseError(null)
      return {
        id: selectedModelId || 'new',
        schema_version: parsed.schema_version,
        type_definitions: parsed.type_definitions,
        conditions: parsed.conditions,
      }
    } catch (e) {
      if (editorValue.trim()) {
        setParseError((e instanceof Error ? e.message : 'Invalid JSON'))
      }
      return null
    }
  }, [editorValue, selectedModelId])

  // Handle save
  const handleSave = useCallback(async () => {
    if (playgroundMode) {
      // In playground mode, just show success (model is already visualized)
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
      return
    }

    setSaveError(null)
    setSaveSuccess(false)

    // Validate JSON
    let modelData: WriteAuthorizationModelRequest
    try {
      modelData = JSON.parse(editorValue) as WriteAuthorizationModelRequest
    } catch (e) {
      setSaveError('Invalid JSON: ' + (e instanceof Error ? e.message : 'Parse error'))
      return
    }

    setSaving(true)
    const newModelId = await writeModel(modelData)
    setSaving(false)

    if (newModelId) {
      setSaveSuccess(true)
      setSelectedModelId(newModelId)
      // Refresh models list
      await fetchModels()
      setTimeout(() => setSaveSuccess(false), 3000)
    } else {
      setSaveError('Failed to save model')
    }
  }, [editorValue, writeModel, fetchModels, playgroundMode])

  // Check if editor content differs from selected model
  const hasChanges = useMemo(() => {
    if (playgroundMode) {
      return editorValue !== modelToJson(PLAYGROUND_SAMPLE_MODEL)
    }
    const selectedModel = models.find(m => m.id === selectedModelId)
    if (!selectedModel) return editorValue.trim().length > 0
    return editorValue !== modelToJson(selectedModel)
  }, [editorValue, selectedModelId, models, playgroundMode])

  const storeName = currentStore?.name || 'Store'

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg shadow-blue-500/25">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Model Explorer
                </h1>
                {playgroundMode && (
                  <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                    <Play className="h-3 w-3 mr-1" />
                    Playground
                  </Badge>
                )}
              </div>
              <p className="text-sm text-muted-foreground">
                {playgroundMode
                  ? 'Explore and edit sample authorization models'
                  : 'Edit your model and visualize relationships in real-time'
                }
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Model Version Selector */}
          {!playgroundMode && (
            <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
              <History className="h-4 w-4 text-slate-500" />
              <Select
                value={selectedModelId}
                onValueChange={handleModelSelect}
              >
                <SelectTrigger className="w-[240px] border-0 bg-transparent h-8 text-xs font-mono focus:ring-0" disabled={loading}>
                  <SelectValue placeholder="Select model version" />
                </SelectTrigger>
                <SelectContent>
                  {models.length === 0 && (
                    <SelectItem value="">New Model</SelectItem>
                  )}
                  {models.map((model, index) => (
                    <SelectItem key={model.id} value={model.id} className="font-mono text-xs">
                      {model.id.slice(0, 20)}... {index === 0 ? '(latest)' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Save Button */}
          <Button
            onClick={handleSave}
            disabled={saving || loading || (!playgroundMode && !hasChanges)}
            className="h-10 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transition-all duration-200 disabled:opacity-50 disabled:shadow-none"
          >
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {playgroundMode ? 'Apply Changes' : 'Save Model'}
          </Button>
        </div>
      </div>

      {/* Status Messages */}
      {(error || saveError || saveSuccess) && (
        <div className="animate-in">
          {error && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{error}</p>
            </div>
          )}
          {saveError && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 text-red-700 dark:text-red-400">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">{saveError}</p>
            </div>
          )}
          {saveSuccess && (
            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 text-emerald-700 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <p className="text-sm">
                {playgroundMode
                  ? 'Changes applied! The visualization has been updated.'
                  : <>Model saved successfully! New ID: <code className="font-mono text-xs bg-emerald-100 dark:bg-emerald-900/50 px-2 py-0.5 rounded">{selectedModelId.slice(0, 20)}...</code></>
                }
              </p>
            </div>
          )}
        </div>
      )}

      {/* Main Content - Split View */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 min-h-0">
        {/* Left: Monaco Editor */}
        <div className="flex flex-col rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 bg-slate-950">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-900 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-red-500"></div>
                <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                <div className="w-3 h-3 rounded-full bg-green-500"></div>
              </div>
              <div className="flex items-center gap-2 text-slate-400">
                <Code2 className="h-4 w-4" />
                <span className="text-sm font-medium">Model</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {parseError && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-500/20 text-red-400 text-xs font-medium">
                  <AlertCircle className="h-3 w-3" />
                  Syntax Error
                </span>
              )}
              {hasChanges && !parseError && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/20 text-amber-400 text-xs font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
                  Modified
                </span>
              )}
              {!hasChanges && !parseError && initialized && (
                <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-medium">
                  <CheckCircle2 className="h-3 w-3" />
                  Synced
                </span>
              )}
            </div>
          </div>

          {/* Editor Content */}
          <div className="flex-1 min-h-[400px]">
            <Editor
              height="100%"
              defaultLanguage="json"
              value={editorValue}
              onChange={(v) => setEditorValue(v || '')}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, Monaco, 'Courier New', monospace",
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                formatOnPaste: true,
                formatOnType: true,
                tabSize: 2,
                automaticLayout: true,
                padding: { top: 16, bottom: 16 },
                smoothScrolling: true,
                cursorBlinking: 'smooth',
                cursorSmoothCaretAnimation: 'on',
                renderLineHighlight: 'all',
                lineHeight: 1.6,
              }}
            />
          </div>
        </div>

        {/* Right: Visualization */}
        <div className="flex flex-col rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xl shadow-slate-200/50 dark:shadow-slate-950/50 bg-white dark:bg-slate-900">
          {/* Visualization Header */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-800">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
              <GitBranch className="h-4 w-4" />
              <span className="text-sm font-medium">Preview</span>
            </div>
            {currentModel && (
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 text-xs font-medium">
                  {currentModel.type_definitions.length} types
                </span>
              </div>
            )}
          </div>

          {/* Visualization Content */}
          <div className="flex-1 min-h-[400px] p-4 overflow-hidden">
            {!playgroundMode && loading ? (
              <div className="h-full flex flex-col items-center justify-center gap-3">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                <span className="text-sm text-muted-foreground">Loading models...</span>
              </div>
            ) : parseError ? (
              <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
                <div className="p-4 rounded-2xl bg-red-50 dark:bg-red-950/30">
                  <AlertCircle className="h-10 w-10 text-red-500" />
                </div>
                <div className="space-y-1">
                  <p className="font-medium text-slate-900 dark:text-slate-100">Invalid JSON</p>
                  <p className="text-sm text-muted-foreground max-w-xs">Fix the syntax error in the editor to see the visualization</p>
                </div>
                <code className="px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs text-red-600 dark:text-red-400 max-w-full overflow-auto">
                  {parseError}
                </code>
              </div>
            ) : (
              <ModelGraph model={currentModel} storeName={storeName} />
            )}
          </div>
        </div>
      </div>

      {/* Footer Info */}
      <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-slate-50 dark:bg-slate-800/30 border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          <span>
            {playgroundMode
              ? 'Playground mode - changes are not saved to any server'
              : 'Edit the JSON model and watch the graph update in real-time'
            }
          </span>
        </div>
        {!playgroundMode && (
          <div className="text-xs text-muted-foreground">
            Press <kbd className="px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-700 font-mono">Cmd+S</kbd> to save
          </div>
        )}
      </div>
    </div>
  )
}
