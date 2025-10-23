"""
Admin-only route protection middleware
"""
from fastapi import HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
from app.utils.auth import get_current_user_id
import logging

logger = logging.getLogger(__name__)


def get_admin_user(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> User:
    """
    Verify that the current user is an admin.
    Returns the user object if admin, raises 403 if not.

    Usage in admin routes:
        admin_user: User = Depends(get_admin_user)
    """
    user = db.query(User).filter(User.id == user_id).first()

    if not user:
        logger.warning(f"User {user_id} not found in database")
        raise HTTPException(status_code=404, detail="User not found")

    if not user.is_admin:
        logger.warning(f"Non-admin user {user_id} attempted to access admin route")
        raise HTTPException(
            status_code=403,
            detail="Access denied. Admin privileges required."
        )

    logger.info(f"Admin user {user.email} accessed admin route")
    return user
