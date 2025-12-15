from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
from dotenv import load_dotenv
from passlib.context import CryptContext

load_dotenv()

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def seed_observer_principal():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    print("🌱 Seeding Observer and Principal data...")
    
    # Clear existing data
    await db.observers.delete_many({})
    await db.principals.delete_many({})
    
    # Create Observer
    observer = {
        "id": "observer-001",
        "email": "observer@sanjaya.com",
        "name": "Priya Desai",
        "phone": "+91-9988776655",
        "title": "Child Emotional Support Specialist",
        "hashed_password": pwd_context.hash("observer123"),
        "role": "observer",
        "is_active": True,
        "created_at": "2024-01-10T09:00:00",
        "last_login": None
    }
    
    await db.observers.insert_one(observer)
    print(f"✓ Created Observer: {observer['name']} ({observer['email']} / observer123)")
    
    # Create Principal
    principal = {
        "id": "principal-001",
        "email": "principal@greenwood.edu",
        "name": "Rajesh Sharma",
        "school": "Greenwood International School",
        "phone": "+91-9876543210",
        "hashed_password": pwd_context.hash("principal123"),
        "role": "principal",
        "is_active": True,
        "created_at": "2024-01-05T08:00:00",
        "last_login": None
    }
    
    await db.principals.insert_one(principal)
    print(f"✓ Created Principal: {principal['name']} ({principal['email']} / principal123)")
    print(f"  School: {principal['school']}")
    
    # Verify and show connections
    print("\n=== Verifying Data Links ===")
    
    # Check children assigned to this observer
    children_with_observer = await db.children.find({"observer_id": "observer-001"}, {"_id": 0}).to_list(10)
    print(f"\nChildren assigned to Observer ({len(children_with_observer)}):")
    for child in children_with_observer:
        print(f"  - {child['name']} (Age {child['age']}, {child['school']})")
    
    # Check children from principal's school
    children_in_school = await db.children.find({"school": principal['school']}, {"_id": 0}).to_list(10)
    print(f"\nStudents at {principal['school']} ({len(children_in_school)}):")
    for child in children_in_school:
        print(f"  - {child['name']} (Age {child['age']}, Grade {child['grade']})")
    
    print("\n✅ Observer and Principal seeding complete!")
    print("\nLogin Credentials:")
    print("  Observer: observer@sanjaya.com / observer123")
    print("  Principal: principal@greenwood.edu / principal123")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_observer_principal())
