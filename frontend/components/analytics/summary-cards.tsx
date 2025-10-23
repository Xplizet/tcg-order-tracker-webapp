"use client"

import { useQuery } from "@tanstack/react-query"
import { useApi } from "@/lib/use-api"
import type { Statistics, PreorderListParams } from "@/lib/api"

interface SummaryCardsProps {
  filters: PreorderListParams
}

export function SummaryCards({ filters }: SummaryCardsProps) {
  const { apiRequest } = useApi()

  // Build query string from filters
  const buildQueryString = (params: PreorderListParams) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "" && key !== "page" && key !== "page_size" && key !== "sort_by" && key !== "sort_order") {
        searchParams.append(key, value.toString())
      }
    })
    return searchParams.toString()
  }

  const queryString = buildQueryString(filters)

  const { data: stats, isLoading } = useQuery({
    queryKey: ["statistics", queryString],
    queryFn: () => apiRequest<Statistics>(`/api/v1/analytics/statistics?${queryString}`),
  })

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg shadow p-6 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-8 bg-gray-200 rounded w-3/4"></div>
          </div>
        ))}
      </div>
    )
  }

  if (!stats) return null

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(value)
  }

  const formatPercent = (value: number | null) => {
    if (value === null) return "N/A"
    return `${value.toFixed(1)}%`
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Preorders */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Preorders</h3>
        <p className="text-3xl font-bold text-gray-900">{stats.total_preorders}</p>
        <div className="mt-2 text-sm text-gray-600">
          <span className="text-yellow-600">{stats.pending_count} Pending</span>
          {" • "}
          <span className="text-blue-600">{stats.delivered_count} Delivered</span>
          {" • "}
          <span className="text-green-600">{stats.sold_count} Sold</span>
        </div>
      </div>

      {/* Total Cost */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Cost</h3>
        <p className="text-3xl font-bold text-gray-900">{formatCurrency(stats.total_cost)}</p>
        <p className="mt-2 text-sm text-gray-600">Total investment</p>
      </div>

      {/* Amount Owing */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Amount Owing</h3>
        <p className="text-3xl font-bold text-red-600">{formatCurrency(stats.amount_owing)}</p>
        <p className="mt-2 text-sm text-gray-600">Outstanding balance</p>
      </div>

      {/* Total Profit */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Total Profit</h3>
        <p className={`text-3xl font-bold ${stats.total_profit >= 0 ? "text-green-600" : "text-red-600"}`}>
          {formatCurrency(stats.total_profit)}
        </p>
        <p className="mt-2 text-sm text-gray-600">
          From {stats.sold_count} sold item{stats.sold_count !== 1 ? "s" : ""}
        </p>
      </div>

      {/* Average Profit Margin */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Avg Profit Margin</h3>
        <p className="text-3xl font-bold text-gray-900">
          {formatPercent(stats.average_profit_margin)}
        </p>
        <p className="mt-2 text-sm text-gray-600">On sold items</p>
      </div>

      {/* Amount Paid */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-sm font-medium text-gray-500 mb-2">Amount Paid</h3>
        <p className="text-3xl font-bold text-green-600">
          {formatCurrency(stats.total_cost - stats.amount_owing)}
        </p>
        <p className="mt-2 text-sm text-gray-600">Total payments made</p>
      </div>
    </div>
  )
}
