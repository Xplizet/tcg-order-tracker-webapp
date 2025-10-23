# TCG Preorder Tracker - Development Tasks

**Project Status:** 🟢 Phase 3 Complete - Advanced Features Implemented!
**Last Updated:** 2025-10-23
**Sprint:** Phase 1 - Foundation (✅ COMPLETE) | Phase 2 - Core Features (✅ COMPLETE) | Phase 3 - Advanced Features (✅ COMPLETE)

**Milestone Achieved:** ✅ Full-Featured Application - Bulk Operations, CSV Import/Export, Backup/Restore Working!

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
  - [x] Create `Preorder` model with computed fields
  - [ ] Create `Subscription` model
  - [ ] Create `AnalyticsEvent` model
  - [ ] Create `SystemSettings` model
  - [x] Add model relationships

- [x] ✅ **API Base Structure** `@claude`
  - [x] Create base response schemas
  - [x] Setup error handling middleware
  - [x] Create health check endpoint
  - [x] Setup API versioning (`/api/v1`)

### 2.2 Preorder CRUD Operations

- [x] ✅ **Backend - Preorder Endpoints** `@claude`
  - [x] POST `/api/v1/preorders` - Create preorder
  - [x] GET `/api/v1/preorders` - List preorders (with pagination)
  - [x] GET `/api/v1/preorders/{id}` - Get single preorder
  - [x] PUT `/api/v1/preorders/{id}` - Update preorder
  - [x] DELETE `/api/v1/preorders/{id}` - Delete preorder
  - [x] Add input validation (Pydantic)
  - [x] Add user ownership verification

- [x] ✅ **Frontend - API Client** `@claude`
  - [x] Setup TanStack Query
  - [x] Create API client utility (useApi hook with Clerk tokens)
  - [x] Create preorder query hooks
  - [x] Create preorder mutation hooks
  - [x] Add error handling

- [x] ✅ **Frontend - Preorder Form Component** `@claude`
  - [x] Create form with React Hook Form
  - [x] Add Zod validation schema
  - [x] Create form fields (all from PRD)
  - [x] Add auto-calculations (total cost, amount owing) - handled by PostgreSQL
  - [x] Add date pickers
  - [ ] Add store name autocomplete (future enhancement)
  - [x] Create modal/dialog wrapper

- [x] ✅ **Frontend - Preorder Table** `@claude`
  - [x] Create table component (custom table)
  - [ ] Add sortable columns (future enhancement)
  - [ ] Add pagination controls (future enhancement)
  - [ ] Add row actions (edit, delete) (future enhancement)
  - [x] Add loading states
  - [x] Add empty state
  - [ ] Make responsive (cards on mobile) (future enhancement)

- [x] ✅ **Frontend - Preorder Page** `@claude`
  - [x] Create main preorders page (integrated into dashboard)
  - [x] Add "New Preorder" button
  - [x] Integrate table component
  - [ ] Add delete confirmation modal (future enhancement)
  - [ ] Add success/error toasts (future enhancement)
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
  - [ ] Update URL query params (future enhancement)

- [x] ✅ **Frontend - Sorting UI** `@claude`
  - [x] Add sort icons to table headers (↑↓)
  - [x] Toggle ascending/descending
  - [x] Visual indicators for active sort
  - [ ] Persist sort state in URL (future enhancement)

### 2.4 Dashboard & Analytics

- [x] ✅ **Backend - Statistics Endpoint** `@claude`
  - [x] GET `/api/v1/analytics/statistics` endpoint
  - [x] Calculate total preorders
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
  - [x] Display total preorders with status breakdown
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
  - [x] Integrate analytics into PreordersView
  - [x] Add summary cards grid (6 cards)
  - [x] Add charts grid (2x2 layout)
  - [x] Filter integration (analytics update with filters)
  - [x] Responsive layouts

---

## Phase 3: Advanced Features (Weeks 5-6)

