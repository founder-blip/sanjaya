from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
from dotenv import load_dotenv

load_dotenv()

async def fix_school():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    # Update all children to be from Greenwood International School
    result = await db.children.update_many(
        {},
        {"$set": {"school": "Greenwood International School"}}
    )
    
    print(f"✓ Updated {result.modified_count} children to Greenwood International School")
    
    # Verify
    children = await db.children.find({}, {"_id": 0}).to_list(10)
    for child in children:
        print(f"  - {child['name']}: {child['school']}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(fix_school())
