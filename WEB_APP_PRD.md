# TCG Preorder Tracker - Web Application PRD

**Product Requirements Document**
**Version:** 1.0
**Date:** October 21, 2025
**Status:** Draft

---

## Executive Summary

Transform the successful TCG Preorder Tracker desktop application into a modern cloud-based web application with multi-device access, real-time sync, and subscription-based monetization.

### Vision
Provide TCG collectors and resellers with a professional, accessible, cloud-based solution for tracking preorders across all their devices with advanced analytics and reporting.

### Success Metrics
- **Phase 1 (Beta - Month 0-3):** 100+ active users, all features free
- **Phase 2 (Launch - Month 3+):** 500+ active users, 10% conversion to paid tiers
- **Phase 3 (Growth - Month 6+):** 2,000+ active users, $2,000+ MRR

---

## 1. Product Overview

### 1.1 Target Users

**Primary Persona: TCG Collector**
- Age: 18-45
- Collects and preorders TCG products (Pokemon, Magic, Yu-Gi-Oh!, etc.)
- Tracks 10-100+ preorders across multiple stores
- Wants to manage payments and release dates
- Values: Organization, financial tracking, notifications

**Secondary Persona: TCG Reseller**
- Age: 25-55
- Buys sealed product to resell
- Tracks 50-500+ items with profit calculations
- Needs: Bulk operations, detailed analytics, PDF reports
- Values: Profit tracking, professional reports, efficiency

### 1.2 Core Value Proposition

**For Collectors:**
"Never miss a release or forget how much you owe. Track all your TCG preorders in one beautiful, accessible app."

**For Resellers:**
"Professional inventory and profit tracking for your TCG business, accessible anywhere."

---

## 2. Technical Architecture

### 2.1 Tech Stack

**Frontend**
- Framework: Next.js 14 (App Router)
- Language: TypeScript
- UI Library: shadcn/ui + Tailwind CSS
- Charts: Recharts
- State Management: TanStack Query (React Query)
- Forms: React Hook Form + Zod validation
- Hosting: Vercel

**Backend**
- Framework: FastAPI (Python 3.10+)
- ORM: SQLAlchemy
- Database: Supabase (PostgreSQL)
- File Storage: Supabase Storage
- Hosting: Railway

**Authentication**
- Provider: Clerk
- Features: Email/password, OAuth (Google, GitHub), user management

**Payments**
- Provider: Stripe
- Features: Subscriptions, customer portal, webhooks

**Email**
- Provider: Resend
- Use Cases: Notifications, password resets, receipts

### 2.2 System Architecture

```
┌─────────────────────────────────────────┐
│           User's Browser                 │
│     Next.js 14 (TypeScript + React)     │
│  - Clerk Auth Components                │
│  - shadcn/ui + Tailwind CSS             │
│  - Recharts Visualizations              │
│  - TanStack Query for API calls         │
└──────────────────┬──────────────────────┘
                   │ REST API (HTTPS)
                   │ Auth: Clerk JWT tokens
                   ↓
┌─────────────────────────────────────────┐
│        FastAPI Backend (Python)          │
│  - Clerk token verification             │
│  - Business logic (from desktop app)    │
│  - PDF generation (reportlab)           │
│  - CSV import/export                    │
│  - Statistics calculations              │
└──────────────────┬──────────────────────┘
                   │ SQL + Storage
                   ↓
┌─────────────────────────────────────────┐
│      Supabase (PostgreSQL + Storage)     │
│  - User profiles                         │
│  - Preorder data                         │
│  - Subscription info                     │
│  - System settings (admin panel)        │
│  - File storage (PDFs, exports)         │
└─────────────────────────────────────────┘

External Services:
- Clerk (Authentication)
- Stripe (Payments & Subscriptions)
- Resend (Transactional Emails)
```

### 2.3 Database Schema

