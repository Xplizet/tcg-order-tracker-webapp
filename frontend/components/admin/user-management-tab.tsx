"use client"

import { useState } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useApi } from "@/lib/use-api"
import type { UserListItem, UserTierUpdate } from "@/lib/api"

export function UserManagementTab() {
  const { apiRequest } = useApi()
  const queryClient = useQueryClient()

  const [search, setSearch] = useState("")
  const [tierFilter, setTierFilter] = useState<string>("")
  const [grandfatheredFilter, setGrandfatheredFilter] = useState<string>("")
  const [selectedUser, setSelectedUser] = useState<UserListItem | null>(null)
  const [newTier, setNewTier] = useState<string>("")

  // Fetch users with filters
  const { data: users, isLoading } = useQuery({
    queryKey: ["admin-users", search, tierFilter, grandfatheredFilter],
    queryFn: () => {
      const params = new URLSearchParams()
      if (search) params.append("search", search)
      if (tierFilter) params.append("tier", tierFilter)
      if (grandfatheredFilter) params.append("grandfathered", grandfatheredFilter)

      const queryString = params.toString()
      return apiRequest<UserListItem[]>(
        `/api/v1/admin/users${queryString ? `?${queryString}` : ""}`
      )
    },
  })

  // Update user tier mutation
  const updateUserTier = useMutation({
    mutationFn: ({ userId, tier }: { userId: string; tier: string }) =>
      apiRequest<UserListItem>(`/api/v1/admin/users/${userId}/tier`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tier }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-users"] })
      queryClient.invalidateQueries({ queryKey: ["admin-statistics"] })
      setSelectedUser(null)
      alert("User tier updated successfully!")
    },
    onError: (error: Error) => {
      alert("Failed to update user tier: " + error.message)
    },
  })

  const handleChangeTier = () => {
    if (selectedUser && newTier) {
      updateUserTier.mutate({ userId: selectedUser.id, tier: newTier })
    }
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-card text-card-foreground rounded-lg shadow p-6 border border-border">
        <h3 className="text-lg font-semibold mb-4">Filter Users</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Search by Email
            </label>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="user@example.com"
              className="w-full px-3 py-2 border border-input rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Filter by Tier
            </label>
            <select
              value={tierFilter}
              onChange={(e) => setTierFilter(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg"
            >
              <option value="">All Tiers</option>
              <option value="free">Free</option>
              <option value="basic">Basic</option>
              <option value="pro">Pro</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Grandfathered Status
            </label>
            <select
              value={grandfatheredFilter}
              onChange={(e) => setGrandfatheredFilter(e.target.value)}
              className="w-full px-3 py-2 border border-input rounded-lg"
            >
              <option value="">All Users</option>
              <option value="true">Grandfathered Only</option>
              <option value="false">Not Grandfathered</option>
            </select>
          </div>
        </div>
      </div>

      {/* User List */}
      <div className="bg-card text-card-foreground rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">Users</h3>
          {users && (
            <p className="text-sm text-muted-foreground mt-1">
              Showing {users.length} user{users.length !== 1 ? "s" : ""}
            </p>
          )}
        </div>

        {isLoading ? (
          <div className="p-6 text-center text-muted-foreground">Loading users...</div>
        ) : users && users.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/20">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Tier
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Orders
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-card text-card-foreground divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-muted/20">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-foreground">
                          {user.email}
                          {user.is_admin && (
                            <span className="ml-2 px-2 py-1 text-xs bg-purple-100 text-purple-800 rounded">
                              Admin
                            </span>
                          )}
                        </div>
                        {(user.first_name || user.last_name) && (
                          <div className="text-sm text-muted-foreground">
                            {user.first_name} {user.last_name}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`px-2 py-1 text-xs font-medium rounded ${
                          user.tier === "free"
                            ? "bg-muted/30 text-foreground"
                            : user.tier === "basic"
                            ? "bg-blue-100 text-blue-800"
                            : "bg-purple-100 text-purple-800"
                        }`}
                      >
                        {user.tier.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-foreground">
                      {user.orders_count}
                    </td>
                    <td className="px-6 py-4">
                      {user.is_grandfathered && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-800 rounded">
                          Grandfathered
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-muted-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedUser(user)
                          setNewTier(user.tier)
                        }}
                        className="text-primary hover:text-blue-800 text-sm font-medium"
                      >
                        Change Tier
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            No users found matching your filters.
          </div>
        )}
      </div>

      {/* Change Tier Modal */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-card text-card-foreground rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4">Change User Tier</h3>

            <div className="mb-4">
              <p className="text-sm text-muted-foreground mb-2">
                <strong>User:</strong> {selectedUser.email}
              </p>
              <p className="text-sm text-muted-foreground mb-4">
                <strong>Current Tier:</strong>{" "}
                <span className="font-semibold uppercase">{selectedUser.tier}</span>
              </p>

              <label className="block text-sm font-medium text-foreground mb-2">
                New Tier
              </label>
              <select
                value={newTier}
                onChange={(e) => setNewTier(e.target.value)}
                className="w-full px-3 py-2 border border-input rounded-lg"
              >
                <option value="free">Free</option>
                <option value="basic">Basic</option>
                <option value="pro">Pro</option>
              </select>
            </div>

            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg mb-4">
              <p className="text-xs text-yellow-800">
                <strong>Note:</strong> This manually overrides the user's tier. It does not affect
                their Stripe subscription status.
              </p>
            </div>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setSelectedUser(null)
                  setNewTier("")
                }}
                className="px-4 py-2 border border-input rounded-lg hover:bg-muted/20"
              >
                Cancel
              </button>
              <button
                onClick={handleChangeTier}
                disabled={updateUserTier.isPending || newTier === selectedUser.tier}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {updateUserTier.isPending ? "Updating..." : "Update Tier"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
