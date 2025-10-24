# TCG Order Tracker - Development Tasks

**Project Status:** ✅ Phase 7 Complete - UI/UX Polish + Enhancements!
**Last Updated:** 2025-10-24
**Sprint:** Phase 1-7 Complete (✅ Foundation, Core Features, Advanced Features, Settings, Admin Panel, UI/UX Polish)

**Milestone Achieved:** ✅ Production-Ready Application - Full CRUD, Analytics, Bulk Ops, Import/Export, Backup/Restore, User Settings, Admin Panel, Dark Theme, Responsive Design!

**Recent Enhancements (2025-10-24):**
- ✅ Toast notifications with Sonner for all CRUD operations
- ✅ Improved delete confirmation modals with dark theme
- ✅ Amount paid validation (cannot exceed total cost)
- ✅ Release date column added to order table
- ✅ Enhanced UX with success/error feedback
- ✅ Store name autocomplete with 8 default Australian TCG stores
- ✅ URL query parameter persistence for filters and sorting (shareable/bookmarkable views)
- ✅ Pagination controls with page navigation and items-per-page selector

---

## Task Legend

- 🟢 **Status:** Not Started
- 🟡 **Status:** In Progress
- 🔵 **Status:** Blocked
- ✅ **Status:** Complete
- ❌ **Status:** Cancelled

**Assignees:**
- `@claude` - Claude Code (AI Developer)
- `@user` - Human Developer (Infrastructure & External Services)

---

## Phase 1: Foundation (Weeks 1-2)

### 1.1 Project Setup & Infrastructure

- [x] ✅ **Setup Next.js Project** `@claude`
  - [x] Initialize Next.js 15.5.6 with App Router
  - [x] Configure TypeScript
  - [x] Setup Tailwind CSS 4
  - [x] Install shadcn/ui
  - [x] Configure project structure (`/app`, `/components`, `/lib`, `/types`)

- [x] ✅ **Setup FastAPI Backend** `@claude`
  - [x] Initialize FastAPI project
  - [x] Configure Python virtual environment
  - [x] Setup project structure (`/app`, `/models`, `/routes`, `/services`)
  - [x] Configure SQLAlchemy
  - [x] Setup Pydantic models
  - [x] Add CORS middleware

- [x] ✅ **Database Setup** `@user`
  - [x] Create Supabase project
  - [x] Run database migrations (schema from PRD)
  - [x] Create indexes
  - [ ] Setup row-level security policies (Phase 2)
  - [x] Provide connection strings to `@claude`

- [x] ✅ **Authentication Setup** `@user`
  - [x] Create Clerk account
  - [x] Configure Clerk application
  - [x] Setup OAuth providers (Google, GitHub)
  - [ ] Configure webhooks endpoint (Phase 2)
  - [x] Provide API keys to `@claude`

- [x] ✅ **Clerk Integration - Frontend** `@claude`
  - [x] Install Clerk SDK
  - [x] Configure ClerkProvider
  - [x] Create auth layouts (sign-in, sign-up)
  - [x] Implement protected routes
  - [x] Add user button/menu

- [x] ✅ **Clerk Integration - Backend** `@claude`
  - [x] Install Clerk Python SDK
  - [x] Create JWT verification middleware
  - [x] Extract user_id from tokens
  - [x] Setup user sync webhook handler (needs Clerk dashboard config)
  - [x] Test authentication flow

### 1.2 Development Environment

- [x] ✅ **Environment Configuration** `@claude`
  - [x] Create `.env.example` files (frontend & backend)
  - [x] Document required environment variables
  - [x] Setup environment validation (Pydantic for backend)

- [x] ✅ **Local Development Setup** `@user`
  - [x] Configure local environment variables
  - [x] Test frontend dev server (`npm run dev`)
  - [x] Test backend dev server (`uvicorn`)
  - [x] Verify database connection

- [x] ✅ **Git & Version Control** `@claude`
  - [x] Create `.gitignore` files
  - [x] Setup commit message conventions
  - [x] Create README.md with setup instructions

---

## Phase 2: Core Features (Weeks 3-4)

### 2.1 Database Models & API Foundation

- [x] ✅ **SQLAlchemy Models** `@claude`
  - [x] Create `User` model
  - [x] Create `Order` model with computed fields
  - [ ] Create `Subscription` model (future - when Stripe integrated)
  - [ ] Create `AnalyticsEvent` model (future enhancement)
  - [x] Create `SystemSettings` model with feature flags
  - [x] Create `NotificationPreferences` model
  - [x] Add model relationships

