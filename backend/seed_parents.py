from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
from dotenv import load_dotenv
from passlib.context import CryptContext

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_parents():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    print("🌱 Seeding parent data...")
    
    # Clear existing parents
    await db.parents.delete_many({})
    
    # Create demo parent
    parent = {
        "id": "parent-001",
        "email": "demo@parent.com",
        "name": "Demo Parent",
        "phone": "+91-9876543210",
        "hashed_password": pwd_context.hash("demo123"),
        "role": "parent",
        "is_active": True,
        "created_at": "2024-01-15T10:00:00",
        "last_login": None
    }
    
    await db.parents.insert_one(parent)
    print("✓ Created Demo Parent (demo@parent.com / demo123)")
    
    # Verify parent data
    parents = await db.parents.find({}, {"_id": 0, "hashed_password": 0}).to_list(10)
    print(f"\n✅ Seeded {len(parents)} parent(s)")
    for p in parents:
        print(f"  - {p['name']} ({p['email']}) - ID: {p['id']}")
    
    # Show children links
    children = await db.children.find({"parent_ids": "parent-001"}, {"_id": 0}).to_list(10)
    print(f"\n✓ This parent has access to {len(children)} children:")
    for c in children:
        print(f"  - {c['name']}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_parents())
