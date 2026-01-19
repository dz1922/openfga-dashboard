"use client"

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AuthConfig } from '@/lib/openfga/types'

interface AuthConfigFormProps {
  value: AuthConfig
  onChange: (config: AuthConfig) => void
}

export function AuthConfigForm({ value, onChange }: AuthConfigFormProps) {
  const handleTypeChange = (type: string) => {
    switch (type) {
      case 'none':
        onChange({ type: 'none' })
        break
      case 'api-key':
        onChange({ type: 'api-key', apiKey: '' })
        break
      case 'oidc':
        onChange({
          type: 'oidc',
          clientId: '',
          clientSecret: '',
          tokenUrl: '',
        })
        break
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="auth-type">Authentication Method</Label>
        <Select value={value.type} onValueChange={handleTypeChange}>
          <SelectTrigger id="auth-type">
            <SelectValue placeholder="Select authentication method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None (No Authentication)</SelectItem>
            <SelectItem value="api-key">API Key (Pre-shared Key)</SelectItem>
            <SelectItem value="oidc">OIDC (Client Credentials)</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {value.type === 'api-key' && (
        <div className="space-y-2">
          <Label htmlFor="api-key">API Key</Label>
          <Input
            id="api-key"
            type="password"
            placeholder="Enter your API key"
            value={value.apiKey}
            onChange={(e) =>
              onChange({ ...value, apiKey: e.target.value })
            }
          />
        </div>
      )}

      {value.type === 'oidc' && (
        <>
          <div className="space-y-2">
            <Label htmlFor="client-id">Client ID</Label>
            <Input
              id="client-id"
              placeholder="Enter client ID"
              value={value.clientId}
              onChange={(e) =>
                onChange({ ...value, clientId: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="client-secret">Client Secret</Label>
            <Input
              id="client-secret"
              type="password"
              placeholder="Enter client secret"
              value={value.clientSecret}
              onChange={(e) =>
                onChange({ ...value, clientSecret: e.target.value })
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="token-url">Token URL</Label>
            <Input
              id="token-url"
              placeholder="https://auth.example.com/oauth/token"
              value={value.tokenUrl}
              onChange={(e) =>
                onChange({ ...value, tokenUrl: e.target.value })
              }
            />
          </div>
        </>
      )}
    </div>
  )
}
