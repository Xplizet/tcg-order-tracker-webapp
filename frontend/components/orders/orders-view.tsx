"use client"

import { useState } from "react"
import type { OrderListParams } from "@/lib/api"
import { OrderFilters } from "./order-filters"
import { OrderTable } from "./order-table"
import { SummaryCards } from "../analytics/summary-cards"
import { AnalyticsCharts } from "../analytics/analytics-charts"
import { CsvImportExport } from "./csv-import-export"

export function OrdersView() {
  const [filters, setFilters] = useState<OrderListParams>({
    page: 1,
    page_size: 50,
    sort_by: "created_at",
    sort_order: "desc",
  })

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

  return (
    <div>
      <SummaryCards filters={filters} />
      <AnalyticsCharts filters={filters} />
      <OrderFilters filters={filters} onFiltersChange={handleFiltersChange} />
      <div className="mb-4 flex justify-end">
        <CsvImportExport />
      </div>
      <OrderTable filters={filters} onSortChange={handleSortChange} />
    </div>
  )
}
