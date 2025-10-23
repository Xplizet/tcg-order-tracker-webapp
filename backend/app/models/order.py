"""
Order model - core data model for TCG order tracking
"""
from sqlalchemy import Column, String, Integer, Numeric, DateTime, Date, ForeignKey, func, text, Computed
from sqlalchemy.orm import relationship
from app.database import Base
import uuid


class Order(Base):
    __tablename__ = "orders"

    # Primary key
    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()), index=True)

    # Foreign key to users
    user_id = Column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)

    # Product information
    product_name = Column(String, nullable=False)
    product_url = Column(String, nullable=True)
    quantity = Column(Integer, default=1, nullable=False)
    store_name = Column(String, nullable=False, index=True)

    # Financial fields
    cost_per_item = Column(Numeric(10, 2), nullable=False)
    amount_paid = Column(Numeric(10, 2), default=0, nullable=False)
    sold_price = Column(Numeric(10, 2), nullable=True)

    # Status
    status = Column(String, default="Pending", nullable=False, index=True)  # Pending, Delivered, Sold

    # Dates
    release_date = Column(Date, nullable=True)
    order_date = Column(Date, server_default=func.current_date(), nullable=False)

    # Notes
    notes = Column(String, nullable=True)

    # Computed columns (PostgreSQL GENERATED columns)
    # Using Computed() tells SQLAlchemy these are server-generated and shouldn't be in INSERT/UPDATE
    total_cost = Column(Numeric(10, 2), Computed("(cost_per_item * quantity)", persisted=True))
    amount_owing = Column(Numeric(10, 2), Computed("((cost_per_item * quantity) - amount_paid)", persisted=True))
    profit = Column(Numeric(10, 2), Computed("(sold_price - (cost_per_item * quantity))", persisted=True))
    profit_margin = Column(Numeric(5, 2), Computed("(CASE WHEN sold_price > 0 THEN ((sold_price - (cost_per_item * quantity)) / sold_price * 100) ELSE NULL END)", persisted=True))

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now(), nullable=False)
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now(), nullable=False)

    # Relationship to user
    # user = relationship("User", back_populates="orders")

    def __repr__(self):
        return f"<Order {self.product_name} - {self.store_name} ({self.status})>"
