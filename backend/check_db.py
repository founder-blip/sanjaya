from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def check_db():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    parents = await db.parents.find({}, {"_id": 0}).to_list(10)
    print(f"Found {len(parents)} parents:")
    for p in parents:
        print(f"  - {p.get('name')} ({p.get('email')}) - ID: {p.get('id')}")
    
    children = await db.children.find({}, {"_id": 0}).to_list(10)
    print(f"\nFound {len(children)} children:")
    for c in children:
        print(f"  - {c.get('name')} - Parent IDs: {c.get('parent_ids', [])}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(check_db())
