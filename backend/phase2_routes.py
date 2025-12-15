"""
Phase 2 Routes - Messaging, Resources, Gamification
"""
from fastapi import APIRouter, HTTPException, Depends
from typing import List
from models import Message, Conversation, Activity, ResourceArticle, Badge, ChildBadge, ChildStreak
from parent_routes import verify_parent_token
import logging
import uuid
from datetime import datetime, timezone

router = APIRouter()
db = None
logger = logging.getLogger(__name__)

def set_database(database):
    """Set the database instance from main server"""
    global db
    db = database

# ==================== MESSAGING SYSTEM ====================

@router.get("/parent/conversations")
async def get_parent_conversations(current_user: dict = Depends(verify_parent_token)):
    """Get all conversations for a parent"""
    try:
        parent_id = current_user['id']
        
        conversations = await db.conversations.find(
            {"parent_id": parent_id},
            {"_id": 0}
        ).sort("last_message_at", -1).to_list(100)
        
        return {"conversations": conversations}
    except Exception as e:
        logger.error(f"Error fetching conversations: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load conversations")

@router.get("/parent/messages/{conversation_id}")
async def get_conversation_messages(
    conversation_id: str,
    current_user: dict = Depends(verify_parent_token)
):
    """Get all messages in a conversation"""
    try:
        parent_id = current_user['id']
        
        # Verify parent has access to this conversation
        conversation = await db.conversations.find_one({
            "id": conversation_id,
            "parent_id": parent_id
        }, {"_id": 0})
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Get messages
        messages = await db.messages.find(
            {"conversation_id": conversation_id},
            {"_id": 0}
        ).sort("created_at", 1).to_list(1000)
        
        # Mark as read for parent
        await db.messages.update_many(
            {
                "conversation_id": conversation_id,
                "recipient_type": "parent",
                "read": False
            },
            {"$set": {"read": True}}
        )
        
        # Update unread count
        await db.conversations.update_one(
            {"id": conversation_id},
            {"$set": {"unread_count_parent": 0}}
        )
        
        return {"messages": messages, "conversation": conversation}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching messages: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load messages")

@router.post("/parent/messages")
async def send_message(
    conversation_id: str,
    message_text: str,
    current_user: dict = Depends(verify_parent_token)
):
    """Send a message to observer"""
    try:
        parent_id = current_user['id']
        
        # Get conversation
        conversation = await db.conversations.find_one({
            "id": conversation_id,
            "parent_id": parent_id
        }, {"_id": 0})
        
        if not conversation:
            raise HTTPException(status_code=404, detail="Conversation not found")
        
        # Create message
        message = {
            "id": str(uuid.uuid4()),
            "conversation_id": conversation_id,
            "sender_id": parent_id,
            "sender_type": "parent",
            "recipient_id": conversation['observer_id'],
            "recipient_type": "observer",
            "child_id": conversation['child_id'],
            "message_text": message_text,
            "read": False,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.messages.insert_one(message)
        
        # Update conversation
        await db.conversations.update_one(
            {"id": conversation_id},
            {
                "$set": {
                    "last_message": message_text[:100],
                    "last_message_at": datetime.now(timezone.utc).isoformat()
                },
                "$inc": {"unread_count_observer": 1}
            }
        )
        
        return {"success": True, "message": message}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending message: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send message")

# ==================== RESOURCES & ACTIVITIES ====================

@router.get("/resources/activities")
async def get_activities(
    age_range: str = None,
    category: str = None,
    current_user: dict = Depends(verify_parent_token)
):
    """Get activities filtered by age and category"""
    try:
        query = {}
        if age_range:
            query["age_range"] = age_range
        if category:
            query["category"] = category
        
        activities = await db.activities.find(query, {"_id": 0}).to_list(100)
        
        return {"activities": activities}
    except Exception as e:
        logger.error(f"Error fetching activities: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load activities")

@router.get("/resources/articles")
async def get_articles(
    category: str = None,
    current_user: dict = Depends(verify_parent_token)
):
    """Get resource articles"""
    try:
        query = {}
        if category:
            query["category"] = category
        
        articles = await db.resource_articles.find(query, {"_id": 0}).to_list(100)
        
        return {"articles": articles}
    except Exception as e:
        logger.error(f"Error fetching articles: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load articles")

# ==================== GAMIFICATION ====================

@router.get("/parent/child/{child_id}/rewards")
async def get_child_rewards(
    child_id: str,
    current_user: dict = Depends(verify_parent_token)
):
    """Get child's badges and streaks"""
    try:
        parent_id = current_user['id']
        
        # Verify access
        child = await db.children.find_one({"id": child_id, "parent_ids": parent_id})
        if not child:
            raise HTTPException(status_code=404, detail="Child not found")
        
        # Get earned badges
        child_badges = await db.child_badges.find(
            {"child_id": child_id},
            {"_id": 0}
        ).to_list(100)
        
        # Get badge details
        badge_ids = [cb['badge_id'] for cb in child_badges]
        badges = await db.badges.find(
            {"id": {"$in": badge_ids}},
            {"_id": 0}
        ).to_list(100)
        
        # Combine badges with earned date
        earned_badges = []
        for cb in child_badges:
            badge = next((b for b in badges if b['id'] == cb['badge_id']), None)
            if badge:
                earned_badges.append({
                    **badge,
                    "earned_at": cb['earned_at'],
                    "displayed": cb.get('displayed', True)
                })
        
        # Get streak
        streak = await db.child_streaks.find_one(
            {"child_id": child_id},
            {"_id": 0}
        )
        
        if not streak:
            streak = {
                "child_id": child_id,
                "current_streak": 0,
                "longest_streak": 0,
                "total_sessions": 0
            }
        
        return {
            "badges": earned_badges,
            "streak": streak,
            "total_badges": len(earned_badges)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching rewards: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load rewards")