```sql
-- Users (synced from Clerk via webhooks)
users (
  id TEXT PRIMARY KEY,              -- Clerk user ID
  email TEXT UNIQUE NOT NULL,
  first_name TEXT,
  last_name TEXT,
  tier TEXT DEFAULT 'free' CHECK (tier IN ('free', 'basic', 'pro')),
  is_grandfathered BOOLEAN DEFAULT FALSE,  -- Early users get free forever
  is_admin BOOLEAN DEFAULT FALSE,
  stripe_customer_id TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Subscriptions (managed via Stripe webhooks)
subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  stripe_customer_id TEXT UNIQUE,
  stripe_subscription_id TEXT UNIQUE,
  tier TEXT CHECK (tier IN ('free', 'basic', 'pro')),
  status TEXT CHECK (status IN ('active', 'cancelled', 'past_due', 'trialing')),
  current_period_end TIMESTAMP,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Preorders (core data model)
preorders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,

  -- Product info
  product_name TEXT NOT NULL,
  product_url TEXT,
  quantity INTEGER DEFAULT 1 CHECK (quantity > 0),
  store_name TEXT NOT NULL,

  -- Financial
  cost_per_item DECIMAL(10,2) NOT NULL,
  amount_paid DECIMAL(10,2) DEFAULT 0,
  sold_price DECIMAL(10,2),

  -- Status
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Delivered', 'Sold')),

  -- Dates
  release_date DATE,
  order_date DATE DEFAULT CURRENT_DATE,

  -- Notes
  notes TEXT,

  -- Computed (virtual columns)
  total_cost DECIMAL(10,2) GENERATED ALWAYS AS (cost_per_item * quantity) STORED,
  amount_owing DECIMAL(10,2) GENERATED ALWAYS AS (cost_per_item * quantity - amount_paid) STORED,
  profit DECIMAL(10,2) GENERATED ALWAYS AS (sold_price - (cost_per_item * quantity)) STORED,
  profit_margin DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE
      WHEN sold_price > 0 THEN ((sold_price - (cost_per_item * quantity)) / sold_price * 100)
      ELSE 0
    END
  ) STORED,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- System Settings (Admin Panel)
system_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  description TEXT,
  updated_by TEXT REFERENCES users(id),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Analytics Events
analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,  -- 'preorder_created', 'pdf_exported', etc.
  event_data JSONB,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_preorders_user_id ON preorders(user_id);
CREATE INDEX idx_preorders_status ON preorders(status);
CREATE INDEX idx_preorders_created_at ON preorders(created_at DESC);
CREATE INDEX idx_subscriptions_user_id ON subscriptions(user_id);
CREATE INDEX idx_subscriptions_stripe_customer ON subscriptions(stripe_customer_id);
CREATE INDEX idx_analytics_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_created_at ON analytics_events(created_at DESC);
```

---

## 3. Feature Specifications

### 3.1 Authentication & User Management (Clerk)

**User Registration**
- Email/password signup
- OAuth: Google, GitHub (optional)
- Email verification required
- Welcome email sent via Resend

**User Login**
- Email/password
- OAuth providers
- "Remember me" option
- Password reset via email

**User Profile**
- View/edit name, email
- Change password
- Delete account (with confirmation)
- View subscription status

**Session Management**
- JWT tokens from Clerk
- Automatic refresh
- Logout clears session

### 3.2 Core Preorder Management (CRUD)

**Create Preorder**
- Form fields:
  - Product Name* (required)
  - Product URL (optional, validates URL format)
  - Quantity* (required, min: 1)
  - Store Name* (required, autocomplete from common stores)
  - Cost Per Item* (required, validates decimal)
  - Amount Paid (optional, validates decimal)
  - Release Date (optional, date picker)
  - Order Date (defaults to today)
  - Notes (optional, multi-line textarea)
  - Status (dropdown: Pending, Delivered, Sold)
- Auto-calculated: Total Cost, Amount Owing
- Validation: Zod schema on frontend, Pydantic on backend
- Success: Redirect to preorders list with success toast

**Read Preorders**
- **Table View** (default):
  - Columns: Product, Store, Quantity, Cost/Item, Total, Paid, Owing, Status, Release Date
  - Sortable columns (click header to sort)
  - Pagination: 50 items per page
  - Responsive: Collapses to cards on mobile
- **Card View** (mobile):
  - Product name, store, status badge
  - Total cost, amount owing
  - Release date
  - Expandable for details

