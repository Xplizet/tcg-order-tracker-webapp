"use client"

import { useAuth } from "@clerk/nextjs"

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"

/**
 * Hook to make authenticated API requests with Clerk token
 */
export function useApi() {
  const { getToken } = useAuth()

  const apiRequest = async <T,>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> => {
    // Get the session token from Clerk
    const token = await getToken()

    if (!token) {
      throw new Error("No authentication token available")
    }

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
        ...options?.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ detail: "Request failed" }))

      // Handle maintenance mode (503)
      if (response.status === 503 && error.maintenance_mode) {
        // Redirect to maintenance page
        if (typeof window !== "undefined") {
          window.location.href = "/maintenance"
        }
        throw new Error(error.message || "Application is under maintenance")
      }

      throw new Error(error.detail || `HTTP ${response.status}: ${response.statusText}`)
    }

    // Handle 204 No Content (e.g., DELETE requests)
    if (response.status === 204) {
      return null as T
    }

    return response.json()
  }

  return { apiRequest }
}
