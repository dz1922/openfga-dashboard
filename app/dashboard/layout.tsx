"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { useConnectionStore } from '@/lib/store/connection-store'
import { Loader2 } from 'lucide-react'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const isConnected = useConnectionStore((state) => state.isConnected)
  const config = useConnectionStore((state) => state.config)
  const playgroundMode = useConnectionStore((state) => state.playgroundMode)
  const [hydrated, setHydrated] = useState(false)

  // Wait for hydration
  useEffect(() => {
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return

    // If not connected and not in playground mode, redirect to home
    if (!isConnected && !playgroundMode) {
      router.push('/')
    }
  }, [isConnected, playgroundMode, router, hydrated])

  // Show loading while hydrating
  if (!hydrated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    )
  }

  // If not connected and not in playground, don't render
  if (!isConnected && !playgroundMode) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 md:ml-64">
          <div className="py-6 px-6 lg:px-8 xl:px-12">{children}</div>
        </main>
      </div>
    </div>
  )
}
