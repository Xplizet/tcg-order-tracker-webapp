"""
Webhook handlers for external services (Clerk, Stripe)
"""
from fastapi import APIRouter, Request, HTTPException, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models import User
import logging

logger = logging.getLogger(__name__)
router = APIRouter()


@router.post("/clerk")
async def clerk_webhook(request: Request, db: Session = Depends(get_db)):
    """
    Handle Clerk webhook events for user management
    Events: user.created, user.updated, user.deleted
    """
    try:
        # Get the webhook payload
        payload = await request.json()
        event_type = payload.get("type")
        data = payload.get("data", {})

        logger.info(f"Received Clerk webhook: {event_type}")

        if event_type == "user.created":
            # Create new user in database
            user = User(
                id=data.get("id"),
                email=data.get("email_addresses", [{}])[0].get("email_address"),
                first_name=data.get("first_name"),
                last_name=data.get("last_name"),
                tier="free",
                is_grandfathered=False,
                is_admin=False
            )
            db.add(user)
            db.commit()
            logger.info(f"Created user: {user.email}")

        elif event_type == "user.updated":
            # Update existing user
            user = db.query(User).filter(User.id == data.get("id")).first()
            if user:
                user.email = data.get("email_addresses", [{}])[0].get("email_address")
                user.first_name = data.get("first_name")
                user.last_name = data.get("last_name")
                db.commit()
                logger.info(f"Updated user: {user.email}")

        elif event_type == "user.deleted":
            # Delete user (cascade will delete preorders)
            user = db.query(User).filter(User.id == data.get("id")).first()
            if user:
                db.delete(user)
                db.commit()
                logger.info(f"Deleted user: {user.email}")

        return {"status": "success"}

    except Exception as e:
        logger.error(f"Clerk webhook error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
