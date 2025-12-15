"""
Phase 3 Routes - Mood Journal, Goals, Community Forum, Group Sessions
"""
from fastapi import APIRouter, HTTPException, Depends, Query
from typing import List, Optional
from models import (
    MoodEntry, Goal, ForumPost, ForumComment, ForumLike, 
    GroupSession, SessionRegistration
)
from parent_routes import verify_parent_token
import logging
import uuid
from datetime import datetime, timezone, timedelta

router = APIRouter()
db = None
logger = logging.getLogger(__name__)

def set_database(database):
    """Set the database instance from main server"""
    global db
    db = database

# ==================== MOOD JOURNAL ====================

@router.get("/observer/mood-entries/{child_id}")
async def get_child_mood_entries(
    child_id: str,
    days: int = 30,
    current_user: dict = Depends(verify_parent_token)
):
    """Get mood entries for a child (last N days)"""
    try:
        # Verify access (parent or observer)
        child = await db.children.find_one({"id": child_id}, {"_id": 0})
        if not child:
            raise HTTPException(status_code=404, detail="Child not found")
        
        # Get mood entries
        entries = await db.mood_entries.find(
            {"child_id": child_id},
            {"_id": 0}
        ).sort("logged_date", -1).limit(days).to_list(days)
        
        return {"entries": entries, "child": child}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching mood entries: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load mood entries")