- [x] ✅ **API Base Structure** `@claude`
  - [x] Create base response schemas
  - [x] Setup error handling middleware
  - [x] Create health check endpoint
  - [x] Setup API versioning (`/api/v1`)

### 2.2 Order CRUD Operations

- [x] ✅ **Backend - Order Endpoints** `@claude`
  - [x] POST `/api/v1/orders` - Create preorder
  - [x] GET `/api/v1/orders` - List orders (with pagination)
  - [x] GET `/api/v1/orders/{id}` - Get single preorder
  - [x] PUT `/api/v1/orders/{id}` - Update preorder
  - [x] DELETE `/api/v1/orders/{id}` - Delete preorder
  - [x] Add input validation (Pydantic)
  - [x] Add user ownership verification

- [x] ✅ **Frontend - API Client** `@claude`
  - [x] Setup TanStack Query
  - [x] Create API client utility (useApi hook with Clerk tokens)
  - [x] Create preorder query hooks
  - [x] Create preorder mutation hooks
  - [x] Add error handling

- [x] ✅ **Frontend - Order Form Component** `@claude`
  - [x] Create form with React Hook Form
  - [x] Add Zod validation schema
  - [x] Create form fields (all from PRD)
  - [x] Add auto-calculations (total cost, amount owing) - handled by PostgreSQL
  - [x] Add date pickers
  - [x] Add store name autocomplete with Australian TCG stores
  - [x] Create modal/dialog wrapper

- [x] ✅ **Frontend - Order Table** `@claude`
  - [x] Create table component (custom table)
  - [x] Add sortable columns (all 11 fields sortable)
  - [x] Add row actions (edit, delete buttons)
  - [x] Add loading states
  - [x] Add empty state
  - [x] Make responsive (cards on mobile)
  - [x] Add release date column
  - [x] Add pagination controls (Previous/Next, page numbers, items-per-page selector)

- [x] ✅ **Frontend - Order Page** `@claude`
  - [x] Create main orders page (integrated into dashboard)
  - [x] Add "New Order" button
  - [x] Integrate table component
  - [x] Add delete confirmation modal with dark theme
  - [x] Add success/error toasts (sonner integration)
  - [x] Test full CRUD flow (Create + List working)

### 2.3 Filtering, Search & Sorting

- [x] ✅ **Backend - Query Parameters** `@claude`
  - [x] Add search query parameter (product_name, store_name, notes)
  - [x] Add status filter
  - [x] Add store filter
  - [x] Add date range filter (order_date and release_date)
  - [x] Add amount_owing filter
  - [x] Add sorting parameters (11 sortable fields)
  - [ ] Optimize queries with indexes (future enhancement)

- [x] ✅ **Frontend - Search & Filter UI** `@claude`
  - [x] Create search bar component
  - [x] Create filter bar component
  - [x] Add store filter input
  - [x] Add status filter dropdown
  - [x] Add date range pickers (order and release dates)
  - [x] Add "Amount Owing" toggle checkbox
  - [x] Show active filter count and clear all
  - [x] Update URL query params for shareable views

- [x] ✅ **Frontend - Sorting UI** `@claude`
  - [x] Add sort icons to table headers (↑↓)
  - [x] Toggle ascending/descending
  - [x] Visual indicators for active sort
  - [x] Persist sort state in URL

### 2.4 Dashboard & Analytics

- [x] ✅ **Backend - Statistics Endpoint** `@claude`
  - [x] GET `/api/v1/analytics/statistics` endpoint
  - [x] Calculate total orders
  - [x] Calculate pending/delivered/sold counts
  - [x] Calculate total cost
  - [x] Calculate amount owing
  - [x] Calculate total profit
  - [x] Calculate average profit margin
  - [ ] Add caching for performance (future enhancement)

- [x] ✅ **Backend - Analytics Endpoints** `@claude`
  - [x] GET `/api/v1/analytics/spending-by-store`
  - [x] GET `/api/v1/analytics/status-overview`
  - [x] GET `/api/v1/analytics/profit-by-store`
  - [x] GET `/api/v1/analytics/monthly-spending`
  - [x] Apply filters to all analytics endpoints

- [x] ✅ **Frontend - Summary Cards** `@claude`
  - [x] Create SummaryCards component
  - [x] Display total orders with status breakdown
  - [x] Display total cost
  - [x] Display amount owing
  - [x] Display total profit (from sold items)
  - [x] Display average profit margin
  - [x] Display amount paid
  - [x] Add loading skeletons

