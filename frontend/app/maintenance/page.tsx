"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function MaintenancePage() {
  const router = useRouter()
  const [maintenanceMessage, setMaintenanceMessage] = useState<string | null>(null)
  const [isCheckingStatus, setIsCheckingStatus] = useState(true)

  useEffect(() => {
    // Check maintenance status periodically
    const checkMaintenance = async () => {
      try {
        // Try to fetch admin settings (allowed during maintenance)
        const response = await fetch("http://localhost:8000/api/v1/admin/settings", {
          credentials: "include",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("clerk-token")}`,
          },
        })

        if (response.ok) {
          const data = await response.json()
          if (!data.maintenance_mode) {
            // Maintenance is off, redirect to dashboard
            router.push("/dashboard")
            return
          }
          setMaintenanceMessage(data.maintenance_message)
        }
      } catch (error) {
        console.error("Error checking maintenance status:", error)
      } finally {
        setIsCheckingStatus(false)
      }
    }

    // Initial check
    checkMaintenance()

    // Check every 30 seconds
    const interval = setInterval(checkMaintenance, 30000)

    return () => clearInterval(interval)
  }, [router])

  if (isCheckingStatus) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Checking server status...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <div className="max-w-2xl w-full">
        <div className="bg-card border border-border rounded-lg shadow-lg p-8 text-center">
          {/* Maintenance Icon */}
          <div className="mb-6">
            <svg
              className="w-24 h-24 mx-auto text-yellow-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-foreground mb-4">
            Under Maintenance
          </h1>

          {/* Message */}
          <p className="text-lg text-muted-foreground mb-6">
            {maintenanceMessage ||
              "We're currently performing scheduled maintenance. We'll be back online soon!"}
          </p>

          {/* Additional Info */}
          <div className="bg-muted/30 border border-border rounded-lg p-4 mb-6">
            <p className="text-sm text-muted-foreground">
              The page will automatically refresh when the application is back online.
            </p>
          </div>

          {/* Refresh Button */}
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
          >
            Refresh Now
          </button>

          {/* Contact Info (optional) */}
          <p className="text-sm text-muted-foreground mt-6">
            If you have any questions, please contact support.
          </p>
        </div>
      </div>
    </div>
  )
}