@router.post("/observer/mood-entries")
async def create_mood_entry(
    child_id: str,
    mood: str,
    mood_emoji: str,
    logged_date: str,
    notes: str = "",
    triggers: List[str] = Query(default=[]),
    session_id: Optional[str] = None,
    current_user: dict = Depends(verify_parent_token)
):
    """Create a new mood entry for a child"""
    try:
        observer_id = current_user['id']
        
        # Verify child exists
        child = await db.children.find_one({"id": child_id}, {"_id": 0})
        if not child:
            raise HTTPException(status_code=404, detail="Child not found")
        
        entry = {
            "id": str(uuid.uuid4()),
            "child_id": child_id,
            "observer_id": observer_id,
            "session_id": session_id,
            "mood": mood,
            "mood_emoji": mood_emoji,
            "notes": notes,
            "triggers": triggers if triggers else [],
            "logged_date": logged_date,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.mood_entries.insert_one(entry)
        
        return {"success": True, "entry": {
            "id": entry["id"],
            "child_id": child_id,
            "mood": mood,
            "mood_emoji": mood_emoji,
            "logged_date": logged_date
        }}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating mood entry: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create mood entry")

@router.get("/parent/child/{child_id}/mood-trends")
async def get_mood_trends(
    child_id: str,
    days: int = 30,
    current_user: dict = Depends(verify_parent_token)
):
    """Get mood trends and analytics for a child"""
    try:
        parent_id = current_user['id']
        
        # Verify access
        child = await db.children.find_one({
            "id": child_id,
            "parent_ids": parent_id
        }, {"_id": 0})
        
        if not child:
            raise HTTPException(status_code=404, detail="Child not found or access denied")
        
        # Get recent mood entries
        entries = await db.mood_entries.find(
            {"child_id": child_id},
            {"_id": 0}
        ).sort("logged_date", -1).limit(days).to_list(days)
        
        # Calculate trends
        mood_counts = {"very_happy": 0, "happy": 0, "neutral": 0, "sad": 0, "very_sad": 0}
        for entry in entries:
            mood_counts[entry.get("mood", "neutral")] += 1
        
        return {
            "child": child,
            "entries": entries,
            "mood_counts": mood_counts,
            "total_entries": len(entries),
            "days_tracked": days
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching mood trends: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load mood trends")

# ==================== GOAL SETTING ====================

@router.get("/parent/child/{child_id}/goals")
async def get_child_goals(
    child_id: str,
    status: Optional[str] = None,
    current_user: dict = Depends(verify_parent_token)
):
    """Get all goals for a child"""
    try:
        parent_id = current_user['id']
        
        # Verify access
        child = await db.children.find_one({
            "id": child_id,
            "parent_ids": parent_id
        }, {"_id": 0})
        
        if not child:
            raise HTTPException(status_code=404, detail="Child not found or access denied")
        
        query = {"child_id": child_id}
        if status:
            query["status"] = status
        
        goals = await db.goals.find(query, {"_id": 0}).sort("created_at", -1).to_list(100)
        
        return {"goals": goals, "child": child}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching goals: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load goals")

@router.post("/observer/goals")
async def create_goal(
    child_id: str,
    title: str,
    description: str,
    category: str,
    target_date: Optional[str] = None,
    current_user: dict = Depends(verify_parent_token)
):
    """Create a new goal for a child"""
    try:
        observer_id = current_user['id']
        
        goal = {
            "id": str(uuid.uuid4()),
            "child_id": child_id,
            "observer_id": observer_id,
            "title": title,
            "description": description,
            "category": category,
            "target_date": target_date,
            "progress": 0,
            "status": "active",
            "milestones": [],
            "parent_notes": "",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat(),
            "completed_at": None
        }
        
        await db.goals.insert_one(goal)
        
        return {"success": True, "goal": {
            "id": goal["id"],
            "title": title,
            "category": category,
            "status": "active"
        }}
    except Exception as e:
        logger.error(f"Error creating goal: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create goal")

@router.patch("/observer/goals/{goal_id}/progress")
async def update_goal_progress(
    goal_id: str,
    progress: int,
    current_user: dict = Depends(verify_parent_token)
):
    """Update goal progress"""
    try:
        if progress < 0 or progress > 100:
            raise HTTPException(status_code=400, detail="Progress must be between 0 and 100")
        
        update_data = {
            "progress": progress,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        if progress == 100:
            update_data["status"] = "completed"
            update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
        
        result = await db.goals.update_one(
            {"id": goal_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Goal not found")
        
        return {"success": True, "progress": progress}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating goal progress: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update goal")

# ==================== COMMUNITY FORUM ====================

@router.get("/forum/posts")
async def get_forum_posts(
    category: Optional[str] = None,
    limit: int = 50,
    current_user: dict = Depends(verify_parent_token)
):
    """Get forum posts (all anonymous)"""
    try:
        query = {}
        if category:
            query["category"] = category
        
        posts = await db.forum_posts.find(query, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
        
        # Replace parent_id with "Anonymous Parent" for display
        for post in posts:
            post["author"] = "Anonymous Parent"
            post.pop("parent_id", None)
        
        return {"posts": posts}
    except Exception as e:
        logger.error(f"Error fetching forum posts: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load forum posts")

@router.post("/forum/posts")
async def create_forum_post(
    category: str,
    title: str,
    content: str,
    current_user: dict = Depends(verify_parent_token)
):
    """Create a new forum post (anonymous)"""
    try:
        parent_id = current_user['id']
        
        post = {
            "id": str(uuid.uuid4()),
            "parent_id": parent_id,
            "category": category,
            "title": title,
            "content": content,
            "is_anonymous": True,
            "likes_count": 0,
            "comments_count": 0,
            "is_pinned": False,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.forum_posts.insert_one(post)
        
        return {"success": True, "post": {
            "id": post["id"],
            "title": title,
            "category": category,
            "author": "Anonymous Parent"
        }}
    except Exception as e:
        logger.error(f"Error creating forum post: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create post")

@router.get("/forum/posts/{post_id}/comments")
async def get_post_comments(
    post_id: str,
    current_user: dict = Depends(verify_parent_token)
):
    """Get all comments for a post"""
    try:
        comments = await db.forum_comments.find(
            {"post_id": post_id},
            {"_id": 0}
        ).sort("created_at", 1).to_list(1000)
        
        # Replace parent_id with "Anonymous Parent"
        for comment in comments:
            comment["author"] = "Anonymous Parent"
            comment.pop("parent_id", None)
        
        return {"comments": comments}
    except Exception as e:
        logger.error(f"Error fetching comments: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load comments")

@router.post("/forum/posts/{post_id}/comments")
async def create_comment(
    post_id: str,
    content: str,
    current_user: dict = Depends(verify_parent_token)
):
    """Add a comment to a post (anonymous)"""
    try:
        parent_id = current_user['id']
        
        comment = {
            "id": str(uuid.uuid4()),
            "post_id": post_id,
            "parent_id": parent_id,
            "content": content,
            "is_anonymous": True,
            "likes_count": 0,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.forum_comments.insert_one(comment)
        
        # Update comment count on post
        await db.forum_posts.update_one(
            {"id": post_id},
            {"$inc": {"comments_count": 1}}
        )
        
        return {"success": True, "comment": {
            "id": comment["id"],
            "author": "Anonymous Parent",
            "created_at": comment["created_at"]
        }}
    except Exception as e:
        logger.error(f"Error creating comment: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create comment")

@router.post("/forum/like")
async def toggle_like(
    target_id: str,
    target_type: str,
    current_user: dict = Depends(verify_parent_token)
):
    """Toggle like on a post or comment"""
    try:
        parent_id = current_user['id']
        
        # Check if already liked
        existing_like = await db.forum_likes.find_one({
            "parent_id": parent_id,
            "target_id": target_id,
            "target_type": target_type
        })
        
        if existing_like:
            # Unlike
            await db.forum_likes.delete_one({"_id": existing_like["_id"]})
            increment = -1
            action = "unliked"
        else:
            # Like
            like = {
                "id": str(uuid.uuid4()),
                "parent_id": parent_id,
                "target_id": target_id,
                "target_type": target_type,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.forum_likes.insert_one(like)
            increment = 1
            action = "liked"
        
        # Update like count
        collection = db.forum_posts if target_type == "post" else db.forum_comments
        await collection.update_one(
            {"id": target_id},
            {"$inc": {"likes_count": increment}}
        )
        
        return {"success": True, "action": action}
    except Exception as e:
        logger.error(f"Error toggling like: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update like")

# ==================== GROUP COACHING SESSIONS ====================

@router.get("/group-sessions")
async def get_group_sessions(
    upcoming_only: bool = True,
    current_user: dict = Depends(verify_parent_token)
):
    """Get all group coaching sessions"""
    try:
        query = {"is_active": True}
        
        if upcoming_only:
            # Get sessions in the future
            current_time = datetime.now(timezone.utc)
            sessions = await db.group_sessions.find(query, {"_id": 0}).to_list(100)
            # Filter in Python since datetime comparison can be tricky with string dates
            sessions = [s for s in sessions if datetime.fromisoformat(s.get("session_date", "")) > current_time] if sessions else []
        else:
            sessions = await db.group_sessions.find(query, {"_id": 0}).sort("session_date", -1).to_list(100)
        
        parent_id = current_user['id']
        
        # Check which sessions the parent is registered for
        for session in sessions:
            registration = await db.session_registrations.find_one({
                "session_id": session["id"],
                "parent_id": parent_id
            }, {"_id": 0})
            session["is_registered"] = registration is not None
            session["registration_status"] = registration.get("status") if registration else None
        
        return {"sessions": sessions}
    except Exception as e:
        logger.error(f"Error fetching group sessions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load sessions")

@router.post("/group-sessions/{session_id}/register")
async def register_for_session(
    session_id: str,
    current_user: dict = Depends(verify_parent_token)
):
    """Register for a group coaching session"""
    try:
        parent_id = current_user['id']
        
        # Get session
        session = await db.group_sessions.find_one({"id": session_id}, {"_id": 0})
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        # Check if already registered
        existing = await db.session_registrations.find_one({
            "session_id": session_id,
            "parent_id": parent_id
        })
        
        if existing:
            raise HTTPException(status_code=400, detail="Already registered for this session")
        
        # Check capacity
        if session.get("current_participants", 0) >= session.get("max_participants", 20):
            raise HTTPException(status_code=400, detail="Session is full")
        
        # Get parent info
        parent = await db.parents.find_one({"id": parent_id}, {"_id": 0})
        
        registration = {
            "id": str(uuid.uuid4()),
            "session_id": session_id,
            "parent_id": parent_id,
            "parent_name": parent.get("name", "Parent"),
            "parent_email": parent.get("email", ""),
            "status": "registered",
            "registered_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.session_registrations.insert_one(registration)
        
        # Update participant count
        await db.group_sessions.update_one(
            {"id": session_id},
            {"$inc": {"current_participants": 1}}
        )
        
        return {"success": True, "registration": {
            "id": registration["id"],
            "session_id": session_id,
            "status": "registered"
        }}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error registering for session: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to register")

@router.delete("/group-sessions/{session_id}/register")
async def cancel_registration(
    session_id: str,
    current_user: dict = Depends(verify_parent_token)
):
    """Cancel registration for a session"""
    try:
        parent_id = current_user['id']
        
        registration = await db.session_registrations.find_one({
            "session_id": session_id,
            "parent_id": parent_id
        })
        
        if not registration:
            raise HTTPException(status_code=404, detail="Registration not found")
        
        # Update status instead of deleting
        await db.session_registrations.update_one(
            {"_id": registration["_id"]},
            {"$set": {"status": "cancelled"}}
        )
        
        # Decrease participant count
        await db.group_sessions.update_one(
            {"id": session_id},
            {"$inc": {"current_participants": -1}}
        )
        
        return {"success": True, "message": "Registration cancelled"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error cancelling registration: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to cancel registration")