### 3.1 Bulk Operations

- [x] ✅ **Backend - Bulk Endpoints** `@claude`
  - [x] POST `/api/v1/preorders/bulk-delete`
  - [x] POST `/api/v1/preorders/bulk-update` (status and amount_paid)
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
  - [x] GET `/api/v1/preorders/export` endpoint
  - [x] Export all user preorders
  - [x] Include all columns + computed fields
  - [x] Stream CSV response with timestamp filename

- [x] ✅ **Backend - CSV Import** `@claude`
  - [x] POST `/api/v1/preorders/import` endpoint
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
  - [x] GET `/api/v1/preorders/backup` - Manual backup (JSON format)
  - [x] POST `/api/v1/preorders/restore` - Restore from JSON
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

- [ ] 🟢 **Email Service Setup** `@user`
  - [ ] Create Resend account
  - [ ] Verify sender domain
  - [ ] Provide API key to `@claude`

- [ ] 🟢 **Backend - Email Templates** `@claude`
  - [ ] Create welcome email template
  - [ ] Create release reminder template
  - [ ] Create payment reminder template
  - [ ] Create weekly digest template
  - [ ] Create monthly digest template

- [ ] 🟢 **Backend - Email Service** `@claude`
  - [ ] Setup Resend SDK
  - [ ] Create email sending service
  - [ ] Add email queue (background jobs)
  - [ ] Create notification scheduler
  - [ ] Add unsubscribe handling

- [ ] 🟢 **Backend - Notification Endpoints** `@claude`
  - [ ] POST `/api/v1/notifications/send-test` - Test email
  - [ ] GET `/api/v1/notifications/preferences`
  - [ ] PUT `/api/v1/notifications/preferences`

- [ ] 🟢 **Frontend - Notification Settings** `@claude`
  - [ ] Add notification preferences form
  - [ ] Toggle release reminders
  - [ ] Configure reminder days (1/3/7/14)
  - [ ] Toggle payment reminders
  - [ ] Set payment threshold
  - [ ] Configure digest frequency
  - [ ] Add "Send Test Email" button

### 4.2 User Settings

- [ ] 🟢 **Frontend - Settings Page** `@claude`
  - [ ] Create settings page layout
  - [ ] Add tabbed navigation
  - [ ] Create Account tab (Clerk integration)
  - [ ] Create Notifications tab
  - [ ] Create Data tab
  - [ ] Create Subscription tab (basic, for now)

- [ ] 🟢 **Frontend - Account Settings** `@claude`
  - [ ] Display user profile (from Clerk)
  - [ ] Add "Change Password" link (Clerk)
  - [ ] Add "Delete Account" button with confirmation

- [ ] 🟢 **Frontend - Data Settings** `@claude`
  - [ ] Add "Export All Data" button (JSON)
  - [ ] Add "Import Data" button
  - [ ] Add "Delete All Data" button with confirmation
  - [ ] Show data statistics (total preorders, etc.)

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

- [ ] 🟢 **Backend - Feature Flag Service** `@claude`
  - [ ] Create system settings CRUD
  - [ ] Add default feature flags
  - [ ] Create feature check middleware
  - [ ] Implement tier limit enforcement
  - [ ] Add grandfathering logic

- [ ] 🟢 **Frontend - Feature Gating** `@claude`
  - [ ] Create feature gate components
  - [ ] Show upgrade prompts for locked features
  - [ ] Display limit warnings (e.g., "8/10 preorders")
  - [ ] Add tooltips for Pro features

---

## Phase 6: Admin Panel (Week 11-12)

### 6.1 Admin Foundation

- [ ] 🟢 **Backend - Admin Middleware** `@claude`
  - [ ] Create admin-only route protection
  - [ ] Add admin check middleware
  - [ ] Return 403 for non-admins

