"""
Seed Phase 3 Data: Mood Entries, Goals, Forum Posts, Group Sessions
"""
from motor.motor_asyncio import AsyncIOMotorClient
import asyncio
import os
from datetime import datetime, timedelta, timezone
from dotenv import load_dotenv

load_dotenv()

async def seed_phase3_data():
    # Connect to MongoDB
    mongo_url = os.environ['MONGO_URL']
    client = AsyncIOMotorClient(mongo_url)
    db = client[os.environ['DB_NAME']]
    
    print("🌱 Seeding Phase 3 data...")
    
    # Clear existing Phase 3 data
    await db.mood_entries.delete_many({})
    await db.goals.delete_many({})
    await db.forum_posts.delete_many({})
    await db.forum_comments.delete_many({})
    await db.forum_likes.delete_many({})
    await db.group_sessions.delete_many({})
    await db.session_registrations.delete_many({})
    
    # ==================== MOOD ENTRIES ====================
    print("Creating mood entries...")
    
    today = datetime.now(timezone.utc)
    mood_data = [
        # Last 14 days for child-001
        {"child_id": "child-001", "observer_id": "observer-001", "mood": "happy", "emoji": "🙂", "notes": "Had a great session today, very engaged!", "days_ago": 0},
        {"child_id": "child-001", "observer_id": "observer-001", "mood": "neutral", "emoji": "😐", "notes": "A bit quiet today, but participated when encouraged.", "days_ago": 1},
        {"child_id": "child-001", "observer_id": "observer-001", "mood": "very_happy", "emoji": "😊", "notes": "Excellent! Made a new friend during activities.", "days_ago": 2},
        {"child_id": "child-001", "observer_id": "observer-001", "mood": "happy", "emoji": "🙂", "notes": "Good energy, enjoyed the storytelling activity.", "days_ago": 3},
        {"child_id": "child-001", "observer_id": "observer-001", "mood": "sad", "emoji": "😔", "notes": "Was upset about a situation at school.", "days_ago": 4},
        {"child_id": "child-001", "observer_id": "observer-001", "mood": "neutral", "emoji": "😐", "notes": "Average day, focused on breathing exercises.", "days_ago": 5},
        {"child_id": "child-001", "observer_id": "observer-001", "mood": "happy", "emoji": "🙂", "notes": "Better today, practiced positive affirmations.", "days_ago": 6},
        {"child_id": "child-001", "observer_id": "observer-001", "mood": "very_happy", "emoji": "😊", "notes": "Great progress! Successfully shared feelings.", "days_ago": 7},
        {"child_id": "child-001", "observer_id": "observer-001", "mood": "happy", "emoji": "🙂", "notes": "Confident and expressive today.", "days_ago": 8},
        {"child_id": "child-001", "observer_id": "observer-001", "mood": "neutral", "emoji": "😐", "notes": "Quiet but attentive.", "days_ago": 9},
        {"child_id": "child-001", "observer_id": "observer-001", "mood": "happy", "emoji": "🙂", "notes": "Enjoyed art therapy session.", "days_ago": 10},
        {"child_id": "child-001", "observer_id": "observer-001", "mood": "very_happy", "emoji": "😊", "notes": "Wonderful session! Lots of smiles.", "days_ago": 11},
        {"child_id": "child-001", "observer_id": "observer-001", "mood": "happy", "emoji": "🙂", "notes": "Good communication skills demonstrated.", "days_ago": 12},
        {"child_id": "child-001", "observer_id": "observer-001", "mood": "neutral", "emoji": "😐", "notes": "Calm and reflective.", "days_ago": 13},
    ]
    
    mood_entries = []
    for entry in mood_data:
        date = (today - timedelta(days=entry["days_ago"])).date().isoformat()
        mood_entries.append({
            "id": f"mood-{entry['child_id']}-{entry['days_ago']}",
            "child_id": entry["child_id"],
            "observer_id": entry["observer_id"],
            "session_id": None,
            "mood": entry["mood"],
            "mood_emoji": entry["emoji"],
            "notes": entry["notes"],
            "triggers": [],
            "logged_date": date,
            "created_at": (today - timedelta(days=entry["days_ago"])).isoformat()
        })
    
    await db.mood_entries.insert_many(mood_entries)
    print(f"✓ Created {len(mood_entries)} mood entries")
    
    # ==================== GOALS ====================
    print("Creating goals...")
    
    goals = [
        {
            "id": "goal-001",
            "child_id": "child-001",
            "observer_id": "observer-001",
            "title": "Express feelings with words",
            "description": "Practice identifying and expressing emotions using age-appropriate vocabulary",
            "category": "emotional",
            "target_date": (today + timedelta(days=30)).date().isoformat(),
            "progress": 65,
            "status": "active",
            "milestones": [
                {"text": "Learn emotion words (happy, sad, angry, scared)", "completed": True},
                {"text": "Use 'I feel...' statements in conversations", "completed": True},
                {"text": "Express feelings without prompting", "completed": False}
            ],
            "parent_notes": "",
            "created_at": (today - timedelta(days=20)).isoformat(),
            "updated_at": today.isoformat(),
            "completed_at": None
        },
        {
            "id": "goal-002",
            "child_id": "child-001",
            "observer_id": "observer-001",
            "title": "Build confidence in social situations",
            "description": "Gradually increase comfort level when interacting with peers",
            "category": "social",
            "target_date": (today + timedelta(days=60)).date().isoformat(),
            "progress": 40,
            "status": "active",
            "milestones": [
                {"text": "Say hello to one new person each day", "completed": True},
                {"text": "Join a group activity", "completed": False},
                {"text": "Initiate a conversation", "completed": False}
            ],
            "parent_notes": "",
            "created_at": (today - timedelta(days=15)).isoformat(),
            "updated_at": today.isoformat(),
            "completed_at": None
        },
        {
            "id": "goal-003",
            "child_id": "child-001",
            "observer_id": "observer-001",
            "title": "Practice mindfulness daily",
            "description": "Use breathing techniques when feeling overwhelmed",
            "category": "behavioral",
            "target_date": (today + timedelta(days=45)).date().isoformat(),
            "progress": 80,
            "status": "active",
            "milestones": [
                {"text": "Learn 3 breathing exercises", "completed": True},
                {"text": "Practice for 5 minutes daily", "completed": True},
                {"text": "Use independently when upset", "completed": True}
            ],
            "parent_notes": "",
            "created_at": (today - timedelta(days=30)).isoformat(),
            "updated_at": today.isoformat(),
            "completed_at": None
        }
    ]
    
    await db.goals.insert_many(goals)
    print(f"✓ Created {len(goals)} goals")
    
    # ==================== FORUM POSTS ====================
    print("Creating forum posts...")
    
    forum_posts = [
        {
            "id": "post-001",
            "parent_id": "parent-001",
            "category": "emotional_support",
            "title": "How do you handle bedtime anxiety?",
            "content": "My child has been struggling with anxiety at bedtime. We've tried reading, calming music, and a consistent routine, but they still get very worried. Any advice from parents who've been through this?",
            "is_anonymous": True,
            "likes_count": 5,
            "comments_count": 3,
            "is_pinned": False,
            "created_at": (today - timedelta(days=3)).isoformat(),
            "updated_at": (today - timedelta(days=3)).isoformat()
        },
        {
            "id": "post-002",
            "parent_id": "parent-002",
            "category": "activities",
            "title": "Great outdoor activity for emotional regulation",
            "content": "We discovered that nature walks really help our child process emotions. We bring a small journal and encourage them to draw what they see. It's been amazing for their mood!",
            "is_anonymous": True,
            "likes_count": 12,
            "comments_count": 5,
            "is_pinned": True,
            "created_at": (today - timedelta(days=5)).isoformat(),
            "updated_at": (today - timedelta(days=5)).isoformat()
        },
        {
            "id": "post-003",
            "parent_id": "parent-001",
            "category": "school_issues",
            "title": "Communication with teachers about emotional needs",
            "content": "How do you approach teachers about your child's emotional support needs? I want to advocate without overstepping. Would love to hear your experiences.",
            "is_anonymous": True,
            "likes_count": 8,
            "comments_count": 6,
            "is_pinned": False,
            "created_at": (today - timedelta(days=2)).isoformat(),
            "updated_at": (today - timedelta(days=2)).isoformat()
        },
        {
            "id": "post-004",
            "parent_id": "parent-002",
            "category": "general",
            "title": "Celebrating small wins",
            "content": "Just wanted to share that my child initiated a playdate for the first time! It might seem small, but it's huge progress for us. Remember to celebrate every step forward! 🎉",
            "is_anonymous": True,
            "likes_count": 18,
            "comments_count": 4,
            "is_pinned": False,
            "created_at": (today - timedelta(days=1)).isoformat(),
            "updated_at": (today - timedelta(days=1)).isoformat()
        }
    ]
    
    await db.forum_posts.insert_many(forum_posts)
    print(f"✓ Created {len(forum_posts)} forum posts")
    
    # ==================== FORUM COMMENTS ====================
    print("Creating forum comments...")
    
    forum_comments = [
        {
            "id": "comment-001",
            "post_id": "post-001",
            "parent_id": "parent-002",
            "content": "We went through the same thing! What helped us was creating a 'worry box' where they could write or draw their worries before bed. Then we'd 'put them away' until morning.",
            "is_anonymous": True,
            "likes_count": 3,
            "created_at": (today - timedelta(days=2, hours=20)).isoformat()
        },
        {
            "id": "comment-002",
            "post_id": "post-001",
            "parent_id": "parent-001",
            "content": "Thank you! That's a great idea. I'll try the worry box tonight.",
            "is_anonymous": True,
            "likes_count": 1,
            "created_at": (today - timedelta(days=2, hours=18)).isoformat()
        },
        {
            "id": "comment-003",
            "post_id": "post-002",
            "parent_id": "parent-001",
            "content": "Love this idea! We've been looking for outdoor activities. How long are your walks usually?",
            "is_anonymous": True,
            "likes_count": 2,
            "created_at": (today - timedelta(days=4)).isoformat()
        },
        {
            "id": "comment-004",
            "post_id": "post-004",
            "parent_id": "parent-002",
            "content": "That's wonderful! Every milestone matters. Congratulations! 🎊",
            "is_anonymous": True,
            "likes_count": 5,
            "created_at": (today - timedelta(hours=12)).isoformat()
        }
    ]
    
    await db.forum_comments.insert_many(forum_comments)
    print(f"✓ Created {len(forum_comments)} forum comments")
    
    # ==================== GROUP SESSIONS ====================
    print("Creating group coaching sessions...")
    
    group_sessions = [
        {
            "id": "session-001",
            "title": "Managing Your Child's Big Emotions",
            "description": "Learn practical strategies to help your child navigate intense emotions and build emotional intelligence.",
            "facilitator_name": "Dr. Priya Mehta",
            "facilitator_title": "Child Psychologist, PhD",
            "topic": "managing_emotions",
            "session_date": (today + timedelta(days=7)).replace(hour=19, minute=0, second=0, microsecond=0).isoformat(),
            "duration_minutes": 60,
            "max_participants": 20,
            "current_participants": 8,
            "meeting_link": "https://zoom.us/j/example001",
            "is_active": True,
            "created_at": (today - timedelta(days=14)).isoformat()
        },
        {
            "id": "session-002",
            "title": "Communication Skills for Parents",
            "description": "Discover effective communication techniques to strengthen your connection with your child and foster open dialogue.",
            "facilitator_name": "Anita Sharma",
            "facilitator_title": "Family Therapist, MSW",
            "topic": "communication_skills",
            "session_date": (today + timedelta(days=14)).replace(hour=18, minute=30, second=0, microsecond=0).isoformat(),
            "duration_minutes": 90,
            "max_participants": 15,
            "current_participants": 5,
            "meeting_link": "https://zoom.us/j/example002",
            "is_active": True,
            "created_at": (today - timedelta(days=10)).isoformat()
        },
        {
            "id": "session-003",
            "title": "Self-Care for Parents: You Matter Too",
            "description": "Taking care of yourself is essential for taking care of your child. Join us for mindfulness practices and self-care strategies.",
            "facilitator_name": "Raj Kapoor",
            "facilitator_title": "Wellness Coach",
            "topic": "parent_wellness",
            "session_date": (today + timedelta(days=21)).replace(hour=20, minute=0, second=0, microsecond=0).isoformat(),
            "duration_minutes": 60,
            "max_participants": 25,
            "current_participants": 12,
            "meeting_link": "https://zoom.us/j/example003",
            "is_active": True,
            "created_at": (today - timedelta(days=7)).isoformat()
        },
        {
            "id": "session-004",
            "title": "Building Your Child's Confidence",
            "description": "Practical tools and activities to help boost your child's self-esteem and confidence in various situations.",
            "facilitator_name": "Dr. Sneha Patel",
            "facilitator_title": "Educational Psychologist",
            "topic": "building_confidence",
            "session_date": (today + timedelta(days=28)).replace(hour=19, minute=0, second=0, microsecond=0).isoformat(),
            "duration_minutes": 75,
            "max_participants": 20,
            "current_participants": 3,
            "meeting_link": "https://zoom.us/j/example004",
            "is_active": True,
            "created_at": (today - timedelta(days=5)).isoformat()
        }
    ]
    
    await db.group_sessions.insert_many(group_sessions)
    print(f"✓ Created {len(group_sessions)} group sessions")
    
    # ==================== SESSION REGISTRATIONS ====================
    print("Creating session registrations...")
    
    registrations = [
        {
            "id": "reg-001",
            "session_id": "session-001",
            "parent_id": "parent-001",
            "parent_name": "Demo Parent",
            "parent_email": "demo@parent.com",
            "status": "registered",
            "registered_at": (today - timedelta(days=5)).isoformat()
        }
    ]
    
    await db.session_registrations.insert_many(registrations)
    print(f"✓ Created {len(registrations)} session registrations")
    
    print("\n✅ Phase 3 data seeding complete!")
    print("\nSummary:")
    print(f"  - {len(mood_entries)} mood entries")
    print(f"  - {len(goals)} goals")
    print(f"  - {len(forum_posts)} forum posts")
    print(f"  - {len(forum_comments)} forum comments")
    print(f"  - {len(group_sessions)} group sessions")
    print(f"  - {len(registrations)} registrations")
    
    client.close()

if __name__ == "__main__":
    asyncio.run(seed_phase3_data())
