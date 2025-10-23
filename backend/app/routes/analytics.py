"""
Analytics API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from typing import Optional, List
from decimal import Decimal
from app.database import get_db
from app.models import Preorder
from app.schemas.analytics import (
    Statistics,
    SpendingByStore,
    StatusOverview,
    ProfitByStore,
    MonthlySpending
)
from app.utils.auth import get_current_user_id
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/statistics", response_model=Statistics)
def get_statistics(
    status: Optional[str] = None,
    store: Optional[str] = None,
    search: Optional[str] = None,
    order_date_from: Optional[str] = None,
    order_date_to: Optional[str] = None,
    release_date_from: Optional[str] = None,
    release_date_to: Optional[str] = None,
    amount_owing_only: Optional[bool] = None,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get overall statistics with optional filters
    """
    try:
        # Base query with filters (same as list endpoint)
        query = db.query(Preorder).filter(Preorder.user_id == user_id)

        # Apply same filters as list endpoint
        if status:
            query = query.filter(Preorder.status == status)
        if store:
            query = query.filter(Preorder.store_name == store)
        if search:
            search_pattern = f"%{search}%"
            query = query.filter(
                (Preorder.product_name.ilike(search_pattern)) |
                (Preorder.store_name.ilike(search_pattern)) |
                (Preorder.notes.ilike(search_pattern))
            )
        if order_date_from:
            query = query.filter(Preorder.order_date >= order_date_from)
        if order_date_to:
            query = query.filter(Preorder.order_date <= order_date_to)
        if release_date_from:
            query = query.filter(Preorder.release_date >= release_date_from)
        if release_date_to:
            query = query.filter(Preorder.release_date <= release_date_to)
        if amount_owing_only:
            query = query.filter(Preorder.amount_owing > 0)

        # Calculate statistics
        all_preorders = query.all()

        total_preorders = len(all_preorders)
        pending_count = sum(1 for p in all_preorders if p.status == "Pending")
        delivered_count = sum(1 for p in all_preorders if p.status == "Delivered")
        sold_count = sum(1 for p in all_preorders if p.status == "Sold")

        total_cost = sum(p.total_cost or Decimal(0) for p in all_preorders)
        amount_owing = sum(p.amount_owing or Decimal(0) for p in all_preorders)

        # Only calculate profit for sold items
        sold_preorders = [p for p in all_preorders if p.status == "Sold" and p.profit is not None]
        total_profit = sum(p.profit for p in sold_preorders)

        # Calculate average profit margin for sold items
        profit_margins = [p.profit_margin for p in sold_preorders if p.profit_margin is not None]
        average_profit_margin = sum(profit_margins) / len(profit_margins) if profit_margins else None

        return Statistics(
            total_preorders=total_preorders,
            pending_count=pending_count,
            delivered_count=delivered_count,
            sold_count=sold_count,
            total_cost=total_cost,
            amount_owing=amount_owing,
            total_profit=total_profit,
            average_profit_margin=average_profit_margin
        )

    except Exception as e:
        logger.error(f"Error getting statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get statistics: {str(e)}")


@router.get("/spending-by-store", response_model=List[SpendingByStore])
def get_spending_by_store(
    status: Optional[str] = None,
    order_date_from: Optional[str] = None,
    order_date_to: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get spending grouped by store
    """
    try:
        query = db.query(
            Preorder.store_name,
            func.sum(Preorder.total_cost).label('total_spent'),
            func.count(Preorder.id).label('preorder_count')
        ).filter(Preorder.user_id == user_id)

        # Apply filters
        if status:
            query = query.filter(Preorder.status == status)
        if order_date_from:
            query = query.filter(Preorder.order_date >= order_date_from)
        if order_date_to:
            query = query.filter(Preorder.order_date <= order_date_to)

        results = query.group_by(Preorder.store_name).order_by(func.sum(Preorder.total_cost).desc()).all()

        return [
            SpendingByStore(
                store_name=row.store_name,
                total_spent=row.total_spent or Decimal(0),
                preorder_count=row.preorder_count
            )
            for row in results
        ]

    except Exception as e:
        logger.error(f"Error getting spending by store: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get spending by store: {str(e)}")


@router.get("/status-overview", response_model=List[StatusOverview])
def get_status_overview(
    store: Optional[str] = None,
    order_date_from: Optional[str] = None,
    order_date_to: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get preorder count and value by status
    """
    try:
        query = db.query(
            Preorder.status,
            func.count(Preorder.id).label('count'),
            func.sum(Preorder.total_cost).label('total_value')
        ).filter(Preorder.user_id == user_id)

        # Apply filters
        if store:
            query = query.filter(Preorder.store_name == store)
        if order_date_from:
            query = query.filter(Preorder.order_date >= order_date_from)
        if order_date_to:
            query = query.filter(Preorder.order_date <= order_date_to)

        results = query.group_by(Preorder.status).all()

        return [
            StatusOverview(
                status=row.status,
                count=row.count,
                total_value=row.total_value or Decimal(0)
            )
            for row in results
        ]

    except Exception as e:
        logger.error(f"Error getting status overview: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get status overview: {str(e)}")


@router.get("/profit-by-store", response_model=List[ProfitByStore])
def get_profit_by_store(
    order_date_from: Optional[str] = None,
    order_date_to: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get profit grouped by store (only for sold items)
    """
    try:
        query = db.query(
            Preorder.store_name,
            func.sum(Preorder.profit).label('total_profit'),
            func.count(Preorder.id).label('sold_count'),
            func.avg(Preorder.profit_margin).label('avg_profit_margin')
        ).filter(
            Preorder.user_id == user_id,
            Preorder.status == "Sold"
        )

        # Apply filters
        if order_date_from:
            query = query.filter(Preorder.order_date >= order_date_from)
        if order_date_to:
            query = query.filter(Preorder.order_date <= order_date_to)

        results = query.group_by(Preorder.store_name).order_by(func.sum(Preorder.profit).desc()).all()

        return [
            ProfitByStore(
                store_name=row.store_name,
                total_profit=row.total_profit or Decimal(0),
                sold_count=row.sold_count,
                average_profit_margin=row.avg_profit_margin
            )
            for row in results
        ]

    except Exception as e:
        logger.error(f"Error getting profit by store: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get profit by store: {str(e)}")


@router.get("/monthly-spending", response_model=List[MonthlySpending])
def get_monthly_spending(
    status: Optional[str] = None,
    store: Optional[str] = None,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get spending grouped by month
    """
    try:
        query = db.query(
            func.to_char(Preorder.order_date, 'YYYY-MM').label('month'),
            func.sum(Preorder.total_cost).label('total_spent'),
            func.count(Preorder.id).label('preorder_count')
        ).filter(Preorder.user_id == user_id)

        # Apply filters
        if status:
            query = query.filter(Preorder.status == status)
        if store:
            query = query.filter(Preorder.store_name == store)

        results = query.group_by('month').order_by('month').all()

        return [
            MonthlySpending(
                month=row.month,
                total_spent=row.total_spent or Decimal(0),
                preorder_count=row.preorder_count
            )
            for row in results
        ]

    except Exception as e:
        logger.error(f"Error getting monthly spending: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get monthly spending: {str(e)}")