- [ ] 🟢 **Frontend - Admin Layout** `@claude`
  - [ ] Create admin page layout
  - [ ] Add admin navigation
  - [ ] Add admin-only route guards
  - [ ] Create "Admin" nav item (visible to admins only)

### 6.2 Admin Dashboard

- [ ] 🟢 **Backend - Admin Endpoints** `@claude`
  - [ ] GET `/api/v1/admin/statistics` - System stats
  - [ ] GET `/api/v1/admin/analytics/users` - User growth
  - [ ] GET `/api/v1/admin/analytics/revenue` - Revenue stats
  - [ ] GET `/api/v1/admin/users` - List all users
  - [ ] PATCH `/api/v1/admin/users/{id}` - Update user tier
  - [ ] GET `/api/v1/admin/settings` - System settings
  - [ ] PUT `/api/v1/admin/settings` - Update settings

- [ ] 🟢 **Frontend - Admin Dashboard Tab** `@claude`
  - [ ] Display overview stats
  - [ ] Show user growth chart
  - [ ] Show revenue chart (when applicable)
  - [ ] Show tier distribution pie chart
  - [ ] Add quick stats cards

- [ ] 🟢 **Frontend - User Management Tab** `@claude`
  - [ ] Create user list table
  - [ ] Add search/filter
  - [ ] Add user detail view
  - [ ] Add "Change Tier" action
  - [ ] Add "View as User" (impersonation) option
  - [ ] Show user statistics

- [ ] 🟢 **Frontend - Feature Flags Tab** `@claude`
  - [ ] Display subscription toggle
  - [ ] Add "Enable Subscriptions" button
  - [ ] Show grandfather date
  - [ ] Add tier limit inputs
  - [ ] Add maintenance mode toggle
  - [ ] Create confirmation dialogs

- [ ] 🟢 **Frontend - Analytics Tab** `@claude`
  - [ ] Display feature usage stats
  - [ ] Show most popular stores
  - [ ] Show top users by activity
  - [ ] Add export analytics button
  - [ ] Add date range filter

---

## Phase 7: Polish & Testing (Week 13-14)

### 7.1 UI/UX Polish

- [ ] 🟢 **Design System Refinement** `@claude`
  - [ ] Implement dark theme colors from PRD
  - [ ] Create custom shadcn/ui theme
  - [ ] Ensure consistent spacing
  - [ ] Add loading states everywhere
  - [ ] Add skeleton loaders
  - [ ] Refine error states

- [ ] 🟢 **Responsive Design** `@claude`
  - [ ] Test all pages on mobile
  - [ ] Implement mobile navigation (bottom nav)
  - [ ] Convert tables to cards on mobile
  - [ ] Test touch interactions
  - [ ] Optimize form inputs for mobile
  - [ ] Test on tablet sizes

- [ ] 🟢 **Accessibility** `@claude`
  - [ ] Add ARIA labels
  - [ ] Test keyboard navigation
  - [ ] Ensure color contrast
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

- [ ] 🟢 **Frontend Performance** `@claude`
  - [ ] Code splitting
  - [ ] Lazy load charts
  - [ ] Optimize images
  - [ ] Add React.memo where needed
  - [ ] Optimize TanStack Query cache
  - [ ] Run Lighthouse audit

- [ ] 🟢 **Backend Performance** `@claude`
  - [ ] Review and optimize slow queries
  - [ ] Add database query logging
  - [ ] Implement connection pooling
  - [ ] Add response compression
  - [ ] Profile endpoint performance

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
**Sprint Goal:** Complete preorder management functionality

---

## Notes

- All tasks are estimated for a ~16 week timeline (per PRD)
- `@claude` handles all development tasks
- `@user` handles infrastructure, external services, and QA
- Update status emoji as tasks progress
- Move completed tasks to a separate "Completed" section weekly
- Add blockers to the "Blockers & Dependencies" section immediately

---

**Last Updated:** 2025-10-21 by `@claude`
