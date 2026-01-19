"use client"

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { AuthorizationModel, TypeDefinition } from '@/lib/openfga/types'

interface ModelViewerProps {
  model: AuthorizationModel
}

function RelationDisplay({ name, definition }: { name: string; definition: unknown }) {
  // Simplified display of relation definition
  const getRelationDescription = (def: unknown): string => {
    if (!def || typeof def !== 'object') return 'self'

    const d = def as Record<string, unknown>
    if ('this' in d) return 'self'
    if ('computedUserset' in d) {
      const computed = d.computedUserset as Record<string, string>
      return `computed from ${computed.relation}`
    }
    if ('tupleToUserset' in d) {
      const ttu = d.tupleToUserset as Record<string, Record<string, string>>
      return `${ttu.tupleset?.relation} -> ${ttu.computedUserset?.relation}`
    }
    if ('union' in d) return 'union'
    if ('intersection' in d) return 'intersection'
    if ('difference' in d) return 'difference'
    return 'complex'
  }

  return (
    <div className="flex items-center justify-between py-1">
      <span className="font-mono text-sm">{name}</span>
      <Badge variant="outline" className="text-xs">
        {getRelationDescription(definition)}
      </Badge>
    </div>
  )
}

function TypeCard({ typeDef }: { typeDef: TypeDefinition }) {
  const relations = typeDef.relations || {}
  const relationNames = Object.keys(relations)

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-mono">{typeDef.type}</CardTitle>
      </CardHeader>
      <CardContent>
        {relationNames.length === 0 ? (
          <p className="text-sm text-muted-foreground">No relations defined</p>
        ) : (
          <div className="space-y-1">
            {relationNames.map((relationName) => (
              <RelationDisplay
                key={relationName}
                name={relationName}
                definition={relations[relationName]}
              />
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function ModelViewer({ model }: ModelViewerProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <span>Schema Version: {model.schema_version}</span>
        <span>|</span>
        <span className="font-mono">{model.id}</span>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {model.type_definitions.map((typeDef) => (
          <TypeCard key={typeDef.type} typeDef={typeDef} />
        ))}
      </div>
    </div>
  )
}
