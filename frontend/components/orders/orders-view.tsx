"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import type { OrderListParams } from "@/lib/api"
import { OrderFilters } from "./order-filters"
import { OrderTable } from "./order-table"
import { SummaryCards } from "../analytics/summary-cards"
import { AnalyticsCharts } from "../analytics/analytics-charts"
import { CsvImportExport } from "./csv-import-export"

/**
 * Parse URL search params into OrderListParams
 */
function parseFiltersFromUrl(searchParams: URLSearchParams): OrderListParams {
  const filters: OrderListParams = {
    page: 1,
    page_size: 50,
    sort_by: "created_at",
    sort_order: "desc",
  }

  const page = searchParams.get("page")
  if (page) filters.page = parseInt(page, 10)

  const pageSize = searchParams.get("page_size")
  if (pageSize) filters.page_size = parseInt(pageSize, 10)

  const status = searchParams.get("status")
  if (status) filters.status = status

  const store = searchParams.get("store")
  if (store) filters.store = store

  const search = searchParams.get("search")
  if (search) filters.search = search

  const orderDateFrom = searchParams.get("order_date_from")
  if (orderDateFrom) filters.order_date_from = orderDateFrom

  const orderDateTo = searchParams.get("order_date_to")
  if (orderDateTo) filters.order_date_to = orderDateTo

  const releaseDateFrom = searchParams.get("release_date_from")
  if (releaseDateFrom) filters.release_date_from = releaseDateFrom

  const releaseDateTo = searchParams.get("release_date_to")
  if (releaseDateTo) filters.release_date_to = releaseDateTo

  const amountOwingOnly = searchParams.get("amount_owing_only")
  if (amountOwingOnly === "true") filters.amount_owing_only = true

  const sortBy = searchParams.get("sort_by")
  if (sortBy) filters.sort_by = sortBy

  const sortOrder = searchParams.get("sort_order")
  if (sortOrder === "asc" || sortOrder === "desc") filters.sort_order = sortOrder

  return filters
}

/**
 * Convert OrderListParams to URL search params string
 */
function serializeFiltersToUrl(filters: OrderListParams): string {
  const params = new URLSearchParams()

  // Always include page and page_size
  params.set("page", String(filters.page ?? 1))
  params.set("page_size", String(filters.page_size ?? 50))
  params.set("sort_by", filters.sort_by ?? "created_at")
  params.set("sort_order", filters.sort_order ?? "desc")

  // Only include optional params if they have values
  if (filters.status) params.set("status", filters.status)
  if (filters.store) params.set("store", filters.store)
  if (filters.search) params.set("search", filters.search)
  if (filters.order_date_from) params.set("order_date_from", filters.order_date_from)
  if (filters.order_date_to) params.set("order_date_to", filters.order_date_to)
  if (filters.release_date_from) params.set("release_date_from", filters.release_date_from)
  if (filters.release_date_to) params.set("release_date_to", filters.release_date_to)
  if (filters.amount_owing_only) params.set("amount_owing_only", "true")

  return params.toString()
}

export function OrdersView() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<OrderListParams>(() => {
    // Initialize from URL params if available
    return parseFiltersFromUrl(searchParams)
  })

  // Sync URL when filters change
  useEffect(() => {
    const newUrl = `/dashboard?${serializeFiltersToUrl(filters)}`
    router.replace(newUrl, { scroll: false })
  }, [filters, router])

  const handleFiltersChange = (newFilters: OrderListParams) => {
    setFilters(newFilters)
  }

  const handleSortChange = (sortBy: string) => {
    setFilters((prev) => ({
      ...prev,
      sort_by: sortBy,
      sort_order:
        prev.sort_by === sortBy && prev.sort_order === "desc" ? "asc" : "desc",
    }))
  }

  const handlePageChange = (page: number) => {
    setFilters((prev) => ({
      ...prev,
      page,
    }))
  }

  const handlePageSizeChange = (pageSize: number) => {
    setFilters((prev) => ({
      ...prev,
      page_size: pageSize,
    }))
  }

  return (
    <div>
      <SummaryCards filters={filters} />
      <AnalyticsCharts filters={filters} />
      <OrderFilters filters={filters} onFiltersChange={handleFiltersChange} />
      <div className="mb-4 flex justify-end">
        <CsvImportExport />
      </div>
      <OrderTable
        filters={filters}
        onSortChange={handleSortChange}
        onPageChange={handlePageChange}
        onPageSizeChange={handlePageSizeChange}
      />
    </div>
  )
}
