# RentalSquare - Project Flow Diagram

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
│ picture             │       │ rent_amount         │
│ created_at          │       │ deposit_amount      │
└─────────────────────┘       │ bedrooms, bathrooms │
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
                              │ tenant_id (FK)      │
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
│  └── POST   /api/agents             → Create agent (admin only)             │
│                                                                              │
│  OWNER                                                                       │
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

