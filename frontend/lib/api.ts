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
  order_date_from?: string
  order_date_to?: string
  release_date_from?: string
  release_date_to?: string
  amount_owing_only?: boolean
  sort_by?: string
  sort_order?: "asc" | "desc"
}

/**
 * Analytics API types
 */
export interface Statistics {
  total_preorders: number
  pending_count: number
  delivered_count: number
  sold_count: number
  total_cost: number
  amount_owing: number
  total_profit: number
  average_profit_margin: number | null
}

export interface SpendingByStore {
  store_name: string
  total_spent: number
  preorder_count: number
}

export interface StatusOverview {
  status: string
  count: number
  total_value: number
}

export interface ProfitByStore {
  store_name: string
  total_profit: number
  sold_count: number
  average_profit_margin: number | null
}

export interface MonthlySpending {
  month: string
  total_spent: number
  preorder_count: number
}

/**
 * Bulk Operations API types
 */
export interface BulkUpdateRequest {
  preorder_ids: string[]
  update_data: PreorderUpdate
}

export interface BulkUpdateResponse {
  updated_count: number
  failed_ids: string[]
  message: string
}

export interface BulkDeleteRequest {
  preorder_ids: string[]
}

export interface BulkDeleteResponse {
  deleted_count: number
  failed_ids: string[]
  message: string
}
