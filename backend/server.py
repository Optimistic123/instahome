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
    created_at: str

class UserCreate(BaseModel):
    email: EmailStr
    name: str
    password: str
    role: str = "tenant"
    phone: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

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

class VisitRequestCreate(BaseModel):
    property_id: str
    phone: Optional[str] = None
    preferred_date: Optional[str] = None
    notes: Optional[str] = None

class RentalRecord(BaseModel):
    rental_id: str
    property_id: str
    tenant_id: str
    start_date: str
    monthly_rent: float
    payment_status: str
    last_payment_date: Optional[str] = None
    next_payment_due: str
    created_at: str

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
            "tenant_id": tenant_id,
            "start_date": datetime.now(timezone.utc).isoformat(),
            "monthly_rent": property_doc["rent_amount"],
            "payment_status": "pending",
            "last_payment_date": None,
            "next_payment_due": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.rental_records.insert_one(rental_doc)
    
    return {"message": "Property status updated"}

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
        "updated_at": datetime.now(timezone.utc).isoformat()
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
    
    update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
    if stage:
        update_data["stage"] = stage
    if assigned_agent_id:
        update_data["assigned_agent_id"] = assigned_agent_id
    if notes:
        update_data["notes"] = notes
    
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

@api_router.post("/agents", response_model=User)
async def create_agent(agent_data: UserCreate, current_user: User = Depends(get_current_user)):
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Only admins can create agents")
    
    agent_data.role = "agent"
    return await register(agent_data)

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