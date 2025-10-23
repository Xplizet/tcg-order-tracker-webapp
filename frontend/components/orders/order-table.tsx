"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useApi } from "@/lib/use-api"
import type { Order, OrderList, OrderListParams } from "@/lib/api"
import { EditOrderForm } from "./edit-order-form"
import { DeleteConfirmation } from "./delete-confirmation"
import { BulkOperations } from "./bulk-operations"

interface OrderTableProps {
  filters: OrderListParams
  onSortChange: (sortBy: string) => void
}

export function OrderTable({ filters, onSortChange }: OrderTableProps) {
  const { apiRequest } = useApi()
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [deletingOrder, setDeletingOrder] = useState<Order | null>(null)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  // Build query string from filters
  const buildQueryString = (params: OrderListParams) => {
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
    queryKey: ["orders", queryString],
    queryFn: () => apiRequest<OrderList>(`/api/v1/orders?${queryString}`),
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-gray-600">Loading orders...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">Error loading orders: {error.message}</p>
      </div>
    )
  }

  if (!data || data.orders.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-gray-600">No orders yet. Add your first one!</p>
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
    if (selectedIds.size === data.orders.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(data.orders.map(p => p.id)))
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
            My Orders ({data.total})
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
                  checked={selectedIds.size === data.orders.length && data.orders.length > 0}
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
            {data.orders.map((order: Order) => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(order.id)}
                    onChange={() => handleSelectOne(order.id)}
                    className="rounded border-gray-300"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    {order.product_url ? (
                      <a
                        href={order.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {order.product_name}
                      </a>
                    ) : (
                      order.product_name
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.store_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {order.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(order.cost_per_item)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatCurrency(order.total_cost)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatCurrency(order.amount_paid)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {formatCurrency(order.amount_owing)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {formatDate(order.order_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingOrder(order)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingOrder(order)}
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
            Showing {data.orders.length} of {data.total} orders
          </p>
        </div>
      )}

      {editingOrder && (
        <EditOrderForm
          order={editingOrder}
          onClose={() => setEditingOrder(null)}
        />
      )}

      {deletingOrder && (
        <DeleteConfirmation
          order={deletingOrder}
          onClose={() => setDeletingOrder(null)}
        />
      )}
    </div>
  )
}
