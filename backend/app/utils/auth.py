"""
Authentication utilities - Clerk JWT verification
"""
from fastapi import HTTPException, Security
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import jwt
from jwt import PyJWKClient
from app.database import get_settings
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
