"""
Preorder CRUD API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import Optional
from app.database import get_db
from app.models import Preorder
from app.schemas import PreorderCreate, PreorderResponse, PreorderList
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
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    List preorders for the authenticated user with pagination and filtering
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

        # Get total count
        total = query.count()

        # Apply pagination
        offset = (page - 1) * page_size
        preorders = query.order_by(Preorder.created_at.desc()).offset(offset).limit(page_size).all()

        logger.info(f"Retrieved {len(preorders)} preorders for user {user_id}")

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