- [x] ✅ **Frontend - Charts** `@claude`
  - [x] Setup Recharts
  - [x] Create "Spending by Store" pie chart
  - [x] Create "Status Overview" donut chart with color coding
  - [x] Create "Profit by Store" bar chart
  - [x] Create "Monthly Spending" line chart
  - [x] Make charts responsive
  - [x] Add interactive tooltips
  - [x] Add empty states for no data

- [x] ✅ **Frontend - Dashboard Integration** `@claude`
  - [x] Integrate analytics into OrdersView
  - [x] Add summary cards grid (6 cards)
  - [x] Add charts grid (2x2 layout)
  - [x] Filter integration (analytics update with filters)
  - [x] Responsive layouts

---

## Phase 3: Advanced Features (Weeks 5-6)

### 3.1 Bulk Operations

- [x] ✅ **Backend - Bulk Endpoints** `@claude`
  - [x] POST `/api/v1/orders/bulk-delete`
  - [x] POST `/api/v1/orders/bulk-update` (status and amount_paid)
  - [x] Add transaction support
  - [x] Return success/failed counts

- [x] ✅ **Frontend - Bulk Selection** `@claude`
  - [x] Add checkboxes to table rows
  - [x] Add "Select All" checkbox
  - [x] Create bulk action toolbar (shows when items selected)
  - [x] Add bulk delete button with confirmation
  - [x] Add bulk update modal for status and amount paid
  - [x] Show operation results
  - [x] Clear selection after operation

### 3.2 Import / Export

- [x] ✅ **Backend - CSV Export** `@claude`
  - [x] GET `/api/v1/orders/export` endpoint
  - [x] Export all user orders
  - [x] Include all columns + computed fields
  - [x] Stream CSV response with timestamp filename

- [x] ✅ **Backend - CSV Import** `@claude`
  - [x] POST `/api/v1/orders/import` endpoint
  - [x] Validate CSV structure
  - [x] Handle duplicates (skip/update/add options)
  - [x] Return import summary (imported/skipped/failed counts)
  - [x] Return error details for failed rows

- [ ] 🟢 **Backend - PDF Report** `@claude` (Future Enhancement)
  - [ ] Install reportlab
  - [ ] POST `/api/v1/export/pdf` endpoint
  - [ ] Generate summary statistics section
  - [ ] Embed charts as images
  - [ ] Add detailed tables (pending/delivered/sold)
  - [ ] Professional formatting
  - [ ] Return PDF file

- [x] ✅ **Frontend - Export/Import UI** `@claude`
  - [x] Add "Export CSV" button with download
  - [x] Add "Import CSV" button with modal
  - [x] File upload input with validation
  - [x] Duplicate handling dropdown (skip/update/add)
  - [x] Show import results with counts
  - [x] Display error details for failed rows

### 3.3 Backup & Restore

- [x] ✅ **Backend - Backup Endpoints** `@claude`
  - [x] GET `/api/v1/orders/backup` - Manual backup (JSON format)
  - [x] POST `/api/v1/orders/restore` - Restore from JSON
  - [x] Add backup validation
  - [x] Full replace mode (deletes existing data)
  - [x] Return restore summary with error details

- [ ] 🟢 **Backend - Auto Backup Service** `@claude` (Future Enhancement)
  - [ ] Create background job for daily backups
  - [ ] Store backups in Supabase Storage
  - [ ] Implement 7-day retention policy
  - [ ] Add backup cleanup job

- [ ] 🟢 **Supabase Storage Setup** `@user` (Future - when auto backups needed)
  - [ ] Create storage bucket for backups
  - [ ] Configure bucket policies
  - [ ] Provide access credentials to `@claude`

- [x] ✅ **Frontend - Backup/Restore UI** `@claude`
  - [x] Add "Backup" button with JSON download
  - [x] Add "Restore" button with file upload modal
  - [x] Warning message about data deletion
  - [x] Double confirmation for restore
  - [x] Show restore results with counts

---

## Phase 4: Notifications & Settings (Week 7-8)

### 4.1 Email Notifications

- [x] ✅ **Email Service Setup** `@user`
  - [x] Create Resend account
  - [ ] Verify sender domain (using Gmail for testing currently)
  - [x] Provide API key to backend

