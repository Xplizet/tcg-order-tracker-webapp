"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useApi } from "@/lib/use-api"
import type { Preorder, PreorderList, PreorderListParams } from "@/lib/api"
import { EditPreorderForm } from "./edit-preorder-form"
import { DeleteConfirmation } from "./delete-confirmation"
import { BulkOperations } from "./bulk-operations"

interface PreorderTableProps {
  filters: PreorderListParams
  onSortChange: (sortBy: string) => void
}

export function PreorderTable({ filters, onSortChange }: PreorderTableProps) {
  const { apiRequest } = useApi()
  const [editingPreorder, setEditingPreorder] = useState<Preorder | null>(null)
  const [deletingPreorder, setDeletingPreorder] = useState<Preorder | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Build query string from filters
  const buildQueryString = (params: PreorderListParams) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, value.toString())
      }
    })
    return searchParams.toString()
  }

  const queryString = buildQueryString(filters)

  const { data, isLoading, error } = useQuery({
    queryKey: ["preorders", queryString],
    queryFn: () => apiRequest<PreorderList>(`/api/v1/preorders?${queryString}`),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading preorders...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading preorders: {error.message}</p>
      </div>
    )
  }

  if (!data || data.preorders.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No preorders yet. Add your first one!</p>
      </div>
    )
  }

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null) return "-"
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Pending":
        return "bg-yellow-100 text-yellow-800"
      case "Delivered":
        return "bg-blue-100 text-blue-800"
      case "Sold":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const handleSelectAll = () => {
    if (selectedIds.size === data.preorders.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(data.preorders.map(p => p.id)))
    }
  }

  const handleSelectOne = (id: string) => {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  const handleBulkOperationComplete = () => {
    setSelectedIds(new Set())
  }

  const SortableHeader = ({ label, sortKey }: { label: string; sortKey: string }) => {
    const isActive = filters.sort_by === sortKey
    const isAsc = filters.sort_order === "asc"

    return (
      <th
        onClick={() => onSortChange(sortKey)}
        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 select-none"
      >
        <div className="flex items-center gap-1">
          {label}
          <span className="text-gray-400">
            {isActive ? (isAsc ? "↑" : "↓") : "↕"}
          </span>
        </div>
      </th>
    )
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">
            My Preorders ({data.total})
          </h2>
          {selectedIds.size > 0 && (
            <BulkOperations
              selectedIds={Array.from(selectedIds)}
              onComplete={handleBulkOperationComplete}
            />
          )}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.size === data.preorders.length && data.preorders.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300"
                />
              </th>
              <SortableHeader label="Product" sortKey="product_name" />
              <SortableHeader label="Store" sortKey="store_name" />
              <SortableHeader label="Qty" sortKey="quantity" />
              <SortableHeader label="Cost/Item" sortKey="cost_per_item" />
              <SortableHeader label="Total Cost" sortKey="total_cost" />
              <SortableHeader label="Paid" sortKey="amount_paid" />
              <SortableHeader label="Owing" sortKey="amount_owing" />
              <SortableHeader label="Status" sortKey="status" />
              <SortableHeader label="Order Date" sortKey="order_date" />
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {data.preorders.map((preorder: Preorder) => (
              <tr key={preorder.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(preorder.id)}
                    onChange={() => handleSelectOne(preorder.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {preorder.product_url ? (
                      <a
                        href={preorder.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {preorder.product_name}
                      </a>
                    ) : (
                      preorder.product_name
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {preorder.store_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {preorder.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(preorder.cost_per_item)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(preorder.total_cost)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(preorder.amount_paid)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(preorder.amount_owing)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      preorder.status
                    )}`}
                  >
                    {preorder.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(preorder.order_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingPreorder(preorder)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingPreorder(preorder)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {data.total > data.page_size && (
        <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
          <p className="text-sm text-gray-600">
            Showing {data.preorders.length} of {data.total} preorders
          </p>
        </div>
      )}

      {editingPreorder && (
        <EditPreorderForm
          preorder={editingPreorder}
          onClose={() => setEditingPreorder(null)}
        />
      )}

      {deletingPreorder && (
        <DeleteConfirmation
          preorder={deletingPreorder}
          onClose={() => setDeletingPreorder(null)}
        />
      )}
    </div>
  )
}
