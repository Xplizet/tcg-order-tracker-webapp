"use client"

import { useState } from "react"
import { useQuery } from "@tanstack/react-query"
import { useApi } from "@/lib/use-api"
import type { AdminStatistics, SystemSettings, UserListItem } from "@/lib/api"
import { FeatureFlagsTab } from "@/components/admin/feature-flags-tab"
import { UserManagementTab } from "@/components/admin/user-management-tab"
import { NavBar } from "@/components/nav-bar"

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
      <>
        <NavBar isAdmin />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="text-xl font-semibold text-foreground">Loading Admin Panel...</div>
          </div>
        </div>
      </>
    )
  }

  if (statsError || settingsError) {
    return (
      <>
        <NavBar />
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center bg-destructive/10 border border-destructive/30 p-8 rounded-lg max-w-md">
            <h2 className="text-xl font-semibold text-destructive mb-2">Access Denied</h2>
            <p className="text-destructive">
              {statsError ? (statsError as Error).message : (settingsError as Error).message}
            </p>
            <p className="text-sm text-muted-foreground mt-4">
              You need admin privileges to access this page.
            </p>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <NavBar isAdmin />
      <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Admin Panel</h1>
          <p className="text-muted-foreground mt-2 text-sm sm:text-base">Manage system settings, users, and monitor application health</p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-border mb-6">
          <nav className="-mb-px flex space-x-6 sm:space-x-8 overflow-x-auto">
            <button
              onClick={() => setActiveTab("dashboard")}
              className={`${
                activeTab === "dashboard"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
              } whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Dashboard
            </button>
            <button
              onClick={() => setActiveTab("feature-flags")}
              className={`${
                activeTab === "feature-flags"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
              } whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-sm`}
            >
              Feature Flags
            </button>
            <button
              onClick={() => setActiveTab("users")}
              className={`${
                activeTab === "users"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:border-muted"
              } whitespace-nowrap py-3 sm:py-4 px-1 border-b-2 font-medium text-sm`}
            >
              User Management
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        {activeTab === "dashboard" && stats && (
          <div className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-card text-card-foreground rounded-lg shadow p-4 sm:p-6 border border-border">
                <div className="text-xs sm:text-sm text-muted-foreground">Total Users</div>
                <div className="text-2xl sm:text-3xl font-bold text-foreground mt-2">{stats.total_users}</div>
              </div>
              <div className="bg-card text-card-foreground rounded-lg shadow p-4 sm:p-6 border border-border">
                <div className="text-xs sm:text-sm text-muted-foreground">Active (7d)</div>
                <div className="text-2xl sm:text-3xl font-bold text-primary mt-2">{stats.active_users_7d}</div>
              </div>
              <div className="bg-card text-card-foreground rounded-lg shadow p-4 sm:p-6 border border-border">
                <div className="text-xs sm:text-sm text-muted-foreground">New This Week</div>
                <div className="text-2xl sm:text-3xl font-bold text-green-600 dark:text-green-500 mt-2">{stats.new_users_this_week}</div>
              </div>
              <div className="bg-card text-card-foreground rounded-lg shadow p-4 sm:p-6 border border-border">
                <div className="text-xs sm:text-sm text-muted-foreground">Total Orders</div>
                <div className="text-2xl sm:text-3xl font-bold text-secondary mt-2">{stats.total_orders}</div>
              </div>
            </div>

            <div className="bg-card text-card-foreground rounded-lg shadow p-4 sm:p-6 border border-border">
              <h3 className="text-base sm:text-lg font-semibold mb-4 text-foreground">User Tier Distribution</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="border border-border rounded-lg p-4">
                  <div className="text-xs sm:text-sm text-muted-foreground">Free Tier</div>
                  <div className="text-xl sm:text-2xl font-bold text-foreground">{stats.free_tier_users}</div>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <div className="text-xs sm:text-sm text-muted-foreground">Basic Tier</div>
                  <div className="text-xl sm:text-2xl font-bold text-primary">{stats.basic_tier_users}</div>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <div className="text-xs sm:text-sm text-muted-foreground">Pro Tier</div>
                  <div className="text-xl sm:text-2xl font-bold text-secondary">{stats.pro_tier_users}</div>
                </div>
                <div className="border border-border rounded-lg p-4">
                  <div className="text-xs sm:text-sm text-muted-foreground">Grandfathered</div>
                  <div className="text-xl sm:text-2xl font-bold text-green-600 dark:text-green-500">{stats.grandfathered_users}</div>
                </div>
              </div>
            </div>

            <div className="bg-card text-card-foreground rounded-lg shadow p-4 sm:p-6 border border-border">
              <h3 className="text-base sm:text-lg font-semibold mb-4 text-foreground">System Metrics</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm sm:text-base text-muted-foreground">Average Orders per User</span>
                  <span className="text-sm sm:text-base font-semibold text-foreground">{stats.avg_orders_per_user.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-border">
                  <span className="text-sm sm:text-base text-muted-foreground">Active Users (30d)</span>
                  <span className="text-sm sm:text-base font-semibold text-foreground">{stats.active_users_30d}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm sm:text-base text-muted-foreground">New Users This Month</span>
                  <span className="text-sm sm:text-base font-semibold text-foreground">{stats.new_users_this_month}</span>
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
    </>
  )
}