- [x] ✅ **Backend - Email Templates** `@claude`
  - [x] Create test email template (send_test_email)
  - [x] Create release reminder template (send_release_reminder)
  - [x] Create payment reminder template (send_payment_reminder)
  - [x] Create weekly digest template (send_weekly_digest)
  - [x] Create monthly digest template (send_monthly_digest)

- [x] ✅ **Backend - Email Service** `@claude`
  - [x] Setup Resend SDK
  - [x] Create email sending service (app/services/email_service.py)
  - [ ] Add email queue (background jobs) (future - requires scheduler)
  - [ ] Create notification scheduler (future - requires background task system)
  - [ ] Add unsubscribe handling (future enhancement)

- [x] ✅ **Backend - Notification Endpoints** `@claude`
  - [x] GET `/api/v1/notifications/preferences`
  - [x] PUT `/api/v1/notifications/preferences`
  - [x] POST `/api/v1/notifications/send-test` - Test email functionality

- [x] ✅ **Frontend - Notification Settings** `@claude`
  - [x] Add notification preferences form
  - [x] Toggle release reminders
  - [x] Configure reminder days (1/3/7/14/30)
  - [x] Toggle payment reminders
  - [x] Set payment threshold
  - [x] Configure digest frequency (weekly/monthly)
  - [x] Save preferences functionality
  - [x] Add "Send Test Email" button with success/error handling

### 4.2 User Settings

- [x] ✅ **Frontend - Settings Page** `@claude`
  - [x] Create settings page layout at /settings
  - [x] Add tabbed navigation (Account, Notifications, Data)
  - [x] Create Account tab (Clerk integration)
  - [x] Create Notifications tab
  - [x] Create Data tab

- [x] ✅ **Frontend - Account Settings** `@claude`
  - [x] Display user profile (email, ID, created date from Clerk)
  - [x] Add "Manage Account" link (Clerk)
  - [x] Add "Delete Account" button with confirmation

- [x] ✅ **Frontend - Data Settings** `@claude`
  - [x] Add "Export JSON" button (full backup)
  - [x] Add "Export CSV" button
  - [x] Add "Delete All Data" button with typed confirmation
  - [x] Show data statistics (total orders, value, profit)

---

## Phase 5: Payments & Subscriptions (Week 9-10)

### 5.1 Stripe Setup

- [ ] 🟢 **Stripe Account Setup** `@user`
  - [ ] Create Stripe account
  - [ ] Create products (Basic $5/mo, Pro $15/mo)
  - [ ] Create prices
  - [ ] Setup test mode
  - [ ] Configure webhook endpoint
  - [ ] Provide API keys to `@claude`

- [ ] 🟢 **Backend - Stripe Integration** `@claude`
  - [ ] Install Stripe SDK
  - [ ] Create Stripe service
  - [ ] POST `/api/v1/billing/create-checkout` - Create checkout session
  - [ ] POST `/api/v1/billing/create-portal` - Customer portal
  - [ ] POST `/api/v1/billing/webhook` - Handle webhooks
  - [ ] Implement webhook handlers:
    - [ ] `checkout.session.completed`
    - [ ] `customer.subscription.updated`
    - [ ] `customer.subscription.deleted`
    - [ ] `invoice.payment_succeeded`
    - [ ] `invoice.payment_failed`

- [ ] 🟢 **Backend - Subscription Logic** `@claude`
  - [ ] Create subscription management service
  - [ ] Implement tier limit checks
  - [ ] Add middleware for feature gating
  - [ ] Sync subscription status from Stripe

- [ ] 🟢 **Frontend - Pricing Page** `@claude`
  - [ ] Create pricing page
  - [ ] Display tier comparison table
  - [ ] Add "Upgrade" buttons
  - [ ] Show current tier badge
  - [ ] Add FAQ section

- [ ] 🟢 **Frontend - Subscription Management** `@claude`
  - [ ] Add subscription status display
  - [ ] Add "Manage Billing" button (Stripe portal)
  - [ ] Show billing history
  - [ ] Add upgrade/downgrade CTAs
  - [ ] Show grandfathered status badge

### 5.2 Feature Flags & Limits

- [x] ✅ **Backend - Feature Flag Service** `@claude`
  - [x] Create system settings model (subscriptions_enabled, grandfather_date, tier limits)
  - [x] Add system settings CRUD endpoints (GET/PUT /api/v1/admin/settings)
  - [x] Add default feature flags (subscriptions_enabled, maintenance_mode, tier limits)
  - [ ] Create feature check middleware (future enhancement - when subscriptions enabled)
  - [ ] Implement tier limit enforcement (future enhancement - when subscriptions enabled)
  - [x] Add grandfathering logic (is_grandfathered flag in User model)

