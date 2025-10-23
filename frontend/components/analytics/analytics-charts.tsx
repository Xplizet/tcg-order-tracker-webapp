"use client"

import { useQuery } from "@tanstack/react-query"
import { useApi } from "@/lib/use-api"
import type { SpendingByStore, StatusOverview, ProfitByStore, MonthlySpending, OrderListParams } from "@/lib/api"
import { PieChart, Pie, Cell, BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface AnalyticsChartsProps {
  filters: OrderListParams
}

const COLORS = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"]

export function AnalyticsCharts({ filters }: AnalyticsChartsProps) {
  const { apiRequest } = useApi()

  // Build query string (excluding pagination/sorting)
  const buildQueryString = (params: OrderListParams) => {
    const searchParams = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "" &&
          key !== "page" && key !== "page_size" && key !== "sort_by" && key !== "sort_order" && key !== "search") {
        searchParams.append(key, value.toString())
      }
    })
    return searchParams.toString()
  }

  const queryString = buildQueryString(filters)

  const { data: spendingByStoreRaw, isLoading: loadingSpending } = useQuery({
    queryKey: ["spending-by-store", queryString],
    queryFn: () => apiRequest<SpendingByStore[]>(`/api/v1/analytics/spending-by-store?${queryString}`),
  })

  // Convert string decimals to numbers for charts
  const spendingByStore = spendingByStoreRaw?.map(item => ({
    ...item,
    total_spent: typeof item.total_spent === 'string' ? parseFloat(item.total_spent) : item.total_spent
  }))

  const { data: statusOverview, isLoading: loadingStatus } = useQuery({
    queryKey: ["status-overview", queryString],
    queryFn: () => apiRequest<StatusOverview[]>(`/api/v1/analytics/status-overview?${queryString}`),
  })

  const { data: profitByStoreRaw, isLoading: loadingProfit } = useQuery({
    queryKey: ["profit-by-store", queryString],
    queryFn: () => apiRequest<ProfitByStore[]>(`/api/v1/analytics/profit-by-store?${queryString}`),
  })

  // Convert string decimals to numbers for charts
  const profitByStore = profitByStoreRaw?.map(item => ({
    ...item,
    total_profit: typeof item.total_profit === 'string' ? parseFloat(item.total_profit) : item.total_profit,
    avg_profit_margin: typeof item.avg_profit_margin === 'string' ? parseFloat(item.avg_profit_margin) : item.avg_profit_margin
  }))

  const { data: monthlySpendingRaw, isLoading: loadingMonthly } = useQuery({
    queryKey: ["monthly-spending", queryString],
    queryFn: () => apiRequest<MonthlySpending[]>(`/api/v1/analytics/monthly-spending?${queryString}`),
  })

  // Convert string decimals to numbers for charts
  const monthlySpending = monthlySpendingRaw?.map(item => ({
    ...item,
    total_spent: typeof item.total_spent === 'string' ? parseFloat(item.total_spent) : item.total_spent
  }))

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
      {/* Spending by Store - Pie Chart */}
      <div className="bg-card text-card-foreground rounded-lg shadow p-4 sm:p-6 border border-border">
        <h3 className="text-lg font-semibold mb-4">Spending by Store</h3>
        {loadingSpending ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="space-y-3 w-full">
              <div className="h-6 bg-muted rounded w-3/4 mx-auto animate-pulse"></div>
              <div className="h-6 bg-muted rounded w-2/3 mx-auto animate-pulse"></div>
              <div className="h-6 bg-muted rounded w-1/2 mx-auto animate-pulse"></div>
              <div className="h-48 bg-muted rounded-full w-48 mx-auto animate-pulse mt-8"></div>
            </div>
          </div>
        ) : spendingByStore && spendingByStore.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={spendingByStore}
                dataKey="total_spent"
                nameKey="store_name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={({ store_name, total_spent }) => `${store_name}: ${formatCurrency(total_spent)}`}
              >
                {spendingByStore.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No data available
          </div>
        )}
      </div>

      {/* Status Overview - Donut Chart */}
      <div className="bg-card text-card-foreground rounded-lg shadow p-4 sm:p-6 border border-border">
        <h3 className="text-lg font-semibold mb-4">Status Overview</h3>
        {loadingStatus ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="space-y-3 w-full">
              <div className="h-6 bg-muted rounded w-3/4 mx-auto animate-pulse"></div>
              <div className="h-6 bg-muted rounded w-2/3 mx-auto animate-pulse"></div>
              <div className="h-6 bg-muted rounded w-1/2 mx-auto animate-pulse"></div>
              <div className="h-48 bg-muted rounded-full w-48 mx-auto animate-pulse mt-8"></div>
            </div>
          </div>
        ) : statusOverview && statusOverview.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusOverview}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                label={({ status, count }) => `${status}: ${count}`}
              >
                {statusOverview.map((entry, index) => {
                  const colorMap: Record<string, string> = {
                    "Pending": "#f59e0b",
                    "Delivered": "#3b82f6",
                    "Sold": "#10b981"
                  }
                  return <Cell key={`cell-${index}`} fill={colorMap[entry.status] || COLORS[index]} />
                })}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No data available
          </div>
        )}
      </div>

      {/* Profit by Store - Bar Chart */}
      <div className="bg-card text-card-foreground rounded-lg shadow p-4 sm:p-6 border border-border">
        <h3 className="text-lg font-semibold mb-4">Profit by Store</h3>
        {loadingProfit ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="space-y-2 w-full px-8">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-end gap-2">
                  <div className="h-4 bg-muted rounded w-20 animate-pulse"></div>
                  <div className={`bg-muted rounded-t animate-pulse`} style={{ height: `${40 + i * 30}px`, width: '100%' }}></div>
                </div>
              ))}
            </div>
          </div>
        ) : profitByStore && profitByStore.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={profitByStore}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="store_name" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Bar dataKey="total_profit" fill="#10b981" name="Total Profit" />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No sold items yet
          </div>
        )}
      </div>

      {/* Monthly Spending - Line Chart */}
      <div className="bg-card text-card-foreground rounded-lg shadow p-4 sm:p-6 border border-border">
        <h3 className="text-lg font-semibold mb-4">Monthly Spending</h3>
        {loadingMonthly ? (
          <div className="flex items-center justify-center h-[300px]">
            <div className="space-y-2 w-full px-8">
              <div className="flex items-end justify-between h-48">
                {[80, 120, 95, 110, 75, 130, 100, 90].map((height, i) => (
                  <div key={i} className={`bg-muted rounded-t animate-pulse w-8`} style={{ height: `${height}px` }}></div>
                ))}
              </div>
              <div className="flex justify-between">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="h-4 bg-muted rounded w-12 animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        ) : monthlySpending && monthlySpending.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlySpending}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatCurrency(value)} />
              <Legend />
              <Line type="monotone" dataKey="total_spent" stroke="#3b82f6" strokeWidth={2} name="Total Spent" />
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[300px] text-muted-foreground">
            No data available
          </div>
        )}
      </div>
    </div>
  )
}
