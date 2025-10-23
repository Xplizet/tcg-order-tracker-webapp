# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TCG Preorder Tracker is a monorepo web application for tracking Trading Card Game preorders. It consists of a Next.js frontend and FastAPI backend, designed to transform a desktop application into a cloud-based SaaS product with subscription tiers.

**Repository:** https://github.com/Xplizet/tcg-order-tracker-webapp
**Current Status:** Phase 2 - Core Features (CRUD Complete)

## Key Architecture Decisions

### Monorepo Structure
- **Frontend** (`frontend/`): Next.js 15.5.6 with App Router, Turbopack enabled
- **Backend** (`backend/`): FastAPI with Python 3.12+ in isolated venv
- Both apps run independently but share authentication via Clerk JWT tokens
- CORS configured for cross-origin communication between frontend (port 3000) and backend (port 8000)

### Data Flow Architecture
1. User authenticates via Clerk (frontend)
2. Clerk issues JWT token
3. Frontend sends requests to FastAPI with JWT in headers
4. Backend verifies JWT, extracts user_id, enforces row-level security
5. All database queries filter by user_id to prevent cross-user data access

### Database Design (PostgreSQL via Supabase)
- **Preorders table** uses PostgreSQL GENERATED columns for computed fields:
  - `total_cost = cost_per_item * quantity`
  - `amount_owing = total_cost - amount_paid`
  - `profit = sold_price - total_cost`
  - `profit_margin = ((sold_price - total_cost) / sold_price * 100)`
- **Users table** synced from Clerk via webhooks (Clerk is source of truth)
- **Subscriptions table** managed by Stripe webhooks
- **System settings** stored as JSONB for admin-controlled feature flags

### Authentication & Authorization
- **Clerk** handles all auth (email/password, OAuth)
- Backend verifies Clerk JWT on every request
- User tier enforcement happens at API level via middleware
- Grandfathering logic: `is_grandfathered` flag bypasses tier limits

### Subscription/Monetization Model
- Three tiers: Free (limited), Basic ($5/mo), Pro ($15/mo)
- Early users (before grandfather_date) get unlimited free access forever
- Feature flags in `system_settings` table control when subscriptions are enabled
- Stripe webhooks keep subscription status in sync

## Development Commands

### Frontend (from project root)
```bash
cd frontend
npm run dev          # Start dev server with Turbopack (http://localhost:3000)
npm run build        # Production build with Turbopack
npm run lint         # ESLint check
```

### Backend (from project root)
```bash
# Must use direct path to venv Python to avoid shebang issues
backend/venv/bin/uvicorn backend.app.main:app --reload --host 0.0.0.0 --port 8000

# Alternative: activate venv first (but background jobs should use direct path)
cd backend
source venv/bin/activate
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

# Testing (when implemented)
backend/venv/bin/pytest

# Database migrations (when implemented)
backend/venv/bin/alembic upgrade head
```

### Important: Backend Virtual Environment
- The venv MUST be at `backend/venv/` (not nested deeper)
- Always use `backend/venv/bin/python` or `backend/venv/bin/pip` for commands
- Activating venv in background shells doesn't work reliably; use direct paths

## Critical Implementation Details

### API Structure (Backend)
- All API routes will be versioned: `/api/v1/{resource}`
- Routers registered in `app/main.py` with tags for auto-docs
- Auto-generated OpenAPI docs at `http://localhost:8000/docs`
- Structure: `app/routes/` for endpoints, `app/services/` for business logic, `app/models/` for SQLAlchemy

### Frontend State Management
- Use TanStack Query for all server state (not yet implemented)
- Forms validated with React Hook Form + Zod schemas matching backend Pydantic models
- shadcn/ui components for consistent UI (dark theme as per PRD section 7.1)

### Environment Variables
- Frontend: `.env.local` (never commit)
- Backend: `.env` (never commit)
- Templates provided in `.env.example` files
- Required for Clerk, Supabase, Stripe, Resend integration

