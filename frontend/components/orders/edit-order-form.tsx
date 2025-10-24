"use client"

import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { toast } from "sonner"
import * as z from "zod"
import { useApi } from "@/lib/use-api"
import { useStoreSuggestions } from "@/lib/use-store-suggestions"
import { AutocompleteInput } from "@/components/ui/autocomplete-input"
import type { OrderUpdate, Order } from "@/lib/api"

const orderSchema = z.object({
  product_name: z.string().min(1, "Product name is required").max(500),
  product_url: z.string().url("Must be a valid URL").optional().or(z.literal("")),
  quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
  store_name: z.string().min(1, "Store name is required").max(200),
  cost_per_item: z.coerce.number().min(0.01, "Cost must be greater than 0"),
  amount_paid: z.coerce.number().min(0, "Amount paid must be 0 or greater").default(0),
  sold_price: z.coerce.number().min(0).optional().or(z.literal("")),
  status: z.enum(["Pending", "Delivered", "Sold"]).default("Pending"),
  release_date: z.string().optional().or(z.literal("")),
  order_date: z.string().optional().or(z.literal("")),
  notes: z.string().optional().or(z.literal("")),
}).refine((data) => {
  const totalCost = data.cost_per_item * data.quantity
  return data.amount_paid <= totalCost
}, {
  message: "Amount paid cannot exceed total cost",
  path: ["amount_paid"],
})

type OrderFormData = z.infer<typeof orderSchema>

interface EditOrderFormProps {
  order: Order
  onClose: () => void
}

export function EditOrderForm({ order, onClose }: EditOrderFormProps) {
  const queryClient = useQueryClient()
  const { apiRequest } = useApi()
  const { suggestions: storeSuggestions } = useStoreSuggestions()

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm<OrderFormData>({
    resolver: zodResolver(orderSchema),
    defaultValues: {
      product_name: order.product_name,
      product_url: order.product_url || "",
      quantity: order.quantity,
      store_name: order.store_name,
      cost_per_item: order.cost_per_item,
      amount_paid: order.amount_paid,
      sold_price: order.sold_price || "",
      status: order.status,
      release_date: order.release_date || "",
      order_date: order.order_date || "",
      notes: order.notes || "",
    },
  })

  const updateOrder = useMutation({
    mutationFn: (data: OrderUpdate) =>
      apiRequest<Order>(`/api/v1/orders/${order.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["analytics"] })
      toast.success("Order updated successfully")
      onClose()
    },
    onError: (error: Error) => {
      toast.error(`Failed to update order: ${error.message}`)
    },
  })

  const onSubmit = (data: OrderFormData) => {
    // Clean up empty optional fields
    const cleanData: OrderUpdate = {
      ...data,
      product_url: data.product_url || undefined,
      sold_price: data.sold_price ? Number(data.sold_price) : undefined,
      release_date: data.release_date || undefined,
      order_date: data.order_date || undefined,
      notes: data.notes || undefined,
    }
    updateOrder.mutate(cleanData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-card text-card-foreground rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-border">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Edit Order</h2>
            <button
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Product Name *
              </label>
              <input
                {...register("product_name")}
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                placeholder="e.g., Pokemon Scarlet & Violet Booster Box"
              />
              {errors.product_name && (
                <p className="text-destructive text-sm mt-1">{errors.product_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-foreground mb-1">
                Product URL
              </label>
              <input
                {...register("product_url")}
                type="url"
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                placeholder="https://..."
              />
              {errors.product_url && (
                <p className="text-destructive text-sm mt-1">{errors.product_url.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Store Name *
                </label>
                <Controller
                  name="store_name"
                  control={control}
                  render={({ field }) => (
                    <AutocompleteInput
                      value={field.value}
                      onChange={field.onChange}
                      suggestions={storeSuggestions}
                      placeholder="e.g., EB Games, Good Games"
                      className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                      error={errors.store_name?.message}
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Quantity *
                </label>
                <input
                  {...register("quantity")}
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
                {errors.quantity && (
                  <p className="text-destructive text-sm mt-1">{errors.quantity.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Cost Per Item *
                </label>
                <input
                  {...register("cost_per_item")}
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="0.00"
                />
                {errors.cost_per_item && (
                  <p className="text-destructive text-sm mt-1">{errors.cost_per_item.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Amount Paid
                </label>
                <input
                  {...register("amount_paid")}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="0.00"
                />
                {errors.amount_paid && (
                  <p className="text-destructive text-sm mt-1">{errors.amount_paid.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Status
                </label>
                <select
                  {...register("status")}
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                >
                  <option value="Pending">Pending</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Sold Price
                </label>
                <input
                  {...register("sold_price")}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Order Date
                </label>
                <input
                  {...register("order_date")}
                  type="date"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-foreground mb-1">
                  Release Date
                </label>
                <input
                  {...register("release_date")}
                  type="date"
                  className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                {...register("notes")}
                rows={3}
                className="w-full px-3 py-2 bg-background border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary text-foreground"
                placeholder="Any additional notes..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={updateOrder.isPending}
                className="flex-1 px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 disabled:opacity-50 transition-colors"
              >
                {updateOrder.isPending ? "Updating..." : "Update Order"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
