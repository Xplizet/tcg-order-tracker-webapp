"""
Preorder CRUD API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import Preorder
from app.schemas import PreorderCreate, PreorderResponse, PreorderList, PreorderUpdate
from app.utils.auth import get_current_user_id
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("", response_model=PreorderResponse, status_code=201)
def create_preorder(
    preorder: PreorderCreate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Create a new preorder for the authenticated user
    """
    try:
        # Create new preorder
        db_preorder = Preorder(
            user_id=user_id,
            **preorder.model_dump()
        )

        db.add(db_preorder)
        db.commit()
        db.refresh(db_preorder)

        logger.info(f"Created preorder {db_preorder.id} for user {user_id}")
        return db_preorder

    except Exception as e:
        db.rollback()
        logger.error(f"Error creating preorder: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create preorder: {str(e)}")


@router.get("", response_model=PreorderList)
def list_preorders(
    page: int = 1,
    page_size: int = 50,
    status: Optional[str] = None,
    store: Optional[str] = None,
    search: Optional[str] = None,
    order_date_from: Optional[str] = None,
    order_date_to: Optional[str] = None,
    release_date_from: Optional[str] = None,
    release_date_to: Optional[str] = None,
    amount_owing_only: Optional[bool] = None,
    sort_by: Optional[str] = "created_at",
    sort_order: Optional[str] = "desc",
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    List preorders for the authenticated user with pagination, filtering, and sorting

    Query Parameters:
    - status: Filter by status (Pending, Delivered, Sold)
    - store: Filter by store name
    - search: Search in product_name, store_name, notes
    - order_date_from/to: Filter by order date range
    - release_date_from/to: Filter by release date range
    - amount_owing_only: Show only preorders with amount owing > 0
    - sort_by: Field to sort by (created_at, order_date, product_name, total_cost, etc.)
    - sort_order: Sort order (asc, desc)
    """
    try:
        # Base query - CRITICAL: Filter by user_id for row-level security
        query = db.query(Preorder).filter(Preorder.user_id == user_id)

        # Apply filters
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

        # Date range filters
        if order_date_from:
            query = query.filter(Preorder.order_date >= order_date_from)
        if order_date_to:
            query = query.filter(Preorder.order_date <= order_date_to)
        if release_date_from:
            query = query.filter(Preorder.release_date >= release_date_from)
        if release_date_to:
            query = query.filter(Preorder.release_date <= release_date_to)

        # Amount owing filter (using computed column)
        if amount_owing_only:
            query = query.filter(Preorder.amount_owing > 0)

        # Get total count before sorting
        total = query.count()

        # Apply sorting
        valid_sort_fields = {
            "created_at": Preorder.created_at,
            "order_date": Preorder.order_date,
            "release_date": Preorder.release_date,
            "product_name": Preorder.product_name,
            "store_name": Preorder.store_name,
            "quantity": Preorder.quantity,
            "cost_per_item": Preorder.cost_per_item,
            "total_cost": Preorder.total_cost,
            "amount_paid": Preorder.amount_paid,
            "amount_owing": Preorder.amount_owing,
            "status": Preorder.status,
        }

        sort_field = valid_sort_fields.get(sort_by, Preorder.created_at)
        if sort_order == "asc":
            query = query.order_by(sort_field.asc())
        else:
            query = query.order_by(sort_field.desc())

        # Apply pagination
        offset = (page - 1) * page_size
        preorders = query.offset(offset).limit(page_size).all()

        logger.info(f"Retrieved {len(preorders)} preorders for user {user_id} (total: {total})")

        return PreorderList(
            preorders=preorders,
            total=total,
            page=page,
            page_size=page_size
        )

    except Exception as e:
        logger.error(f"Error listing preorders: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list preorders: {str(e)}")


@router.get("/{preorder_id}", response_model=PreorderResponse)
def get_preorder(
    preorder_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get a single preorder by ID
    """
    preorder = db.query(Preorder).filter(
        Preorder.id == preorder_id,
        Preorder.user_id == user_id  # Row-level security
    ).first()

    if not preorder:
        raise HTTPException(status_code=404, detail="Preorder not found")

    return preorder


@router.put("/{preorder_id}", response_model=PreorderResponse)
def update_preorder(
    preorder_id: str,
    preorder_update: PreorderUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Update a preorder by ID
    """
    try:
        # Find preorder with row-level security check
        preorder = db.query(Preorder).filter(
            Preorder.id == preorder_id,
            Preorder.user_id == user_id
        ).first()

        if not preorder:
            raise HTTPException(status_code=404, detail="Preorder not found")

        # Update only provided fields
        update_data = preorder_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(preorder, field, value)

        db.commit()
        db.refresh(preorder)

        logger.info(f"Updated preorder {preorder_id} for user {user_id}")
        return preorder

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating preorder: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update preorder: {str(e)}")


@router.delete("/{preorder_id}", status_code=204)
def delete_preorder(
    preorder_id: str,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Delete a preorder by ID
    """
    try:
        # Find preorder with row-level security check
        preorder = db.query(Preorder).filter(
            Preorder.id == preorder_id,
            Preorder.user_id == user_id
        ).first()

        if not preorder:
            raise HTTPException(status_code=404, detail="Preorder not found")

        db.delete(preorder)
        db.commit()

        logger.info(f"Deleted preorder {preorder_id} for user {user_id}")
        return None

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error deleting preorder: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete preorder: {str(e)}")