**Update Preorder**
- Click row to open edit modal
- Same form as Create
- Pre-filled with existing data
- Save updates, cancel discards changes
- Success: Toast notification, table refreshes

**Delete Preorder**
- Click delete icon
- Confirmation modal: "Are you sure? This cannot be undone."
- Success: Toast notification, row removes from table
- Soft delete option for admins (future)

**Bulk Operations**
- Select multiple rows (checkboxes)
- Actions:
  - Bulk Delete
  - Bulk Mark as Delivered
  - Bulk Mark as Pending
  - Bulk Edit (change store, dates, costs)
- Confirmation before bulk actions
- Progress indicator for large batches

### 3.3 Filtering & Search

**Search Bar**
- Real-time search as user types
- Searches: Product name, store name, notes
- Debounced (300ms) to reduce API calls
- Clear button to reset

**Filters**
- **Store Filter**: Dropdown, multi-select
- **Status Filter**: All / Pending / Delivered / Sold
- **Date Range**:
  - Presets: Last 7 days, Last 30 days, Last 90 days, This month, Last month, This quarter, Custom range
  - Date picker for custom range
- **Amount Owing**: Show only items with outstanding balance
- Active filters shown as chips, removable

**Sorting**
- Click column header to sort
- Toggle: Ascending ↑ / Descending ↓
- Sort by: Product, Store, Cost, Release Date, Order Date, Status

### 3.4 Dashboard & Analytics

**Summary Cards** (Top of page)
- Total Preorders
- Pending Orders
- Delivered Items
- Sold Items
- Total Cost (all)
- Amount Owing
- Total Profit (sold items)

**Charts** (Dashboard tab)
1. **Spending by Store** (Pie Chart)
   - Shows distribution of spending across stores
   - Interactive: Click slice to filter table

2. **Status Overview** (Donut Chart)
   - Pending vs. Delivered vs. Sold
   - Center shows total item count

3. **Profit by Store** (Bar Chart)
   - Horizontal bars
   - Green for profit, red for loss
   - Only shows sold items

4. **Monthly Spending Trend** (Line Chart)
   - X-axis: Months
   - Y-axis: Total spending
   - Hover shows exact amounts

**Filters Apply to Charts**
- Charts update based on active filters
- Useful for analyzing specific stores or date ranges

### 3.5 Import / Export

**CSV Export**
- Button: "Export to CSV"
- Options:
  - Export All Preorders
  - Export Current View (filtered data)
  - Export Selected Items (if rows selected)
- Columns: All data fields + computed columns
- Filename: `tcg_preorders_YYYY-MM-DD.csv`
- Downloads immediately

**CSV Import**
- Button: "Import from CSV"
- File upload dialog
- Validation:
  - Check required columns
  - Validate data types
  - Show errors for invalid rows
- Preview before import
- Options:
  - Skip duplicates (by product name + store)
  - Update existing
  - Add all as new
- Success: Show count of imported items

**PDF Reports**
- Button: "Generate PDF Report"
- Includes:
  - Summary statistics
  - All 4 charts (as images)
  - Detailed tables (Pending, Delivered, Sold)
- Professional formatting
- Filename: `TCG_Report_YYYY-MM-DD.pdf`
- Download or email option (future)

### 3.6 Backup & Restore

**Auto-Backup**
- Automatic daily backup to Supabase Storage
- Retention: Last 7 backups
- JSON format: Full data export

**Manual Backup**
- Button: "Create Backup"
- Downloads JSON file: `backup_YYYY-MM-DD_HHMMSS.json`
- Includes all user's preorders + metadata

**Restore from Backup**
- Button: "Restore from Backup"
- Upload JSON file
- Preview data before restore
- Options:
  - Replace all data
  - Merge with existing (skip duplicates)
- Confirmation required
- Creates backup before restore (safety)

### 3.7 Notifications (Email)

**Release Reminders**
- Sent X days before release date (user configurable: 1, 3, 7, 14 days)
- Subject: "Reminder: [Product Name] releases in X days"
- Body: Product details, store, amount owing
- CTA: "View Preorder" (link to app)

**Payment Reminders**
- Sent when amount owing > $X (configurable threshold)
- Daily digest: Lists all items with outstanding balance
- Subject: "You have X preorders with outstanding payments"

