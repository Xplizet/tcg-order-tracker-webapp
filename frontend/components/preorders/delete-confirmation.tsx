"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useApi } from "@/lib/use-api"
import type { Preorder } from "@/lib/api"

interface DeleteConfirmationProps {
  preorder: Preorder
  onClose: () => void
}

export function DeleteConfirmation({ preorder, onClose }: DeleteConfirmationProps) {
  const queryClient = useQueryClient()
  const { apiRequest } = useApi()

  const deletePreorder = useMutation({
    mutationFn: () =>
      apiRequest(`/api/v1/preorders/${preorder.id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preorders"] })
      onClose()
    },
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
        <h2 className="text-xl font-bold mb-4">Delete Preorder</h2>

        <p className="text-gray-600 mb-6">
          Are you sure you want to delete <strong>{preorder.product_name}</strong>?
          This action cannot be undone.
        </p>

        {deletePreorder.isError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-600 text-sm">
              Error: {deletePreorder.error.message}
            </p>
          </div>
        )}

        <div className="flex gap-3">
          <button
            onClick={() => deletePreorder.mutate()}
            disabled={deletePreorder.isPending}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 transition-colors"
          >
            {deletePreorder.isPending ? "Deleting..." : "Delete"}
          </button>
          <button
            onClick={onClose}
            disabled={deletePreorder.isPending}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
