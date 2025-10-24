"""
Authentication utilities - Clerk JWT verification
"""
from fastapi import HTTPException, Security, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
import jwt
from jwt import PyJWKClient
from app.database import get_settings, get_db
from app.models.user import User
import requests
import logging

logger = logging.getLogger(__name__)
security = HTTPBearer()
settings = get_settings()


def get_current_user_id(credentials: HTTPAuthorizationCredentials = Security(security)) -> str:
    """
    Verify Clerk JWT token and extract user ID

    Usage in route:
        user_id: str = Depends(get_current_user_id)
    """
    try:
        token = credentials.credentials

        # Get Clerk's JWKS (JSON Web Key Set) URL
        # Extract domain from base64-encoded publishable key
        import base64
        # Format: pk_test_<base64_encoded_domain>
        encoded_domain = settings.clerk_publishable_key.split("_")[2]
        clerk_domain = base64.b64decode(encoded_domain + "==").decode("utf-8").rstrip("$")
        jwks_url = f"https://{clerk_domain}/.well-known/jwks.json"

        logger.info(f"Using JWKS URL: {jwks_url}")

        # Verify and decode the JWT
        jwks_client = PyJWKClient(jwks_url)
        signing_key = jwks_client.get_signing_key_from_jwt(token)

        decoded = jwt.decode(
            token,
            signing_key.key,
            algorithms=["RS256"],
            options={"verify_exp": True}
        )

        # Extract user ID from the 'sub' claim
        user_id = decoded.get("sub")

        if not user_id:
            logger.error("Token decoded but no 'sub' claim found")
            raise HTTPException(status_code=401, detail="Invalid token: no user ID")

        logger.info(f"Successfully authenticated user: {user_id}")
        return user_id

    except jwt.ExpiredSignatureError:
        logger.error("Token has expired")
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.InvalidTokenError as e:
        logger.error(f"Invalid token: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Invalid token: {str(e)}")
    except Exception as e:
        logger.error(f"Authentication failed: {str(e)}")
        raise HTTPException(status_code=401, detail=f"Authentication failed: {str(e)}")


def get_current_user(
    user_id: str = Depends(get_current_user_id),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current user and auto-create if they don't exist in database yet.

    This ensures users are synced from Clerk on first login without needing webhooks.

    Usage in route:
        current_user: User = Depends(get_current_user)
    """
    # Check if user exists in database
    user = db.query(User).filter(User.id == user_id).first()

    if user:
        logger.info(f"Found existing user: {user.email}")
        return user

    # User doesn't exist - fetch from Clerk and create
    logger.info(f"User {user_id} not in database - syncing from Clerk...")

    try:
        # Fetch user data from Clerk API
        clerk_api_url = f"https://api.clerk.com/v1/users/{user_id}"
        headers = {
            "Authorization": f"Bearer {settings.clerk_secret_key}",
            "Content-Type": "application/json"
        }

        response = requests.get(clerk_api_url, headers=headers)
        response.raise_for_status()
        clerk_user = response.json()

        # Extract user data
        email_addresses = clerk_user.get("email_addresses", [])
        primary_email = next(
            (e["email_address"] for e in email_addresses if e.get("id") == clerk_user.get("primary_email_address_id")),
            email_addresses[0]["email_address"] if email_addresses else None
        )

        # Create user in database
        new_user = User(
            id=user_id,
            email=primary_email,
            first_name=clerk_user.get("first_name"),
            last_name=clerk_user.get("last_name"),
            tier="free",
            is_grandfathered=False,
            is_admin=False
        )

        db.add(new_user)
        db.commit()
        db.refresh(new_user)

        logger.info(f"✅ Auto-created user from Clerk: {new_user.email}")
        return new_user

    except requests.RequestException as e:
        logger.error(f"Failed to fetch user from Clerk API: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="Failed to sync user from Clerk. Please try again."
        )
    except Exception as e:
        logger.error(f"Failed to create user: {str(e)}")
        db.rollback()
        raise HTTPException(
            status_code=500,
            detail="Failed to create user in database"
        )
