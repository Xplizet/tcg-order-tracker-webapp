"""
Pydantic schemas for admin API endpoints
"""
from pydantic import BaseModel
from typing import Optional
from datetime import datetime


# System Settings Schemas
class SystemSettingsResponse(BaseModel):
    id: str
    subscriptions_enabled: bool
    grandfather_date: Optional[datetime]
    free_tier_limit: Optional[int]
    basic_tier_limit: Optional[int]
    maintenance_mode: bool
    maintenance_message: Optional[str]
    extra_settings: Optional[dict]
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class SystemSettingsUpdate(BaseModel):
    subscriptions_enabled: Optional[bool] = None
    free_tier_limit: Optional[int] = None
    basic_tier_limit: Optional[int] = None
    maintenance_mode: Optional[bool] = None
    maintenance_message: Optional[str] = None


# Admin Statistics Schemas
class AdminStatistics(BaseModel):
    total_users: int
    active_users_7d: int
    active_users_30d: int
    new_users_this_week: int
    new_users_this_month: int
    total_preorders: int
    avg_preorders_per_user: float
    free_tier_users: int
    basic_tier_users: int
    pro_tier_users: int
    grandfathered_users: int


# User Management Schemas
class UserListItem(BaseModel):
    id: str
    email: str
    first_name: Optional[str]
    last_name: Optional[str]
    tier: str
    is_grandfathered: bool
    is_admin: bool
    created_at: datetime
    preorders_count: int

    class Config:
        from_attributes = True


class UserTierUpdate(BaseModel):
    tier: str  # "free", "basic", or "pro"
