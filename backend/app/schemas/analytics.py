"""
Pydantic schemas for Analytics API responses
"""
from pydantic import BaseModel
from decimal import Decimal
from typing import Optional


class Statistics(BaseModel):
    """Overall statistics summary"""
    total_orders: int
    pending_count: int
    delivered_count: int
    sold_count: int
    total_cost: Decimal
    amount_owing: Decimal
    total_profit: Decimal
    average_profit_margin: Optional[Decimal]


class SpendingByStore(BaseModel):
    """Spending grouped by store"""
    store_name: str
    total_spent: Decimal
    order_count: int


class StatusOverview(BaseModel):
    """Order count by status"""
    status: str
    count: int
    total_value: Decimal


class ProfitByStore(BaseModel):
    """Profit grouped by store"""
    store_name: str
    total_profit: Decimal
    sold_count: int
    average_profit_margin: Optional[Decimal]


class MonthlySpending(BaseModel):
    """Spending grouped by month"""
    month: str  # Format: "2025-01"
    total_spent: Decimal
    order_count: int
