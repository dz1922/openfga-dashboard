"use client"

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useConnectionStore, PLAYGROUND_SAMPLE_MODEL } from '@/lib/store/connection-store'
import { useAuthorizationModels, useTuples } from '@/hooks/use-openfga'
import {
  FileCode,
  Link2,
  Search,
  ArrowRight,
  Loader2,
  Database,
  Copy,
  Check,
  Calendar,
  Clock,
  Hash,
  Tag,
  Sparkles
} from 'lucide-react'
import Link from 'next/link'

export default function StoreOverviewPage() {
  const params = useParams()
  const router = useRouter()
  const storeId = params.storeId as string
  const client = useConnectionStore((state) => state.client)
  const currentStore = useConnectionStore((state) => state.currentStore)
  const setCurrentStore = useConnectionStore((state) => state.setCurrentStore)
  const playgroundMode = useConnectionStore((state) => state.playgroundMode)

  const { models, fetchModels, loading: modelsLoading } = useAuthorizationModels(storeId)
  const { tuples, fetchTuples, loading: tuplesLoading } = useTuples(storeId)

  const [loading, setLoading] = useState(!playgroundMode)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    // In playground mode, we don't need to load from server
    if (playgroundMode) {
      setLoading(false)
      return
    }

    const loadStore = async () => {
      if (!client) return

      if (!currentStore || currentStore.id !== storeId) {
        try {
          const store = await client.getStore(storeId)
          setCurrentStore(store)
        } catch (error) {
          console.error('Failed to load store:', error)
          router.push('/dashboard')
          return
        }
      }

      await Promise.all([fetchModels(), fetchTuples({ page_size: 10 })])
      setLoading(false)
    }

    loadStore()
  }, [client, storeId, currentStore, setCurrentStore, fetchModels, fetchTuples, router, playgroundMode])

  const handleCopyId = async () => {
    await navigator.clipboard.writeText(currentStore?.id || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  if (loading || !currentStore) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
        <p className="text-sm text-muted-foreground">Loading store...</p>
      </div>
    )
  }

  // In playground mode, use sample model info
  const latestModel = playgroundMode ? PLAYGROUND_SAMPLE_MODEL : (models.length > 0 ? models[0] : null)
  const modelCount = playgroundMode ? 1 : models.length
  const tupleCount = playgroundMode ? 5 : tuples.length

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-4">
          <div className="p-3 rounded-2xl shadow-lg bg-gradient-to-br from-emerald-500 to-teal-600 shadow-emerald-500/25">
            <Database className="h-7 w-7 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                {currentStore.name}
              </h1>
              {playgroundMode && (
                <Badge className="bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                  <Sparkles className="h-3 w-3 mr-1" />
                  Playground
                </Badge>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-sm text-muted-foreground font-mono">
                {currentStore.id}
              </code>
              {!playgroundMode && (
                <button
                  onClick={handleCopyId}
                  className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                  title="Copy Store ID"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-emerald-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5 text-muted-foreground" />
                  )}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Authorization Models Card */}
        <div className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-lg hover:border-blue-200 dark:hover:border-blue-900 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Authorization Models</span>
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400">
              <FileCode className="h-4 w-4" />
            </div>
          </div>
          <div className="mb-4">
            {!playgroundMode && modelsLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            ) : (
              <span className="text-4xl font-bold text-slate-900 dark:text-white">{modelCount}</span>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {latestModel ? (
                <>Latest: <code className="text-xs bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded">{latestModel.id.slice(0, 12)}...</code></>
              ) : (
                'No models yet'
              )}
            </p>
          </div>
          <Link href={`/dashboard/stores/${storeId}/model`}>
            <Button variant="ghost" className="w-full justify-between group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {playgroundMode ? 'Open Model Explorer' : 'Manage Models'}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Relationship Tuples Card */}
        <div className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-lg hover:border-violet-200 dark:hover:border-violet-900 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Relationship Tuples</span>
            <div className="p-2 rounded-xl bg-violet-50 dark:bg-violet-950/50 text-violet-600 dark:text-violet-400">
              <Link2 className="h-4 w-4" />
            </div>
          </div>
          <div className="mb-4">
            {!playgroundMode && tuplesLoading ? (
              <Loader2 className="h-8 w-8 animate-spin text-violet-500" />
            ) : (
              <span className="text-4xl font-bold text-slate-900 dark:text-white">{tupleCount}</span>
            )}
            <p className="text-sm text-muted-foreground mt-1">
              {playgroundMode ? 'Sample tuples for demo' : (tuples.length >= 10 ? 'Showing first 10' : `${tuples.length} total tuples`)}
            </p>
          </div>
          <Link href={`/dashboard/stores/${storeId}/tuples`}>
            <Button variant="ghost" className="w-full justify-between group-hover:bg-violet-50 dark:group-hover:bg-violet-950/50 group-hover:text-violet-600 dark:group-hover:text-violet-400 transition-colors">
              {playgroundMode ? 'View Sample Tuples' : 'Manage Tuples'}
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>

        {/* Query Operations Card */}
        <div className="group relative rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-sm hover:shadow-lg hover:border-amber-200 dark:hover:border-amber-900 transition-all duration-300">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-medium text-slate-600 dark:text-slate-400">Query Operations</span>
            <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/50 text-amber-600 dark:text-amber-400">
              <Search className="h-4 w-4" />
            </div>
          </div>
          <div className="flex flex-wrap gap-1.5 mb-4">
            <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-0">Check</Badge>
            <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-0">Expand</Badge>
            <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-0">List Objects</Badge>
            <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 border-0">List Users</Badge>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            {playgroundMode ? 'Queries disabled in playground' : 'Test your authorization model'}
          </p>
          <Link href={`/dashboard/stores/${storeId}/query`}>
            <Button
              variant="ghost"
              className="w-full justify-between group-hover:bg-amber-50 dark:group-hover:bg-amber-950/50 group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors"
              disabled={playgroundMode}
            >
              Run Queries
              <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Store Details */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white">Store Details</h2>
          <p className="text-sm text-muted-foreground">
            {playgroundMode ? 'Sample store for playground mode' : 'Information about this store'}
          </p>
        </div>
        <div className="p-6">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Hash className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Store ID</dt>
                <dd className="mt-1 font-mono text-sm text-slate-900 dark:text-white break-all">
                  {currentStore.id}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Tag className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Name</dt>
                <dd className="mt-1 text-sm font-medium text-slate-900 dark:text-white">
                  {currentStore.name}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Calendar className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Created</dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-white">
                  {playgroundMode ? 'N/A (Playground)' : new Date(currentStore.created_at).toLocaleString()}
                </dd>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                <Clock className="h-4 w-4 text-slate-500" />
              </div>
              <div>
                <dt className="text-sm font-medium text-muted-foreground">Updated</dt>
                <dd className="mt-1 text-sm text-slate-900 dark:text-white">
                  {playgroundMode ? 'N/A (Playground)' : new Date(currentStore.updated_at).toLocaleString()}
                </dd>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