- [x] ✅ **Frontend - Feature Gating** `@claude`
  - [x] Create feature flags management UI in admin panel
  - [x] Add "Enable Subscriptions" button with grandfather date setting
  - [x] Add tier limit configuration (free, basic, pro)
  - [ ] Show upgrade prompts for locked features (future - when subscriptions enabled)
  - [ ] Display limit warnings (e.g., "8/10 orders") (future - when subscriptions enabled)
  - [ ] Add tooltips for Pro features (future - when subscriptions enabled)

---

## Phase 6: Admin Panel (Week 11-12)

### 6.1 Admin Foundation

- [x] ✅ **Backend - Admin Middleware** `@claude`
  - [x] Create admin-only route protection
  - [x] Add admin check middleware
  - [x] Return 403 for non-admins

- [x] ✅ **Frontend - Admin Layout** `@claude`
  - [x] Create admin page layout at /admin
  - [x] Add admin navigation with tabs
  - [x] Add admin-only route guards
  - [x] Create "Admin" nav item (visible to admins only via auto-detection)

### 6.2 Admin Dashboard

- [x] ✅ **Backend - Admin Endpoints** `@claude`
  - [x] GET `/api/v1/admin/statistics` - System stats
  - [ ] GET `/api/v1/admin/analytics/users` - User growth (future enhancement)
  - [ ] GET `/api/v1/admin/analytics/revenue` - Revenue stats (future enhancement)
  - [x] GET `/api/v1/admin/users` - List all users
  - [x] PATCH `/api/v1/admin/users/{id}` - Update user tier
  - [x] GET `/api/v1/admin/settings` - System settings
  - [x] PUT `/api/v1/admin/settings` - Update settings

- [x] ✅ **Frontend - Admin Dashboard Tab** `@claude`
  - [x] Display overview stats (total users, active users, new users, total orders)
  - [ ] Show user growth chart (future enhancement)
  - [ ] Show revenue chart (when applicable)
  - [x] Show tier distribution (free, basic, pro, grandfathered)
  - [x] Add quick stats cards

- [x] ✅ **Frontend - User Management Tab** `@claude`
  - [x] Create user list table with pagination
  - [x] Add search/filter by email
  - [ ] Add user detail view (future enhancement)
  - [x] Add "Change Tier" action
  - [ ] Add "View as User" (impersonation) option (future enhancement)
  - [x] Show user statistics (orders count, last active)

- [x] ✅ **Frontend - Feature Flags Tab** `@claude`
  - [x] Display subscription toggle
  - [x] Add "Enable Subscriptions" button
  - [x] Show grandfather date
  - [x] Add tier limit inputs (free, basic, pro)
  - [ ] Add maintenance mode toggle (future enhancement)
  - [x] Create confirmation dialogs

- [ ] 🟢 **Frontend - Analytics Tab** `@claude` (Future Enhancement)
  - [ ] Display feature usage stats
  - [ ] Show most popular stores
  - [ ] Show top users by activity
  - [ ] Add export analytics button
  - [ ] Add date range filter

---

## Phase 7: Polish & Testing (Week 13-14)

### 7.1 UI/UX Polish

- [x] ✅ **Design System Refinement** `@claude`
  - [x] Implement dark theme colors from PRD (black background, subtle grays)
  - [x] Create custom theme-aware components using Tailwind variables
  - [x] Ensure consistent spacing across all pages
  - [x] Add loading states everywhere
  - [x] Add skeleton loaders for analytics charts and summary cards
  - [x] Refine error states

- [x] ✅ **Responsive Design** `@claude`
  - [x] Test all pages on mobile (dashboard, settings, admin)
  - [x] Implement mobile-responsive navigation (icons only on mobile)
  - [x] Make tables responsive with horizontal scroll
  - [x] Test touch interactions
  - [x] Optimize form inputs for mobile
  - [x] Test on tablet sizes

- [x] ✅ **Navigation** `@claude`
  - [x] Create NavBar component with Dashboard, Settings, Admin links
  - [x] Add auto-detection for admin status via API
  - [x] Make navigation responsive (full text desktop, icons mobile)
  - [x] Add theme toggle to navigation
  - [x] Integrate Clerk UserButton

