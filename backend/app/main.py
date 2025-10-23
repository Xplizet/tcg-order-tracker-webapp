"""
TCG Preorder Tracker - FastAPI Backend
Main application entry point
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

# Import routers
from app.routes import preorders, webhooks

@asynccontextmanager
async def lifespan(app: FastAPI):
    """Application lifespan manager"""
    # Startup
    print("Starting up TCG Preorder Tracker API...")
    yield
    # Shutdown
    print("Shutting down TCG Preorder Tracker API...")

app = FastAPI(
    title="TCG Preorder Tracker API",
    description="Backend API for TCG Preorder Tracker web application",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",  # Next.js dev server
        "http://localhost:3001",
        # Production URLs will be added later
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "TCG Preorder Tracker API",
        "version": "1.0.0",
        "status": "running"
    }


@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "tcg-preorder-tracker-api"
    }


# API versioned routes
app.include_router(webhooks.router, prefix="/api/webhooks", tags=["webhooks"])
app.include_router(preorders.router, prefix="/api/v1/preorders", tags=["preorders"])
