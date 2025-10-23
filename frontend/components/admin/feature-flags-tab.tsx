"use client"

import { useState } from "react"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useApi } from "@/lib/use-api"
import type { SystemSettings, SystemSettingsUpdate } from "@/lib/api"

interface FeatureFlagsTabProps {
  settings: SystemSettings
}

export function FeatureFlagsTab({ settings }: FeatureFlagsTabProps) {
  const { apiRequest } = useApi()
  const queryClient = useQueryClient()

  const [formData, setFormData] = useState<SystemSettingsUpdate>({
    subscriptions_enabled: settings.subscriptions_enabled,
    free_tier_limit: settings.free_tier_limit,
    basic_tier_limit: settings.basic_tier_limit,
    maintenance_mode: settings.maintenance_mode,
    maintenance_message: settings.maintenance_message || "",
  })

  const [showSubscriptionWarning, setShowSubscriptionWarning] = useState(false)
  const [showMaintenanceConfirm, setShowMaintenanceConfirm] = useState(false)

  const updateSettings = useMutation({
    mutationFn: (data: SystemSettingsUpdate) =>
      apiRequest<SystemSettings>("/api/v1/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-settings"] })
      queryClient.invalidateQueries({ queryKey: ["admin-statistics"] })
      alert("Settings updated successfully!")
    },
    onError: (error: Error) => {
      alert("Failed to update settings: " + error.message)
    },
  })

  const handleEnableSubscriptions = () => {
    if (!settings.subscriptions_enabled && formData.subscriptions_enabled) {
      setShowSubscriptionWarning(true)
    } else {
      updateSettings.mutate({ subscriptions_enabled: formData.subscriptions_enabled })
    }
  }

  const confirmEnableSubscriptions = () => {
    updateSettings.mutate({ subscriptions_enabled: true })
    setShowSubscriptionWarning(false)
  }

  const handleSaveTierLimits = () => {
    updateSettings.mutate({
      free_tier_limit: formData.free_tier_limit,
      basic_tier_limit: formData.basic_tier_limit,
    })
  }

  const handleToggleMaintenance = () => {
    if (!settings.maintenance_mode && formData.maintenance_mode) {
      setShowMaintenanceConfirm(true)
    } else {
      updateSettings.mutate({
        maintenance_mode: formData.maintenance_mode,
        maintenance_message: formData.maintenance_message,
      })
    }
  }

  const confirmEnableMaintenance = () => {
    updateSettings.mutate({
      maintenance_mode: true,
      maintenance_message: formData.maintenance_message,
    })
    setShowMaintenanceConfirm(false)
  }

  return (
    <div className="space-y-6">
      {/* Subscriptions Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Subscription System</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <div className="font-medium">Enable Subscriptions</div>
              <div className="text-sm text-gray-500">
                Activates paid tiers and enforces tier limits
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.subscriptions_enabled ?? false}
                onChange={(e) =>
                  setFormData({ ...formData, subscriptions_enabled: e.target.checked })
                }
                className="sr-only peer"
                disabled={settings.subscriptions_enabled}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>

          {settings.subscriptions_enabled && (
            <div className="p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-green-800">
                ✓ Subscriptions are enabled
                {settings.grandfather_date && (
                  <span className="ml-2">
                    (Grandfather date: {new Date(settings.grandfather_date).toLocaleDateString()})
                  </span>
                )}
              </p>
            </div>
          )}

          {!settings.subscriptions_enabled && formData.subscriptions_enabled !== settings.subscriptions_enabled && (
            <button
              onClick={handleEnableSubscriptions}
              disabled={updateSettings.isPending}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {updateSettings.isPending ? "Enabling..." : "Enable Subscriptions"}
            </button>
          )}
        </div>
      </div>

      {/* Tier Limits Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Tier Limits</h3>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Free Tier Max Preorders
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={formData.free_tier_limit ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    free_tier_limit: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="Unlimited"
                className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg"
              />
              <span className="text-sm text-gray-500">
                (leave empty for unlimited)
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Current: {settings.free_tier_limit ?? "Unlimited"}
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Basic Tier Max Preorders
            </label>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min="0"
                value={formData.basic_tier_limit ?? ""}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    basic_tier_limit: e.target.value ? Number(e.target.value) : null,
                  })
                }
                placeholder="Unlimited"
                className="flex-1 max-w-xs px-3 py-2 border border-gray-300 rounded-lg"
              />
              <span className="text-sm text-gray-500">
                (leave empty for unlimited)
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Current: {settings.basic_tier_limit ?? "Unlimited"}
            </p>
          </div>

          <div className="p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600">
              <strong>Pro Tier:</strong> Always unlimited
            </p>
          </div>

          <button
            onClick={handleSaveTierLimits}
            disabled={updateSettings.isPending}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {updateSettings.isPending ? "Saving..." : "Save Tier Limits"}
          </button>
        </div>
      </div>

      {/* Maintenance Mode Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold mb-4">Maintenance Mode</h3>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <div className="font-medium">Maintenance Mode</div>
              <div className="text-sm text-gray-500">
                Shows maintenance page to all non-admin users
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={formData.maintenance_mode ?? false}
                onChange={(e) =>
                  setFormData({ ...formData, maintenance_mode: e.target.checked })
                }
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {formData.maintenance_mode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Maintenance Message
              </label>
              <textarea
                value={formData.maintenance_message || ""}
                onChange={(e) =>
                  setFormData({ ...formData, maintenance_message: e.target.value })
                }
                placeholder="We're performing scheduled maintenance. We'll be back soon!"
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          )}

          {formData.maintenance_mode !== settings.maintenance_mode && (
            <button
              onClick={handleToggleMaintenance}
              disabled={updateSettings.isPending}
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {updateSettings.isPending
                ? "Updating..."
                : formData.maintenance_mode
                ? "Enable Maintenance Mode"
                : "Disable Maintenance Mode"}
            </button>
          )}
        </div>
      </div>

      {/* Subscription Warning Modal */}
      {showSubscriptionWarning && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-orange-600">
              Warning: Enable Subscriptions?
            </h3>

            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
              <p className="text-sm text-orange-800 font-semibold">This action cannot be undone!</p>
              <p className="text-sm text-orange-700 mt-2">
                Enabling subscriptions will:
              </p>
              <ul className="list-disc list-inside text-sm text-orange-700 mt-2 space-y-1">
                <li>Set the grandfather date to now</li>
                <li>Mark all existing users as "grandfathered" (unlimited free access forever)</li>
                <li>Activate tier-based limitations for new users</li>
              </ul>
            </div>

            <p className="text-sm text-gray-600 mb-6">
              Are you sure you want to enable subscriptions?
            </p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowSubscriptionWarning(false)
                  setFormData({ ...formData, subscriptions_enabled: false })
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmEnableSubscriptions}
                disabled={updateSettings.isPending}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                {updateSettings.isPending ? "Enabling..." : "Yes, Enable Subscriptions"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Maintenance Confirmation Modal */}
      {showMaintenanceConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-lg font-semibold mb-4 text-red-600">
              Enable Maintenance Mode?
            </h3>

            <p className="text-sm text-gray-600 mb-4">
              This will show a maintenance page to all non-admin users. They won't be able to access the application until you disable maintenance mode.
            </p>

            <div className="flex gap-2 justify-end">
              <button
                onClick={() => {
                  setShowMaintenanceConfirm(false)
                  setFormData({ ...formData, maintenance_mode: false })
                }}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmEnableMaintenance}
                disabled={updateSettings.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
              >
                {updateSettings.isPending ? "Enabling..." : "Enable Maintenance Mode"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