**Digest Options**
- Weekly summary: Total preorders, spending, upcoming releases
- Monthly summary: Stats, charts, insights

**Email Preferences**
- Settings page: Enable/disable each notification type
- Frequency: Immediate, Daily digest, Weekly digest
- Unsubscribe link in all emails

### 3.8 User Settings

**Account Settings**
- Name, email (synced with Clerk)
- Password change (via Clerk)
- Profile picture (Clerk avatar)

**Notification Preferences**
- Release reminders: On/Off, Days before
- Payment reminders: On/Off, Threshold amount
- Email frequency: Immediate, Daily, Weekly
- Digest day: Monday-Sunday (for weekly)

**Data Settings**
- Export all data (CSV/JSON)
- Import data (CSV/JSON)
- Delete all data (confirmation required)

**Subscription Management**
- Current tier display
- Upgrade/Downgrade buttons
- Billing history
- Cancel subscription (Stripe portal)

---

## 4. Subscription & Monetization

### 4.1 Pricing Strategy

**Launch Phase (Month 0-3): FREE FOR ALL**
- All features unlocked
- No payment required
- Build user base
- Collect feedback
- Grandfather early users

**Post-Launch Tiers:**

| Feature | Free (Grandfathered) | Free (New Users) | Basic ($5/mo) | Pro ($15/mo) |
|---------|---------------------|------------------|---------------|--------------|
| Preorders | Unlimited | 10 max | 100 max | Unlimited |
| Dashboard Charts | ✅ | Basic only | ✅ | ✅ |
| CSV Export | ✅ | ✅ | ✅ | ✅ |
| CSV Import | ✅ | ❌ | ✅ | ✅ |
| PDF Reports | ✅ | ❌ | ✅ | ✅ |
| Bulk Operations | ✅ | ❌ | ✅ | ✅ |
| Email Notifications | ✅ | ❌ | ✅ | ✅ |
| Backup/Restore | ✅ | Manual only | Auto + Manual | Auto + Manual |
| Priority Support | ✅ | ❌ | ❌ | ✅ |
| API Access (Future) | ✅ | ❌ | ❌ | ✅ |

### 4.2 Feature Flags (Admin Panel)

**System Settings** (Controlled by Admin)
```json
{
  "subscriptions_enabled": false,  // Toggle to enable paid tiers
  "grandfather_date": null,         // Set when enabling subscriptions
  "free_tier_limits": {
    "max_preorders": null,          // null = unlimited during beta
    "features": ["all"]
  },
  "basic_tier_limits": {
    "max_preorders": 100,
    "features": ["all"]
  },
  "pro_tier_limits": {
    "max_preorders": null,          // Unlimited
    "features": ["all", "priority_support", "api_access"]
  }
}
```

**Grandfathering Logic**
1. Admin enables subscriptions via admin panel
2. System sets `grandfather_date` to current timestamp
3. All existing users marked as `is_grandfathered = true`
4. Grandfathered users: Free forever, all features
5. New users after cutoff: Subject to free tier limits

### 4.3 Stripe Integration

**Checkout Flow**
1. User clicks "Upgrade to Basic/Pro"
2. Redirect to Stripe Checkout
3. Pre-filled email from Clerk
4. Payment methods: Card, Google Pay, Apple Pay
5. Success: Redirect to app with success message
6. Webhook updates subscription in database

**Subscription Management**
- Stripe Customer Portal for:
  - Update payment method
  - View invoices
  - Change subscription tier
  - Cancel subscription
- Cancellation: Remains active until period end

**Webhooks** (Handle via FastAPI)
- `checkout.session.completed`: Create subscription
- `customer.subscription.updated`: Update tier/status
- `customer.subscription.deleted`: Downgrade to free
- `invoice.payment_succeeded`: Send receipt email
- `invoice.payment_failed`: Send warning email

---

## 5. Admin Panel

### 5.1 Access Control

**Admin Users**
- Manually set via database: `UPDATE users SET is_admin = true WHERE email = 'admin@example.com'`
- Admin panel only visible to admins
- Route: `/admin` (protected, 403 for non-admins)

### 5.2 Dashboard

