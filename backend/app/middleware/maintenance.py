"""
Maintenance Mode Middleware
Blocks non-admin users when maintenance mode is enabled
"""
from fastapi import Request, Response
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session
from app.database import SessionLocal
from app.models.system_settings import SystemSettings
from app.models.user import User
from app.utils.auth import get_current_user_id, security
import logging
import sys

logger = logging.getLogger(__name__)

# Paths that should always be accessible during maintenance
ALLOWED_PATHS = [
    "/",
    "/health",
    "/api/v1/admin/settings",  # Allow admins to disable maintenance mode
    "/docs",
    "/openapi.json",
]


async def maintenance_mode_middleware(request: Request, call_next):
    """
    Middleware to enforce maintenance mode

    When maintenance mode is enabled:
    - Admin users can access the application normally
    - Non-admin users receive a 503 Service Unavailable response
    - Health check and root endpoints remain accessible
    """
    print(f"[MIDDLEWARE] Processing request: {request.method} {request.url.path}", file=sys.stderr, flush=True)

    # Always allow OPTIONS requests (CORS preflight)
    if request.method == "OPTIONS":
        print(f"[MIDDLEWARE] Allowing OPTIONS request", file=sys.stderr, flush=True)
        return await call_next(request)

    # Allow health check and root endpoints
    if any(request.url.path.startswith(path) for path in ALLOWED_PATHS):
        print(f"[MIDDLEWARE] Path {request.url.path} is in ALLOWED_PATHS - allowing", file=sys.stderr, flush=True)
        return await call_next(request)

    print(f"[MIDDLEWARE] Checking maintenance mode for {request.url.path}", file=sys.stderr, flush=True)

    # Check maintenance mode status
    db: Session = SessionLocal()
    try:
        settings = db.query(SystemSettings).filter(SystemSettings.id == "global").first()

        # If no settings or maintenance mode is off, proceed normally
        if not settings or not settings.maintenance_mode:
            print(f"[MIDDLEWARE] Maintenance mode is OFF - allowing request", file=sys.stderr, flush=True)
            return await call_next(request)

        print(f"[MIDDLEWARE] Maintenance mode is ENABLED - checking auth", file=sys.stderr, flush=True)

        # Maintenance mode is enabled - check if user is admin
        try:
            # Try to get user from Authorization header
            auth_header = request.headers.get("Authorization")
            if not auth_header:
                # No auth token - return maintenance message
                print(f"[MIDDLEWARE] No auth token - blocking access", file=sys.stderr, flush=True)
                return _maintenance_response(settings.maintenance_message)

            # Extract user_id from token
            credentials = security.model_validate({"scheme": "Bearer", "credentials": auth_header.split(" ")[1]})
            user_id = get_current_user_id(credentials)

            # Check if user is admin
            user = db.query(User).filter(User.id == user_id).first()

            if not user:
                # User not found in database
                print(f"[MIDDLEWARE] User {user_id} not found in database - blocking", file=sys.stderr, flush=True)
                return _maintenance_response(settings.maintenance_message)

            if user.is_admin:
                # Admin user - allow access
                print(f"[MIDDLEWARE] Admin user {user_id} - allowing access", file=sys.stderr, flush=True)
                return await call_next(request)

            # Non-admin user - return maintenance message
            print(f"[MIDDLEWARE] Non-admin user {user_id} - blocking access", file=sys.stderr, flush=True)
            return _maintenance_response(settings.maintenance_message)

        except Exception as e:
            # If auth fails, return maintenance message
            print(f"[MIDDLEWARE] Auth check failed: {str(e)} - blocking", file=sys.stderr, flush=True)
            return _maintenance_response(settings.maintenance_message)

    finally:
        db.close()


def _maintenance_response(message: str = None) -> JSONResponse:
    """Return a 503 Service Unavailable response with maintenance message"""
    default_message = "The application is currently undergoing maintenance. Please check back soon."
    return JSONResponse(
        status_code=503,
        content={
            "error": "Service Unavailable",
            "message": message or default_message,
            "maintenance_mode": True
        }
    )
