"use client"

import { useState } from "react"
import type { OrderListParams } from "@/lib/api"

interface OrderFiltersProps {
  filters: OrderListParams
  onFiltersChange: (filters: OrderListParams) => void
}

export function OrderFilters({ filters, onFiltersChange }: OrderFiltersProps) {
  const [searchInput, setSearchInput] = useState(filters.search || "")

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onFiltersChange({ ...filters, search: searchInput || undefined, page: 1 })
  }

  const handleFilterChange = (key: keyof OrderListParams, value: any) => {
    onFiltersChange({ ...filters, [key]: value || undefined, page: 1 })
  }

  const handleClearFilters = () => {
    setSearchInput("")
    onFiltersChange({
      page: filters.page,
      page_size: filters.page_size,
      sort_by: filters.sort_by,
      sort_order: filters.sort_order,
    })
  }

  const activeFiltersCount = [
    filters.search,
    filters.status,
    filters.store,
    filters.order_date_from,
    filters.order_date_to,
    filters.release_date_from,
    filters.release_date_to,
    filters.amount_owing_only,
  ].filter(Boolean).length

  return (
    <div className="bg-card text-card-foreground rounded-lg shadow p-4 mb-4 space-y-4 border border-border">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder="Search products, stores, or notes..."
          className="flex-1 px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
        />
        <button
          type="submit"
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
        >
          Search
        </button>
      </form>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Status Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Status
          </label>
          <select
            value={filters.status || ""}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="Delivered">Delivered</option>
            <option value="Sold">Sold</option>
          </select>
        </div>

        {/* Store Filter */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Store
          </label>
          <input
            type="text"
            value={filters.store || ""}
            onChange={(e) => handleFilterChange("store", e.target.value)}
            placeholder="Filter by store..."
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Order Date From */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Order Date From
          </label>
          <input
            type="date"
            value={filters.order_date_from || ""}
            onChange={(e) => handleFilterChange("order_date_from", e.target.value)}
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Order Date To */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Order Date To
          </label>
          <input
            type="date"
            value={filters.order_date_to || ""}
            onChange={(e) => handleFilterChange("order_date_to", e.target.value)}
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Release Date From */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Release Date From
          </label>
          <input
            type="date"
            value={filters.release_date_from || ""}
            onChange={(e) => handleFilterChange("release_date_from", e.target.value)}
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Release Date To */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-1">
            Release Date To
          </label>
          <input
            type="date"
            value={filters.release_date_to || ""}
            onChange={(e) => handleFilterChange("release_date_to", e.target.value)}
            className="w-full px-3 py-2 border border-input bg-background text-foreground rounded-md focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>

        {/* Amount Owing Filter */}
        <div className="flex items-end">
          <label className="flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={filters.amount_owing_only || false}
              onChange={(e) => handleFilterChange("amount_owing_only", e.target.checked || undefined)}
              className="mr-2 h-4 w-4 text-primary focus:ring-ring border-input rounded"
            />
            <span className="text-sm font-medium text-foreground">
              Amount Owing Only
            </span>
          </label>
        </div>
      </div>

      {/* Active Filters & Clear */}
      {activeFiltersCount > 0 && (
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <span className="text-sm text-muted-foreground">
            {activeFiltersCount} filter{activeFiltersCount > 1 ? "s" : ""} active
          </span>
          <button
            onClick={handleClearFilters}
            className="text-sm text-primary hover:text-primary/80 font-medium"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}
