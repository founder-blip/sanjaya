"""Seed Phase 2 Demo Data - Messaging, Resources, Gamification"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()

async def seed_phase2_data():
    client = AsyncIOMotorClient(os.environ['MONGO_URL'])
    db = client[os.environ['DB_NAME']]
    
    print("🌱 Seeding Phase 2 Demo Data...")
    
    # Create conversations
    conversations = [
        {
            "id": "conv-001",
            "parent_id": "parent-001",
            "observer_id": "observer-001",
            "child_id": "child-001",
            "last_message": "Thank you for the update on Aarav's progress!",
            "last_message_at": datetime.now(timezone.utc).isoformat(),
            "unread_count_parent": 0,
            "unread_count_observer": 0,
            "created_at": (datetime.now(timezone.utc) - timedelta(days=30)).isoformat()
        }
    ]
    
    await db.conversations.delete_many({})
    await db.conversations.insert_many(conversations)
    print(f"✅ Created {len(conversations)} conversations")
    
    # Create sample messages
    messages = [
        {
            "id": "msg-001",
            "conversation_id": "conv-001",
            "sender_id": "parent-001",
            "sender_type": "parent",
            "recipient_id": "observer-001",
            "recipient_type": "observer",
            "child_id": "child-001",
            "message_text": "Hello! I wanted to ask about Aarav's recent sessions. He's been talking about school more at home.",
            "read": True,
            "created_at": (datetime.now(timezone.utc) - timedelta(days=2)).isoformat()
        },
        {
            "id": "msg-002",
            "conversation_id": "conv-001",
            "sender_id": "observer-001",
            "sender_type": "observer",
            "recipient_id": "parent-001",
            "recipient_type": "parent",
            "child_id": "child-001",
            "message_text": "That's wonderful! Aarav has been very engaged in our sessions. He's showing great progress in expressing his feelings about school experiences.",
            "read": True,
            "created_at": (datetime.now(timezone.utc) - timedelta(days=1, hours=12)).isoformat()
        },
        {
            "id": "msg-003",
            "conversation_id": "conv-001",
            "sender_id": "parent-001",
            "sender_type": "parent",
            "recipient_id": "observer-001",
            "recipient_type": "observer",
            "child_id": "child-001",
            "message_text": "Thank you for the update! Are there any activities we can do at home to support his progress?",
            "read": True,
            "created_at": (datetime.now(timezone.utc) - timedelta(hours=6)).isoformat()
        }
    ]
    
    await db.messages.delete_many({})
    await db.messages.insert_many(messages)
    print(f"✅ Created {len(messages)} messages")
    
    # Create activities
    activities = [
        {
            "id": "act-001",
            "title": "Emotion Face Drawing",
            "description": "Help your child identify and express different emotions through drawing",
            "age_range": "5-10",
            "category": "emotional_regulation",
            "duration_minutes": 15,
            "materials_needed": ["Paper", "Crayons or markers", "Mirror (optional)"],
            "instructions": [
                "Sit with your child in a comfortable space",
                "Talk about different emotions (happy, sad, angry, excited)",
                "Ask them to draw faces showing each emotion",
                "Discuss when they feel each emotion"
            ],
            "tips": ["Make it fun!", "Share your own emotions too", "No right or wrong answers"],
            "difficulty": "easy",
            "image_url": "",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "act-002",
            "title": "Feelings Charades",
            "description": "Act out different emotions to build emotional vocabulary",
            "age_range": "8-13",
            "category": "communication",
            "duration_minutes": 20,
            "materials_needed": ["Paper for emotion cards (optional)"],
            "instructions": [
                "Write different emotions on pieces of paper",
                "Take turns picking and acting out the emotion",
                "Other person guesses the emotion",
                "Discuss times when you've felt that way"
            ],
            "tips": ["Start with basic emotions", "Add more complex ones as you go", "Make it silly and fun"],
            "difficulty": "easy",
            "image_url": "",
            "created_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "act-003",
            "title": "Confidence Building Mirror Talk",
            "description": "Daily affirmations to build self-confidence",
            "age_range": "5-13",
            "category": "confidence",
            "duration_minutes": 5,
            "materials_needed": ["Mirror"],
            "instructions": [
                "Stand together in front of a mirror",
                "Take turns saying positive things about yourselves",
                "Examples: 'I am kind', 'I am brave', 'I can learn new things'",
                "Do this every morning or evening"
            ],
            "tips": ["Model positive self-talk", "Celebrate small wins", "Be consistent"],
            "difficulty": "easy",
            "image_url": "",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.activities.delete_many({})
    await db.activities.insert_many(activities)
    print(f"✅ Created {len(activities)} activities")
    
    # Create resource articles
    articles = [
        {
            "id": "art-001",
            "title": "Understanding Your Child's Emotions: A Parent's Guide",
            "category": "emotional_development",
            "excerpt": "Learn how to recognize and respond to your child's emotional needs effectively.",
            "content": "Full article content would go here...",
            "age_relevant": ["5-7", "8-10"],
            "read_time_minutes": 5,
            "author": "Dr. Punam Jaiswal",
            "image_url": "",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.resource_articles.delete_many({})
    await db.resource_articles.insert_many(articles)
    print(f"✅ Created {len(articles)} articles")
    
    # Create badges
    badges = [
        {
            "id": "badge-001",
            "name": "First Steps",
            "description": "Completed your first session!",
            "icon": "🎉",
            "criteria": "Complete 1 session",
            "rarity": "common"
        },
        {
            "id": "badge-002",
            "name": "Week Warrior",
            "description": "7 days in a row!",
            "icon": "🔥",
            "criteria": "Complete 7 consecutive sessions",
            "rarity": "rare"
        },
        {
            "id": "badge-003",
            "name": "Communication Champion",
            "description": "Mastered communication skills",
            "icon": "💬",
            "criteria": "Communication score above 8",
            "rarity": "epic"
        }
    ]
    
    await db.badges.delete_many({})
    await db.badges.insert_many(badges)
    print(f"✅ Created {len(badges)} badges")
    
    # Assign badges to children
    child_badges = [
        {
            "id": "cb-001",
            "child_id": "child-001",
            "badge_id": "badge-001",
            "earned_at": (datetime.now(timezone.utc) - timedelta(days=25)).isoformat(),
            "displayed": True
        },
        {
            "id": "cb-002",
            "child_id": "child-001",
            "badge_id": "badge-002",
            "earned_at": (datetime.now(timezone.utc) - timedelta(days=18)).isoformat(),
            "displayed": True
        }
    ]
    
    await db.child_badges.delete_many({})
    await db.child_badges.insert_many(child_badges)
    print(f"✅ Assigned {len(child_badges)} badges to children")
    
    # Create streaks
    streaks = [
        {
            "id": "streak-001",
            "child_id": "child-001",
            "current_streak": 15,
            "longest_streak": 20,
            "last_session_date": datetime.now(timezone.utc).date().isoformat(),
            "total_sessions": 20,
            "updated_at": datetime.now(timezone.utc).isoformat()
        },
        {
            "id": "streak-002",
            "child_id": "child-002",
            "current_streak": 12,
            "longest_streak": 15,
            "last_session_date": datetime.now(timezone.utc).date().isoformat(),
            "total_sessions": 20,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
    ]
    
    await db.child_streaks.delete_many({})
    await db.child_streaks.insert_many(streaks)
    print(f"✅ Created {len(streaks)} streaks")
    
    print("\n🎉 Phase 2 Demo Data Seeded Successfully!")
    print(f"\n📊 Summary:")
    print(f"   Conversations: {len(conversations)}")
    print(f"   Messages: {len(messages)}")
    print(f"   Activities: {len(activities)}")
    print(f"   Articles: {len(articles)}")
    print(f"   Badges: {len(badges)}")
    print(f"   Child Badges: {len(child_badges)}")
    print(f"   Streaks: {len(streaks)}")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_phase2_data())
