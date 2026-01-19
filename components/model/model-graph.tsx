"use client"

import { useMemo, useState, useCallback } from 'react'
import { ZoomIn, ZoomOut, RotateCcw, Box, Database } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { AuthorizationModel, TypeDefinition } from '@/lib/openfga/types'

interface ModelGraphProps {
  model: AuthorizationModel | null
  storeName?: string
}

interface GraphNode {
  id: string
  label: string
  type: 'store' | 'type' | 'relation'
  x: number
  y: number
  parentId?: string
}

interface GraphEdge {
  from: string
  to: string
}

function buildGraphData(model: AuthorizationModel, storeName: string = 'store'): { nodes: GraphNode[], edges: GraphEdge[] } {
  const nodes: GraphNode[] = []
  const edges: GraphEdge[] = []

  // Center store node
  const centerX = 400
  const centerY = 300

  nodes.push({
    id: 'store',
    label: storeName,
    type: 'store',
    x: centerX,
    y: centerY,
  })

  const types = model.type_definitions
  const typeCount = types.length

  if (typeCount === 0) return { nodes, edges }

  // Arrange types in a circle around the store
  const typeRadius = 180

  types.forEach((typeDef, typeIndex) => {
    const typeAngle = (2 * Math.PI * typeIndex) / typeCount - Math.PI / 2
    const typeX = centerX + typeRadius * Math.cos(typeAngle)
    const typeY = centerY + typeRadius * Math.sin(typeAngle)

    const typeNodeId = `type-${typeDef.type}`

    nodes.push({
      id: typeNodeId,
      label: typeDef.type,
      type: 'type',
      x: typeX,
      y: typeY,
      parentId: 'store',
    })

    edges.push({
      from: 'store',
      to: typeNodeId,
    })

    // Add relation nodes
    const relations = Object.keys(typeDef.relations || {})
    const relationCount = relations.length

    if (relationCount > 0) {
      const relationRadius = 100
      const spreadAngle = Math.PI * 0.6 // Spread relations in a 108-degree arc
      const startAngle = typeAngle - spreadAngle / 2

      relations.forEach((relationName, relIndex) => {
        const relAngle = relationCount === 1
          ? typeAngle
          : startAngle + (spreadAngle * relIndex) / (relationCount - 1)

        const relX = typeX + relationRadius * Math.cos(relAngle)
        const relY = typeY + relationRadius * Math.sin(relAngle)

        const relNodeId = `rel-${typeDef.type}-${relationName}`

        nodes.push({
          id: relNodeId,
          label: relationName,
          type: 'relation',
          x: relX,
          y: relY,
          parentId: typeNodeId,
        })

        edges.push({
          from: typeNodeId,
          to: relNodeId,
        })
      })
    }
  })

  return { nodes, edges }
}

