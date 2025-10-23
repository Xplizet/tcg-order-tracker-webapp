"use client"

import { useState } from "react"
import type { PreorderListParams } from "@/lib/api"
import { PreorderFilters } from "./preorder-filters"
import { PreorderTable } from "./preorder-table"

export function PreordersView() {
  const [filters, setFilters] = useState<PreorderListParams>({
    page: 1,
    page_size: 50,
    sort_by: "created_at",
    sort_order: "desc",
  })

  const handleFiltersChange = (newFilters: PreorderListParams) => {
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
      <PreorderFilters filters={filters} onFiltersChange={handleFiltersChange} />
      <PreorderTable filters={filters} onSortChange={handleSortChange} />
    </div>
  )
}
