"""
Notification Preferences API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import NotificationPreferences
from app.schemas.notifications import NotificationPreferencesResponse, NotificationPreferencesUpdate
from app.utils.auth import get_current_user_id
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.get("/preferences", response_model=NotificationPreferencesResponse)
def get_notification_preferences(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Get notification preferences for the authenticated user.
    Creates default preferences if they don't exist.
    """
    try:
        preferences = db.query(NotificationPreferences).filter(
            NotificationPreferences.user_id == user_id
        ).first()

        if not preferences:
            # Create default preferences
            preferences = NotificationPreferences(user_id=user_id)
            db.add(preferences)
            db.commit()
            db.refresh(preferences)

        return preferences

    except Exception as e:
        logger.error(f"Error getting notification preferences: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get preferences: {str(e)}")


@router.put("/preferences", response_model=NotificationPreferencesResponse)
def update_notification_preferences(
    preferences_update: NotificationPreferencesUpdate,
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Update notification preferences for the authenticated user.
    """
    try:
        preferences = db.query(NotificationPreferences).filter(
            NotificationPreferences.user_id == user_id
        ).first()

        if not preferences:
            # Create new preferences with provided values
            preferences = NotificationPreferences(
                user_id=user_id,
                **preferences_update.model_dump(exclude_unset=True)
            )
            db.add(preferences)
        else:
            # Update existing preferences
            update_data = preferences_update.model_dump(exclude_unset=True)
            for field, value in update_data.items():
                setattr(preferences, field, value)

        db.commit()
        db.refresh(preferences)

        logger.info(f"Updated notification preferences for user {user_id}")
        return preferences

    except Exception as e:
        db.rollback()
        logger.error(f"Error updating notification preferences: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update preferences: {str(e)}")
