"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Trash2, Loader2 } from 'lucide-react'
import type { Tuple, TupleKey } from '@/lib/openfga/types'

interface TupleTableProps {
  tuples: Tuple[]
  onDelete: (tupleKey: TupleKey) => Promise<boolean>
  loading?: boolean
}

export function TupleTable({ tuples, onDelete, loading = false }: TupleTableProps) {
  const [deletingTuple, setDeletingTuple] = useState<TupleKey | null>(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)

  const handleDeleteClick = (tuple: Tuple) => {
    setDeletingTuple(tuple.key)
    setDeleteDialogOpen(true)
  }

  const handleConfirmDelete = async () => {
    if (!deletingTuple) return

    setDeleting(true)
    await onDelete(deletingTuple)
    setDeleting(false)
    setDeleteDialogOpen(false)
    setDeletingTuple(null)
  }

  if (tuples.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No relationship tuples found
      </div>
    )
  }

  return (
    <>
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-muted/50">
              <tr>
                <th className="px-4 py-3 text-left font-medium">User</th>
                <th className="px-4 py-3 text-left font-medium">Relation</th>
                <th className="px-4 py-3 text-left font-medium">Object</th>
                <th className="px-4 py-3 text-left font-medium">Timestamp</th>
                <th className="px-4 py-3 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {tuples.map((tuple, index) => (
                <tr key={index} className="hover:bg-muted/25">
                  <td className="px-4 py-3">
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {tuple.key.user}
                    </code>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{tuple.key.relation}</Badge>
                  </td>
                  <td className="px-4 py-3">
                    <code className="text-xs bg-muted px-1 py-0.5 rounded">
                      {tuple.key.object}
                    </code>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">
                    {new Date(tuple.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => handleDeleteClick(tuple)}
                      disabled={loading}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Tuple</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this relationship tuple? This action
              cannot be undone.
            </DialogDescription>
          </DialogHeader>
          {deletingTuple && (
            <div className="bg-muted p-4 rounded-md space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">User:</span>{' '}
                <code>{deletingTuple.user}</code>
              </p>
              <p>
                <span className="text-muted-foreground">Relation:</span>{' '}
                <code>{deletingTuple.relation}</code>
              </p>
              <p>
                <span className="text-muted-foreground">Object:</span>{' '}
                <code>{deletingTuple.object}</code>
              </p>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleting}
            >
              {deleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
