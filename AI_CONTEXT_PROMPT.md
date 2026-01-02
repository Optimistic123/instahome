# RentalSquare - AI Context & Requirements Prompt

> **Purpose**: This document serves as a comprehensive context prompt for AI assistants to understand and work with the RentalSquare rental property management system.

---

## 📋 PROJECT OVERVIEW

### What is RentalSquare?
RentalSquare is a full-stack rental property management platform that connects property owners, tenants, and real estate agents under a unified admin-managed system. The platform enables:

- **Property Owners** to list and manage their rental properties
- **Tenants** to browse properties and request visits
- **Agents** to handle visit requests and guide tenants through the rental process
- **Admins** to oversee the entire operation, onboard owners, create properties, and assign agents

### Technology Stack
| Layer | Technology |
|-------|------------|
| Frontend | React 18 with vite |
| UI Components | Shadcn/ui + Tailwind CSS |
| Backend | Python FastAPI |
| Database | MongoDB (via Motor async driver) |
| Authentication | Session-based (cookies) + Google OAuth |
| State Management | React hooks (useState, useEffect) |
| HTTP Client | Axios with credentials |

### Project Structure
```
instahome/
├── backend/
│   ├── server.py              # FastAPI application (all routes)
│   ├── requirements.txt       # Python dependencies
│   └── .env                   # Environment variables
├── frontend/
│   ├── src/
│   │   ├── App.js             # Main app with routing & axios config
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
├── scripts/
│   └── seed_data.py           # Database seeding script
└── setup_local.sh             # Local setup automation
```

---

## 👥 USER ROLES & PERMISSIONS

### Role Hierarchy
```
ADMIN (Full Control)
  ├── AGENT (Visit Management)
  ├── OWNER (Property Ownership)
  └── TENANT (Property Browsing)
```

### Detailed Permissions

#### 🔴 ADMIN
- **Onboarding**:
  - Create new owner accounts (generates temporary password)
  - Create properties linked to specific owners
  - Create agent accounts
- **Management**:
  - View all properties, visits, agents, and owners
  - Assign agents to visit requests
  - Update property status (available/occupied)
  - Delete owners (only if they have no properties)

#### 🟠 AGENT
- View only assigned visit requests
- Update visit stages (new → talked → visit_scheduled → visit_completed)
- Add notes to visit requests
- View activity logs for their visits

#### 🟢 OWNER
- View only their own properties
- Track rental earnings and payment status
- View property performance metrics
- (Note: Owners are created by Admin, not self-registered)

#### 🔵 TENANT
- Browse all available properties
- View property details
- Request property visits (requires login)
- Track their visit request status
- Archive completed visit requests

---

## 🔐 AUTHENTICATION SYSTEM

### Session-Based Authentication
- Uses HTTP-only cookies for security
- Session tokens stored in MongoDB `user_sessions` collection
- Tokens expire after 7 days
- Supports both email/password and Google OAuth

### Authentication Flow
```
1. User submits credentials (login) OR completes Google OAuth
2. Backend validates and creates session in database
3. Session token set as HTTP-only cookie
4. Frontend includes credentials in all API requests
5. Backend validates session on each protected route
6. User redirected to role-specific dashboard
```

### Route Protection
- Public routes: Landing, Property Listing, Property Detail, Login, Register
- Protected routes: All dashboards (role-based access)
- API protection via `get_current_user` dependency

---

## 🏢 OWNER & PROPERTY ONBOARDING FLOW

### Current Implementation (Admin-Driven)

#### Step 1: Admin Creates Owner
```
Admin Dashboard → Owners Tab → "Add New Owner" Button
↓
Modal Form:
  - Name (required)
  - Email (required)
  - Phone (optional)
  - Address (optional)
↓
POST /api/admin/owners
↓
System generates temporary password
↓
Admin shares credentials with owner
```

#### Step 2: Admin Creates Property
```
Admin Dashboard → Properties Tab → "Add New Property" Button
↓
Modal Form:
  - Owner Selection (required dropdown)
  - Title, Description
  - Property Type (apartment/house/condo/studio/villa)
  - Address, City, State
  - Rent Amount, Deposit Amount
  - Bedrooms, Bathrooms, Area (sqft)
↓
POST /api/properties (validates owner_id exists)
↓
Property linked to owner, status = "available"
```

#### Step 3: Property Goes Live
- Appears on Landing Page featured section
- Appears on Property Listing page
- Visible in Owner Dashboard
- Tenants can request visits

---

## 🏠 PROPERTY VISIT REQUEST LIFECYCLE

### Visit Stages
```
new → talked → visit_scheduled → visit_completed
```

