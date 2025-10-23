"use client"

import { useState, useEffect } from "react"
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query"
import { useApi } from "@/lib/use-api"
import type { NotificationPreferences, NotificationPreferencesUpdate } from "@/lib/api"

export function NotificationSettings() {
  const { apiRequest } = useApi()
  const queryClient = useQueryClient()

  const { data: preferences, isLoading } = useQuery({
    queryKey: ["notification-preferences"],
    queryFn: () => apiRequest<NotificationPreferences>("/api/v1/notifications/preferences"),
  })

  const [formData, setFormData] = useState<NotificationPreferencesUpdate>({})

  useEffect(() => {
    if (preferences) {
      setFormData({
        release_reminders_enabled: preferences.release_reminders_enabled,
        release_reminder_days: preferences.release_reminder_days,
        payment_reminders_enabled: preferences.payment_reminders_enabled,
        payment_threshold: preferences.payment_threshold,
        weekly_digest_enabled: preferences.weekly_digest_enabled,
        monthly_digest_enabled: preferences.monthly_digest_enabled,
      })
    }
  }, [preferences])

  const updatePreferences = useMutation({
    mutationFn: (data: NotificationPreferencesUpdate) =>
      apiRequest<NotificationPreferences>("/api/v1/notifications/preferences", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] })
      alert("Notification preferences updated successfully!")
    },
    onError: (error: Error) => {
      alert("Failed to update preferences: " + error.message)
    },
  })

  const sendTestEmail = useMutation({
    mutationFn: () =>
      apiRequest("/api/v1/notifications/send-test", {
        method: "POST",
      }),
    onSuccess: (data: any) => {
      alert(`Test email sent successfully! Check your inbox.\n\nEmail ID: ${data.email_id}`)
    },
    onError: (error: Error) => {
      alert("Failed to send test email: " + error.message)
    },
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    updatePreferences.mutate(formData)
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Release Reminders</h2>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="release-reminders"
              checked={formData.release_reminders_enabled ?? false}
              onChange={(e) =>
                setFormData({ ...formData, release_reminders_enabled: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <label htmlFor="release-reminders" className="ml-2 block text-sm text-gray-900">
              Send me reminders about upcoming release dates
            </label>
          </div>

          {formData.release_reminders_enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Remind me this many days before release:
              </label>
              <select
                value={formData.release_reminder_days ?? 7}
                onChange={(e) =>
                  setFormData({ ...formData, release_reminder_days: Number(e.target.value) })
                }
                className="w-full max-w-xs px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value={1}>1 day</option>
                <option value={3}>3 days</option>
                <option value={7}>7 days</option>
                <option value={14}>14 days</option>
                <option value={30}>30 days</option>
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Reminders</h2>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="payment-reminders"
              checked={formData.payment_reminders_enabled ?? false}
              onChange={(e) =>
                setFormData({ ...formData, payment_reminders_enabled: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <label htmlFor="payment-reminders" className="ml-2 block text-sm text-gray-900">
              Send me reminders about outstanding payments
            </label>
          </div>

          {formData.payment_reminders_enabled && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Only remind me when amount owing is at least:
              </label>
              <div className="flex items-center max-w-xs">
                <span className="text-gray-500 mr-2">$</span>
                <input
                  type="number"
                  min="0"
                  step="10"
                  value={formData.payment_threshold ?? 100}
                  onChange={(e) =>
                    setFormData({ ...formData, payment_threshold: Number(e.target.value) })
                  }
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Digest Emails</h2>

        <div className="space-y-4">
          <div className="flex items-center">
            <input
              type="checkbox"
              id="weekly-digest"
              checked={formData.weekly_digest_enabled ?? false}
              onChange={(e) =>
                setFormData({ ...formData, weekly_digest_enabled: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <label htmlFor="weekly-digest" className="ml-2 block text-sm text-gray-900">
              Send me a weekly digest of my orders
            </label>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              id="monthly-digest"
              checked={formData.monthly_digest_enabled ?? false}
              onChange={(e) =>
                setFormData({ ...formData, monthly_digest_enabled: e.target.checked })
              }
              className="h-4 w-4 text-blue-600 rounded-border-gray-300"
            />
            <label htmlFor="monthly-digest" className="ml-2 block text-sm text-gray-900">
              Send me a monthly summary report
            </label>
          </div>
        </div>

      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Test Email Notifications</h2>

        <p className="text-sm text-gray-600 mb-4">
          Send a test email to verify that your email notifications are working correctly.
        </p>

        <button
          type="button"
          onClick={() => sendTestEmail.mutate()}
          disabled={sendTestEmail.isPending}
          className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
        >
          {sendTestEmail.isPending ? "Sending..." : "Send Test Email"}
        </button>
      </div>

      <div className="flex justify-end gap-3">
        <button
          type="button"
          onClick={() => sendTestEmail.mutate()}
          disabled={sendTestEmail.isPending}
          className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          {sendTestEmail.isPending ? "Sending..." : "Send Test Email"}
        </button>
        <button
          type="submit"
          disabled={updatePreferences.isPending}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
        >
          {updatePreferences.isPending ? "Saving..." : "Save Preferences"}
        </button>
      </div>
    </form>
  )
}
