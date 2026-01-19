"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { AuthConfigForm } from './auth-config'
import { useConnectionStore } from '@/lib/store/connection-store'
import type { AuthConfig, ConnectionConfig } from '@/lib/openfga/types'
import { AlertTriangle, Loader2, CheckCircle2, XCircle } from 'lucide-react'

export function ConnectionForm() {
  const router = useRouter()
  const config = useConnectionStore((state) => state.config)
  const testConnection = useConnectionStore((state) => state.testConnection)
  const connect = useConnectionStore((state) => state.connect)

  const [serverUrl, setServerUrl] = useState(config?.serverUrl || 'http://localhost:8080')
  const [auth, setAuth] = useState<AuthConfig>(config?.auth || { type: 'none' })
  const [testing, setTesting] = useState(false)
  const [testResult, setTestResult] = useState<'success' | 'error' | null>(null)
  const [errorMessage, setErrorMessage] = useState('')
  const [connecting, setConnecting] = useState(false)

  const handleTestConnection = async () => {
    setTesting(true)
    setTestResult(null)
    setErrorMessage('')

    const connectionConfig: ConnectionConfig = {
      serverUrl: serverUrl.replace(/\/$/, ''), // Remove trailing slash
      auth,
    }

    try {
      const success = await testConnection(connectionConfig)
      if (success) {
        setTestResult('success')
      } else {
        setTestResult('error')
        setErrorMessage('Connection failed. Please check your settings.')
      }
    } catch (error) {
      setTestResult('error')
      setErrorMessage(
        error instanceof Error ? error.message : 'Connection failed'
      )
    } finally {
      setTesting(false)
    }
  }

  const handleConnect = async () => {
    setConnecting(true)
    setErrorMessage('')

    const connectionConfig: ConnectionConfig = {
      serverUrl: serverUrl.replace(/\/$/, ''),
      auth,
    }

    try {
      const success = await connect(connectionConfig)
      if (success) {
        router.push('/dashboard')
      } else {
        setErrorMessage('Connection failed. Please check your settings.')
      }
    } catch (error) {
      setErrorMessage(
        error instanceof Error ? error.message : 'Connection failed'
      )
    } finally {
      setConnecting(false)
    }
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Connect to OpenFGA Server</CardTitle>
        <CardDescription>
          Enter your OpenFGA server details to get started
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Credentials stored in browser local storage.<br />
            Only connect to trusted servers with CORS enabled.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <Label htmlFor="server-url">Server URL</Label>
          <Input
            id="server-url"
            placeholder="http://localhost:8080"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
          />
        </div>

        <AuthConfigForm value={auth} onChange={setAuth} />

        {testResult && (
          <Alert variant={testResult === 'success' ? 'default' : 'destructive'}>
            {testResult === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle>
              {testResult === 'success' ? 'Connection Successful' : 'Connection Failed'}
            </AlertTitle>
            {errorMessage && <AlertDescription>{errorMessage}</AlertDescription>}
          </Alert>
        )}

        {errorMessage && !testResult && (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{errorMessage}</AlertDescription>
          </Alert>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleTestConnection}
          disabled={testing || connecting}
        >
          {testing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Test Connection
        </Button>

        <Button onClick={handleConnect} disabled={testing || connecting}>
          {connecting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Connect
        </Button>
      </CardFooter>
    </Card>
  )
}