**Overview Stats**
- Total Users (all time)
- Active Users (last 7/30 days)
- New Users (this week/month)
- Total Preorders Created
- Total Revenue (when subscriptions enabled)
- MRR (Monthly Recurring Revenue)
- Churn Rate

**Charts**
- User Growth (line chart)
- Revenue Growth (line chart)
- Subscription Tier Distribution (pie chart)

### 5.3 Feature Flags

**Subscriptions**
- Toggle: Enable/Disable Subscriptions
- When enabled: Sets grandfather date, marks existing users
- Warning: "This cannot be undone. Existing users will be grandfathered."

**Tier Limits**
- Free Tier: Max preorders (input number or "Unlimited")
- Basic Tier: Max preorders
- Pro Tier: Always unlimited
- Save button applies changes globally

**Maintenance Mode**
- Toggle: Enable/Disable Maintenance Mode
- When enabled: Shows maintenance page to all users except admins
- Custom message field

### 5.4 User Management

**User List**
- Table with columns: Email, Name, Tier, Joined Date, Last Active, Preorders Count
- Search by email
- Filter by tier, grandfathered status
- Sort by any column

**User Actions**
- View user details
- Manually change tier (override Stripe)
- Grant free upgrade
- Impersonate user (view app as them, for support)
- Delete user (soft delete, can recover)

### 5.5 Analytics

**Usage Metrics**
- Feature usage (PDF exports, bulk operations, etc.)
- Average preorders per user
- Most popular stores
- Top users by activity

**Export Analytics**
- Download CSV of analytics events
- Date range selector
- Filter by event type

---

## 6. Analytics & Tracking

### 6.1 Events to Track

**User Events**
- `user_signed_up`: New user registration
- `user_logged_in`: User login
- `user_logged_out`: User logout
- `user_upgraded`: Subscription tier change
- `user_cancelled`: Subscription cancellation

**Preorder Events**
- `preorder_created`: New preorder added
- `preorder_updated`: Preorder edited
- `preorder_deleted`: Preorder deleted
- `preorder_marked_delivered`: Status changed to Delivered
- `preorder_marked_sold`: Status changed to Sold

**Feature Usage Events**
- `csv_exported`: CSV export used
- `csv_imported`: CSV import used
- `pdf_generated`: PDF report generated
- `bulk_operation`: Bulk action performed
- `backup_created`: Manual backup created
- `backup_restored`: Backup restored

**Admin Events**
- `feature_flag_changed`: Admin changed system setting
- `user_tier_overridden`: Admin manually changed user tier

### 6.2 Analytics Storage

**Database Table**: `analytics_events`
```sql
{
  id: UUID,
  user_id: TEXT,
  event_type: TEXT,
  event_data: JSONB,  -- Additional context
  created_at: TIMESTAMP
}
```

**Event Data Examples**:
```json
// preorder_created
{
  "preorder_id": "uuid",
  "store_name": "EB Games",
  "total_cost": 159.99
}

// csv_exported
{
  "row_count": 45,
  "export_type": "all" | "filtered" | "selected"
}
```

### 6.3 Analytics Queries

**Admin Dashboard Queries**
- Total users: `SELECT COUNT(*) FROM users`
- Active users (30d): `SELECT COUNT(DISTINCT user_id) FROM analytics_events WHERE created_at > NOW() - INTERVAL '30 days'`
- New users (this week): `SELECT COUNT(*) FROM users WHERE created_at > DATE_TRUNC('week', NOW())`
- Total preorders: `SELECT COUNT(*) FROM preorders`
- Average preorders per user: `SELECT AVG(count) FROM (SELECT COUNT(*) as count FROM preorders GROUP BY user_id)`

---

## 7. User Interface Design

### 7.1 Design System

**Colors** (Dark Theme - Matching Desktop App)
- Background: `#1E1E2E` (dark)
- Surface: `#2A2A3E` (cards, modals)
- Primary: `#8B5CF6` (purple)
- Secondary: `#06B6D4` (cyan/blue)
- Accent: `#F59E0B` (amber/orange)
- Success: `#10B981` (green)
- Error: `#EF4444` (red)
- Text: `#E5E7EB` (light gray)
- Text Muted: `#9CA3AF` (gray)

