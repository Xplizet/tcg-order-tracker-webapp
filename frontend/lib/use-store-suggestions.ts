import { useQuery } from "@tanstack/react-query"
import { useApi } from "@/lib/use-api"
import { DEFAULT_TCG_STORES } from "@/lib/constants"

/**
 * Hook to get store name suggestions
 * Combines default Australian TCG stores with user's previously used stores
 */
export function useStoreSuggestions() {
  const { apiRequest } = useApi()

  const { data: userStores = [], isLoading } = useQuery({
    queryKey: ["stores"],
    queryFn: () => apiRequest<string[]>("/api/v1/orders/stores"),
    staleTime: 5 * 60 * 1000, // Cache for 5 minutes
  })

  // Combine default stores with user stores, remove duplicates, and sort
  const allStores = [...new Set([...DEFAULT_TCG_STORES, ...userStores])].sort()

  return {
    suggestions: allStores,
    isLoading,
  }
}
