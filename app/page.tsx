"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ConnectionForm } from '@/components/connection/connection-form'
import { Button } from '@/components/ui/button'
import { useConnectionStore } from '@/lib/store/connection-store'
import { Database, Play, Sparkles, ArrowRight, Github, Coffee } from 'lucide-react'

export default function HomePage() {
  const router = useRouter()
  const isConnected = useConnectionStore((state) => state.isConnected)
  const playgroundMode = useConnectionStore((state) => state.playgroundMode)
  const enterPlaygroundMode = useConnectionStore((state) => state.enterPlaygroundMode)

  useEffect(() => {
    if (isConnected) {
      if (playgroundMode) {
        router.push('/dashboard/stores/playground-store/model')
      } else {
        router.push('/dashboard')
      }
    }
  }, [isConnected, playgroundMode, router])

  const handlePlayground = () => {
    enterPlaygroundMode()
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        {/* Hero Section */}
        <div className="mb-10 text-center">
          <div className="flex items-center justify-center mb-6">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl shadow-blue-500/25">
              <Database className="h-10 w-10 text-white" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-slate-700 to-slate-900 dark:from-white dark:via-slate-200 dark:to-white bg-clip-text text-transparent">
            OpenFGA Dashboard
          </h1>
          <p className="mt-3 text-lg text-muted-foreground max-w-md mx-auto">
            Manage your OpenFGA authorization server with a modern, intuitive interface
          </p>
        </div>

        {/* Connection Form */}
        <ConnectionForm />

        {/* Divider */}
        <div className="flex items-center gap-4 my-8 w-full max-w-md">
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
          <span className="text-sm text-muted-foreground">or</span>
          <div className="flex-1 h-px bg-slate-200 dark:bg-slate-800"></div>
        </div>

        {/* Playground Mode */}
        <div className="w-full max-w-md">
          <div className="rounded-2xl border border-dashed border-slate-300 dark:border-slate-700 bg-white/50 dark:bg-slate-900/50 p-6 text-center">
            <div className="flex items-center justify-center mb-4">
              <div className="p-3 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 shadow-lg shadow-orange-500/25">
                <Play className="h-6 w-6 text-white" />
              </div>
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              Try Playground Mode
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Explore OpenFGA without a server. Edit sample models and visualize relationships in real-time.
            </p>
            <Button
              onClick={handlePlayground}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 transition-all"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Enter Playground
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Info Text */}
        <div className="mt-10 text-center text-sm text-muted-foreground max-w-lg px-4">
          <p>
            OpenFGA is an open-source authorization solution that allows you to
            model and query fine-grained access control for your applications.
            {' '}
            <a
              href="https://openfga.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 hover:underline"
            >
              Learn more →
            </a>
          </p>
        </div>

        {/* Footer Links */}
        <div className="mt-12 flex items-center justify-center gap-6 text-sm text-muted-foreground">
          <a
            href="https://opensource.org/licenses/Apache-2.0"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-foreground transition-colors"
          >
            Apache 2.0
          </a>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <a
            href="https://github.com/dz1922/openfga-dashboard"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Github className="h-4 w-4" />
            GitHub
          </a>
          <span className="text-slate-300 dark:text-slate-700">•</span>
          <a
            href="https://buymeacoffee.com/dachao"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 hover:text-foreground transition-colors"
          >
            <Coffee className="h-4 w-4" />
            Buy me a coffee
          </a>
        </div>
      </main>
    </div>
  )
}
