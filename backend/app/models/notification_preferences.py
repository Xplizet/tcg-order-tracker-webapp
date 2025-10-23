"""
Notification Preferences Model
"""
from sqlalchemy import Column, String, Boolean, Integer, DateTime, func
from app.database import Base


class NotificationPreferences(Base):
    """Notification preferences for users"""
    __tablename__ = "notification_preferences"

    user_id = Column(String, primary_key=True, index=True)

    # Release reminders
    release_reminders_enabled = Column(Boolean, default=True)
    release_reminder_days = Column(Integer, default=7)  # Days before release

    # Payment reminders
    payment_reminders_enabled = Column(Boolean, default=True)
    payment_threshold = Column(Integer, default=100)  # Minimum amount owing

    # Digest emails
    weekly_digest_enabled = Column(Boolean, default=False)
    monthly_digest_enabled = Column(Boolean, default=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