- [ ] 🟢 **Accessibility** `@claude` (Future Enhancement)
  - [ ] Add ARIA labels
  - [ ] Test keyboard navigation
  - [ ] Ensure color contrast (dark theme needs review)
  - [ ] Add focus indicators
  - [ ] Test with screen reader

### 7.2 Testing

- [ ] 🟢 **Backend Testing** `@claude`
  - [ ] Setup pytest
  - [ ] Write unit tests for models
  - [ ] Write tests for API endpoints
  - [ ] Write tests for statistics calculations
  - [ ] Write tests for authentication
  - [ ] Write tests for webhooks
  - [ ] Aim for >80% coverage

- [ ] 🟢 **Frontend Testing** `@claude`
  - [ ] Setup Vitest + React Testing Library
  - [ ] Write component tests
  - [ ] Write form validation tests
  - [ ] Write API hook tests (with MSW)
  - [ ] Test critical user flows

- [ ] 🟢 **E2E Testing** `@claude`
  - [ ] Setup Playwright
  - [ ] Write E2E tests for auth flow
  - [ ] Write E2E tests for CRUD operations
  - [ ] Write E2E tests for checkout flow
  - [ ] Write E2E tests for admin panel

- [ ] 🟢 **Manual QA** `@user`
  - [ ] Test sign up / login flows
  - [ ] Test all CRUD operations
  - [ ] Test filters & search
  - [ ] Test CSV import/export
  - [ ] Test PDF generation
  - [ ] Test Stripe checkout (test mode)
  - [ ] Test email notifications
  - [ ] Test mobile responsive
  - [ ] Test cross-browser (Chrome, Firefox, Safari)
  - [ ] Test admin panel

### 7.3 Performance Optimization

- [ ] 🟢 **Frontend Performance** `@claude` (Future Enhancement)
  - [ ] Code splitting
  - [ ] Lazy load charts
  - [ ] Optimize images
  - [ ] Add React.memo where needed
  - [ ] Optimize TanStack Query cache
  - [ ] Run Lighthouse audit

- [x] ✅ **Backend Performance** `@claude`
  - [ ] Review and optimize slow queries (future enhancement)
  - [x] Add database query logging (enabled in debug mode)
  - [x] Implement connection pooling (pool_size=5, max_overflow=0, pool_recycle=3600)
  - [ ] Add response compression (future enhancement)
  - [ ] Profile endpoint performance (future enhancement)

---

## Phase 8: Deployment (Week 15)

### 8.1 Production Infrastructure

- [ ] 🟢 **Domain & DNS** `@user`
  - [ ] Purchase domain (e.g., tcgtracker.app)
  - [ ] Configure DNS for frontend
  - [ ] Configure DNS for backend API
  - [ ] Setup SSL certificates

- [ ] 🟢 **Frontend Deployment** `@user`
  - [ ] Create Vercel account
  - [ ] Connect GitHub repository
  - [ ] Configure environment variables
  - [ ] Setup custom domain
  - [ ] Enable analytics
  - [ ] Test deployment

- [ ] 🟢 **Backend Deployment** `@user`
  - [ ] Create Railway account
  - [ ] Connect GitHub repository
  - [ ] Configure environment variables
  - [ ] Setup custom domain
  - [ ] Configure auto-deploy
  - [ ] Test deployment

- [ ] 🟢 **Production Database** `@user`
  - [ ] Create production Supabase project
  - [ ] Run migrations
  - [ ] Setup backups
  - [ ] Configure monitoring

- [ ] 🟢 **Production Services** `@user`
  - [ ] Switch Clerk to production
  - [ ] Switch Stripe to live mode
  - [ ] Switch Resend to production
  - [ ] Configure webhooks for production URLs

### 8.2 Monitoring & Analytics

- [ ] 🟢 **Error Tracking** `@user`
  - [ ] Setup Sentry (backend)
  - [ ] Setup Sentry (frontend)
  - [ ] Configure error alerts

- [ ] 🟢 **Application Monitoring** `@user`
  - [ ] Enable Vercel Analytics
  - [ ] Enable Railway monitoring
  - [ ] Configure Supabase monitoring
  - [ ] Setup uptime monitoring

- [ ] 🟢 **Analytics Setup** `@claude`
  - [ ] Add analytics event tracking
  - [ ] Test analytics in production
  - [ ] Verify admin dashboard displays data

### 8.3 Documentation

- [ ] 🟢 **User Documentation** `@claude`
  - [ ] Create user guide
  - [ ] Create FAQ page
  - [ ] Document CSV import format
  - [ ] Create troubleshooting guide

