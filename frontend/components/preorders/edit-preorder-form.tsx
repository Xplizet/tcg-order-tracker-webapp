"use client"

import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import * as z from "zod"
import { useApi } from "@/lib/use-api"
import type { PreorderUpdate, Preorder } from "@/lib/api"

const preorderSchema = z.object({
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
})

type PreorderFormData = z.infer<typeof preorderSchema>

interface EditPreorderFormProps {
  preorder: Preorder
  onClose: () => void
}

export function EditPreorderForm({ preorder, onClose }: EditPreorderFormProps) {
  const queryClient = useQueryClient()
  const { apiRequest } = useApi()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PreorderFormData>({
    resolver: zodResolver(preorderSchema),
    defaultValues: {
      product_name: preorder.product_name,
      product_url: preorder.product_url || "",
      quantity: preorder.quantity,
      store_name: preorder.store_name,
      cost_per_item: preorder.cost_per_item,
      amount_paid: preorder.amount_paid,
      sold_price: preorder.sold_price || "",
      status: preorder.status,
      release_date: preorder.release_date || "",
      order_date: preorder.order_date || "",
      notes: preorder.notes || "",
    },
  })

  const updatePreorder = useMutation({
    mutationFn: (data: PreorderUpdate) =>
      apiRequest<Preorder>(`/api/v1/preorders/${preorder.id}`, {
        method: "PUT",
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["preorders"] })
      onClose()
    },
  })

  const onSubmit = (data: PreorderFormData) => {
    // Clean up empty optional fields
    const cleanData: PreorderUpdate = {
      ...data,
      product_url: data.product_url || undefined,
      sold_price: data.sold_price ? Number(data.sold_price) : undefined,
      release_date: data.release_date || undefined,
      order_date: data.order_date || undefined,
      notes: data.notes || undefined,
    }
    updatePreorder.mutate(cleanData)
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">Edit Preorder</h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name *
              </label>
              <input
                {...register("product_name")}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., Pokemon Scarlet & Violet Booster Box"
              />
              {errors.product_name && (
                <p className="text-red-600 text-sm mt-1">{errors.product_name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product URL
              </label>
              <input
                {...register("product_url")}
                type="url"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://..."
              />
              {errors.product_url && (
                <p className="text-red-600 text-sm mt-1">{errors.product_url.message}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Store Name *
                </label>
                <input
                  {...register("store_name")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., TCG Store"
                />
                {errors.store_name && (
                  <p className="text-red-600 text-sm mt-1">{errors.store_name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity *
                </label>
                <input
                  {...register("quantity")}
                  type="number"
                  min="1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.quantity && (
                  <p className="text-red-600 text-sm mt-1">{errors.quantity.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cost Per Item *
                </label>
                <input
                  {...register("cost_per_item")}
                  type="number"
                  step="0.01"
                  min="0.01"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
                {errors.cost_per_item && (
                  <p className="text-red-600 text-sm mt-1">{errors.cost_per_item.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount Paid
                </label>
                <input
                  {...register("amount_paid")}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
                {errors.amount_paid && (
                  <p className="text-red-600 text-sm mt-1">{errors.amount_paid.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  {...register("status")}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Pending">Pending</option>
                  <option value="Delivered">Delivered</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Sold Price
                </label>
                <input
                  {...register("sold_price")}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Order Date
                </label>
                <input
                  {...register("order_date")}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Release Date
                </label>
                <input
                  {...register("release_date")}
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Any additional notes..."
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="submit"
                disabled={updatePreorder.isPending}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
              >
                {updatePreorder.isPending ? "Updating..." : "Update Preorder"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>

            {updatePreorder.isError && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                <p className="text-red-600 text-sm">
                  Error: {updatePreorder.error.message}
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
