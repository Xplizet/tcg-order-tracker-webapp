/**
 * API client types and utilities
 */

/**
 * Order API types
 */
export interface Order {
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

export interface OrderCreate {
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

export interface OrderUpdate {
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

export interface OrderList {
  orders: Order[]
  total: number
  page: number
  page_size: number
}

/**
 * API query parameters type
 */
export interface OrderListParams {
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
  total_orders: number
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
  order_count: number
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
  order_count: number
}

/**
 * Bulk Operations API types
 */
export interface BulkUpdateRequest {
  order_ids: string[]
  update_data: OrderUpdate
}

export interface BulkUpdateResponse {
  updated_count: number
  failed_ids: string[]
  message: string
}

export interface BulkDeleteRequest {
  order_ids: string[]
}

export interface BulkDeleteResponse {
  deleted_count: number
  failed_ids: string[]
  message: string
}

/**
 * Notification Preferences API types
 */
export interface NotificationPreferences {
  user_id: string
  release_reminders_enabled: boolean
  release_reminder_days: number
  payment_reminders_enabled: boolean
  payment_threshold: number
  weekly_digest_enabled: boolean
  monthly_digest_enabled: boolean
  created_at: string
  updated_at: string
}

export interface NotificationPreferencesUpdate {
  release_reminders_enabled?: boolean
  release_reminder_days?: number
  payment_reminders_enabled?: boolean
  payment_threshold?: number
  weekly_digest_enabled?: boolean
  monthly_digest_enabled?: boolean
}

/**
 * Admin API types
 */
export interface AdminStatistics {
  total_users: number
  active_users_7d: number
  active_users_30d: number
  new_users_this_week: number
  new_users_this_month: number
  total_orders: number
  avg_orders_per_user: number
  free_tier_users: number
  basic_tier_users: number
  pro_tier_users: number
  grandfathered_users: number
}

export interface SystemSettings {
  id: string
  subscriptions_enabled: boolean
  grandfather_date: string | null
  free_tier_limit: number | null
  basic_tier_limit: number | null
  maintenance_mode: boolean
  maintenance_message: string | null
  extra_settings: Record<string, any> | null
  created_at: string
  updated_at: string
}

export interface SystemSettingsUpdate {
  subscriptions_enabled?: boolean
  free_tier_limit?: number | null
  basic_tier_limit?: number | null
  maintenance_mode?: boolean
  maintenance_message?: string | null
}

export interface UserListItem {
  id: string
  email: string
  first_name: string | null
  last_name: string | null
  tier: string
  is_grandfathered: boolean
  is_admin: boolean
  created_at: string
  orders_count: number
}

export interface UserTierUpdate {
  tier: string
}
