"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/header'
import { Sidebar } from '@/components/layout/sidebar'
import { Footer } from '@/components/layout/footer'
import { useConnectionStore } from '@/lib/store/connection-store'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const isConnected = useConnectionStore((state) => state.isConnected)
  const config = useConnectionStore((state) => state.config)

  useEffect(() => {
    // If not connected but have config, try to reconnect
    if (!isConnected && config) {
      // Auto-reconnect logic is handled by the store's rehydration
    }
    // If not connected and no config, redirect to home
    if (!isConnected && !config) {
      router.push('/')
    }
  }, [isConnected, config, router])

  if (!config) {
    return null
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <div className="flex-1 flex">
        <Sidebar />
        <main className="flex-1 md:ml-64 md:pl-6">
          <div className="container py-6 pr-6">{children}</div>
        </main>
      </div>
      <Footer />
    </div>
  )
}
