# TCG Preorder Tracker - Web Application

A modern cloud-based web application for tracking TCG (Trading Card Game) preorders with real-time sync, analytics, and subscription-based features.

**Repository:** https://github.com/Xplizet/tcg-order-tracker-webapp

**Status:** Phase 2 - Core Features (CRUD Complete)

## Tech Stack

### Frontend
- **Framework:** Next.js 15.5.6 (App Router, Turbopack)
- **Language:** TypeScript
- **UI Library:** shadcn/ui + Tailwind CSS 4
- **State Management:** TanStack Query (React Query)
- **Forms:** React Hook Form + Zod validation
- **Charts:** Recharts
- **Hosting:** Vercel

### Backend
- **Framework:** FastAPI 0.115.14 (Python 3.12+)
- **ORM:** SQLAlchemy 2.0.44
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Clerk
- **Payments:** Stripe
- **Email:** Resend
- **Hosting:** Railway

## Project Structure

```
tcg-order-tracker-webapp/
├── frontend/                 # Next.js application
│   ├── app/                 # App router pages
│   ├── components/          # React components
│   ├── lib/                 # Utility functions
│   └── public/              # Static assets
├── backend/                 # FastAPI application
│   ├── app/
│   │   ├── models/         # SQLAlchemy models
│   │   ├── routes/         # API endpoints
│   │   ├── services/       # Business logic
│   │   └── utils/          # Helper functions
│   ├── venv/               # Python virtual environment
│   └── requirements.txt    # Python dependencies
├── WEB_APP_PRD.md          # Product Requirements Document
└── tasks.md                # Development task tracker
```

## Getting Started

### Prerequisites
- **Node.js** 20+ (for frontend)
- **Python** 3.12+ (for backend)
- **PostgreSQL** (via Supabase)
- **Git**

### Frontend Setup

1. Navigate to frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Copy environment variables:
   ```bash
   cp .env.example .env.local
   ```

4. Fill in the environment variables in `.env.local`

5. Start development server:
   ```bash
   npm run dev
   ```

Frontend will be available at `http://localhost:3000`

### Backend Setup

1. Navigate to backend directory:
   ```bash
   cd backend
   ```

2. Create and activate virtual environment:
   ```bash
   python3 -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Copy environment variables:
   ```bash
   cp .env.example .env
   ```

5. Fill in the environment variables in `.env`

6. Start development server:
   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

Backend will be available at `http://localhost:8000`
API documentation: `http://localhost:8000/docs`

## Development Workflow

1. Check `tasks.md` for current sprint tasks
2. Create feature branches from `main`
3. Test locally before committing
4. Update task status in `tasks.md`

## External Services Setup

You'll need to create accounts and configure the following services:

1. **Supabase** - Database & Storage
   - Create project at https://supabase.com
   - Get connection string and API keys

2. **Clerk** - Authentication
   - Create application at https://clerk.com
   - Configure OAuth providers
   - Get API keys

3. **Stripe** - Payments (when ready)
   - Create account at https://stripe.com
   - Setup products and prices
   - Configure webhooks

4. **Resend** - Email (when ready)
   - Create account at https://resend.com
   - Verify sender domain
   - Get API key

## Available Scripts

### Frontend
- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

### Backend
- `uvicorn app.main:app --reload` - Start development server
- `pytest` - Run tests
- `alembic upgrade head` - Run database migrations

## Documentation

- [Product Requirements Document](./WEB_APP_PRD.md)
- [Task Tracker](./tasks.md)
- API Docs: http://localhost:8000/docs (when backend running)

## License

Private - All rights reserved

## Version

Current Version: 1.0.0 (Phase 1 - Development)
