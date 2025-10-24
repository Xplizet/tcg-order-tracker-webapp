"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useApi } from "@/lib/use-api"
import type { BulkDeleteResponse, BulkUpdateResponse, OrderUpdate } from "@/lib/api"

interface BulkOperationsProps {
  selectedIds: string[]
  onComplete: () => void
}

export function BulkOperations({ selectedIds, onComplete }: BulkOperationsProps) {
  const { apiRequest } = useApi()
  const queryClient = useQueryClient()
  const [showUpdateForm, setShowUpdateForm] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const bulkUpdate = useMutation({
    mutationFn: (updateData: OrderUpdate) =>
      apiRequest<BulkUpdateResponse>("/api/v1/orders/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_ids: selectedIds,
          update_data: updateData,
        }),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
      setShowUpdateForm(false)
      onComplete()
      toast.success(data.message)
    },
    onError: (error: Error) => {
      toast.error(`Failed to update orders: ${error.message}`)
    },
  })

  const bulkDelete = useMutation({
    mutationFn: () =>
      apiRequest<BulkDeleteResponse>("/api/v1/orders/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_ids: selectedIds,
        }),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
      setShowDeleteConfirm(false)
      onComplete()
      toast.success(data.message)
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete orders: ${error.message}`)
    },
  })

  const [updateForm, setUpdateForm] = useState<OrderUpdate>({
    status: undefined,
    amount_paid: undefined,
  })

  const handleBulkUpdate = (e: React.FormEvent) => {
    e.preventDefault()

    // Filter out undefined values
    const filteredUpdate = Object.entries(updateForm).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        acc[key as keyof OrderUpdate] = value
      }
      return acc
    }, {} as OrderUpdate)

    if (Object.keys(filteredUpdate).length === 0) {
      toast.warning("Please select at least one field to update")
      return
    }

    bulkUpdate.mutate(filteredUpdate)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-muted-foreground">
        {selectedIds.length} selected
      </span>

      <button
        onClick={() => setShowUpdateForm(true)}
        className="px-3 py-1 text-sm bg-primary text-primary-foreground rounded hover:bg-primary/90"
      >
        Bulk Update
      </button>

      <button
        onClick={() => setShowDeleteConfirm(true)}
        className="px-3 py-1 text-sm bg-destructive text-destructive-foreground rounded hover:bg-destructive/90"
      >
        Bulk Delete
      </button>

      {/* Bulk Update Modal */}
      {showUpdateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card text-card-foreground rounded-lg p-6 max-w-md w-full border border-border">
            <h3 className="text-lg font-semibold mb-4">
              Bulk Update {selectedIds.length} Order(s)
            </h3>

            <form onSubmit={handleBulkUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Update Status
                </label>
                <select
                  value={updateForm.status || ""}
                  onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value || undefined })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                >
                  <option value="">Don't change</option>
                  <option value="Pending">Pending</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Add to Amount Paid
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Leave empty to skip"
                  value={updateForm.amount_paid || ""}
                  onChange={(e) => setUpdateForm({ ...updateForm, amount_paid: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 bg-background border border-border rounded-lg text-foreground"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowUpdateForm(false)}
                  className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkUpdate.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 disabled:opacity-50"
                >
                  {bulkUpdate.isPending ? "Updating..." : "Update"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-card text-card-foreground rounded-lg p-6 max-w-md w-full border border-border">
            <h3 className="text-lg font-semibold mb-4">Confirm Bulk Delete</h3>
            <p className="text-muted-foreground mb-6">
              Are you sure you want to delete {selectedIds.length} order(s)? This action cannot be undone.
            </p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-border rounded-lg hover:bg-muted"
              >
                Cancel
              </button>
              <button
                onClick={() => bulkDelete.mutate()}
                disabled={bulkDelete.isPending}
                className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg hover:bg-destructive/90 disabled:opacity-50"
              >
                {bulkDelete.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
