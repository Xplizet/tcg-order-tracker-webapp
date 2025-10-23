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

  const { data: spendingByStore } = useQuery({
    queryKey: ["spending-by-store", queryString],
    queryFn: () => apiRequest<SpendingByStore[]>(`/api/v1/analytics/spending-by-store?${queryString}`),
  })

  const { data: statusOverview } = useQuery({
    queryKey: ["status-overview", queryString],
    queryFn: () => apiRequest<StatusOverview[]>(`/api/v1/analytics/status-overview?${queryString}`),
  })

  const { data: profitByStore } = useQuery({
    queryKey: ["profit-by-store", queryString],
    queryFn: () => apiRequest<ProfitByStore[]>(`/api/v1/analytics/profit-by-store?${queryString}`),
  })

  const { data: monthlySpending } = useQuery({
    queryKey: ["monthly-spending", queryString],
    queryFn: () => apiRequest<MonthlySpending[]>(`/api/v1/analytics/monthly-spending?${queryString}`),
  })

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
      {/* Spending by Store - Pie Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Spending by Store</h3>
        {spendingByStore && spendingByStore.length > 0 ? (
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
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No data available
          </div>
        )}
      </div>

      {/* Status Overview - Donut Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Status Overview</h3>
        {statusOverview && statusOverview.length > 0 ? (
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
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No data available
          </div>
        )}
      </div>

      {/* Profit by Store - Bar Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Profit by Store</h3>
        {profitByStore && profitByStore.length > 0 ? (
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
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No sold items yet
          </div>
        )}
      </div>

      {/* Monthly Spending - Line Chart */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Monthly Spending</h3>
        {monthlySpending && monthlySpending.length > 0 ? (
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
          <div className="flex items-center justify-center h-[300px] text-gray-500">
            No data available
          </div>
        )}
      </div>
    </div>
  )
}
