"use client"

import { useConnectionStore } from '@/lib/store/connection-store'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { LogOut, Server, Play } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export function Header() {
  const isConnected = useConnectionStore((state) => state.isConnected)
  const playgroundMode = useConnectionStore((state) => state.playgroundMode)
  const config = useConnectionStore((state) => state.config)
  const disconnect = useConnectionStore((state) => state.disconnect)
  const exitPlaygroundMode = useConnectionStore((state) => state.exitPlaygroundMode)
  const router = useRouter()

  const handleDisconnect = () => {
    if (playgroundMode) {
      exitPlaygroundMode()
    } else {
      disconnect()
    }
    router.push('/')
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center px-6">
        <div className="mr-4 flex">
          <Link href={playgroundMode ? '/dashboard/stores/playground-store/model' : '/'} className="mr-6 flex items-center">
            <span className="font-bold text-lg">OpenFGA Dashboard</span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-end space-x-4 pr-2">
          {isConnected && (
            <>
              <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                {playgroundMode ? (
                  <>
                    <Play className="h-4 w-4 text-amber-500" />
                    <span className="hidden md:inline text-amber-600 dark:text-amber-400 font-medium">Playground Mode</span>
                    <Badge className="ml-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white border-0">
                      Demo
                    </Badge>
                  </>
                ) : config ? (
                  <>
                    <Server className="h-4 w-4" />
                    <span className="hidden md:inline">{config.serverUrl}</span>
                    <Badge variant="success" className="ml-2">
                      Connected
                    </Badge>
                  </>
                ) : null}
              </div>
              <Button variant="ghost" size="sm" onClick={handleDisconnect}>
                <LogOut className="h-4 w-4 mr-2" />
                {playgroundMode ? 'Exit Playground' : 'Disconnect'}
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