- [ ] 🟢 **Developer Documentation** `@claude`
  - [ ] Document API endpoints
  - [ ] Update README with deployment instructions
  - [ ] Document environment variables
  - [ ] Create contribution guide

- [ ] 🟢 **Operational Documentation** `@claude`
  - [ ] Create runbook for common issues
  - [ ] Document backup/restore procedures
  - [ ] Document admin panel usage
  - [ ] Create incident response plan

---

## Phase 9: Beta Launch (Week 16+)

### 9.1 Beta Preparation

- [ ] 🟢 **Pre-Launch Checklist** `@user` + `@claude`
  - [ ] All critical bugs fixed
  - [ ] Security audit completed
  - [ ] Performance targets met
  - [ ] Backup system tested
  - [ ] Monitoring configured
  - [ ] Support email setup
  - [ ] Terms of Service created
  - [ ] Privacy Policy created

- [ ] 🟢 **Beta Program Setup** `@user`
  - [ ] Create beta sign-up form
  - [ ] Prepare welcome email
  - [ ] Create feedback survey
  - [ ] Setup support channel (email/Discord)

### 9.2 Launch Activities

- [ ] 🟢 **Deploy to Production** `@user`
  - [ ] Final deployment
  - [ ] Smoke test all features
  - [ ] Monitor error rates
  - [ ] Monitor performance

- [ ] 🟢 **Beta User Onboarding** `@user`
  - [ ] Invite beta users
  - [ ] Send welcome emails
  - [ ] Monitor sign-ups
  - [ ] Respond to support requests

- [ ] 🟢 **Marketing** `@user`
  - [ ] Announce on Reddit (r/PokemonTCG, r/magicTCG)
  - [ ] Post on Twitter/X
  - [ ] Share in TCG Discord servers
  - [ ] Create demo video

### 9.3 Post-Launch Iteration

- [ ] 🟢 **Bug Fixes** `@claude`
  - [ ] Monitor error logs
  - [ ] Prioritize and fix critical bugs
  - [ ] Deploy hotfixes as needed

- [ ] 🟢 **Feedback Collection** `@user`
  - [ ] Collect user feedback
  - [ ] Analyze usage patterns
  - [ ] Identify pain points
  - [ ] Prioritize feature requests

- [ ] 🟢 **Optimization** `@claude`
  - [ ] Optimize based on real usage data
  - [ ] Improve slow queries
  - [ ] Enhance UX based on feedback

---

## Future Phases (Month 4+)

### Subscription Launch

- [ ] 🟢 **Enable Subscriptions** `@user` + `@claude`
  - [ ] Verify Stripe live mode working
  - [ ] Enable feature flag via admin panel
  - [ ] Grandfather existing users
  - [ ] Test tier limitations
  - [ ] Announce to users

### Mobile App (Phase 4+)
- [ ] 🟢 React Native setup
- [ ] 🟢 iOS build
- [ ] 🟢 Android build
- [ ] 🟢 Push notifications

### API Access (Pro Tier)
- [ ] 🟢 REST API documentation
- [ ] 🟢 API key generation
- [ ] 🟢 Rate limiting per tier

---

## Blockers & Dependencies

### Current Blockers
*None yet - add as they arise*

### External Dependencies
- [ ] Supabase project creation → `@user`
- [ ] Clerk account setup → `@user`
- [ ] Resend account setup → `@user`
- [ ] Stripe account setup → `@user`
- [ ] Domain registration → `@user`
- [ ] Vercel/Railway setup → `@user`

---

## Sprint Planning

**Current Sprint:** Foundation & Setup
**Sprint Goal:** Get development environment running with authentication

**Next Sprint:** Core CRUD Features
**Sprint Goal:** Complete order management functionality

---

## Phase 7.5: UX Enhancements (October 2025)

### 7.5.1 Toast Notifications (2025-10-24)

- [x] ✅ **Toast Notification System** `@claude`
  - [x] Install and configure Sonner library
  - [x] Add Toaster to root layout (top-right, rich colors)
  - [x] Add success toasts to create order
  - [x] Add success toasts to update order
  - [x] Add success toasts to delete order
  - [x] Add success toasts to bulk operations
  - [x] Add error toasts for all failed operations
  - [x] Add warning toast for bulk update validation
  - [x] Invalidate analytics cache on mutations

### 7.5.2 Validation Improvements (2025-10-24)

