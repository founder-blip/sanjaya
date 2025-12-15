from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def fix_guardian_links():
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("Fixing guardian links...")
    
    # Get demo parent
    parent = await db.parents.find_one({"email": "demo@parent.com"})
    if not parent:
        print("❌ Demo parent not found")
        return
    
    parent_id = parent['id']
    print(f"✓ Found demo parent: {parent['name']} ({parent_id})")
    
    # Update both children to have this parent
    result1 = await db.children.update_one(
        {"id": "child-001"},
        {"$addToSet": {"parent_ids": parent_id}}
    )
    
    result2 = await db.children.update_one(
        {"id": "child-002"},
        {"$addToSet": {"parent_ids": parent_id}}
    )
    
    print(f"✓ Updated child-001 (modified: {result1.modified_count})")
    print(f"✓ Updated child-002 (modified: {result2.modified_count})")
    
    # Verify
    children = await db.children.find({"parent_ids": parent_id}, {"_id": 0}).to_list(10)
    print(f"\n✓ Demo parent now has access to {len(children)} children")
    for child in children:
        print(f"  - {child['name']} (Guardians: {len(child.get('parent_ids', []))})")
    
    client.close()
    print("\n✅ Guardian links fixed!")

if __name__ == "__main__":
    asyncio.run(fix_guardian_links())
