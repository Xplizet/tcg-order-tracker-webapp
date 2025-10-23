"""
SystemSettings model for feature flags and global configuration
"""
from sqlalchemy import Column, String, Boolean, Integer, DateTime, Text
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.sql import func
from app.database import Base


class SystemSettings(Base):
    """
    System-wide settings and feature flags.
    Only one row should exist (id='global').
    """
    __tablename__ = "system_settings"

    id = Column(String, primary_key=True, default="global")

    # Subscription Feature Flags
    subscriptions_enabled = Column(Boolean, default=False, nullable=False)
    grandfather_date = Column(DateTime(timezone=True), nullable=True)  # Set when subscriptions enabled

    # Tier Limits (null = unlimited)
    free_tier_limit = Column(Integer, nullable=True)  # null means unlimited
    basic_tier_limit = Column(Integer, nullable=True)  # null means unlimited
    # Pro tier is always unlimited

    # Maintenance Mode
    maintenance_mode = Column(Boolean, default=False, nullable=False)
    maintenance_message = Column(Text, nullable=True)

    # Additional Settings (stored as JSON for flexibility)
    extra_settings = Column(JSONB, nullable=True, default={})

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<SystemSettings(subscriptions_enabled={self.subscriptions_enabled})>"