### CSV Import/Export Feature
- Must validate CSV structure before importing
- Duplicate handling options: skip, update existing, or add as new
- Export should include ALL fields including computed columns

### PDF Report Generation
- Uses reportlab library
- Must include: summary stats, all 4 charts (as embedded images), detailed tables
- Grouped by status: Pending, Delivered, Sold

### Analytics/Statistics
- All analytics endpoints must respect current filter state
- Calculations happen in backend, not database (except for generated columns)
- Charts should be interactive (Recharts) and update when filters change

### Feature Flags & Admin Panel
- System settings stored as JSONB in database
- Admin-only routes protected by `is_admin` check in middleware
- Enabling subscriptions is one-way (sets grandfather_date, marks existing users)

## External Service Integration

**Required for Phase 1:**
- Supabase: Database connection string needed before implementing models
- Clerk: API keys needed before implementing auth

**Required for Later Phases:**
- Stripe: For subscription checkout and webhooks
- Resend: For email notifications

## Git Commit Guidelines

**IMPORTANT:** When creating git commits:
- NEVER mention Claude, AI, or any automated tools in commit messages
- Write commits as if a human developer created them
- Focus on technical changes and their purpose
- Use conventional commit format when appropriate
- Keep messages concise and professional

## Git & GitHub Workflow

**Repository Setup:**
- GitHub repository: https://github.com/Xplizet/tcg-order-tracker-webapp
- Default branch: `master`
- Remote: `origin`
- GitHub CLI configured for authentication

**Standard Workflow:**
1. Always work on the `master` branch or create feature branches for larger changes
2. Commit frequently with descriptive messages
3. Push to GitHub after completing logical units of work
4. Use `git status` before committing to verify changes
5. Frontend and backend code are tracked in the same repository (monorepo structure)

**Common Commands:**
```bash
# Check status
git status

# Add and commit changes
git add <files>
git commit -m "message"

# Push to GitHub
git push

# Pull latest changes
git pull

# Create and switch to feature branch
git checkout -b feature/feature-name

# View commit history
git log --oneline
```

**Important Notes:**
- The frontend directory is tracked directly (not as a submodule)
- Always ensure both frontend and backend changes are committed together when they're related
- Use GitHub CLI (`gh`) for creating repositories, PRs, and issues
- Git credentials are managed via GitHub CLI authentication

## Task Tracking

Always check and update `tasks.md` when working on features. It follows GitHub task list format with status indicators:
- 🟢 Not Started
- 🟡 In Progress
- ✅ Complete
- 🔵 Blocked

Update task status immediately when starting/completing work.

## Testing Strategy (When Implemented)

### Backend
- pytest for unit/integration tests
- Mock Clerk JWT verification in tests
- Test row-level security (ensure users can't access others' data)
- Test computed columns return correct calculations

### Frontend
- Vitest + React Testing Library for components
- MSW for API mocking
- Playwright for E2E critical paths

## Common Patterns

### Adding a New API Endpoint
1. Create Pydantic request/response models
2. Add route in `app/routes/{resource}.py`
3. Implement business logic in `app/services/{resource}.py`
4. Register router in `app/main.py`
5. Add authentication middleware if needed
6. Test with auto-docs at `/docs`

### Adding a New Page (Frontend)
1. Create route in `app/` directory (App Router)
2. Create components in `components/`
3. Add TanStack Query hooks for API calls
4. Implement Zod validation for forms
5. Use shadcn/ui components for consistency

### Implementing Row-Level Security
Every query in backend services MUST filter by user_id extracted from JWT:
```python
preorders = db.query(Preorder).filter(Preorder.user_id == current_user_id).all()
```

## Version Information

- Next.js: 15.5.6 (App Router, Turbopack)
- React: 19.1.0
- Tailwind CSS: 4.x
- FastAPI: 0.115.14
- Python: 3.12+
- SQLAlchemy: 2.0.44
- Pydantic: 2.12.3

All packages are pinned to latest stable versions as of project creation.
