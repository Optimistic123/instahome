# InstaMakaan - Project Flow Diagram

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              FRONTEND (React)                                │
│                              Port: 3000                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │
│   │  Landing     │  │  Property    │  │  Login/      │  │  Auth        │   │
│   │  Page        │  │  Listing     │  │  Register    │  │  Callback    │   │
│   └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘   │
│          │                 │                 │                  │           │
│          └─────────────────┼─────────────────┼──────────────────┘           │
│                            │                 │                              │
│                            ▼                 ▼                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                     Protected Routes (Role-Based)                    │   │
│   ├─────────────────┬─────────────────┬─────────────────┬───────────────┤   │
│   │  Admin          │  Agent          │  Owner          │  Tenant       │   │
│   │  Dashboard      │  Dashboard      │  Dashboard      │  Dashboard    │   │
│   └─────────────────┴─────────────────┴─────────────────┴───────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ HTTP/REST API (axios)
                                      │ withCredentials: true
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                           BACKEND (FastAPI + Python)                         │
│                              Port: 8001                                      │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                          API Router (/api)                           │   │
│   ├─────────────────┬─────────────────┬─────────────────┬───────────────┤   │
│   │  /auth/*        │  /properties/*  │  /visit-        │  /agents      │   │
│   │  - register     │  - GET (list)   │   requests/*    │  - GET        │   │
│   │  - login        │  - GET/:id      │  - POST         │  - POST       │   │
│   │  - logout       │  - POST         │  - GET          │               │   │
│   │  - me           │  - PUT/:id      │  - PATCH/:id    │  /owner/      │   │
│   │  - session      │  - PATCH/status │                 │   dashboard   │   │
│   └─────────────────┴─────────────────┴─────────────────┴───────────────┘   │
│                                                                              │
│   ┌─────────────────────────────────────────────────────────────────────┐   │
│   │                        Authentication Layer                          │   │
│   │  - Session-based auth (cookies)                                      │   │
│   │  - bcrypt password hashing                                           │   │
│   │  - Google OAuth (external)                                           │   │
│   └─────────────────────────────────────────────────────────────────────┘   │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
                                      │
                                      │ Motor (async MongoDB driver)
                                      ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│                              DATABASE (MongoDB)                              │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│   ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────────────┐   │
│   │   users    │  │ properties │  │   visit    │  │  rental_records   │   │
│   │            │  │            │  │  requests  │  │                   │   │
│   └────────────┘  └────────────┘  └────────────┘  └────────────────────┘   │
│                                                                              │
│   ┌────────────────────────────────────────────────────────────────────┐    │
│   │                        user_sessions                                │    │
│   └────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 👥 User Roles & Permissions

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              USER ROLES                                      │
├──────────────┬──────────────┬──────────────┬────────────────────────────────┤
│    ADMIN     │    AGENT     │    OWNER     │            TENANT              │
├──────────────┼──────────────┼──────────────┼────────────────────────────────┤
│ • View all   │ • View       │ • View own   │ • Browse properties            │
│   properties │   assigned   │   properties │ • Request property visits      │
│ • Create/    │   visits     │ • View       │ • Track visit status           │
│   Edit props │ • Update     │   earnings   │ • Archive visit requests       │
│ • View all   │   visit      │ • Track      │                                │
│   visits     │   stages     │   payments   │                                │
│ • Assign     │ • Add notes  │              │                                │
│   agents     │ • View       │              │                                │
│ • View all   │   activity   │              │                                │
│   agents     │   logs       │              │                                │
│ • Update     │              │              │                                │
│   property   │              │              │                                │
│   status     │              │              │                                │
│ ─────────────│              │              │                                │
│ ONBOARDING:  │              │              │                                │
│ • Create new │              │              │                                │
│   owners     │              │              │                                │
│ • Create new │              │              │                                │
│   properties │              │              │                                │
│   (linked to │              │              │                                │
│   owners)    │              │              │                                │
│ • View owner │              │              │                                │
│   stats      │              │              │                                │
└──────────────┴──────────────┴──────────────┴────────────────────────────────┘
```

---

## 🔐 Authentication Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AUTHENTICATION FLOWS                                 │
└─────────────────────────────────────────────────────────────────────────────┘

                        ┌──────────────────┐
                        │   Login Page     │
                        └────────┬─────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼                         ▼
        ┌───────────────────┐     ┌───────────────────┐
        │  Email/Password   │     │   Google OAuth    │
        │     Login         │     │     Login         │
        └─────────┬─────────┘     └─────────┬─────────┘
                  │                         │
                  ▼                         ▼
        ┌───────────────────┐     ┌───────────────────┐
        │  POST /auth/login │     │  External OAuth   │
        │  - Validate creds │     │  (emergentagent)  │
        │  - Create session │     └─────────┬─────────┘
        └─────────┬─────────┘               │
                  │                         ▼
                  │               ┌───────────────────┐
                  │               │  AuthCallback.js  │
                  │               │  - Extract token  │
                  │               └─────────┬─────────┘
                  │                         │
                  │                         ▼
                  │               ┌───────────────────┐
                  │               │ POST /auth/session│
                  │               │ - Create user     │
                  │               │ - Create session  │
                  │               └─────────┬─────────┘
                  │                         │
                  └────────────┬────────────┘
                               ▼
                  ┌───────────────────────────┐
                  │   Set session_token       │
                  │   Cookie (httpOnly)       │
                  └─────────────┬─────────────┘
                                │
                                ▼
                  ┌───────────────────────────┐
                  │   Redirect to Dashboard   │
                  │   based on user.role      │
                  └───────────────────────────┘
                                │
          ┌─────────┬───────────┼───────────┬─────────┐
          ▼         ▼           ▼           ▼         ▼
    ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐
    │  Admin  │ │  Agent  │ │  Owner  │ │ Tenant  │
    │Dashboard│ │Dashboard│ │Dashboard│ │Dashboard│
    └─────────┘ └─────────┘ └─────────┘ └─────────┘
```

---

## 🏢 Owner & Property Onboarding Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                    OWNER & PROPERTY ONBOARDING (Admin-Driven)               │
└─────────────────────────────────────────────────────────────────────────────┘

                              ADMIN DASHBOARD
                                    │
                    ┌───────────────┴───────────────┐
                    │                               │
                    ▼                               ▼
        ┌───────────────────┐           ┌───────────────────┐
        │   OWNERS TAB      │           │  PROPERTIES TAB   │
        │                   │           │                   │
        │  [Add New Owner]  │           │ [Add New Property]│
        └─────────┬─────────┘           └─────────┬─────────┘
                  │                               │
                  ▼                               │
        ┌───────────────────┐                     │
        │  Owner Creation   │                     │
        │     Modal         │                     │
        ├───────────────────┤                     │
        │ • Name *          │                     │
        │ • Email *         │                     │
        │ • Phone           │                     │
        │ • Address         │                     │
        └─────────┬─────────┘                     │
                  │                               │
                  ▼                               │
        ┌───────────────────┐                     │
        │  POST /api/admin/ │                     │
        │      owners       │                     │
        ├───────────────────┤                     │
        │ • Generate temp   │                     │
        │   password        │                     │
        │ • Create user     │                     │
        │   with role=owner │                     │
        │ • Return creds    │                     │
        └─────────┬─────────┘                     │
                  │                               │
                  ▼                               │
        ┌───────────────────┐                     │
        │  Success Modal    │                     │
        │ ┌───────────────┐ │                     │
        │ │ Temp Password │ │                     │
        │ │  [abc123xyz]  │ │                     │
        │ └───────────────┘ │                     │
        │ Share with owner  │                     │
        └─────────┬─────────┘                     │
                  │                               │
                  │     ┌─────────────────────────┘
                  │     │
                  ▼     ▼
        ┌───────────────────────────────────────────┐
        │         Property Creation Modal           │
        ├───────────────────────────────────────────┤
        │                                           │
        │  ┌─────────────────────────────────────┐  │
        │  │  👤 SELECT OWNER * (Required)       │  │
        │  │  ┌─────────────────────────────┐    │  │
        │  │  │ Sarah Johnson               ▼│   │  │
        │  │  │ Michael Chen                 │   │  │
        │  │  └─────────────────────────────┘    │  │
        │  └─────────────────────────────────────┘  │
        │                                           │
        │  Property Details:                        │
        │  • Title, Description                     │
        │  • Type (Apartment/House/etc)             │
        │  • Address, City, State                   │
        │  • Rent Amount, Deposit                   │
        │  • Bedrooms, Bathrooms, Area              │
        │                                           │
        │           [Create Property]               │
        └───────────────────┬───────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────────┐
        │      POST /api/properties                 │
        ├───────────────────────────────────────────┤
        │ • Validate owner_id exists                │
        │ • Create property linked to owner         │
        │ • Status = "available"                    │
        └───────────────────┬───────────────────────┘
                            │
                            ▼
        ┌───────────────────────────────────────────┐
        │  ✅ Property Created Successfully         │
        │                                           │
        │  Property visible on:                     │
        │  • Landing Page                           │
        │  • Property Listing Page                  │
        │  • Owner Dashboard (for the owner)        │
        │  • Admin Dashboard (Properties tab)       │
        └───────────────────────────────────────────┘
```

### Onboarding Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         STEP-BY-STEP ONBOARDING                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  STEP 1: Admin Creates Owner                                                │
│  ────────────────────────────                                                │
│  Admin Dashboard → Owners Tab → "Add New Owner"                             │
│  • Enter owner details (name, email, phone, address)                        │
│  • System generates temporary password                                       │
│  • Admin shares credentials with owner                                       │
│                                                                              │
│  STEP 2: Admin Creates Property                                             │
│  ───────────────────────────────                                             │
│  Admin Dashboard → Properties Tab → "Add New Property"                      │
│  • Select owner from dropdown (REQUIRED)                                    │
│  • Enter property details                                                   │
│  • Property is created and linked to owner                                  │
│                                                                              │
│  STEP 3: Owner Can Login                                                    │
│  ────────────────────────────                                                │
│  • Owner uses shared credentials to login                                   │
│  • Owner Dashboard shows their properties                                   │
│  • Owner can track earnings and payment status                              │
│                                                                              │
│  STEP 4: Property Goes Live                                                 │
│  ───────────────────────────                                                 │
│  • Property appears on public listing pages                                 │
│  • Tenants can browse and request visits                                    │
│  • Admin assigns agents to handle visit requests                            │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │  ✅ Agent Creation: Admin → Agents Tab → "Add New Agent"           │    │
│  │     Same flow as Owner creation (temp password generated)          │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 👔 Agent Onboarding Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         AGENT ONBOARDING (Admin-Driven)                     │
└─────────────────────────────────────────────────────────────────────────────┘

                              ADMIN DASHBOARD
                                    │
                                    ▼
                        ┌───────────────────┐
                        │    AGENTS TAB     │
                        │                   │
                        │  [Add New Agent]  │
                        └─────────┬─────────┘
                                  │
                                  ▼
                        ┌───────────────────┐
                        │  Agent Creation   │
                        │     Modal         │
                        ├───────────────────┤
                        │ • Name *          │
                        │ • Email *         │
                        │ • Phone           │
                        │ • Specialization  │
                        │   - Residential   │
                        │   - Commercial    │
                        │   - Luxury        │
                        │   - Student       │
                        │   - Family Homes  │
                        └─────────┬─────────┘
                                  │
                                  ▼
                        ┌───────────────────┐
                        │   POST /api/      │
                        │     agents        │
                        ├───────────────────┤
                        │ • Generate temp   │
                        │   password        │
                        │ • Create user     │
                        │   with role=agent │
                        │ • Return creds    │
                        └─────────┬─────────┘
                                  │
                                  ▼
                        ┌───────────────────┐
                        │  Success Modal    │
                        │ ┌───────────────┐ │
                        │ │ Temp Password │ │
                        │ │  [abc123xyz]  │ │
                        │ └───────────────┘ │
                        │ Share with agent  │
                        └─────────┬─────────┘
                                  │
                                  ▼
                        ┌───────────────────┐
                        │  Agent Can Login  │
                        │  & View Assigned  │
                        │     Visits        │
                        └───────────────────┘
```

---

## 🏠 Property Visit Request Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                      PROPERTY VISIT REQUEST LIFECYCLE                        │
└─────────────────────────────────────────────────────────────────────────────┘

    TENANT                     ADMIN                      AGENT
      │                          │                          │
      ▼                          │                          │
┌─────────────┐                  │                          │
│ Browse      │                  │                          │
│ Properties  │                  │                          │
└──────┬──────┘                  │                          │
       │                         │                          │
       ▼                         │                          │
┌─────────────┐                  │                          │
│ View Detail │                  │                          │
│ Page        │                  │                          │
└──────┬──────┘                  │                          │
       │                         │                          │
       ▼                         │                          │
┌─────────────┐                  │                          │
│ Request     │                  │                          │
│ Visit       │──────────────────┼──────────────────────────│
└──────┬──────┘                  │                          │
       │                         │                          │
       │    ┌────────────────────┘                          │
       │    │                                               │
       ▼    ▼                                               │
   ┌──────────────┐                                         │
   │ Visit Status │                                         │
   │   = "new"    │                                         │
   └──────┬───────┘                                         │
          │                                                 │
          │         ┌───────────────────┐                   │
          └────────►│ Admin Dashboard   │                   │
                    │ - View all visits │                   │
                    │ - Assign agent    │───────────────────┤
                    └───────────────────┘                   │
                                                            │
                              ┌──────────────────────────────┘
                              │
                              ▼
                    ┌───────────────────┐
                    │ Agent Dashboard   │
                    │ - View assigned   │
                    │ - Update stage    │
                    │ - Add notes       │
                    └─────────┬─────────┘
                              │
       ┌──────────────────────┼──────────────────────┐
       ▼                      ▼                      ▼
┌─────────────┐      ┌─────────────┐      ┌─────────────────┐
│  "talked"   │ ───► │  "visit_    │ ───► │ "visit_         │
│             │      │  scheduled" │      │  completed"     │
└─────────────┘      └─────────────┘      └─────────────────┘
       │                    │                      │
       └────────────────────┼──────────────────────┘
                            │
                            ▼
                  ┌───────────────────┐
                  │ Activity Log      │
                  │ (tracks all       │
                  │  stage changes)   │
                  └───────────────────┘
```

---

## 📊 Database Schema

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                            DATABASE COLLECTIONS                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────┐       ┌─────────────────────┐
│       USERS         │       │     PROPERTIES      │
├─────────────────────┤       ├─────────────────────┤
│ user_id (PK)        │       │ property_id (PK)    │
│ email               │       │ title               │
│ name                │◄──────│ owner_id (FK)       │
│ password (hashed)   │       │ description         │
│ role                │       │ property_type       │
│ phone               │       │ address, city, state│
│ address (for owners)│       │ rent_amount         │
│ picture             │       │ deposit_amount      │
│ created_at          │       │ bedrooms, bathrooms │
└─────────────────────┘       │
         │                    │ area_sqft           │
         │                    │ amenities[]         │
         │                    │ images[]            │
         │                    │ status              │
         │                    │ created_at          │
         │                    └─────────────────────┘
         │                              │
         │                              │
         ▼                              ▼
┌─────────────────────┐       ┌─────────────────────┐
│   USER_SESSIONS     │       │   VISIT_REQUESTS    │
├─────────────────────┤       ├─────────────────────┤
│ user_id (FK)        │       │ visit_id (PK)       │
│ session_token       │       │ property_id (FK)    │
│ expires_at          │       │ user_id (FK)        │
│ created_at          │       │ user_name           │
└─────────────────────┘       │ user_email          │
                              │ user_phone          │
                              │ status              │
                              │ stage               │
                              │ assigned_agent_id   │
                              │ notes               │
                              │ preferred_date      │
                              │ activity_log[]      │
                              │ created_at          │
                              │ updated_at          │
                              └─────────────────────┘
                                        │
                                        │
                                        ▼
                              ┌─────────────────────┐
                              │   RENTAL_RECORDS    │
                              ├─────────────────────┤
                              │ rental_id (PK)      │
                              │ property_id (FK)    │
                              │ primary_tenant_id   │
                              │ co_tenants[] {      │
                              │   user_id, name,    │
                              │   email, phone,     │
                              │   relationship,     │
                              │   rent_share        │
                              │ }                   │
                              │ start_date          │
                              │ monthly_rent        │
                              │ payment_status      │
                              │ last_payment_date   │
                              │ next_payment_due    │
                              │ created_at          │
                              └─────────────────────┘
```

---

## 🔄 API Endpoints Summary

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              API ENDPOINTS                                   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  AUTHENTICATION                                                              │
│  ├── POST   /api/auth/register      → Create new user account               │
│  ├── POST   /api/auth/login         → Login with email/password             │
│  ├── POST   /api/auth/session       → Create session from OAuth             │
│  ├── GET    /api/auth/me            → Get current user info                 │
│  └── POST   /api/auth/logout        → Logout and clear session              │
│                                                                              │
│  PROPERTIES                                                                  │
│  ├── GET    /api/properties         → List all properties (with filters)    │
│  ├── GET    /api/properties/:id     → Get single property details           │
│  ├── POST   /api/properties         → Create property (admin only)          │
│  ├── PUT    /api/properties/:id     → Update property (admin only)          │
│  └── PATCH  /api/properties/:id/status → Update property status             │
│                                                                              │
│  VISIT REQUESTS                                                              │
│  ├── POST   /api/visit-requests     → Create visit request (tenant)         │
│  ├── GET    /api/visit-requests     → Get visits (role-based filtering)     │
│  └── PATCH  /api/visit-requests/:id → Update visit (stage, agent, notes)    │
│                                                                              │
│  AGENTS                                                                      │
│  ├── GET    /api/agents             → List all agents (admin only)          │
│  ├── POST   /api/agents             → Create agent (temp password)          │
│  ├── GET    /api/agents/:id         → Get agent with assigned visits        │
│  └── DELETE /api/agents/:id         → Delete agent (if no active visits)    │
│                                                                              │
│  OWNERS (Admin)                                                              │
│  ├── GET    /api/admin/owners       → List all owners with stats            │
│  ├── POST   /api/admin/owners       → Create new owner account              │
│  ├── GET    /api/admin/owners/:id   → Get owner details with properties     │
│  └── DELETE /api/admin/owners/:id   → Delete owner (if no properties)       │
│                                                                              │
│  OWNER DASHBOARD                                                             │
│  └── GET    /api/owner/dashboard    → Get owner's property stats            │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 📁 Project Structure

```
instahome/
├── backend/
│   ├── server.py              # FastAPI application
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
│
├── frontend/
│   ├── src/
│   │   ├── App.js             # Main app with routing
│   │   ├── pages/
│   │   │   ├── LandingPage.js
│   │   │   ├── PropertyListingPage.js
│   │   │   ├── PropertyDetailPage.js
│   │   │   ├── LoginPage.js
│   │   │   ├── RegisterPage.js
│   │   │   ├── AuthCallback.js
│   │   │   ├── admin/AdminDashboard.js
│   │   │   ├── agent/AgentDashboard.js
│   │   │   ├── owner/OwnerDashboard.js
│   │   │   └── tenant/TenantDashboard.js
│   │   └── components/ui/     # Shadcn UI components
│   └── package.json
│
├── scripts/
│   ├── seed_data.py           # Database seeding script
│   └── add_activity_logs.py
│
└── setup_local.sh             # Local setup script
```

---

## 🚀 Getting Started

```
1. Start MongoDB
   └── brew services start mongodb-community

2. Start Backend (Terminal 1)
   └── cd backend
   └── source venv/bin/activate
   └── uvicorn server:app --host 0.0.0.0 --port 8001 --reload

3. Start Frontend (Terminal 2)
   └── cd frontend
   └── yarn start

4. Access Application
   └── Frontend: http://localhost:3000
   └── Backend API: http://localhost:8001
   └── API Docs: http://localhost:8001/docs
```

---

## 🔑 Demo Credentials

| Role   | Email               | Password    |
|--------|---------------------|-------------|
| Admin  | admin@rental.com    | password123 |
| Agent  | agent1@rental.com   | password123 |
| Owner  | owner1@rental.com   | password123 |
| Tenant | tenant1@rental.com  | password123 |