**Typography**
- Font: Inter (clean, modern)
- Headings: Bold, larger sizes
- Body: Regular, 14-16px
- Code/Monospace: JetBrains Mono

**Components** (shadcn/ui)
- Buttons, Inputs, Dropdowns, Modals
- Tables, Cards, Badges
- Toasts, Alerts, Progress bars
- All styled with Tailwind CSS

### 7.2 Page Layouts

**Navigation**
- Sidebar (desktop): Logo, Dashboard, Preorders, Analytics, Settings, Admin (if admin)
- Mobile: Bottom nav bar
- User menu (top right): Profile, Settings, Logout

**Dashboard Page**
- Summary cards (top)
- Charts (4 in grid)
- Quick actions: Add Preorder, Export, etc.

**Preorders Page**
- Filters bar (top)
- Search + filter chips
- Table or Card view toggle
- Add Preorder button (floating action button on mobile)
- Pagination (bottom)

**Settings Page**
- Tabs: Account, Notifications, Data, Subscription
- Each tab: Form with save button

**Admin Page**
- Tabs: Dashboard, Feature Flags, User Management, Analytics
- Restricted to admins only

### 7.3 Responsive Design

**Breakpoints**
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

**Mobile Optimizations**
- Sidebar → Bottom nav
- Table → Cards
- Multi-column → Single column
- Touch-friendly buttons (min 44x44px)
- Swipe gestures for actions

---

## 8. Performance Requirements

### 8.1 Frontend Performance

**Targets**
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Time to Interactive (TTI): < 3.5s
- Cumulative Layout Shift (CLS): < 0.1

**Optimizations**
- Next.js SSR for initial load
- Image optimization (next/image)
- Code splitting (dynamic imports)
- Lazy loading for charts
- TanStack Query caching

### 8.2 Backend Performance

**Targets**
- API Response Time: < 200ms (p95)
- Database Query Time: < 100ms (p95)
- PDF Generation: < 3s

**Optimizations**
- Database indexes on user_id, created_at, status
- Pagination: Max 50 items per request
- Async/await for I/O operations
- Connection pooling (SQLAlchemy)
- Caching with Redis (future)

### 8.3 Scalability

**Initial Scale** (Month 1-6)
- Users: 100-1,000
- Preorders: 10,000-100,000
- Database: < 1GB
- Bandwidth: < 50GB/month

**Growth Scale** (Month 6-12)
- Users: 1,000-10,000
- Preorders: 100,000-1,000,000
- Database: 1-10GB
- Bandwidth: 50-500GB/month

**Infrastructure**
- Vercel: Auto-scales frontend
- Railway: Start with 1 instance, scale horizontally
- Supabase: Handles up to 1M requests/day on free tier

---

## 9. Security & Privacy

### 9.1 Authentication Security

**Clerk Handles**
- Password hashing (bcrypt)
- JWT token signing/verification
- Session management
- Rate limiting on login attempts

**Backend Verification**
- Every API request verifies Clerk JWT
- Extract user_id from token
- No access without valid token

### 9.2 Data Privacy

**User Data Isolation**
- Row-level security: Users can only access their own preorders
- SQL: `WHERE user_id = current_user_id`
- No cross-user data leakage

**PII Handling**
- Email, name stored in Clerk (encrypted at rest)
- No payment data stored (handled by Stripe)
- GDPR compliant: User can export/delete all data

### 9.3 API Security

**Rate Limiting**
- Authenticated requests: 100 req/minute per user
- Unauthenticated: 10 req/minute per IP
- Implemented via FastAPI middleware

**Input Validation**
- Frontend: Zod schemas
- Backend: Pydantic models
- SQL injection: SQLAlchemy ORM (parameterized queries)
- XSS: React auto-escapes, CSP headers

**HTTPS Only**
- All traffic encrypted (TLS 1.3)
- HSTS headers
- Secure cookies

---

## 10. Testing Strategy

### 10.1 Frontend Testing

**Unit Tests** (Vitest + React Testing Library)
- Components render correctly
- Form validation works
- Utility functions correct

**Integration Tests**
- User flows: Sign up → Add preorder → View dashboard
- API mocking (MSW)

