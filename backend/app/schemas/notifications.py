"""
Pydantic schemas for Notification Preferences
"""
from pydantic import BaseModel, Field
from datetime import datetime


class NotificationPreferencesUpdate(BaseModel):
    """Schema for updating notification preferences"""
    release_reminders_enabled: bool | None = None
    release_reminder_days: int | None = Field(None, ge=1, le=30)
    payment_reminders_enabled: bool | None = None
    payment_threshold: int | None = Field(None, ge=0)
    weekly_digest_enabled: bool | None = None
    monthly_digest_enabled: bool | None = None


class NotificationPreferencesResponse(BaseModel):
    """Schema for notification preferences response"""
    user_id: str
    release_reminders_enabled: bool
    release_reminder_days: int
    payment_reminders_enabled: bool
    payment_threshold: int
    weekly_digest_enabled: bool
    monthly_digest_enabled: bool
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
