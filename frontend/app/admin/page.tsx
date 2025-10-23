"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useApi } from "@/lib/use-api"
import type { AdminStatistics, SystemSettings, UserListItem } from "@/lib/api"
import { FeatureFlagsTab } from "@/components/admin/feature-flags-tab"
import { UserManagementTab } from "@/components/admin/user-management-tab"

export default function AdminPage() {
  const { apiRequest } = useApi()
  const [activeTab, setActiveTab] = useState<"dashboard" | "feature-flags" | "users">("dashboard")

  // Fetch admin statistics
  const { data: stats, isLoading: statsLoading, error: statsError } = useQuery({
    queryKey: ["admin-statistics"],
    queryFn: () => apiRequest<AdminStatistics>("/api/v1/admin/statistics"),
  })

  // Fetch system settings
  const { data: settings, error: settingsError } = useQuery({
    queryKey: ["admin-settings"],
    queryFn: () => apiRequest<SystemSettings>("/api/v1/admin/settings"),
  })

  if (statsLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-xl font-semibold">Loading Admin Panel...</div>
        </div>
      </div>
    )
  }

  if (statsError || settingsError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center bg-red-50 p-8 rounded-lg max-w-md">
          <h2 className="text-xl font-semibold text-red-800 mb-2">Access Denied</h2>
          <p className="text-red-600">
            {statsError ? (statsError as Error).message : (settingsError as Error).message}
          </p>
          <p className="text-sm text-gray-600 mt-4">
            You need admin privileges to access this page.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Panel</h1>
          <p className="text-gray-600 mt-2">Manage system settings, users, and monitor application health</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 mb-6">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`${
                activeTab === "dashboard"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("feature-flags")}
              className={`${
                activeTab === "feature-flags"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Feature Flags
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`${
                activeTab === "users"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
            >
              User Management
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "dashboard" && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600">Total Users</div>
                <div className="text-3xl font-bold text-gray-900 mt-2">{stats.total_users}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600">Active (7d)</div>
                <div className="text-3xl font-bold text-blue-600 mt-2">{stats.active_users_7d}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600">New This Week</div>
                <div className="text-3xl font-bold text-green-600 mt-2">{stats.new_users_this_week}</div>
              </div>
              <div className="bg-white rounded-lg shadow p-6">
                <div className="text-sm text-gray-600">Total Orders</div>
                <div className="text-3xl font-bold text-purple-600 mt-2">{stats.total_orders}</div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">User Tier Distribution</h3>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-gray-600">Free Tier</div>
                  <div className="text-2xl font-bold text-gray-900">{stats.free_tier_users}</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-gray-600">Basic Tier</div>
                  <div className="text-2xl font-bold text-blue-600">{stats.basic_tier_users}</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-gray-600">Pro Tier</div>
                  <div className="text-2xl font-bold text-purple-600">{stats.pro_tier_users}</div>
                </div>
                <div className="border rounded-lg p-4">
                  <div className="text-sm text-gray-600">Grandfathered</div>
                  <div className="text-2xl font-bold text-green-600">{stats.grandfathered_users}</div>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="text-lg font-semibold mb-4">System Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Average Orders per User</span>
                  <span className="font-semibold">{stats.avg_orders_per_user.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b">
                  <span className="text-gray-600">Active Users (30d)</span>
                  <span className="font-semibold">{stats.active_users_30d}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">New Users This Month</span>
                  <span className="font-semibold">{stats.new_users_this_month}</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === "feature-flags" && settings && (
          <FeatureFlagsTab settings={settings} />
        )}

        {activeTab === "users" && (
          <UserManagementTab />
        )}
      </div>
    </div>
  )
}
