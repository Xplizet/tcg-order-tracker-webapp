/**
 * API client types and utilities
 */

/**
 * Preorder API types
 */
export interface Preorder {
  id: string
  user_id: string
  product_name: string
  product_url?: string
  quantity: number
  store_name: string
  cost_per_item: number
  amount_paid: number
  sold_price?: number
  status: "Pending" | "Delivered" | "Sold"
  release_date?: string
  order_date: string
  notes?: string
  total_cost?: number
  amount_owing?: number
  profit?: number
  profit_margin?: number
  created_at: string
  updated_at: string
}

export interface PreorderCreate {
  product_name: string
  product_url?: string
  quantity: number
  store_name: string
  cost_per_item: number
  amount_paid?: number
  sold_price?: number
  status?: "Pending" | "Delivered" | "Sold"
  release_date?: string
  order_date?: string
  notes?: string
}

export interface PreorderUpdate {
  product_name?: string
  product_url?: string
  quantity?: number
  store_name?: string
  cost_per_item?: number
  amount_paid?: number
  sold_price?: number
  status?: "Pending" | "Delivered" | "Sold"
  release_date?: string
  order_date?: string
  notes?: string
}

export interface PreorderList {
  preorders: Preorder[]
  total: number
  page: number
  page_size: number
}

/**
 * API query parameters type
 */
export interface PreorderListParams {
  page?: number
  page_size?: number
  status?: string
  store?: string
  search?: string
}
