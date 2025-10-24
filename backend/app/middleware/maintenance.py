"""
Maintenance Mode Middleware
Blocks non-admin users when maintenance mode is enabled
"""
from fastapi import Request, HTTPException
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from sqlalchemy.orm import Session
from app.database import SessionLocal, get_settings
from app.models.system_settings import SystemSettings
from app.models.user import User
from app.utils.auth import get_current_user_id, security
import logging

logger = logging.getLogger(__name__)


class MaintenanceModeMiddleware(BaseHTTPMiddleware):
    """
    Middleware to enforce maintenance mode

    When maintenance mode is enabled:
    - Admin users can access the application normally
    - Non-admin users receive a 503 Service Unavailable response
    - Health check and root endpoints remain accessible
    """

    # Paths that should always be accessible during maintenance
    ALLOWED_PATHS = [
        "/",
        "/health",
        "/api/v1/admin/settings",  # Allow admins to disable maintenance mode
        "/docs",
        "/openapi.json",
    ]

    async def dispatch(self, request: Request, call_next):
        # Always allow OPTIONS requests (CORS preflight)
        if request.method == "OPTIONS":
            return await call_next(request)

        # Allow health check and root endpoints
        if any(request.url.path.startswith(path) for path in self.ALLOWED_PATHS):
            return await call_next(request)

        # Check maintenance mode status
        db: Session = SessionLocal()
        try:
            settings = db.query(SystemSettings).filter(SystemSettings.id == "global").first()

            # If no settings or maintenance mode is off, proceed normally
            if not settings or not settings.maintenance_mode:
                return await call_next(request)

            # Maintenance mode is enabled - check if user is admin
            try:
                # Try to get user from Authorization header
                auth_header = request.headers.get("Authorization")
                if not auth_header:
                    # No auth token - return maintenance message
                    return self._maintenance_response(settings.maintenance_message)

                # Extract user_id from token (simplified - not calling full dependency)
                credentials = security.model_validate({"scheme": "Bearer", "credentials": auth_header.split(" ")[1]})
                user_id = get_current_user_id(credentials)

                # Check if user is admin
                user = db.query(User).filter(User.id == user_id).first()
                if user and user.is_admin:
                    # Admin user - allow access
                    logger.info(f"Admin user {user_id} accessing during maintenance mode")
                    return await call_next(request)

                # Non-admin user - return maintenance message
                logger.info(f"Non-admin user {user_id} blocked by maintenance mode")
                return self._maintenance_response(settings.maintenance_message)

            except Exception as e:
                # If auth fails (invalid token, etc), return maintenance message
                logger.warning(f"Auth check failed during maintenance mode: {str(e)}")
                return self._maintenance_response(settings.maintenance_message)

        finally:
            db.close()

    def _maintenance_response(self, message: str = None) -> JSONResponse:
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
