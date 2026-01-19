"use client"

import { useConnectionStore } from '@/lib/store/connection-store'

export function useConnection() {
  const config = useConnectionStore((state) => state.config)
  const isConnected = useConnectionStore((state) => state.isConnected)
  const connect = useConnectionStore((state) => state.connect)
  const disconnect = useConnectionStore((state) => state.disconnect)
  const setConfig = useConnectionStore((state) => state.setConfig)

  return {
    config,
    isConnected,
    connect,
    disconnect,
    setConfig,
  }
}