**E2E Tests** (Playwright)
- Critical paths: Sign up, CRUD operations, checkout
- Run before deploy

### 10.2 Backend Testing

**Unit Tests** (pytest)
- Business logic functions
- Data models
- Statistics calculations

**Integration Tests**
- API endpoints
- Database operations
- Clerk token verification

**Load Tests** (Locust)
- 100 concurrent users
- 1000 req/min sustained

### 10.3 Manual QA

**Pre-Launch Checklist**
- [ ] Sign up / Login flows
- [ ] CRUD operations (all)
- [ ] Filters & search
- [ ] CSV import/export
- [ ] PDF generation
- [ ] Subscription checkout (Stripe test mode)
- [ ] Email notifications (Resend test mode)
- [ ] Mobile responsive
- [ ] Cross-browser (Chrome, Firefox, Safari)
- [ ] Admin panel

---

## 11. Deployment & DevOps

### 11.1 Environments

**Development**
- Local: `localhost:3000` (frontend), `localhost:8000` (backend)
- Database: Local PostgreSQL or Supabase dev project

**Staging**
- Frontend: `staging.tcgtracker.app` (Vercel preview)
- Backend: Railway staging environment
- Database: Supabase staging project
- Stripe: Test mode
- Resend: Test mode

**Production**
- Frontend: `app.tcgtracker.app` (Vercel)
- Backend: `api.tcgtracker.app` (Railway)
- Database: Supabase production project
- Stripe: Live mode
- Resend: Live mode

### 11.2 CI/CD Pipeline

**GitHub Actions Workflow**

**Frontend (Next.js)**
1. Push to `main` → Trigger Vercel deploy
2. Run tests (unit + E2E)
3. Build Next.js app
4. Deploy to Vercel
5. Run smoke tests on deployed URL

**Backend (FastAPI)**
1. Push to `main` → Trigger Railway deploy
2. Run tests (unit + integration)
3. Build Docker image
4. Push to Railway
5. Run health check

### 11.3 Monitoring

**Frontend** (Vercel Analytics)
- Page views
- Performance metrics (Core Web Vitals)
- Error tracking

**Backend** (Railway + Sentry)
- API response times
- Error rates
- Database query performance
- Python exceptions (Sentry)

**Database** (Supabase Dashboard)
- Query performance
- Connection pool usage
- Storage usage

**Alerts**
- Error rate > 5%: Slack notification
- API response time > 1s: Email alert
- Database connections > 80%: Alert

---

## 12. Launch Plan

### Phase 1: Development (Weeks 1-8)

**Week 1-2: Foundation**
- Set up Next.js + FastAPI projects
- Configure Supabase, Clerk, Vercel, Railway
- Database schema + migrations
- Basic auth flow (sign up, login)

**Week 3-4: Core Features**
- CRUD operations (preorders)
- Filtering, search, sorting
- Dashboard with summary cards

**Week 5-6: Advanced Features**
- Charts (Recharts integration)
- CSV import/export
- Bulk operations

**Week 7-8: Polish**
- PDF reports
- Notifications (email)
- Settings page
- Mobile responsive

### Phase 2: Beta Testing (Weeks 9-12)

**Week 9: Internal Testing**
- Deploy to staging
- Test all features
- Fix critical bugs

**Week 10-11: Private Beta**
- Invite 20-50 beta users
- Collect feedback
- Monitor performance
- Fix bugs

**Week 12: Public Beta**
- Open sign-ups (still free)
- Announce on Reddit, Twitter
- Collect testimonials

### Phase 3: Production Launch (Week 13+)

**Week 13: Final Prep**
- Load testing
- Security audit
- Documentation
- Support docs/FAQs

**Week 14: Launch**
- Deploy to production
- Announce publicly
- Monitor closely
- Support users

**Month 2-3: Iteration**
- Fix issues
- Add small features based on feedback
- Prepare for monetization

**Month 4: Enable Subscriptions**
- Grandfather existing users
- Enable feature flags
- Set up Stripe prices
- Announce paid tiers
- Launch marketing campaign

---

## 13. Success Metrics & KPIs

### 13.1 User Metrics