export function ModelGraph({ model, storeName = 'store' }: ModelGraphProps) {
  const [zoom, setZoom] = useState(1)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 })

  const { nodes, edges } = useMemo(() => {
    if (!model) return { nodes: [], edges: [] }
    return buildGraphData(model, storeName)
  }, [model, storeName])

  const handleZoomIn = useCallback(() => {
    setZoom(z => Math.min(z * 1.2, 3))
  }, [])

  const handleZoomOut = useCallback(() => {
    setZoom(z => Math.max(z / 1.2, 0.3))
  }, [])

  const handleReset = useCallback(() => {
    setZoom(1)
    setPan({ x: 0, y: 0 })
  }, [])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    setIsDragging(true)
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y })
  }, [pan])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging) return
    setPan({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y,
    })
  }, [isDragging, dragStart])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  if (!model) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">
          <Box className="h-10 w-10 text-slate-400" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-slate-900 dark:text-slate-100">No Model Data</p>
          <p className="text-sm text-muted-foreground">Start editing to see the visualization</p>
        </div>
      </div>
    )
  }

  if (nodes.length <= 1) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 text-center">
        <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800">
          <Database className="h-10 w-10 text-slate-400" />
        </div>
        <div className="space-y-1">
          <p className="font-medium text-slate-900 dark:text-slate-100">No Types Defined</p>
          <p className="text-sm text-muted-foreground">Add type definitions to see the graph</p>
        </div>
      </div>
    )
  }

  const nodeMap = new Map(nodes.map(n => [n.id, n]))

  // Node colors
  const nodeColors = {
    store: { fill: '#db2777', stroke: '#be185d' },   // Pink
    type: { fill: '#6366f1', stroke: '#4f46e5' },     // Indigo/Purple
    relation: { fill: '#10b981', stroke: '#059669' }, // Emerald/Green
  }

  const nodeRadius = {
    store: 28,
    type: 22,
    relation: 18,
  }

  return (
    <div className="h-full w-full flex flex-col">
      {/* Graph Canvas */}
      <div
        className="flex-1 bg-slate-50 dark:bg-slate-800/30 rounded-xl overflow-hidden cursor-grab active:cursor-grabbing relative"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <svg
          width="100%"
          height="100%"
          viewBox="0 0 800 600"
          style={{
            transform: `scale(${zoom}) translate(${pan.x / zoom}px, ${pan.y / zoom}px)`,
            transformOrigin: 'center center',
          }}
        >
          <defs>
            {/* Gradients */}
            <radialGradient id="store-gradient" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#f472b6" />
              <stop offset="100%" stopColor="#db2777" />
            </radialGradient>
            <radialGradient id="type-gradient" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#a5b4fc" />
              <stop offset="100%" stopColor="#6366f1" />
            </radialGradient>
            <radialGradient id="relation-gradient" cx="30%" cy="30%">
              <stop offset="0%" stopColor="#6ee7b7" />
              <stop offset="100%" stopColor="#10b981" />
            </radialGradient>

            {/* Shadow filter */}
            <filter id="node-shadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.2" />
            </filter>
          </defs>

          {/* Edges */}
          <g className="edges">
            {edges.map((edge, i) => {
              const fromNode = nodeMap.get(edge.from)
              const toNode = nodeMap.get(edge.to)
              if (!fromNode || !toNode) return null

              // Calculate curve control point
              const midX = (fromNode.x + toNode.x) / 2
              const midY = (fromNode.y + toNode.y) / 2

              // Add slight curve
              const dx = toNode.x - fromNode.x
              const dy = toNode.y - fromNode.y
              const len = Math.sqrt(dx * dx + dy * dy)

              // Perpendicular offset for curve
              const perpX = -dy / len * 15
              const perpY = dx / len * 15
              const ctrlX = midX + perpX
              const ctrlY = midY + perpY

              return (
                <path
                  key={i}
                  d={`M ${fromNode.x} ${fromNode.y} Q ${ctrlX} ${ctrlY} ${toNode.x} ${toNode.y}`}
                  fill="none"
                  stroke="#94a3b8"
                  strokeWidth="2"
                  className="transition-all duration-300"
                />
              )
            })}
          </g>

          {/* Nodes */}
          <g className="nodes">
            {nodes.map((node) => {
              const radius = nodeRadius[node.type]
              const gradient = `url(#${node.type}-gradient)`

              return (
                <g key={node.id} className="transition-all duration-300">
                  {/* Node circle */}
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={radius}
                    fill={gradient}
                    filter="url(#node-shadow)"
                    className="transition-all duration-200 hover:opacity-90"
                  />

                  {/* Label */}
                  <text
                    x={node.x}
                    y={node.y + radius + 16}
                    fontSize={node.type === 'store' ? 14 : 12}
                    fontWeight={node.type === 'store' ? 600 : 500}
                    textAnchor="middle"
                    className="fill-slate-700 dark:fill-slate-300 select-none"
                  >
                    {node.label.length > 15 ? node.label.slice(0, 12) + '...' : node.label}
                  </text>
                </g>
              )
            })}
          </g>
        </svg>
      </div>

      {/* Footer with Legend and Controls */}
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
        {/* Legend */}
        <div className="flex items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-pink-400 to-pink-600"></div>
            <span className="text-xs text-slate-600 dark:text-slate-400">store</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-indigo-300 to-indigo-500"></div>
            <span className="text-xs text-slate-600 dark:text-slate-400">type</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-gradient-to-br from-emerald-300 to-emerald-500"></div>
            <span className="text-xs text-slate-600 dark:text-slate-400">relation</span>
          </div>
        </div>

        {/* Zoom Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            className="h-8 px-3 text-xs"
          >
            <ZoomIn className="h-3.5 w-3.5 mr-1" />
            Zoom In
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            className="h-8 px-3 text-xs"
          >
            <ZoomOut className="h-3.5 w-3.5 mr-1" />
            Zoom Out
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleReset}
            className="h-8 px-3 text-xs"
          >
            <RotateCcw className="h-3.5 w-3.5 mr-1" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
