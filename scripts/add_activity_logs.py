import os
import sys
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent / "backend"))

from motor.motor_asyncio import AsyncIOMotorClient
from dotenv import load_dotenv
import asyncio
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent.parent / "backend"
load_dotenv(ROOT_DIR / '.env')

async def add_activity_logs():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("Adding activity logs to existing visit requests...")
    
    visits = await db.visit_requests.find({}, {"_id": 0}).to_list(1000)
    
    for visit in visits:
        activity_log = [
            {
                "action": "Visit request created",
                "timestamp": visit["created_at"],
                "actor": visit["user_name"],
                "actor_role": "tenant"
            }
        ]
        
        if visit.get("assigned_agent_id"):
            agent = await db.users.find_one({"user_id": visit["assigned_agent_id"]}, {"_id": 0})
            activity_log.append({
                "action": f"Assigned to agent: {agent.get('name') if agent else 'Unknown'}",
                "timestamp": visit["created_at"],
                "actor": "Admin User",
                "actor_role": "admin"
            })
        
        if visit["stage"] != "new":
            activity_log.append({
                "action": f"Stage changed to '{visit['stage']}'",
                "timestamp": visit["updated_at"],
                "actor": "Agent",
                "actor_role": "agent"
            })
        
        if visit.get("notes"):
            activity_log.append({
                "action": "Notes added",
                "timestamp": visit["updated_at"],
                "actor": visit["user_name"],
                "actor_role": "tenant"
            })
        
        await db.visit_requests.update_one(
            {"visit_id": visit["visit_id"]},
            {"$set": {"activity_log": activity_log}}
        )
    
    print(f"✅ Added activity logs to {len(visits)} visit requests")
    client.close()

if __name__ == "__main__":
    asyncio.run(add_activity_logs())
