"use client"

import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import { useApi } from "@/lib/use-api"
import type { Order } from "@/lib/api"

interface DeleteConfirmationProps {
  order: Order
  onClose: () => void
}

export function DeleteConfirmation({ order, onClose }: DeleteConfirmationProps) {
  const queryClient = useQueryClient()
  const { apiRequest } = useApi()

  const deleteOrder = useMutation({
    mutationFn: () =>
      apiRequest(`/api/v1/orders/${order.id}`, {
        method: "DELETE",
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
      toast.success("Order deleted successfully")
      onClose()
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete order: ${error.message}`)
    },
  })

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card text-card-foreground rounded-lg shadow-xl max-w-md w-full p-6 border border-border">
        <h2 className="text-xl font-bold mb-4">Delete Order</h2>

        <p className="text-muted-foreground mb-6">
          Are you sure you want to delete <strong className="text-foreground">{order.product_name}</strong>?
          This action cannot be undone.
        </p>

        <div className="flex gap-3">
          <button
            onClick={() => deleteOrder.mutate()}
            disabled={deleteOrder.isPending}
            className="flex-1 px-4 py-2 bg-destructive text-destructive-foreground rounded-md hover:bg-destructive/90 disabled:opacity-50 transition-colors"
          >
            {deleteOrder.isPending ? "Deleting..." : "Delete"}
          </button>
          <button
            onClick={onClose}
            disabled={deleteOrder.isPending}
            className="flex-1 px-4 py-2 border border-border rounded-md hover:bg-muted disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}
