"""
Pydantic schemas for Order API requests/responses
"""
from pydantic import BaseModel, Field, field_validator, model_validator
from typing import Optional
from datetime import date, datetime
from decimal import Decimal


class OrderCreate(BaseModel):
    """Schema for creating a new order"""
    product_name: str = Field(..., min_length=1, max_length=500)
    product_url: Optional[str] = None
    quantity: int = Field(1, gt=0)
    store_name: str = Field(..., min_length=1, max_length=200)
    cost_per_item: Decimal = Field(..., gt=0, decimal_places=2)
    amount_paid: Decimal = Field(0, ge=0, decimal_places=2)
    sold_price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    status: str = Field("Pending", pattern="^(Pending|Delivered|Sold)$")
    release_date: Optional[date] = None
    order_date: Optional[date] = None
    notes: Optional[str] = None

    @model_validator(mode='after')
    def validate_amount_paid(self):
        """Validate that amount_paid does not exceed total_cost"""
        total_cost = self.cost_per_item * self.quantity
        if self.amount_paid > total_cost:
            raise ValueError(f"Amount paid (${self.amount_paid}) cannot exceed total cost (${total_cost})")
        return self


class OrderResponse(BaseModel):
    """Schema for order response"""
    id: str
    user_id: str
    product_name: str
    product_url: Optional[str]
    quantity: int
    store_name: str
    cost_per_item: Decimal
    amount_paid: Decimal
    sold_price: Optional[Decimal]
    status: str
    release_date: Optional[date]
    order_date: date
    notes: Optional[str]

    # Computed fields
    total_cost: Optional[Decimal]
    amount_owing: Optional[Decimal]
    profit: Optional[Decimal]
    profit_margin: Optional[Decimal]

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True  # Allows conversion from SQLAlchemy models


class OrderUpdate(BaseModel):
    """Schema for updating an order"""
    product_name: Optional[str] = Field(None, min_length=1, max_length=500)
    product_url: Optional[str] = None
    quantity: Optional[int] = Field(None, gt=0)
    store_name: Optional[str] = Field(None, min_length=1, max_length=200)
    cost_per_item: Optional[Decimal] = Field(None, gt=0, decimal_places=2)
    amount_paid: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    sold_price: Optional[Decimal] = Field(None, ge=0, decimal_places=2)
    status: Optional[str] = Field(None, pattern="^(Pending|Delivered|Sold)$")
    release_date: Optional[date] = None
    order_date: Optional[date] = None
    notes: Optional[str] = None


class OrderList(BaseModel):
    """Schema for list of orders with pagination"""
    orders: list[OrderResponse]
    total: int
    page: int
    page_size: int


class BulkUpdateRequest(BaseModel):
    """Schema for bulk update request"""
    order_ids: list[str] = Field(..., min_length=1)
    update_data: OrderUpdate


class BulkUpdateResponse(BaseModel):
    """Schema for bulk update response"""
    updated_count: int
    failed_ids: list[str] = []
    message: str


class BulkDeleteRequest(BaseModel):
    """Schema for bulk delete request"""
    order_ids: list[str] = Field(..., min_length=1)


class BulkDeleteResponse(BaseModel):
    """Schema for bulk delete response"""
    deleted_count: int
    failed_ids: list[str] = []
    message: str
