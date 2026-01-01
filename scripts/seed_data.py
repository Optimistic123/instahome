import os
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent / "backend"))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import asyncio
import uuid
from datetime import datetime, timezone, timedelta
import bcrypt

ROOT_DIR = Path(__file__).parent.parent / "backend"
load_dotenv(ROOT_DIR / '.env')

async def seed_database():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("Clearing existing data...")
    await db.users.delete_many({})
    await db.properties.delete_many({})
    await db.visit_requests.delete_many({})
    await db.rental_records.delete_many({})
    await db.user_sessions.delete_many({})
    
    print("Creating users...")
    hashed_password = bcrypt.hashpw("password123".encode('utf-8'), bcrypt.gensalt()).decode('utf-8')
    
    admin_id = f"user_{uuid.uuid4().hex[:12]}"
    owner1_id = f"user_{uuid.uuid4().hex[:12]}"
    owner2_id = f"user_{uuid.uuid4().hex[:12]}"
    agent1_id = f"user_{uuid.uuid4().hex[:12]}"
    agent2_id = f"user_{uuid.uuid4().hex[:12]}"
    tenant1_id = f"user_{uuid.uuid4().hex[:12]}"
    tenant2_id = f"user_{uuid.uuid4().hex[:12]}"
    
    users = [
        {
            "user_id": admin_id,
            "email": "admin@rental.com",
            "name": "Admin User",
            "password": hashed_password,
            "role": "admin",
            "phone": "+1-555-0100",
            "picture": "https://images.unsplash.com/photo-1738750908048-14200459c3c9?w=150",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "user_id": owner1_id,
            "email": "owner1@rental.com",
            "name": "Sarah Johnson",
            "password": hashed_password,
            "role": "owner",
            "phone": "+1-555-0101",
            "picture": "https://images.pexels.com/photos/8815915/pexels-photo-8815915.jpeg?w=150",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "user_id": owner2_id,
            "email": "owner2@rental.com",
            "name": "Michael Chen",
            "password": hashed_password,
            "role": "owner",
            "phone": "+1-555-0102",
            "picture": "https://images.unsplash.com/photo-1738750908048-14200459c3c9?w=150",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "user_id": agent1_id,
            "email": "agent1@rental.com",
            "name": "Emily Rodriguez",
            "password": hashed_password,
            "role": "agent",
            "phone": "+1-555-0201",
            "picture": "https://images.pexels.com/photos/8815915/pexels-photo-8815915.jpeg?w=150",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "user_id": agent2_id,
            "email": "agent2@rental.com",
            "name": "David Kumar",
            "password": hashed_password,
            "role": "agent",
            "phone": "+1-555-0202",
            "picture": "https://images.unsplash.com/photo-1738750908048-14200459c3c9?w=150",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "user_id": tenant1_id,
            "email": "tenant1@rental.com",
            "name": "Jessica Williams",
            "password": hashed_password,
            "role": "tenant",
            "phone": "+1-555-0301",
            "picture": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "user_id": tenant2_id,
            "email": "tenant2@rental.com",
            "name": "Robert Martinez",
            "password": hashed_password,
            "role": "tenant",
            "phone": "+1-555-0302",
            "picture": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.users.insert_many(users)
    print(f"Created {len(users)} users")
    
    print("\\nLogin Credentials:")
    print("Admin: admin@rental.com / password123")
    print("Owner 1: owner1@rental.com / password123")
    print("Owner 2: owner2@rental.com / password123")
    print("Agent 1: agent1@rental.com / password123")
    print("Agent 2: agent2@rental.com / password123")
    print("Tenant 1: tenant1@rental.com / password123")
    print("Tenant 2: tenant2@rental.com / password123\\n")
    
    print("Creating properties...")
    properties = [
        {
            "property_id": f"prop_{uuid.uuid4().hex[:12]}",
            "title": "Luxury Downtown Loft",
            "description": "Modern loft in the heart of downtown with stunning city views. Features high ceilings, exposed brick, and premium finishes.",
            "property_type": "Apartment",
            "address": "123 Main Street, Unit 501",
            "city": "San Francisco",
            "state": "CA",
            "rent_amount": 3500.00,
            "deposit_amount": 7000.00,
            "bedrooms": 2,
            "bathrooms": 2,
            "area_sqft": 1200,
            "amenities": ["Gym", "Parking", "Pool", "Elevator", "Security", "Rooftop Deck"],
            "images": [
                "https://images.unsplash.com/photo-1663756915301-2ba688e078cf?w=800",
                "https://images.unsplash.com/photo-1642976975710-1d8890dbf5ab?w=800",
                "https://images.pexels.com/photos/6603475/pexels-photo-6603475.jpeg?w=800"
            ],
            "status": "available",
            "owner_id": owner1_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "property_id": f"prop_{uuid.uuid4().hex[:12]}",
            "title": "Spacious Family Home",
            "description": "Beautiful single-family home in quiet neighborhood. Perfect for families with backyard and modern kitchen.",
            "property_type": "House",
            "address": "456 Oak Avenue",
            "city": "Austin",
            "state": "TX",
            "rent_amount": 2800.00,
            "deposit_amount": 5600.00,
            "bedrooms": 3,
            "bathrooms": 2,
            "area_sqft": 1800,
            "amenities": ["Backyard", "Garage", "Pet Friendly", "Central AC", "Fireplace"],
            "images": [
                "https://images.unsplash.com/photo-1746458258536-b9ee5db20a73?w=800",
                "https://images.unsplash.com/photo-1663756915301-2ba688e078cf?w=800",
                "https://images.pexels.com/photos/3034343/pexels-photo-3034343.jpeg?w=800"
            ],
            "status": "available",
            "owner_id": owner1_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "property_id": f"prop_{uuid.uuid4().hex[:12]}",
            "title": "Modern Studio Apartment",
            "description": "Compact and efficient studio in vibrant neighborhood. Great for young professionals.",
            "property_type": "Studio",
            "address": "789 Park Boulevard, #302",
            "city": "Seattle",
            "state": "WA",
            "rent_amount": 1800.00,
            "deposit_amount": 3600.00,
            "bedrooms": 1,
            "bathrooms": 1,
            "area_sqft": 550,
            "amenities": ["Gym", "Laundry", "Bike Storage", "WiFi Included"],
            "images": [
                "https://images.unsplash.com/photo-1642976975710-1d8890dbf5ab?w=800",
                "https://images.pexels.com/photos/6603475/pexels-photo-6603475.jpeg?w=800",
                "https://images.unsplash.com/photo-1663756915301-2ba688e078cf?w=800"
            ],
            "status": "occupied",
            "owner_id": owner2_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "property_id": f"prop_{uuid.uuid4().hex[:12]}",
            "title": "Penthouse Suite",
            "description": "Luxurious penthouse with panoramic views. Premium amenities and exclusive access to rooftop terrace.",
            "property_type": "Penthouse",
            "address": "321 Skyline Drive, PH-1",
            "city": "Miami",
            "state": "FL",
            "rent_amount": 5500.00,
            "deposit_amount": 11000.00,
            "bedrooms": 3,
            "bathrooms": 3,
            "area_sqft": 2500,
            "amenities": ["Pool", "Gym", "Concierge", "Valet", "Private Terrace", "Smart Home"],
            "images": [
                "https://images.unsplash.com/photo-1746458258536-b9ee5db20a73?w=800",
                "https://images.unsplash.com/photo-1766603636562-531bb3e1dda8?w=800",
                "https://images.pexels.com/photos/3034343/pexels-photo-3034343.jpeg?w=800"
            ],
            "status": "available",
            "owner_id": owner2_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "property_id": f"prop_{uuid.uuid4().hex[:12]}",
            "title": "Cozy Garden Apartment",
            "description": "Ground floor apartment with private garden access. Pet-friendly and quiet location.",
            "property_type": "Apartment",
            "address": "567 Green Street, Unit 101",
            "city": "Portland",
            "state": "OR",
            "rent_amount": 2200.00,
            "deposit_amount": 4400.00,
            "bedrooms": 2,
            "bathrooms": 1,
            "area_sqft": 950,
            "amenities": ["Garden Access", "Pet Friendly", "Storage", "Parking"],
            "images": [
                "https://images.pexels.com/photos/6603475/pexels-photo-6603475.jpeg?w=800",
                "https://images.unsplash.com/photo-1663756915301-2ba688e078cf?w=800",
                "https://images.unsplash.com/photo-1642976975710-1d8890dbf5ab?w=800"
            ],
            "status": "available",
            "owner_id": owner1_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "property_id": f"prop_{uuid.uuid4().hex[:12]}",
            "title": "Contemporary Townhouse",
            "description": "Modern 3-level townhouse with attached garage. Recently renovated with smart home features.",
            "property_type": "Townhouse",
            "address": "890 Cedar Lane",
            "city": "Boston",
            "state": "MA",
            "rent_amount": 3200.00,
            "deposit_amount": 6400.00,
            "bedrooms": 3,
            "bathrooms": 2,
            "area_sqft": 1650,
            "amenities": ["Garage", "Smart Home", "Central AC", "Washer/Dryer", "Patio"],
            "images": [
                "https://images.unsplash.com/photo-1766603636562-531bb3e1dda8?w=800",
                "https://images.unsplash.com/photo-1746458258536-b9ee5db20a73?w=800",
                "https://images.pexels.com/photos/3034343/pexels-photo-3034343.jpeg?w=800"
            ],
            "status": "occupied",
            "owner_id": owner2_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.properties.insert_many(properties)
    print(f"Created {len(properties)} properties")
    
    occupied_properties = [p for p in properties if p["status"] == "occupied"]
    
    print("Creating rental records for occupied properties...")
    rental_records = []
    for prop in occupied_properties:
        rental_records.append({
            "rental_id": f"rental_{uuid.uuid4().hex[:12]}",
            "property_id": prop["property_id"],
            "tenant_id": tenant1_id,
            "start_date": datetime.now(timezone.utc).isoformat(),
            "monthly_rent": prop["rent_amount"],
            "payment_status": "paid",
            "last_payment_date": datetime.now(timezone.utc).isoformat(),
            "next_payment_due": (datetime.now(timezone.utc) + timedelta(days=30)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
    
    if rental_records:
        await db.rental_records.insert_many(rental_records)
        print(f"Created {len(rental_records)} rental records")
    
    print("Creating visit requests...")
    visit_requests = [
        {
            "visit_id": f"visit_{uuid.uuid4().hex[:12]}",
            "property_id": properties[0]["property_id"],
            "user_id": tenant1_id,
            "user_name": "Jessica Williams",
            "user_email": "tenant1@rental.com",
            "user_phone": "+1-555-0301",
            "status": "pending",
            "stage": "talked",
            "assigned_agent_id": agent1_id,
            "notes": "Interested in viewing this weekend",
            "preferred_date": (datetime.now(timezone.utc) + timedelta(days=2)).isoformat(),
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "visit_id": f"visit_{uuid.uuid4().hex[:12]}",
            "property_id": properties[1]["property_id"],
            "user_id": tenant2_id,
            "user_name": "Robert Martinez",
            "user_email": "tenant2@rental.com",
            "user_phone": "+1-555-0302",
            "status": "pending",
            "stage": "new",
            "assigned_agent_id": None,
            "notes": "Looking for family home",
            "preferred_date": None,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "visit_id": f"visit_{uuid.uuid4().hex[:12]}",
            "property_id": properties[3]["property_id"],
            "user_id": tenant1_id,
            "user_name": "Jessica Williams",
            "user_email": "tenant1@rental.com",
            "user_phone": "+1-555-0301",
            "status": "pending",
            "stage": "visit_scheduled",
            "assigned_agent_id": agent2_id,
            "notes": "Very interested in luxury properties",
            "preferred_date": (datetime.now(timezone.utc) + timedelta(days=5)).isoformat(),
            "created_at": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.visit_requests.insert_many(visit_requests)
    print(f"Created {len(visit_requests)} visit requests")
    
    print("\n✅ Database seeded successfully!")
    print(f"Total users: {len(users)}")
    print(f"Total properties: {len(properties)}")
    print(f"Total visit requests: {len(visit_requests)}")
    print(f"Total rental records: {len(rental_records)}")
    
    client.close()

if __name__ == \"__main__\":
    asyncio.run(seed_database())
