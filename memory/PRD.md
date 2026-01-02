# Sanjaya - Product Requirements Document

## Original Problem Statement
Build a website for **Sanjaya**, a governed listening ecosystem for children with:
- Public website for awareness and trust
- Four user portals: Admin, Parent, Observer, Principal

## Tech Stack
- **Frontend**: React, Tailwind CSS, Shadcn UI, Lucide Icons
- **Backend**: FastAPI, Pydantic, Motor (async MongoDB)
- **Database**: MongoDB
- **Authentication**: JWT-based authentication by role
- **AI Integration**: OpenAI via Emergent LLM Key

---

## User Portals

### 1. Admin Platform (Governance & System Control) ✅ COMPLETED
- **Dashboard**: Overview stats (students, users, sessions, tickets)
- **Schools & Programs**: Manage schools, add new schools with stats
- **Student Enrollment**: Enroll students, assign to principals/observers
- **User Management**: Manage principals, observers, parents (tabs)
- **Safety & Escalation**: Red flag monitoring and management
- **Incidents**: Log and track safety incidents
- **Support Tickets**: View, respond, update ticket status
- **Analytics**: Session and enrollment analytics
- **AI System**: Configure AI settings
- **AI Guardrails**: 7 ethical AI toggles (no diagnosis, no medical advice, etc.)
- **Data Privacy**: Retention settings, GDPR compliance
- **Audit Logs**: Activity trail with filtering
- **System Health**: Real-time CPU, Memory, Disk, DB latency, service status
- **Billing**: Subscriptions and payment tracking
- **Help & FAQs**: Manage help documentation

### 2. Principal Platform (Human Oversight) ✅ COMPLETED
- Dashboard with school overview
- Events & Celebrations ✅
- Earnings tracking ✅
- Support Center ✅
- **Student-Observer Assignment** ✅ NEW
  - View all students with assignment status
  - View available observers with capacity info
  - Assign/unassign students to observers
- **Observer Performance Dashboard** ✅ NEW
  - View observer metrics (students, sessions, consistency, rating)
  - Performance status (excellent/good/needs attention)
  - Detailed observer view with assigned students and recent sessions
- **Parent Consultations** ✅ NEW
  - Schedule consultations with parents
  - View/manage consultation requests
  - Track consultation status (scheduled/completed/cancelled)

### 3. Observer Platform (Listening Layer)
- Dashboard with assigned children
- Events & Celebrations ✅
- Earnings tracking ✅
- Support Center ✅
- AI Session Intelligence ✅
- *Pending*: Pre-session readiness, self-reflection log, escalation process

### 4. Parent Platform (Visibility)
- Dashboard with children overview
- Progress tracking
- *Pending*: Guidance resources, consultation scheduling

### 5. Public Website ✅ COMPLETED
- Premium design with animations
- About, How it Works, FAQ pages
- Contact/Inquiry form with email notifications

---

## Completed Features (as of Jan 2, 2026)

### Admin Module (100% Complete)
- [x] Admin Login/Authentication
- [x] Dashboard with stats cards and quick actions
- [x] Schools & Programs management with CRUD
- [x] Student Enrollment with parent creation
- [x] User Management (Principals, Observers, Parents)
- [x] Safety & Escalation (Red Flags)
- [x] Incident Management
- [x] Support Ticket Management with replies
- [x] Analytics Dashboard
- [x] AI System Settings
- [x] AI Guardrails (7 ethical toggles)
- [x] Data Privacy Controls
- [x] Audit Logs
- [x] System Health Monitoring
- [x] Billing Management

### Principal Module (100% Complete)
- [x] Principal Login/Authentication
- [x] Dashboard with school statistics
- [x] Students list view
- [x] Observers list view
- [x] Analytics dashboard
- [x] Events & Celebrations
- [x] Earnings tracking
- [x] Support Center
- [x] Student-Observer Assignment (assign/unassign students)
- [x] Observer Performance Dashboard (metrics, status, details)
- [x] Parent Consultations (schedule, manage, requests)
- [x] Help & FAQs

### Observer & Principal Portals
- [x] Events & Celebrations feature
- [x] Earnings tracking
- [x] Support Center

### Integrations
- [x] OpenAI (Emergent LLM Key) for AI Session Intelligence
- [x] Email notifications (Resend - requires user API key)
- [ ] Google Integration (requires OAuth credentials)

---

## Test Results

### Latest Test Run (Jan 2, 2026)
**Admin Module Tests:**
- Backend Tests: 33/33 PASSED (100%)
- Frontend Tests: 13/13 sections verified (100%)

**Principal Module Tests:**
- Backend Tests: 13/13 PASSED (100%)
- Frontend Tests: All pages verified (100%)
- Test file: `/app/tests/test_principal_apis.py`

---

## Login Credentials

| Portal | URL | Username | Password |
|--------|-----|----------|----------|
| Admin | /admin/login | admin | admin123 |
| Parent | /parent/login | demo@parent.com | demo123 |
| Observer | /observer/login | observer@sanjaya.com | observer123 |
| Principal | /principal/login | principal@sanjaya.com | principal123 |

---

## Key Files Reference

### Backend
- `/app/backend/server.py` - Main server with all routes
- `/app/backend/admin_management_routes.py` - Admin dashboard, students, users, support, billing
- `/app/backend/admin_advanced_routes.py` - System health, safety, incidents, privacy, audit, AI guardrails

### Frontend
- `/app/frontend/src/pages/AdminPanel.jsx` - Complete admin panel with 15 sections
- `/app/frontend/src/pages/ObserverDashboard.jsx`
- `/app/frontend/src/pages/PrincipalDashboard.jsx`

---

## Upcoming Tasks (Priority Order)

### P1: Observer Platform Enhancements
- Pre-session readiness check
- Self-reflection log
- Formal escalation process

### P2: Parent Platform Enhancements
- Guidance resources
- Progress tracking improvements
- Consultation request from parent side

### P3: Public Website Additions
- "What Sanjaya IS / IS NOT" disclosure pages
- Enhanced consent and ethics pages

### P4: Program Lifecycle
- Renewal, pause, completion flows
- Exit surveys

---

## Known Blockers

1. **Google Integration**: Requires user-provided OAuth credentials
2. **Email Integration (Resend)**: Requires user API key
