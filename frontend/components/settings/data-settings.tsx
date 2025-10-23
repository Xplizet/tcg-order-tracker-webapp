"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useApi } from "@/lib/use-api"
import type { Statistics } from "@/lib/api"

export function DataSettings() {
  const { apiRequest } = useApi()
  const queryClient = useQueryClient()
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const { data: stats } = useQuery({
    queryKey: ["statistics", ""],
    queryFn: () => apiRequest<Statistics>("/api/v1/analytics/statistics"),
  })

  const handleExportJSON = async () => {
    try {
      const token = localStorage.getItem("clerk_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/backup`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Export failed")
      }

      const contentDisposition = response.headers.get("Content-Disposition")
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : `orders_backup_${new Date().toISOString().split("T")[0]}.json`

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      alert("Data exported successfully!")
    } catch (error) {
      alert("Export failed: " + (error as Error).message)
    }
  }

  const handleExportCSV = async () => {
    try {
      const token = localStorage.getItem("clerk_token")
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/orders/export`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Export failed")
      }

      const contentDisposition = response.headers.get("Content-Disposition")
      const filename = contentDisposition
        ? contentDisposition.split("filename=")[1].replace(/"/g, "")
        : `orders_${new Date().toISOString().split("T")[0]}.csv`

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      alert("CSV exported successfully!")
    } catch (error) {
      alert("Export failed: " + (error as Error).message)
    }
  }

  const deleteAllData = useMutation({
    mutationFn: async () => {
      const allOrders = await apiRequest<any>("/api/v1/orders?page_size=1000")
      const ids = allOrders.orders.map((p: any) => p.id)

      return apiRequest("/api/v1/orders/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ order_ids: ids }),
      })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] })
      queryClient.invalidateQueries({ queryKey: ["statistics"] })
      setShowDeleteConfirm(false)
      alert("All data deleted successfully")
    },
    onError: (error: Error) => {
      alert("Delete failed: " + error.message)
    },
  })

  return (
    <div className="space-y-6">
      <div className="bg-card text-card-foreground rounded-lg shadow p-6 border border-border">
        <h2 className="text-xl font-semibold mb-4">Data Overview</h2>

        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-muted/20 rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Total Orders</div>
              <div className="text-2xl font-bold text-foreground">{stats.total_orders || 0}</div>
            </div>
            <div className="bg-muted/20 rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Total Value</div>
              <div className="text-2xl font-bold text-foreground">
                ${Number(stats.total_cost || 0).toFixed(2)}
              </div>
            </div>
            <div className="bg-muted/20 rounded-lg p-4">
              <div className="text-sm text-muted-foreground">Total Profit</div>
              <div className={`text-2xl font-bold ${Number(stats.total_profit || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>
                ${Number(stats.total_profit || 0).toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="bg-card text-card-foreground rounded-lg shadow p-6 border border-border">
        <h2 className="text-xl font-semibold mb-4">Export Data</h2>

        <div className="space-y-4">
          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Export as JSON (Full Backup)</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Download all your data as a JSON file. This includes all order information and can be used to restore your data later.
            </p>
            <button
              onClick={handleExportJSON}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
            >
              Export JSON
            </button>
          </div>

          <div>
            <h3 className="text-sm font-medium text-foreground mb-2">Export as CSV</h3>
            <p className="text-sm text-muted-foreground mb-3">
              Download your data as a CSV file for use in spreadsheet applications like Excel or Google Sheets.
            </p>
            <button
              onClick={handleExportCSV}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Export CSV
            </button>
          </div>
        </div>
      </div>

      <div className="bg-card text-card-foreground rounded-lg shadow p-6 border border-border">
        <h2 className="text-xl font-semibold mb-4 text-red-700">Danger Zone</h2>

        <div>
          <h3 className="text-sm font-medium text-foreground mb-2">Delete All Data</h3>
          <p className="text-sm text-muted-foreground mb-3">
            Permanently delete all your orders. This action cannot be undone. We recommend exporting your data first.
          </p>
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            Delete All Data
          </button>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card text-card-foreground rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              Delete All Data?
            </h3>

            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 font-semibold">Warning!</p>
              <p className="text-sm text-red-700">
                This will permanently delete all {stats?.total_orders || 0} order(s). This action cannot be undone!
              </p>
            </div>

            <p className="text-sm text-muted-foreground mb-6">
              Type <strong>DELETE</strong> to confirm:
            </p>

            <input
              type="text"
              id="delete-confirm"
              className="w-full px-3 py-2 border border-input rounded-lg mb-4"
              placeholder="Type DELETE"
            />

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 border border-input rounded-lg hover:bg-muted/20"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  const input = document.getElementById("delete-confirm") as HTMLInputElement
                  if (input.value === "DELETE") {
                    deleteAllData.mutate()
                  } else {
                    alert('Please type "DELETE" to confirm')
                  }
                }}
                disabled={deleteAllData.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {deleteAllData.isPending ? "Deleting..." : "Delete All Data"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