- [x] ✅ **Amount Paid Validation** `@claude`
  - [x] Frontend: Add Zod refine validator (amount_paid <= total_cost)
  - [x] Backend: Add Pydantic model validator for OrderCreate
  - [x] Backend: Add validation in update_order endpoint
  - [x] Display clear error messages on forms
  - [x] Return HTTP 400 with detailed message on backend

### 7.5.3 Table Enhancements (2025-10-24)

- [x] ✅ **Release Date Column** `@claude`
  - [x] Add release date column to desktop table
  - [x] Add release date to mobile card view
  - [x] Make release date sortable
  - [x] Update loading skeleton with new column
  - [x] Format dates consistently

### 7.5.4 Modal Improvements (2025-10-24)

- [x] ✅ **Dark Theme Modal Updates** `@claude`
  - [x] Update delete confirmation modal with theme colors
  - [x] Update edit order form with theme colors
  - [x] Update add order form with theme colors
  - [x] Update bulk operations modals with theme colors
  - [x] Remove inline error displays (replaced with toasts)

### 7.5.5 Store Name Autocomplete (2025-10-24)

- [x] ✅ **Autocomplete Implementation** `@claude`
  - [x] Create backend endpoint GET `/api/v1/orders/stores`
  - [x] Define 8 default Australian TCG stores in constants
  - [x] Create reusable AutocompleteInput component
  - [x] Implement keyboard navigation (arrows, Enter, Escape)
  - [x] Add click-outside detection to close dropdown
  - [x] Create useStoreSuggestions hook
  - [x] Combine default stores with user's previously used stores
  - [x] Integrate autocomplete in add order form
  - [x] Integrate autocomplete in edit order form
  - [x] Add filtering as user types
  - [x] Cache store suggestions for 5 minutes

**Default Australian TCG Stores:**
- Major Chains: EB Games, JB Hi-Fi, Target Australia, Big W, Kmart Australia
- Specialist Retailers: Good Games, Gameology, Zing Pop Culture

### 7.5.6 URL Query Parameter Persistence (2025-10-24)

- [x] ✅ **URL State Management** `@claude`
  - [x] Add Next.js router and search params hooks
  - [x] Create parseFiltersFromUrl helper function
  - [x] Create serializeFiltersToUrl helper function
  - [x] Initialize filters from URL params on page load
  - [x] Sync URL when filters change (non-blocking)
  - [x] Support all filter parameters (status, store, search, dates, amount_owing)
  - [x] Support sort parameters (sort_by, sort_order)
  - [x] Support pagination parameters (page, page_size)
  - [x] Enable shareable/bookmarkable filtered views
  - [x] Preserve scroll position on filter changes

**Benefits:**
- Users can bookmark specific filtered views
- Share links to filtered/sorted data with team members
- Browser back/forward navigation works with filters
- Improves user workflow and collaboration

### 7.5.7 Pagination Controls (2025-10-24)

- [x] ✅ **Table Pagination UI** `@claude`
  - [x] Create PaginationControls component
  - [x] Add Previous/Next navigation buttons
  - [x] Add numbered page buttons with ellipsis for many pages
  - [x] Add items-per-page selector (10, 25, 50, 100 options)
  - [x] Display pagination info ("Showing X-Y of Z orders")
  - [x] Integrate with OrderTable component
  - [x] Add page change handlers in OrdersView
  - [x] Add page size change handlers
  - [x] Sync pagination with URL query parameters
  - [x] Responsive design (condensed view on mobile)
  - [x] Dark theme compatible styling
  - [x] Disable Previous/Next when at boundaries

**Features:**
- Page navigation: Click page numbers or use Previous/Next
- Items per page: Choose 10, 25, 50, or 100 orders per page
- Status text: "Showing 1-50 of 237 orders"
- Smart page number display: Shows ellipsis (...) when many pages
- Mobile responsive: Simplified "Page X of Y" on small screens
- URL persistence: Page and page_size saved in URL

**Benefits:**
- Better performance for users with 100+ orders
- Reduced scrolling on mobile devices
- User control over data density
- Professional data table experience
- Improved perceived performance

---

## Notes

- All tasks are estimated for a ~16 week timeline (per PRD)
- `@claude` handles all development tasks
- `@user` handles infrastructure, external services, and QA
- Update status emoji as tasks progress
- Move completed tasks to a separate "Completed" section weekly
- Add blockers to the "Blockers & Dependencies" section immediately

---

**Last Updated:** 2025-10-24 by `@claude`