### Complete Flow
```
TENANT                      ADMIN                       AGENT
   │                          │                           │
   ▼                          │                           │
Browse Properties             │                           │
   │                          │                           │
   ▼                          │                           │
View Property Detail          │                           │
   │                          │                           │
   ▼                          │                           │
Request Visit ─────────────────────────────────────────────
   │                          │                           │
   │    Creates visit with    │                           │
   │    stage = "new"         │                           │
   │                          ▼                           │
   │               View in Admin Dashboard                │
   │                          │                           │
   │                          ▼                           │
   │               Assign Agent ───────────────────────────
   │                          │                           │
   │                          │                           ▼
   │                          │               View Assigned Visits
   │                          │                           │
   │                          │                           ▼
   │                          │               Update Stage → "talked"
   │                          │                           │
   │                          │                           ▼
   │                          │               Update Stage → "visit_scheduled"
   │                          │                           │
   │                          │                           ▼
   │                          │               Update Stage → "visit_completed"
   ▼                          │                           │
Track Visit Status ←──────────────────────────────────────┘
```

### Activity Logging
Each visit request maintains an `activity_log` array tracking:
- Stage changes (with old → new values)
- Agent assignments
- Note updates
- Actor name and role
- Timestamps

---

## 📊 DATABASE SCHEMA

### Collections

#### `users`
```javascript
{
  user_id: "user_abc123",      // Primary key
  email: "user@email.com",
  name: "John Doe",
  password: "bcrypt_hash",     // Hashed password
  role: "admin|agent|owner|tenant",
  phone: "+1-555-1234",
  address: "123 Main St",      // For owners
  picture: "https://...",      // Profile picture URL
  created_at: "2024-01-01T00:00:00Z"
}
```

#### `properties`
```javascript
{
  property_id: "prop_xyz789",  // Primary key
  owner_id: "user_abc123",     // Foreign key to users
  title: "Modern Apartment",
  description: "...",
  property_type: "apartment|house|condo|studio|villa|penthouse|townhouse",
  address: "456 Oak Ave",
  city: "San Francisco",
  state: "CA",
  rent_amount: 2500.00,
  deposit_amount: 5000.00,
  bedrooms: 2,
  bathrooms: 2,
  area_sqft: 1200,
  amenities: ["Pool", "Gym", "Parking"],
  images: ["https://..."],
  status: "available|occupied",
  created_at: "2024-01-01T00:00:00Z"
}
```

#### `visit_requests`
```javascript
{
  visit_id: "visit_def456",    // Primary key
  property_id: "prop_xyz789",  // Foreign key
  user_id: "user_tenant123",   // Foreign key (tenant)
  user_name: "Jane Smith",
  user_email: "jane@email.com",
  user_phone: "+1-555-5678",
  status: "pending|completed|cancelled",
  stage: "new|talked|visit_scheduled|visit_completed",
  assigned_agent_id: "user_agent456",  // Foreign key
  preferred_date: "2024-01-15T14:00:00Z",
  activity_log: [
    {
      action: "Visit request created",
      timestamp: "2024-01-01T00:00:00Z",
      actor: "Jane Smith",
      actor_role: "tenant",
      notes: "Interested in weekend viewing",
    }
  ],
  created_at: "2024-01-01T00:00:00Z",
  updated_at: "2024-01-02T00:00:00Z"
}
```

#### `rental_records`
```javascript
{
  rental_id: "rental_ghi789",  // Primary key
  property_id: "prop_xyz789",  // Foreign key
  
  // Primary leaseholder (must have account)
  primary_tenant_id: "user_tenant123",
  
  // Co-tenants (may or may not have accounts)
  co_tenants: [
    {
      user_id: "user_tenant456",    // Optional - if they have account
      name: "John Doe",
      email: "john@email.com",
      phone: "+1-555-1234",
      relationship: "roommate|spouse|family|friend|other",
      rent_share: 1000.00           // Optional - their portion
    },
    {
      user_id: null,                // No account
      name: "Jane Smith",
      email: "jane@email.com",
      phone: "+1-555-5678",
      relationship: "roommate",
      rent_share: null              // Shared equally
    }
  ],
  
  start_date: "2024-02-01T00:00:00Z",
  monthly_rent: 2500.00,
  payment_status: "pending|paid|overdue",
  last_payment_date: "2024-03-01T00:00:00Z",
  next_payment_due: "2024-04-01T00:00:00Z",
  created_at: "2024-02-01T00:00:00Z"
}
```

#### `user_sessions`
```javascript
{
  user_id: "user_abc123",      // Foreign key
  session_token: "session_...",
  expires_at: "2024-01-08T00:00:00Z",
  created_at: "2024-01-01T00:00:00Z"
}
```

---

## 🔄 API ENDPOINTS

### Authentication
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/auth/register` | Create new user account | No |
| POST | `/api/auth/login` | Login with email/password | No |
| POST | `/api/auth/session` | Create session from OAuth | No |
| GET | `/api/auth/me` | Get current user info | Yes |
| POST | `/api/auth/logout` | Logout and clear session | Yes |

### Properties
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/properties` | List properties (with filters) | No |
| GET | `/api/properties/:id` | Get property details | No |
| POST | `/api/properties` | Create property | Admin only |
| PUT | `/api/properties/:id` | Update property | Admin only |
| PATCH | `/api/properties/:id/status` | Update status | Admin only |
| DELETE | `/api/properties/:id` | Delete property (if available & no active visits) | Admin only |

