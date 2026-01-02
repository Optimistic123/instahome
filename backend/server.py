from fastapi import FastAPI, APIRouter, HTTPException, Depends, Response, Cookie, Header
from fastapi.responses import JSONResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict, EmailStr
from typing import List, Optional
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt
import jwt
import httpx

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

JWT_SECRET = os.environ.get('JWT_SECRET', 'your-secret-key-change-this')
JWT_ALGORITHM = "HS256"
JWT_EXPIRATION_DAYS = 7

class User(BaseModel):
    user_id: str
    email: EmailStr
    name: str
    role: str
    picture: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    created_at: str

class OwnerWithStats(BaseModel):
    user_id: str
    email: EmailStr
    name: str
    role: str
    phone: Optional[str] = None
    address: Optional[str] = None
    created_at: str
    property_count: int = 0

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: str = "tenant"
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class OwnerCreate(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    address: Optional[str] = None

class AgentCreate(BaseModel):
    email: EmailStr
    name: str
    phone: Optional[str] = None
    specialization: Optional[str] = None  # e.g., "Residential", "Commercial", "Luxury"

class AgentUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    specialization: Optional[str] = None

class OwnerUpdate(BaseModel):
    name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None

class Property(BaseModel):
    property_id: str
    title: str
    description: str
    property_type: str
    address: str
    city: str
    state: str
    rent_amount: float
    deposit_amount: float
    bedrooms: int
    bathrooms: int
    area_sqft: int
    amenities: List[str]
    images: List[str]
    status: str
    owner_id: str
    created_at: str

class PropertyCreate(BaseModel):
    title: str
    description: str
    property_type: str
    address: str
    city: str
    state: str
    rent_amount: float
    deposit_amount: float
    bedrooms: int
    bathrooms: int
    area_sqft: int
    amenities: List[str]
    images: List[str]
    owner_id: str

class VisitRequest(BaseModel):
    visit_id: str
    property_id: str
    user_id: str
    user_name: str
    user_email: str
    user_phone: Optional[str] = None
    status: str
    stage: str
    assigned_agent_id: Optional[str] = None
    notes: Optional[str] = None
    created_at: str
    updated_at: str
    activity_log: Optional[List[dict]] = []

class VisitRequestCreate(BaseModel):
    property_id: str
    phone: Optional[str] = None
    preferred_date: Optional[str] = None
    notes: Optional[str] = None

class CoTenant(BaseModel):
    user_id: Optional[str] = None  # Optional - may not have account
    name: str
    email: Optional[str] = None
    phone: Optional[str] = None
    relationship: str = "roommate"  # roommate, spouse, family, friend, other
    rent_share: Optional[float] = None  # Their portion of rent

class RentalRecord(BaseModel):
    rental_id: str
    property_id: str
    primary_tenant_id: str  # Main leaseholder (must have account)
    co_tenants: Optional[List[CoTenant]] = []  # Additional occupants
    start_date: str
    monthly_rent: float
    payment_status: str
    last_payment_date: Optional[str] = None
    next_payment_due: str
    created_at: str

class RentalRecordCreate(BaseModel):
    property_id: str
    primary_tenant_id: str
    co_tenants: Optional[List[CoTenant]] = []
    monthly_rent: Optional[float] = None  # Override property rent if needed

@api_router.get("/")
async def root():
    return {"message": "Rental Property Management API"}

async def get_current_user(authorization: Optional[str] = Header(None), session_token: Optional[str] = Cookie(None)):
    token = None
    if session_token:
        token = session_token
    elif authorization and authorization.startswith("Bearer "):
        token = authorization.replace("Bearer ", "")
    
    if not token:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    session = await db.user_sessions.find_one({"session_token": token}, {"_id": 0})
    if not session:
        raise HTTPException(status_code=401, detail="Invalid session")
    
    expires_at = session["expires_at"]
    if isinstance(expires_at, str):
        expires_at = datetime.fromisoformat(expires_at)
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Session expired")
    
    user = await db.users.find_one({"user_id": session["user_id"]}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User not found")
    
    return User(**user)

@api_router.post("/auth/register")
async def register(user_data: UserCreate):
    existing_user = await db.users.find_one({"email": user_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    hashed_password = bcrypt.hashpw(user_data.password.encode('utf-8'), bcrypt.gensalt())
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    
    user_doc = {
        "user_id": user_id,
        "email": user_data.email,
        "name": user_data.name,
        "password": hashed_password.decode('utf-8'),
        "role": user_data.role,
        "phone": user_data.phone,
        "picture": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(user_doc)
    
    session_token = f"session_{uuid.uuid4().hex}"
    session_doc = {
        "user_id": user_id,
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    user_doc.pop("password")
    response = JSONResponse(content=user_doc)
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=JWT_EXPIRATION_DAYS * 24 * 60 * 60
    )
    
    return response

@api_router.post("/auth/login")
async def login(credentials: UserLogin):
    user = await db.users.find_one({"email": credentials.email}, {"_id": 0})
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    if not bcrypt.checkpw(credentials.password.encode('utf-8'), user["password"].encode('utf-8')):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    session_token = f"session_{uuid.uuid4().hex}"
    session_doc = {
        "user_id": user["user_id"],
        "session_token": session_token,
        "expires_at": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    await db.user_sessions.insert_one(session_doc)
    
    user.pop("password")
    response = JSONResponse(content=user)
    response.set_cookie(
        key="session_token",
        value=session_token,
        httponly=True,
        secure=True,
        samesite="none",
        path="/",
        max_age=JWT_EXPIRATION_DAYS * 24 * 60 * 60
    )
    
    return response

@api_router.post("/auth/session")
async def create_session_from_oauth(x_session_id: str = Header(...)):
    try:
        # REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
        async with httpx.AsyncClient() as client:
            response = await client.get(
                "https://demobackend.emergentagent.com/auth/v1/env/oauth/session-data",
                headers={"X-Session-ID": x_session_id}
            )
            response.raise_for_status()
            session_data = response.json()
        
        user_id = f"user_{uuid.uuid4().hex[:12]}"
        existing_user = await db.users.find_one({"email": session_data["email"]}, {"_id": 0})
        
        if existing_user:
            user_id = existing_user["user_id"]
            await db.users.update_one(
                {"user_id": user_id},
                {"$set": {"name": session_data["name"], "picture": session_data["picture"]}}
            )
        else:
            user_doc = {
                "user_id": user_id,
                "email": session_data["email"],
                "name": session_data["name"],
                "role": "tenant",
                "picture": session_data["picture"],
                "phone": None,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.users.insert_one(user_doc)
        
        session_token = session_data["session_token"]
        session_doc = {
            "user_id": user_id,
            "session_token": session_token,
            "expires_at": datetime.now(timezone.utc) + timedelta(days=JWT_EXPIRATION_DAYS),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.user_sessions.insert_one(session_doc)
        
        user = await db.users.find_one({"user_id": user_id}, {"_id": 0, "password": 0})
        
        response = JSONResponse(content=user)
        response.set_cookie(
            key="session_token",
            value=session_token,
            httponly=True,
            secure=True,
            samesite="none",
            path="/",
            max_age=JWT_EXPIRATION_DAYS * 24 * 60 * 60
        )
        
        return response
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@api_router.get("/auth/me", response_model=User)
async def get_me(current_user: User = Depends(get_current_user)):
    return current_user

@api_router.post("/auth/logout")
async def logout(response: Response, session_token: Optional[str] = Cookie(None)):
    if session_token:
        await db.user_sessions.delete_one({"session_token": session_token})
    
    response.delete_cookie(key="session_token", path="/")
    return {"message": "Logged out successfully"}

@api_router.get("/properties", response_model=List[Property])
async def get_properties(status: Optional[str] = None, city: Optional[str] = None, property_type: Optional[str] = None):
    query = {}
    if status:
        query["status"] = status
    if city:
        query["city"] = city
    if property_type:
        query["property_type"] = property_type
    
    properties = await db.properties.find(query, {"_id": 0}).to_list(1000)
    return properties

@api_router.get("/properties/{property_id}", response_model=Property)
async def get_property(property_id: str):
    property_doc = await db.properties.find_one({"property_id": property_id}, {"_id": 0})
    if not property_doc:
        raise HTTPException(status_code=404, detail="Property not found")
    return property_doc

@api_router.post("/properties", response_model=Property)
async def create_property(property_data: PropertyCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create properties")
    
    # Validate that owner exists
    owner = await db.users.find_one({"user_id": property_data.owner_id, "role": "owner"}, {"_id": 0})
    if not owner:
        raise HTTPException(status_code=400, detail="Invalid owner_id. Owner not found.")
    
    property_id = f"prop_{uuid.uuid4().hex[:12]}"
    property_doc = {
        "property_id": property_id,
        **property_data.model_dump(),
        "status": "available",
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.properties.insert_one(property_doc)
    return Property(**property_doc)

@api_router.put("/properties/{property_id}", response_model=Property)
async def update_property(property_id: str, property_data: PropertyCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update properties")
    
    result = await db.properties.update_one(
        {"property_id": property_id},
        {"$set": property_data.model_dump()}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Property not found")
    
    updated_property = await db.properties.find_one({"property_id": property_id}, {"_id": 0})
    return Property(**updated_property)

@api_router.patch("/properties/{property_id}/status")
async def update_property_status(property_id: str, status: str, tenant_id: Optional[str] = None, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update property status")
    
    property_doc = await db.properties.find_one({"property_id": property_id}, {"_id": 0})
    if not property_doc:
        raise HTTPException(status_code=404, detail="Property not found")
    
    await db.properties.update_one(
        {"property_id": property_id},
        {"$set": {"status": status}}
    )
    
    if status == "occupied" and tenant_id:
        rental_id = f"rental_{uuid.uuid4().hex[:12]}"
        rental_doc = {
            "rental_id": rental_id,
            "property_id": property_id,
            "primary_tenant_id": tenant_id,
            "co_tenants": [],  # Can be updated later via separate endpoint
            "start_date": datetime.now(timezone.utc).isoformat(),
            "monthly_rent": property_doc["rent_amount"],
            "payment_status": "pending",
            "last_payment_date": None,
            "next_payment_due": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.rental_records.insert_one(rental_doc)
    
    return {"message": "Property status updated"}

@api_router.delete("/properties/{property_id}")
async def delete_property(property_id: str, current_user: User = Depends(get_current_user)):
    """Delete a property (Admin only) - only if not occupied and has no active visits"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete properties")
    
    # Check if property exists
    property_doc = await db.properties.find_one({"property_id": property_id}, {"_id": 0})
    if not property_doc:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Check if property is occupied
    if property_doc.get("status") == "occupied":
        raise HTTPException(status_code=400, detail="Cannot delete occupied property. Change status first.")
    
    # Check if property has active visit requests
    active_visits = await db.visit_requests.count_documents({
        "property_id": property_id,
        "stage": {"$nin": ["visit_completed", "cancelled"]}
    })
    if active_visits > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete property with {active_visits} active visit request(s).")
    
    # Delete associated rental records (if any historical)
    await db.rental_records.delete_many({"property_id": property_id})
    
    # Delete the property
    await db.properties.delete_one({"property_id": property_id})
    
    return {"message": "Property deleted successfully"}

@api_router.post("/visit-requests", response_model=VisitRequest)
async def create_visit_request(visit_data: VisitRequestCreate, current_user: User = Depends(get_current_user)):
    visit_id = f"visit_{uuid.uuid4().hex[:12]}"
    visit_doc = {
        "visit_id": visit_id,
        "property_id": visit_data.property_id,
        "user_id": current_user.user_id,
        "user_name": current_user.name,
        "user_email": current_user.email,
        "user_phone": visit_data.phone or current_user.phone,
        "status": "pending",
        "stage": "new",
        "assigned_agent_id": None,
        "notes": visit_data.notes,
        "preferred_date": visit_data.preferred_date,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "activity_log": [
            {
                "action": "Visit request created",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "actor": current_user.name,
                "actor_role": current_user.role
            }
        ]
    }
    
    await db.visit_requests.insert_one(visit_doc)
    return VisitRequest(**visit_doc)

@api_router.get("/visit-requests", response_model=List[VisitRequest])
async def get_visit_requests(current_user: User = Depends(get_current_user)):
    query = {}
    if current_user.role == "tenant":
        query["user_id"] = current_user.user_id
    elif current_user.role == "agent":
        query["assigned_agent_id"] = current_user.user_id
    
    visits = await db.visit_requests.find(query, {"_id": 0}).to_list(1000)
    return visits

@api_router.patch("/visit-requests/{visit_id}")
async def update_visit_request(visit_id: str, stage: Optional[str] = None, assigned_agent_id: Optional[str] = None, notes: Optional[str] = None, current_user: User = Depends(get_current_user)):
    if current_user.role not in ["admin", "agent"]:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    visit = await db.visit_requests.find_one({"visit_id": visit_id}, {"_id": 0})
    if not visit:
        raise HTTPException(status_code=404, detail="Visit request not found")
    
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    activity_log = visit.get("activity_log", [])
    
    if stage and stage != visit.get("stage"):
        update_data["stage"] = stage
        activity_log.append({
            "action": f"Stage changed from '{visit.get('stage')}' to '{stage}'",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "actor": current_user.name,
            "actor_role": current_user.role
        })
    
    if assigned_agent_id and assigned_agent_id != visit.get("assigned_agent_id"):
        agent = await db.users.find_one({"user_id": assigned_agent_id}, {"_id": 0})
        update_data["assigned_agent_id"] = assigned_agent_id
        activity_log.append({
            "action": f"Assigned to agent: {agent.get('name') if agent else 'Unknown'}",
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "actor": current_user.name,
            "actor_role": current_user.role
        })
    
    if notes is not None:
        old_notes = visit.get("notes", "")
        update_data["notes"] = notes
        if old_notes != notes:
            activity_log.append({
                "action": "Notes updated" if old_notes else "Notes added",
                "timestamp": datetime.now(timezone.utc).isoformat(),
                "actor": current_user.name,
                "actor_role": current_user.role
            })
    
    update_data["activity_log"] = activity_log
    
    result = await db.visit_requests.update_one(
        {"visit_id": visit_id},
        {"$set": update_data}
    )
    
    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Visit request not found")
    
    return {"message": "Visit request updated"}

@api_router.get("/agents", response_model=List[User])
async def get_agents(current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view agents")
    
    agents = await db.users.find({"role": "agent"}, {"_id": 0, "password": 0}).to_list(1000)
    return agents

@api_router.post("/agents")
async def create_agent(agent_data: AgentCreate, current_user: User = Depends(get_current_user)):
    """Create a new agent account (Admin only) - generates temporary password"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create agents")
    
    # Check if email already exists
    existing_user = await db.users.find_one({"email": agent_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Generate a temporary password
    import secrets
    import string
    temp_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
    
    hashed_password = bcrypt.hashpw(temp_password.encode('utf-8'), bcrypt.gensalt())
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    
    agent_doc = {
        "user_id": user_id,
        "email": agent_data.email,
        "name": agent_data.name,
        "password": hashed_password.decode('utf-8'),
        "role": "agent",
        "phone": agent_data.phone,
        "specialization": agent_data.specialization,
        "picture": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(agent_doc)
    
    # Remove password and _id from response (MongoDB adds _id which is not JSON serializable)
    agent_doc.pop("password", None)
    agent_doc.pop("_id", None)
    
    # Log the temporary password (in production, send via email)
    logger.info(f"Created agent {agent_data.email} with temporary password: {temp_password}")
    
    # Return agent with temp password in response (for demo purposes)
    return JSONResponse(content={
        **agent_doc,
        "temp_password": temp_password,
        "message": "Agent created successfully. Please share the temporary password with the agent."
    })

@api_router.get("/agents/{agent_id}")
async def get_agent_details(agent_id: str, current_user: User = Depends(get_current_user)):
    """Get agent details with their assigned visits (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view agent details")
    
    agent = await db.users.find_one({"user_id": agent_id, "role": "agent"}, {"_id": 0, "password": 0})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Get agent's assigned visits
    assigned_visits = await db.visit_requests.find({"assigned_agent_id": agent_id}, {"_id": 0}).to_list(1000)
    
    # Count visits by stage
    visit_stats = {
        "total": len(assigned_visits),
        "new": len([v for v in assigned_visits if v.get("stage") == "new"]),
        "talked": len([v for v in assigned_visits if v.get("stage") == "talked"]),
        "visit_scheduled": len([v for v in assigned_visits if v.get("stage") == "visit_scheduled"]),
        "visit_completed": len([v for v in assigned_visits if v.get("stage") == "visit_completed"])
    }
    
    return {
        **agent,
        "assigned_visits": assigned_visits,
        "visit_stats": visit_stats
    }

@api_router.delete("/agents/{agent_id}")
async def delete_agent(agent_id: str, current_user: User = Depends(get_current_user)):
    """Delete an agent (Admin only) - only if they have no active visits"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete agents")
    
    # Check if agent exists
    agent = await db.users.find_one({"user_id": agent_id, "role": "agent"}, {"_id": 0})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Check if agent has active (non-completed) visits
    active_visits = await db.visit_requests.count_documents({
        "assigned_agent_id": agent_id,
        "stage": {"$ne": "visit_completed"}
    })
    
    if active_visits > 0:
        raise HTTPException(
            status_code=400, 
            detail=f"Cannot delete agent with {active_visits} active visit(s). Reassign visits first."
        )
    
    # Delete agent
    await db.users.delete_one({"user_id": agent_id})
    await db.user_sessions.delete_many({"user_id": agent_id})
    
    return {"message": "Agent deleted successfully"}

@api_router.patch("/agents/{agent_id}")
async def update_agent(agent_id: str, agent_data: AgentUpdate, current_user: User = Depends(get_current_user)):
    """Update an agent's details (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update agents")
    
    # Check if agent exists
    agent = await db.users.find_one({"user_id": agent_id, "role": "agent"}, {"_id": 0})
    if not agent:
        raise HTTPException(status_code=404, detail="Agent not found")
    
    # Build update dict with only provided fields
    update_data = {}
    if agent_data.name is not None:
        update_data["name"] = agent_data.name
    if agent_data.phone is not None:
        update_data["phone"] = agent_data.phone
    if agent_data.specialization is not None:
        update_data["specialization"] = agent_data.specialization
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    await db.users.update_one({"user_id": agent_id}, {"$set": update_data})
    
    # Return updated agent
    updated_agent = await db.users.find_one({"user_id": agent_id}, {"_id": 0, "password": 0})
    return updated_agent

# ============== OWNER MANAGEMENT (Admin) ==============

@api_router.get("/admin/owners", response_model=List[OwnerWithStats])
async def get_all_owners(current_user: User = Depends(get_current_user)):
    """Get all owners with their property counts (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view owners")
    
    owners = await db.users.find({"role": "owner"}, {"_id": 0, "password": 0}).to_list(1000)
    
    # Add property count for each owner
    owners_with_stats = []
    for owner in owners:
        property_count = await db.properties.count_documents({"owner_id": owner["user_id"]})
        owners_with_stats.append({
            **owner,
            "property_count": property_count
        })
    
    return owners_with_stats

@api_router.post("/admin/owners", response_model=User)
async def create_owner(owner_data: OwnerCreate, current_user: User = Depends(get_current_user)):
    """Create a new owner account (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create owners")
    
    # Check if email already exists
    existing_user = await db.users.find_one({"email": owner_data.email}, {"_id": 0})
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    # Generate a temporary password (owner can change later)
    import secrets
    import string
    temp_password = ''.join(secrets.choice(string.ascii_letters + string.digits) for _ in range(12))
    
    hashed_password = bcrypt.hashpw(temp_password.encode('utf-8'), bcrypt.gensalt())
    user_id = f"user_{uuid.uuid4().hex[:12]}"
    
    owner_doc = {
        "user_id": user_id,
        "email": owner_data.email,
        "name": owner_data.name,
        "password": hashed_password.decode('utf-8'),
        "role": "owner",
        "phone": owner_data.phone,
        "address": owner_data.address,
        "picture": None,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.users.insert_one(owner_doc)
    
    # Remove password and _id from response (MongoDB adds _id which is not JSON serializable)
    owner_doc.pop("password", None)
    owner_doc.pop("_id", None)
    
    # Log the temporary password (in production, send via email)
    logger.info(f"Created owner {owner_data.email} with temporary password: {temp_password}")
    
    # Return owner with temp password in response (for demo purposes)
    return JSONResponse(content={
        **owner_doc,
        "temp_password": temp_password,
        "message": "Owner created successfully. Please share the temporary password with the owner."
    })

@api_router.get("/admin/owners/{owner_id}")
async def get_owner_details(owner_id: str, current_user: User = Depends(get_current_user)):
    """Get owner details with their properties (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view owner details")
    
    owner = await db.users.find_one({"user_id": owner_id, "role": "owner"}, {"_id": 0, "password": 0})
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")
    
    # Get owner's properties
    properties = await db.properties.find({"owner_id": owner_id}, {"_id": 0}).to_list(1000)
    
    return {
        **owner,
        "properties": properties
    }

@api_router.delete("/admin/owners/{owner_id}")
async def delete_owner(owner_id: str, current_user: User = Depends(get_current_user)):
    """Delete an owner (Admin only) - only if they have no properties"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can delete owners")
    
    # Check if owner exists
    owner = await db.users.find_one({"user_id": owner_id, "role": "owner"}, {"_id": 0})
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")
    
    # Check if owner has properties
    property_count = await db.properties.count_documents({"owner_id": owner_id})
    if property_count > 0:
        raise HTTPException(status_code=400, detail=f"Cannot delete owner with {property_count} properties. Reassign or delete properties first.")
    
    # Delete owner
    await db.users.delete_one({"user_id": owner_id})
    await db.user_sessions.delete_many({"user_id": owner_id})
    
    return {"message": "Owner deleted successfully"}

@api_router.patch("/admin/owners/{owner_id}")
async def update_owner(owner_id: str, owner_data: OwnerUpdate, current_user: User = Depends(get_current_user)):
    """Update an owner's details (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update owners")
    
    # Check if owner exists
    owner = await db.users.find_one({"user_id": owner_id, "role": "owner"}, {"_id": 0})
    if not owner:
        raise HTTPException(status_code=404, detail="Owner not found")
    
    # Build update dict with only provided fields
    update_data = {}
    if owner_data.name is not None:
        update_data["name"] = owner_data.name
    if owner_data.phone is not None:
        update_data["phone"] = owner_data.phone
    if owner_data.address is not None:
        update_data["address"] = owner_data.address
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No fields to update")
    
    await db.users.update_one({"user_id": owner_id}, {"$set": update_data})
    
    # Return updated owner
    updated_owner = await db.users.find_one({"user_id": owner_id}, {"_id": 0, "password": 0})
    return updated_owner

@api_router.get("/owner/dashboard")
async def get_owner_dashboard(current_user: User = Depends(get_current_user)):
    if current_user.role != "owner":
        raise HTTPException(status_code=403, detail="Only owners can view this dashboard")
    
    properties = await db.properties.find({"owner_id": current_user.user_id}, {"_id": 0}).to_list(1000)
    
    total_properties = len(properties)
    active_properties = len([p for p in properties if p["status"] == "occupied"])
    
    property_ids = [p["property_id"] for p in properties]
    rentals = await db.rental_records.find({"property_id": {"$in": property_ids}}, {"_id": 0}).to_list(1000)
    
    total_income = sum([r["monthly_rent"] for r in rentals])
    pending_payments = len([r for r in rentals if r["payment_status"] == "pending"])
    
    property_earnings = []
    for prop in properties:
        rental = next((r for r in rentals if r["property_id"] == prop["property_id"]), None)
        property_earnings.append({
            "property_id": prop["property_id"],
            "title": prop["title"],
            "rent_amount": prop["rent_amount"],
            "status": prop["status"],
            "payment_status": rental["payment_status"] if rental else "n/a",
            "next_payment_due": rental["next_payment_due"] if rental else None
        })
    
    return {
        "total_properties": total_properties,
        "active_properties": active_properties,
        "total_monthly_income": total_income,
        "pending_payments": pending_payments,
        "property_earnings": property_earnings
    }

# ============== RENTAL RECORDS MANAGEMENT ==============

@api_router.get("/rentals/{property_id}")
async def get_rental_record(property_id: str, current_user: User = Depends(get_current_user)):
    """Get rental record for a property with all tenant details"""
    if current_user.role not in ["admin", "owner"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    rental = await db.rental_records.find_one({"property_id": property_id}, {"_id": 0})
    if not rental:
        raise HTTPException(status_code=404, detail="No rental record found for this property")
    
    # If owner, verify they own the property
    if current_user.role == "owner":
        property_doc = await db.properties.find_one({"property_id": property_id}, {"_id": 0})
        if not property_doc or property_doc.get("owner_id") != current_user.user_id:
            raise HTTPException(status_code=403, detail="Not authorized to view this rental")
    
    # Get primary tenant details
    primary_tenant = await db.users.find_one(
        {"user_id": rental["primary_tenant_id"]}, 
        {"_id": 0, "password": 0}
    )
    
    return {
        **rental,
        "primary_tenant": primary_tenant
    }

@api_router.post("/rentals", response_model=RentalRecord)
async def create_rental_record(rental_data: RentalRecordCreate, current_user: User = Depends(get_current_user)):
    """Create a rental record with primary tenant and optional co-tenants"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create rental records")
    
    # Verify property exists
    property_doc = await db.properties.find_one({"property_id": rental_data.property_id}, {"_id": 0})
    if not property_doc:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Verify primary tenant exists
    primary_tenant = await db.users.find_one({"user_id": rental_data.primary_tenant_id}, {"_id": 0})
    if not primary_tenant:
        raise HTTPException(status_code=404, detail="Primary tenant not found")
    
    # Check if rental already exists for this property
    existing = await db.rental_records.find_one({"property_id": rental_data.property_id}, {"_id": 0})
    if existing:
        raise HTTPException(status_code=400, detail="Rental record already exists for this property")
    
    rental_id = f"rental_{uuid.uuid4().hex[:12]}"
    rental_doc = {
        "rental_id": rental_id,
        "property_id": rental_data.property_id,
        "primary_tenant_id": rental_data.primary_tenant_id,
        "co_tenants": [ct.model_dump() for ct in rental_data.co_tenants] if rental_data.co_tenants else [],
        "start_date": datetime.now(timezone.utc).isoformat(),
        "monthly_rent": rental_data.monthly_rent or property_doc["rent_amount"],
        "payment_status": "pending",
        "last_payment_date": None,
        "next_payment_due": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    
    await db.rental_records.insert_one(rental_doc)
    
    # Update property status to occupied
    await db.properties.update_one(
        {"property_id": rental_data.property_id},
        {"$set": {"status": "occupied"}}
    )
    
    return RentalRecord(**rental_doc)

@api_router.patch("/rentals/{rental_id}/co-tenants")
async def update_co_tenants(rental_id: str, co_tenants: List[CoTenant], current_user: User = Depends(get_current_user)):
    """Add or update co-tenants for a rental record"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can update co-tenants")
    
    rental = await db.rental_records.find_one({"rental_id": rental_id}, {"_id": 0})
    if not rental:
        raise HTTPException(status_code=404, detail="Rental record not found")
    
    await db.rental_records.update_one(
        {"rental_id": rental_id},
        {"$set": {"co_tenants": [ct.model_dump() for ct in co_tenants]}}
    )
    
    return {"message": f"Updated co-tenants for rental {rental_id}", "co_tenant_count": len(co_tenants)}

@api_router.post("/rentals/{rental_id}/co-tenants")
async def add_co_tenant(rental_id: str, co_tenant: CoTenant, current_user: User = Depends(get_current_user)):
    """Add a single co-tenant to an existing rental"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can add co-tenants")
    
    rental = await db.rental_records.find_one({"rental_id": rental_id}, {"_id": 0})
    if not rental:
        raise HTTPException(status_code=404, detail="Rental record not found")
    
    await db.rental_records.update_one(
        {"rental_id": rental_id},
        {"$push": {"co_tenants": co_tenant.model_dump()}}
    )
    
    return {"message": f"Added co-tenant {co_tenant.name} to rental {rental_id}"}

@api_router.delete("/rentals/{rental_id}/co-tenants/{co_tenant_email}")
async def remove_co_tenant(rental_id: str, co_tenant_email: str, current_user: User = Depends(get_current_user)):
    """Remove a co-tenant from a rental by email"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can remove co-tenants")
    
    rental = await db.rental_records.find_one({"rental_id": rental_id}, {"_id": 0})
    if not rental:
        raise HTTPException(status_code=404, detail="Rental record not found")
    
    await db.rental_records.update_one(
        {"rental_id": rental_id},
        {"$pull": {"co_tenants": {"email": co_tenant_email}}}
    )
    
    return {"message": f"Removed co-tenant with email {co_tenant_email}"}

@api_router.get("/admin/rentals")
async def get_all_rentals(current_user: User = Depends(get_current_user)):
    """Get all rental records with tenant details (Admin only)"""
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can view all rentals")
    
    rentals = await db.rental_records.find({}, {"_id": 0}).to_list(1000)
    
    # Enrich with tenant and property details
    enriched_rentals = []
    for rental in rentals:
        primary_tenant = await db.users.find_one(
            {"user_id": rental["primary_tenant_id"]},
            {"_id": 0, "password": 0}
        )
        property_doc = await db.properties.find_one(
            {"property_id": rental["property_id"]},
            {"_id": 0}
        )
        enriched_rentals.append({
            **rental,
            "primary_tenant": primary_tenant,
            "property": property_doc,
            "total_occupants": 1 + len(rental.get("co_tenants", []))
        })
    
    return enriched_rentals

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()