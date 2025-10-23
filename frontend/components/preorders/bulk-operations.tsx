"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useApi } from "@/lib/use-api"
import type { BulkDeleteResponse, BulkUpdateResponse, PreorderUpdate } from "@/lib/api"

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
    mutationFn: (updateData: PreorderUpdate) =>
      apiRequest<BulkUpdateResponse>("/api/v1/preorders/bulk-update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preorder_ids: selectedIds,
          update_data: updateData,
        }),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["preorders"] })
      queryClient.invalidateQueries({ queryKey: ["statistics"] })
      setShowUpdateForm(false)
      onComplete()
      alert(data.message)
    },
  })

  const bulkDelete = useMutation({
    mutationFn: () =>
      apiRequest<BulkDeleteResponse>("/api/v1/preorders/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          preorder_ids: selectedIds,
        }),
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["preorders"] })
      queryClient.invalidateQueries({ queryKey: ["statistics"] })
      setShowDeleteConfirm(false)
      onComplete()
      alert(data.message)
    },
  })

  const [updateForm, setUpdateForm] = useState<PreorderUpdate>({
    status: undefined,
    amount_paid: undefined,
  })

  const handleBulkUpdate = (e: React.FormEvent) => {
    e.preventDefault()

    // Filter out undefined values
    const filteredUpdate = Object.entries(updateForm).reduce((acc, [key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        acc[key as keyof PreorderUpdate] = value
      }
      return acc
    }, {} as PreorderUpdate)

    if (Object.keys(filteredUpdate).length === 0) {
      alert("Please select at least one field to update")
      return
    }

    bulkUpdate.mutate(filteredUpdate)
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600">
        {selectedIds.length} selected
      </span>

      <button
        onClick={() => setShowUpdateForm(true)}
        className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Bulk Update
      </button>

      <button
        onClick={() => setShowDeleteConfirm(true)}
        className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700"
      >
        Bulk Delete
      </button>

      {/* Bulk Update Modal */}
      {showUpdateForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">
              Bulk Update {selectedIds.length} Preorder(s)
            </h3>

            <form onSubmit={handleBulkUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Update Status
                </label>
                <select
                  value={updateForm.status || ""}
                  onChange={(e) => setUpdateForm({ ...updateForm, status: e.target.value || undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                >
                  <option value="">Don't change</option>
                  <option value="Pending">Pending</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Add to Amount Paid
                </label>
                <input
                  type="number"
                  step="0.01"
                  placeholder="Leave empty to skip"
                  value={updateForm.amount_paid || ""}
                  onChange={(e) => setUpdateForm({ ...updateForm, amount_paid: e.target.value ? Number(e.target.value) : undefined })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowUpdateForm(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={bulkUpdate.isPending}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
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
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Bulk Delete</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedIds.length} preorder(s)? This action cannot be undone.
            </p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => bulkDelete.mutate()}
                disabled={bulkDelete.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
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