### Visit Requests
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| POST | `/api/visit-requests` | Create visit request | Yes (Tenant) |
| GET | `/api/visit-requests` | Get visits (role-filtered) | Yes |
| PATCH | `/api/visit-requests/:id` | Update visit | Admin/Agent |

### Agents
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/agents` | List all agents | Admin only |
| POST | `/api/agents` | Create agent (generates temp password) | Admin only |
| GET | `/api/agents/:id` | Get agent with assigned visits | Admin only |
| PATCH | `/api/agents/:id` | Update agent details | Admin only |
| DELETE | `/api/agents/:id` | Delete agent (if no active visits) | Admin only |

### Owners (Admin)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/admin/owners` | List owners with stats | Admin only |
| POST | `/api/admin/owners` | Create new owner | Admin only |
| GET | `/api/admin/owners/:id` | Get owner with properties | Admin only |
| PATCH | `/api/admin/owners/:id` | Update owner details | Admin only |
| DELETE | `/api/admin/owners/:id` | Delete owner (if no properties) | Admin only |

### Owner Dashboard
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/owner/dashboard` | Get owner's stats | Owner only |

### Rental Records (Multi-Tenant Support)
| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| GET | `/api/rentals/:property_id` | Get rental with tenant details | Admin/Owner |
| POST | `/api/rentals` | Create rental with co-tenants | Admin only |
| PATCH | `/api/rentals/:id/co-tenants` | Update all co-tenants | Admin only |
| POST | `/api/rentals/:id/co-tenants` | Add single co-tenant | Admin only |
| DELETE | `/api/rentals/:id/co-tenants/:email` | Remove co-tenant | Admin only |
| GET | `/api/admin/rentals` | List all rentals with details | Admin only |

---

## 🎯 CURRENT IMPLEMENTATION STATUS

### ✅ Completed Features
- [x] User authentication (email/password + Google OAuth)
- [x] Role-based access control (Admin, Agent, Owner, Tenant)
- [x] Property listing and detail pages
- [x] Visit request creation and tracking
- [x] Admin dashboard with all management tabs
- [x] Agent dashboard with assigned visits
- [x] Owner dashboard with property stats
- [x] Tenant dashboard with visit tracking
- [x] **Owner onboarding (Admin creates owners)**
- [x] **Property creation with owner linking**
- [x] Activity logging for visit requests
- [x] **Multi-tenant support (Primary tenant + Co-tenants)**
- [x] **Agent creation flow (Admin → Agents Tab → Add New Agent)**

### 🔜 Coming Next
- [ ] Owner self-service password change
- [ ] Email notifications for visit updates
- [ ] Property image upload
- [ ] Payment tracking enhancements

---

## 🧪 TEST CREDENTIALS

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@rental.com | password123 |
| Agent | agent1@rental.com | password123 |
| Agent | agent2@rental.com | password123 |
| Owner | owner1@rental.com | password123 |
| Owner | owner2@rental.com | password123 |
| Tenant | tenant1@rental.com | password123 |
| Tenant | tenant2@rental.com | password123 |

---

## 🚀 DEVELOPMENT SETUP

### Prerequisites
- Node.js 18+
- Python 3.9+
- MongoDB (local or Atlas)
- Yarn package manager

### Quick Start
```bash
# 1. Start MongoDB
brew services start mongodb-community

# 2. Backend Setup
cd backend
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
python ../scripts/seed_data.py
uvicorn server:app --host 0.0.0.0 --port 8001 --reload

# 3. Frontend Setup (new terminal)
cd frontend
yarn install
yarn start

# 4. Access
# Frontend: http://localhost:3000
# Backend API: http://localhost:8001
# API Docs: http://localhost:8001/docs
```

### Environment Variables
```env
MONGO_URL=mongodb://localhost:27017
DB_NAME=rental_management
JWT_SECRET=your-secret-key
CORS_ORIGINS=http://localhost:3000
```

---

## 📝 INSTRUCTIONS FOR AI ASSISTANTS

When working with this codebase:

1. **Backend changes**: Edit `backend/server.py` - all routes are in this single file
2. **Frontend pages**: Located in `frontend/src/pages/`
3. **UI Components**: Use existing Shadcn components from `frontend/src/components/ui/`
4. **Styling**: Use Tailwind CSS classes
5. **API calls**: Use the `api` instance from `App.js` (axios with baseURL and credentials)
6. **State management**: Use React hooks, no Redux/Context needed for current scope
7. **Database**: MongoDB with Motor async driver - no schemas/migrations, schema-less
8. **Testing**: Run `python ../scripts/seed_data.py` to reset demo data

### Code Conventions
- Backend: FastAPI with Pydantic models
- Frontend: Functional components with hooks
- Naming: camelCase for JS, snake_case for Python
- IDs: `type_uuid12chars` format (e.g., `user_abc123def456`)

---

*This prompt file should be used as context when asking AI assistants to help with development, debugging, or extending the RentalSquare platform.*

