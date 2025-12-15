"""
Seed Phase 1 Demo Data
Creates demo parents, children, sessions, and appointments for testing
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv
from passlib.hash import bcrypt
import random

load_dotenv()

async def seed_phase1_data():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    print("🌱 Seeding Phase 1 Demo Data...")
    
    # Create demo parent user
    parent_email = "demo@parent.com"
    parent_password = "demo123"  # Simple password for demo
    
    parent_doc = {
        "id": "parent-001",
        "email": parent_email,
        "name": "Demo Parent",
        "phone": "+91 9876543210",
        "hashed_password": bcrypt.hash(parent_password),
        "role": "parent",
        "is_active": True,
        "created_at": datetime.now(timezone.utc).isoformat(),
        "last_login": None
    }
    
    await db.parent_users.delete_many({"email": parent_email})
    await db.parent_users.insert_one(parent_doc)
    print(f"✅ Created parent user: {parent_email} / {parent_password}")
    
    # Create demo children
    children = [
        {
            "id": "child-001",
            "name": "Aarav Kumar",
            "age": 8,
            "date_of_birth": "2016-05-15",
            "school": "Delhi Public School",
            "grade": "3rd Grade",
            "parent_ids": ["parent-001"],
            "observer_id": "observer-001",
            "enrollment_date": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat(),
            "status": "active",
            "notes": "Enrolled 30 days ago"
        },
        {
            "id": "child-002",
            "name": "Priya Sharma",
            "age": 10,
            "date_of_birth": "2014-08-22",
            "school": "Greenwood International",
            "grade": "5th Grade",
            "parent_ids": ["parent-001"],
            "observer_id": "observer-002",
            "enrollment_date": (datetime.now(timezone.utc) - timedelta(days=60)).isoformat(),
            "status": "active",
            "notes": "Sibling of Aarav"
        }
    ]
    
    await db.children.delete_many({"parent_ids": "parent-001"})
    await db.children.insert_many(children)
    print(f"✅ Created {len(children)} demo children")
    
    # Create demo session notes (last 30 days)
    session_templates = [
        {
            "topics": ["School experience", "Friendships"],
            "observations": "Child was excited to share about a new friend they made in class. Showed enthusiasm when talking about recess activities.",
            "concerns": "",
            "activities": ["Practice active listening", "Share feelings journal"]
        },
        {
            "topics": ["Family time", "Emotions"],
            "observations": "Expressed feeling happy about recent family outing. Talked openly about missing grandparents.",
            "concerns": "",
            "activities": ["Gratitude practice", "Drawing emotions"]
        },
        {
            "topics": ["School challenges", "Problem-solving"],
            "observations": "Mentioned difficulty with math homework. Worked through problem-solving strategies together.",
            "concerns": "Mild frustration with academic challenges",
            "activities": ["Break tasks into smaller steps", "Celebrate small wins"]
        },
        {
            "topics": ["Hobbies", "Self-expression"],
            "observations": "Very animated discussing favorite books and drawing. Showed confidence in creative expression.",
            "concerns": "",
            "activities": ["Creative journaling", "Art activities"]
        },
        {
            "topics": ["Peer relationships", "Emotions"],
            "observations": "Talked about a disagreement with a friend. Demonstrated good awareness of own feelings.",
            "concerns": "",
            "activities": ["Friendship problem-solving", "Emotion naming"]
        }
    ]
    
    sessions = []
    for child in children:
        # Create 20 sessions over last 30 days
        for i in range(20):
            days_ago = 30 - (i * 1.5)  # Roughly every 1.5 days
            session_date = datetime.now(timezone.utc) - timedelta(days=days_ago)
            
            template = random.choice(session_templates)
            mood = random.randint(3, 5)  # Mostly positive moods
            engagement = random.choice(["medium", "high", "high"])  # Mostly engaged
            
            session = {
                "id": f"session-{child['id']}-{i:03d}",
                "child_id": child['id'],
                "observer_id": child['observer_id'],
                "session_date": session_date.isoformat(),
                "duration_minutes": 5,
                "mood_rating": mood,
                "engagement_level": engagement,
                "topics_discussed": template['topics'],
                "key_observations": template['observations'],
                "concerns": template['concerns'],
                "recommended_activities": template['activities'],
                "parent_visible": True,
                "created_at": session_date.isoformat()
            }
            sessions.append(session)
    
    await db.session_notes.delete_many({"child_id": {"$in": ["child-001", "child-002"]}})
    await db.session_notes.insert_many(sessions)
    print(f"✅ Created {len(sessions)} demo session notes")
    
    # Create progress metrics
    metrics = []
    metric_types = ["emotional_regulation", "confidence", "communication", "social_skills"]
    
    for child in children:
        # Create 10 metrics over time showing improvement
        for i in range(10):
            days_ago = 30 - (i * 3)
            recorded_at = datetime.now(timezone.utc) - timedelta(days=days_ago)
            
            for metric_type in metric_types:
                # Show gradual improvement
                base_score = 5 + (i * 0.3)  # Starts at 5, increases to ~8
                score = min(10, int(base_score + random.uniform(-0.5, 0.5)))
                
                metric = {
                    "id": f"metric-{child['id']}-{metric_type}-{i}",
                    "child_id": child['id'],
                    "metric_type": metric_type,
                    "score": score,
                    "notes": f"Observed improvement in {metric_type.replace('_', ' ')}",
                    "recorded_by": child['observer_id'],
                    "recorded_at": recorded_at.isoformat()
                }
                metrics.append(metric)
    
    await db.progress_metrics.delete_many({"child_id": {"$in": ["child-001", "child-002"]}})
    await db.progress_metrics.insert_many(metrics)
    print(f"✅ Created {len(metrics)} progress metrics")
    
    # Create appointments (upcoming and past)
    appointments = []
    
    for child in children:
        # Past completed appointments
        for i in range(15):
            days_ago = 15 - i
            appt_time = datetime.now(timezone.utc) - timedelta(days=days_ago)
            appt_time = appt_time.replace(hour=16, minute=0, second=0, microsecond=0)
            
            appointment = {
                "id": f"appt-{child['id']}-past-{i:03d}",
                "child_id": child['id'],
                "observer_id": child['observer_id'],
                "scheduled_time": appt_time.isoformat(),
                "duration_minutes": 5,
                "status": "completed",
                "reminder_sent": True,
                "notes": "",
                "created_at": (appt_time - timedelta(days=1)).isoformat(),
                "updated_at": appt_time.isoformat()
            }
            appointments.append(appointment)
        
        # Upcoming appointments
        for i in range(7):
            days_ahead = i + 1
            appt_time = datetime.now(timezone.utc) + timedelta(days=days_ahead)
            appt_time = appt_time.replace(hour=16, minute=0, second=0, microsecond=0)
            
            appointment = {
                "id": f"appt-{child['id']}-future-{i:03d}",
                "child_id": child['id'],
                "observer_id": child['observer_id'],
                "scheduled_time": appt_time.isoformat(),
                "duration_minutes": 5,
                "status": "scheduled",
                "reminder_sent": False,
                "notes": "",
                "created_at": datetime.now(timezone.utc).isoformat(),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }
            appointments.append(appointment)
    
    await db.appointments.delete_many({"child_id": {"$in": ["child-001", "child-002"]}})
    await db.appointments.insert_many(appointments)
    print(f"✅ Created {len(appointments)} appointments")
    
    print("\n🎉 Phase 1 Demo Data Seeded Successfully!")
    print("\n📋 Demo Credentials:")
    print(f"   Email: {parent_email}")
    print(f"   Password: {parent_password}")
    print(f"\n👶 Demo Children: {len(children)}")
    print(f"📝 Demo Sessions: {len(sessions)}")
    print(f"📊 Progress Metrics: {len(metrics)}")
    print(f"📅 Appointments: {len(appointments)}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_phase1_data())
