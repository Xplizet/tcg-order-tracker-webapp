"""
User model - synced from Clerk via webhooks
"""
from sqlalchemy import Column, String, Boolean, DateTime, func
from app.database import Base


class User(Base):
    __tablename__ = "users"

    # Clerk user ID as primary key
    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, nullable=False, index=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)

    # Subscription tier
    tier = Column(String, default="free", nullable=False)  # free, basic, pro
    is_grandfathered = Column(Boolean, default=False, nullable=False)
    is_admin = Column(Boolean, default=False, nullable=False)

    # Stripe customer reference
    stripe_customer_id = Column(String, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    def __repr__(self):
        return f"<User {self.email} (tier: {self.tier})>"
