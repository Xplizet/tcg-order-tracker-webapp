/**
 * Application constants
 */

/**
 * Default Australian TCG stores
 * These are suggested to users when creating/editing orders
 */
export const DEFAULT_TCG_STORES = [
  // Major Chains
  "EB Games",
  "JB Hi-Fi",
  "Target Australia",
  "Big W",
  "Kmart Australia",

  // Specialist Retailers
  "Good Games",
  "Gameology",
  "Zing Pop Culture",
] as const

export type DefaultStore = typeof DEFAULT_TCG_STORES[number]