**Acquisition**
- Sign-ups per week
- Traffic sources (organic, social, referral)
- Conversion rate (visitor → sign-up)

**Engagement**
- Daily Active Users (DAU)
- Weekly Active Users (WAU)
- Monthly Active Users (MAU)
- Average preorders per user
- Average session duration

**Retention**
- Day 1 retention: 50%+
- Day 7 retention: 30%+
- Day 30 retention: 20%+

### 13.2 Revenue Metrics (Post-Monetization)

**Conversion**
- Free → Paid conversion rate: 10% target
- Trial → Paid conversion rate: 30% target

**Revenue**
- Monthly Recurring Revenue (MRR)
- Average Revenue Per User (ARPU)
- Customer Lifetime Value (LTV)

**Churn**
- Monthly churn rate: < 5% target
- Cancellation reasons (track via survey)

### 13.3 Product Metrics

**Feature Adoption**
- % of users who create a preorder
- % of users who export CSV
- % of users who generate PDF report
- % of users with email notifications enabled

**Performance**
- API response time (p50, p95, p99)
- Error rate (< 1% target)
- Uptime (99.9% target)

---

## 14. Risk Assessment

### 14.1 Technical Risks

**Risk: Poor Performance with Scale**
- Mitigation: Load testing, database indexing, caching
- Contingency: Upgrade hosting tier, optimize queries

**Risk: Data Loss**
- Mitigation: Automatic backups, point-in-time recovery (Supabase)
- Contingency: Restore from backup

**Risk: Security Breach**
- Mitigation: Clerk handles auth, input validation, HTTPS, monitoring
- Contingency: Incident response plan, notify users

### 14.2 Business Risks

**Risk: Low User Adoption**
- Mitigation: Free tier, marketing, community building
- Contingency: Pivot features, adjust pricing

**Risk: High Churn**
- Mitigation: Great UX, responsive support, continuous improvement
- Contingency: User interviews, feature adjustments

**Risk: Competitor Launch**
- Mitigation: Unique features (admin panel, grandfathering), fast iteration
- Contingency: Differentiate, lower pricing

### 14.3 Operational Risks

**Risk: Infrastructure Costs Exceed Revenue**
- Mitigation: Monitor costs, optimize, free tier limits
- Contingency: Reduce free tier, increase prices

**Risk: Support Overwhelm**
- Mitigation: Documentation, FAQs, email support
- Contingency: Hire support, community forum

---

## 15. Future Enhancements (Post-MVP)

### Phase 4+ Features (6+ Months Out)

**Mobile App** (React Native)
- Native iOS and Android apps
- Same backend API
- Push notifications

**API Access** (Pro Tier)
- REST API for developers
- Documentation
- Rate limits per tier

**Advanced Analytics**
- Spending trends over time
- Store performance comparison
- Profit forecasting

**Collaboration** (Business Tier - Future)
- Multi-user accounts
- Team permissions
- Shared preorders

**Integrations**
- Zapier integration
- Google Sheets sync
- Discord bot

**AI Features**
- Price prediction based on historical data
- Smart release date reminders
- Auto-categorize by TCG type

---

## Appendix A: Glossary

- **CRUD**: Create, Read, Update, Delete
- **JWT**: JSON Web Token (authentication)
- **MRR**: Monthly Recurring Revenue
- **ARPU**: Average Revenue Per User
- **LTV**: Lifetime Value
- **DAU/WAU/MAU**: Daily/Weekly/Monthly Active Users
- **Churn**: Rate at which users cancel subscriptions
- **Grandfathering**: Allowing existing users to keep old pricing/features

---

## Appendix B: Open Questions

1. **Domain Name**: What domain should we use? `tcgtracker.app`? `preordertrack.com`?
2. **Branding**: Should we rebrand from "TCG Preorder Tracker" to something catchier?
3. **Marketing**: How will we acquire users initially? Reddit, TCG forums, ads?
4. **Support**: Email support only, or also live chat? Who handles support?

---

**END OF PRD**

---

## Document History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-10-21 | Claude | Initial PRD based on discussions |

## Approval

**Product Owner**: [Your Name]
**Developer**: Claude
**Status**: Draft - Pending Review
