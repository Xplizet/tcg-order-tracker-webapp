"""
Admin Panel API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func, extract
from datetime import datetime, timedelta
from app.database import get_db
from app.models import User, Preorder, SystemSettings
from app.schemas.admin import (
    AdminStatistics,
    SystemSettingsResponse,
    SystemSettingsUpdate,
    UserListItem,
    UserTierUpdate
)
from app.utils.admin import get_admin_user
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/statistics", response_model=AdminStatistics)
def get_admin_statistics(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get system-wide statistics for admin dashboard
    """
    try:
        # Calculate date ranges
        now = datetime.utcnow()
        week_ago = now - timedelta(days=7)
        month_ago = now - timedelta(days=30)

        # Get week/month start dates
        week_start = now - timedelta(days=now.weekday())
        month_start = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)

        # Total users
        total_users = db.query(func.count(User.id)).scalar() or 0

        # Active users (users with activity in last X days)
        # For now, we'll count users who created preorders recently
        active_7d = db.query(func.count(func.distinct(Preorder.user_id))).filter(
            Preorder.created_at >= week_ago
        ).scalar() or 0

        active_30d = db.query(func.count(func.distinct(Preorder.user_id))).filter(
            Preorder.created_at >= month_ago
        ).scalar() or 0

        # New users
        new_users_week = db.query(func.count(User.id)).filter(
            User.created_at >= week_start
        ).scalar() or 0

        new_users_month = db.query(func.count(User.id)).filter(
            User.created_at >= month_start
        ).scalar() or 0

        # Total preorders
        total_preorders = db.query(func.count(Preorder.id)).scalar() or 0

        # Average preorders per user (calculate manually)
        if total_users > 0:
            avg_preorders_per_user = total_preorders / total_users
        else:
            avg_preorders_per_user = 0.0

        # User tier distribution
        free_tier = db.query(func.count(User.id)).filter(User.tier == "free").scalar() or 0
        basic_tier = db.query(func.count(User.id)).filter(User.tier == "basic").scalar() or 0
        pro_tier = db.query(func.count(User.id)).filter(User.tier == "pro").scalar() or 0

        # Grandfathered users
        grandfathered = db.query(func.count(User.id)).filter(User.is_grandfathered == True).scalar() or 0

        return AdminStatistics(
            total_users=total_users,
            active_users_7d=active_7d,
            active_users_30d=active_30d,
            new_users_this_week=new_users_week,
            new_users_this_month=new_users_month,
            total_preorders=total_preorders,
            avg_preorders_per_user=avg_preorders_per_user,
            free_tier_users=free_tier,
            basic_tier_users=basic_tier,
            pro_tier_users=pro_tier,
            grandfathered_users=grandfathered
        )

    except Exception as e:
        logger.error(f"Error getting admin statistics: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/settings", response_model=SystemSettingsResponse)
def get_system_settings(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Get current system settings
    """
    try:
        settings = db.query(SystemSettings).filter(SystemSettings.id == "global").first()

        if not settings:
            raise HTTPException(status_code=404, detail="System settings not found")

        return settings

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting system settings: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.put("/settings", response_model=SystemSettingsResponse)
def update_system_settings(
    settings_update: SystemSettingsUpdate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Update system settings

    Special handling:
    - When subscriptions_enabled is set to True for the first time,
      sets grandfather_date to now() and marks all existing users as grandfathered
    """
    try:
        settings = db.query(SystemSettings).filter(SystemSettings.id == "global").first()

        if not settings:
            raise HTTPException(status_code=404, detail="System settings not found")

        # Check if we're enabling subscriptions for the first time
        enabling_subscriptions = (
            settings_update.subscriptions_enabled == True
            and settings.subscriptions_enabled == False
        )

        # Update settings
        update_data = settings_update.model_dump(exclude_unset=True)
        for field, value in update_data.items():
            setattr(settings, field, value)

        # Handle subscription enablement
        if enabling_subscriptions:
            settings.grandfather_date = datetime.utcnow()

            # Mark all existing users as grandfathered
            db.query(User).update({"is_grandfathered": True})

            logger.info(f"Subscriptions enabled by admin {admin_user.email}. Grandfather date set, {db.query(func.count(User.id)).scalar()} users grandfathered.")

        db.commit()
        db.refresh(settings)

        logger.info(f"System settings updated by admin {admin_user.email}")
        return settings

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating system settings: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/users", response_model=list[UserListItem])
def list_users(
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db),
    search: str = "",
    tier: str = None,
    grandfathered: bool = None,
    limit: int = 100,
    offset: int = 0
):
    """
    List all users with filtering and pagination
    """
    try:
        query = db.query(
            User,
            func.count(Preorder.id).label("preorders_count")
        ).outerjoin(Preorder, User.id == Preorder.user_id).group_by(User.id)

        # Apply filters
        if search:
            query = query.filter(User.email.ilike(f"%{search}%"))

        if tier:
            query = query.filter(User.tier == tier)

        if grandfathered is not None:
            query = query.filter(User.is_grandfathered == grandfathered)

        # Apply pagination
        query = query.limit(limit).offset(offset)

        results = query.all()

        # Transform results
        user_list = []
        for user, preorders_count in results:
            user_list.append(UserListItem(
                id=user.id,
                email=user.email,
                first_name=user.first_name,
                last_name=user.last_name,
                tier=user.tier,
                is_grandfathered=user.is_grandfathered,
                is_admin=user.is_admin,
                created_at=user.created_at,
                preorders_count=preorders_count or 0
            ))

        return user_list

    except Exception as e:
        logger.error(f"Error listing users: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))


@router.patch("/users/{user_id}/tier", response_model=UserListItem)
def update_user_tier(
    user_id: str,
    tier_update: UserTierUpdate,
    admin_user: User = Depends(get_admin_user),
    db: Session = Depends(get_db)
):
    """
    Manually update a user's tier
    """
    try:
        user = db.query(User).filter(User.id == user_id).first()

        if not user:
            raise HTTPException(status_code=404, detail="User not found")

        # Validate tier
        if tier_update.tier not in ["free", "basic", "pro"]:
            raise HTTPException(status_code=400, detail="Invalid tier. Must be 'free', 'basic', or 'pro'")

        user.tier = tier_update.tier
        db.commit()

        # Get preorders count
        preorders_count = db.query(func.count(Preorder.id)).filter(Preorder.user_id == user_id).scalar() or 0

        logger.info(f"Admin {admin_user.email} changed user {user.email} tier to {tier_update.tier}")

        return UserListItem(
            id=user.id,
            email=user.email,
            first_name=user.first_name,
            last_name=user.last_name,
            tier=user.tier,
            is_grandfathered=user.is_grandfathered,
            is_admin=user.is_admin,
            created_at=user.created_at,
            preorders_count=preorders_count
        )

    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        logger.error(f"Error updating user tier: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
