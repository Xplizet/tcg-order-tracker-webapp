"""
Notification Preferences API endpoints
"""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import NotificationPreferences, User
from app.schemas.notifications import NotificationPreferencesResponse, NotificationPreferencesUpdate
from app.utils.auth import get_current_user_id
from app.services.email_service import send_test_email
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


@router.post("/send-test")
def send_test_notification(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
):
    """
    Send a test email to the authenticated user to verify email notifications are working.
    """
    try:
        # Get user's email from the users table
        user = db.query(User).filter(User.id == user_id).first()

        if not user or not user.email:
            raise HTTPException(status_code=404, detail="User email not found")

        # Send test email
        result = send_test_email(user.email)

        return {
            "success": True,
            "message": f"Test email sent to {user.email}",
            "email_id": result.get("email_id")
        }

    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending test email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send test email: {str(e)}")
