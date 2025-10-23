# TCG Preorder Tracker - Development Tasks

**Project Status:** 🟢 Phase 1 Complete + MVP Core Features Working!
**Last Updated:** 2025-10-21
**Sprint:** Phase 1 - Foundation (✅ COMPLETE) | Phase 2 - Core Features (🟡 IN PROGRESS)

**Milestone Achieved:** ✅ Minimum Viable Product - Create and List Preorders Working!

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

- [ ] 🟢 **Backend - Query Parameters** `@claude`
  - [ ] Add search query parameter (product_name, store_name, notes)
  - [ ] Add status filter
  - [ ] Add store filter (multi-select)
  - [ ] Add date range filter
  - [ ] Add amount_owing filter
  - [ ] Add sorting parameters
  - [ ] Optimize queries with indexes

- [ ] 🟢 **Frontend - Search & Filter UI** `@claude`
  - [ ] Create search bar component
  - [ ] Create filter bar component
  - [ ] Add store multi-select dropdown
  - [ ] Add status filter dropdown
  - [ ] Add date range picker (with presets)
  - [ ] Add "Amount Owing" toggle
  - [ ] Show active filters as removable chips
  - [ ] Update URL query params

- [ ] 🟢 **Frontend - Sorting UI** `@claude`
  - [ ] Add sort icons to table headers
  - [ ] Toggle ascending/descending
  - [ ] Update URL query params
  - [ ] Persist sort state

### 2.4 Dashboard & Analytics

- [ ] 🟢 **Backend - Statistics Endpoint** `@claude`
  - [ ] GET `/api/v1/statistics` endpoint
  - [ ] Calculate total preorders
  - [ ] Calculate pending/delivered/sold counts
  - [ ] Calculate total cost
  - [ ] Calculate amount owing
  - [ ] Calculate total profit
  - [ ] Add caching for performance

- [ ] 🟢 **Backend - Analytics Endpoints** `@claude`
  - [ ] GET `/api/v1/analytics/spending-by-store`
  - [ ] GET `/api/v1/analytics/status-overview`
  - [ ] GET `/api/v1/analytics/profit-by-store`
  - [ ] GET `/api/v1/analytics/monthly-spending`
  - [ ] Apply filters to analytics

- [ ] 🟢 **Frontend - Summary Cards** `@claude`
  - [ ] Create stat card component
  - [ ] Display total preorders
  - [ ] Display pending/delivered/sold
  - [ ] Display total cost
  - [ ] Display amount owing
  - [ ] Display total profit
  - [ ] Add loading skeletons

- [ ] 🟢 **Frontend - Charts** `@claude`
  - [ ] Setup Recharts
  - [ ] Create "Spending by Store" pie chart
  - [ ] Create "Status Overview" donut chart
  - [ ] Create "Profit by Store" bar chart
  - [ ] Create "Monthly Spending" line chart
  - [ ] Make charts responsive
  - [ ] Add interactive tooltips

- [ ] 🟢 **Frontend - Dashboard Page** `@claude`
  - [ ] Create dashboard layout
  - [ ] Add summary cards grid
  - [ ] Add charts grid (2x2)
  - [ ] Add quick actions section
  - [ ] Test with filters

---

## Phase 3: Advanced Features (Weeks 5-6)

### 3.1 Bulk Operations

- [ ] 🟢 **Backend - Bulk Endpoints** `@claude`
  - [ ] POST `/api/v1/preorders/bulk-delete`
  - [ ] PATCH `/api/v1/preorders/bulk-update-status`
  - [ ] PATCH `/api/v1/preorders/bulk-update`
  - [ ] Add transaction support
  - [ ] Add progress tracking

- [ ] 🟢 **Frontend - Bulk Selection** `@claude`
  - [ ] Add checkboxes to table rows
  - [ ] Add "Select All" checkbox
  - [ ] Create bulk action toolbar
  - [ ] Add bulk delete button
  - [ ] Add bulk status update dropdown
  - [ ] Add confirmation modals
  - [ ] Show progress indicators

### 3.2 Import / Export

- [ ] 🟢 **Backend - CSV Export** `@claude`
  - [ ] GET `/api/v1/export/csv` endpoint
  - [ ] Support filtered export
  - [ ] Support selected IDs export
  - [ ] Include all columns + computed fields
  - [ ] Stream large exports

- [ ] 🟢 **Backend - CSV Import** `@claude`
  - [ ] POST `/api/v1/import/csv` endpoint
  - [ ] Validate CSV structure
  - [ ] Validate data types
  - [ ] Handle duplicates (skip/update/add)
  - [ ] Return import summary (success/failed rows)
  - [ ] Add error reporting

- [ ] 🟢 **Backend - PDF Report** `@claude`
  - [ ] Install reportlab
  - [ ] POST `/api/v1/export/pdf` endpoint
  - [ ] Generate summary statistics section
  - [ ] Embed charts as images
  - [ ] Add detailed tables (pending/delivered/sold)
  - [ ] Professional formatting
  - [ ] Return PDF file

- [ ] 🟢 **Frontend - Export UI** `@claude`
  - [ ] Add "Export CSV" button with options
  - [ ] Add "Generate PDF Report" button
  - [ ] Show export progress
  - [ ] Trigger file download
  - [ ] Add success notifications

- [ ] 🟢 **Frontend - Import UI** `@claude`
  - [ ] Add "Import CSV" button
  - [ ] Create file upload dialog
  - [ ] Show preview before import
  - [ ] Add duplicate handling options
  - [ ] Show import results (success/errors)
  - [ ] Display error details for failed rows

### 3.3 Backup & Restore

- [ ] 🟢 **Backend - Backup Endpoints** `@claude`
  - [ ] GET `/api/v1/backup/create` - Manual backup (JSON)
  - [ ] POST `/api/v1/backup/restore` - Restore from JSON
  - [ ] Add backup validation
  - [ ] Add merge vs replace options
  - [ ] Create safety backup before restore

- [ ] 🟢 **Backend - Auto Backup Service** `@claude`
  - [ ] Create background job for daily backups
  - [ ] Store backups in Supabase Storage
  - [ ] Implement 7-day retention policy
  - [ ] Add backup cleanup job

- [ ] 🟢 **Supabase Storage Setup** `@user`
  - [ ] Create storage bucket for backups
  - [ ] Configure bucket policies
  - [ ] Provide access credentials to `@claude`

- [ ] 🟢 **Frontend - Backup UI** `@claude`
  - [ ] Add "Create Backup" button
  - [ ] Add "Restore from Backup" button
  - [ ] Create restore preview modal
  - [ ] Add confirmation dialogs
  - [ ] Show backup/restore progress

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
