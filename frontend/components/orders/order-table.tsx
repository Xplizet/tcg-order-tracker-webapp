"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useApi } from "@/lib/use-api"
import type { Order, OrderList, OrderListParams } from "@/lib/api"
import { EditOrderForm } from "./edit-order-form"
import { DeleteConfirmation } from "./delete-confirmation"
import { BulkOperations } from "./bulk-operations"
import { PaginationControls } from "../ui/pagination-controls"

interface OrderTableProps {
  filters: OrderListParams
  onSortChange: (sortBy: string) => void
  onPageChange: (page: number) => void
  onPageSizeChange: (pageSize: number) => void
}

export function OrderTable({ filters, onSortChange, onPageChange, onPageSizeChange }: OrderTableProps) {
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
      <div className="bg-card text-card-foreground rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <div className="h-7 bg-muted rounded w-32 animate-pulse"></div>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-border">
            <thead className="bg-muted/30">
              <tr>
                <th className="px-6 py-3 text-left w-12">
                  <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
                </th>
                {["Product", "Store", "Qty", "Cost/Item", "Total Cost", "Paid", "Owing", "Status", "Order Date", "Release Date", "Actions"].map((header) => (
                  <th key={header} className="px-6 py-3 text-left">
                    <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-card text-card-foreground divide-y divide-border">
              {[...Array(5)].map((_, i) => (
                <tr key={i}>
                  <td className="px-6 py-4">
                    <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-muted rounded w-32 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-muted rounded w-12 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-muted rounded w-16 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="h-4 bg-muted rounded w-24 animate-pulse"></div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <div className="h-4 bg-muted rounded w-10 animate-pulse"></div>
                      <div className="h-4 bg-muted rounded w-12 animate-pulse"></div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-destructive/10 border border-destructive/30 rounded-lg p-4">
        <p className="text-destructive">Error loading orders: {error.message}</p>
      </div>
    )
  }

  if (!data || data.orders.length === 0) {
    return (
      <div className="text-center py-12 bg-muted/20 rounded-lg border border-border">
        <p className="text-muted-foreground">No orders yet. Add your first one!</p>
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
        className="px-6 py-3 text-left text-xs font-medium text-foreground/80 uppercase tracking-wider cursor-pointer hover:bg-muted/50 select-none"
      >
        <div className="flex items-center gap-1">
          {label}
          <span className="text-foreground/60">
            {isActive ? (isAsc ? "↑" : "↓") : "↕"}
          </span>
        </div>
      </th>
    )
  }

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow overflow-hidden">
      <div className="px-4 sm:px-6 py-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-semibold">
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

      {/* Mobile Card View */}
      <div className="block md:hidden divide-y divide-border">
        {data.orders.map((order: Order) => (
          <div key={order.id} className="p-4 hover:bg-muted/20">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3 flex-1">
                <input
                  type="checkbox"
                  checked={selectedIds.has(order.id)}
                  onChange={() => handleSelectOne(order.id)}
                  className="rounded border-input mt-1"
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-foreground mb-1 break-words">
                    {order.product_url ? (
                      <a
                        href={order.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {order.product_name}
                      </a>
                    ) : (
                      order.product_name
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mb-2">
                    {order.store_name}
                  </div>
                  <span
                    className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(
                      order.status
                    )}`}
                  >
                    {order.status}
                  </span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mb-3">
              <div>
                <span className="text-muted-foreground">Qty:</span>
                <span className="ml-1 text-foreground">{order.quantity}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Cost/Item:</span>
                <span className="ml-1 text-foreground">{formatCurrency(order.cost_per_item)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Total Cost:</span>
                <span className="ml-1 font-medium text-foreground">{formatCurrency(order.total_cost)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Paid:</span>
                <span className="ml-1 text-foreground">{formatCurrency(order.amount_paid)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Owing:</span>
                <span className="ml-1 text-foreground">{formatCurrency(order.amount_owing)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Order Date:</span>
                <span className="ml-1 text-foreground">{formatDate(order.order_date)}</span>
              </div>
              <div>
                <span className="text-muted-foreground">Release Date:</span>
                <span className="ml-1 text-foreground">{formatDate(order.release_date)}</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2 border-t border-border">
              <button
                onClick={() => setEditingOrder(order)}
                className="text-sm text-primary hover:text-primary/80 font-medium"
              >
                Edit
              </button>
              <button
                onClick={() => setDeletingOrder(order)}
                className="text-sm text-destructive hover:text-destructive/80 font-medium"
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop Table View */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/30">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedIds.size === data.orders.length && data.orders.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-input"
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
              <SortableHeader label="Release Date" sortKey="release_date" />
              <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-card text-card-foreground divide-y divide-border">
            {data.orders.map((order: Order) => (
              <tr key={order.id} className="hover:bg-muted/20">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={selectedIds.has(order.id)}
                    onChange={() => handleSelectOne(order.id)}
                    className="rounded border-input"
                  />
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-foreground">
                    {order.product_url ? (
                      <a
                        href={order.product_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        {order.product_name}
                      </a>
                    ) : (
                      order.product_name
                    )}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {order.store_name}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {order.quantity}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {formatCurrency(order.cost_per_item)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">
                  {formatCurrency(order.total_cost)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {formatCurrency(order.amount_paid)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-foreground">
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
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {formatDate(order.order_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">
                  {formatDate(order.release_date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingOrder(order)}
                      className="text-primary hover:text-primary/80"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => setDeletingOrder(order)}
                      className="text-destructive hover:text-destructive/80"
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

      {/* Pagination Controls */}
      <PaginationControls
        page={data.page}
        pageSize={data.page_size}
        total={data.total}
        onPageChange={onPageChange}
        onPageSizeChange={onPageSizeChange}
      />

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
