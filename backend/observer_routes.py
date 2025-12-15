"""
Observer Routes - Authentication, Dashboard, Child Management
"""
from fastapi import APIRouter, HTTPException, Depends
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from typing import List, Optional
import logging
import uuid

router = APIRouter()
db = None
logger = logging.getLogger(__name__)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
SECRET_KEY = 'your-secret-key-change-in-production'
ALGORITHM = "HS256"

def set_database(database):
    """Set the database instance from main server"""
    global db
    db = database

def verify_observer_token(token: str):
    """Verify observer JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        observer_id = payload.get("sub")
        role = payload.get("role")
        if observer_id is None or role != "observer":
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"id": observer_id, "role": role, "email": payload.get("email")}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== AUTHENTICATION ====================

@router.post("/observer/login")
async def login_observer(email: str, password: str):
    """Observer login"""
    try:
        observer = await db.observers.find_one({"email": email})
        if not observer:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        if not pwd_context.verify(password, observer['hashed_password']):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Update last login
        await db.observers.update_one(
            {"id": observer['id']},
            {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
        )
        
        # Create access token
        access_token = jwt.encode(
            {
                "sub": observer['id'],
                "email": observer['email'],
                "role": "observer",
                "exp": datetime.now(timezone.utc) + timedelta(days=7)
            },
            SECRET_KEY,
            algorithm=ALGORITHM
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "observer": {
                "id": observer['id'],
                "email": observer['email'],
                "name": observer['name'],
                "role": "observer"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")

# ==================== DASHBOARD ====================

@router.get("/observer/dashboard")
async def get_observer_dashboard(token: str):
    """Get observer dashboard data"""
    try:
        user = verify_observer_token(token)
        observer_id = user['id']
        
        # Get observer details
        observer = await db.observers.find_one({"id": observer_id}, {"_id": 0, "hashed_password": 0})
        if not observer:
            raise HTTPException(status_code=404, detail="Observer not found")
        
        # Get assigned children
        children = await db.children.find(
            {"observer_id": observer_id},
            {"_id": 0}
        ).to_list(100)
        
        # Get recent sessions for these children
        child_ids = [c['id'] for c in children]
        recent_sessions = await db.appointments.find(
            {"child_id": {"$in": child_ids}},
            {"_id": 0}
        ).sort("scheduled_date", -1).limit(10).to_list(10)
        
        # Statistics
        total_children = len(children)
        active_children = len([c for c in children if c.get('status') == 'active'])
        
        return {
            "observer": observer,
            "children": children,
            "recent_sessions": recent_sessions,
            "statistics": {
                "total_children": total_children,
                "active_children": active_children,
                "sessions_this_week": len([s for s in recent_sessions if s.get('scheduled_date', '')[:10] >= (datetime.now(timezone.utc) - timedelta(days=7)).date().isoformat()])
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Dashboard error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load dashboard")

# ==================== CHILD MANAGEMENT ====================

@router.get("/observer/children")
async def get_assigned_children(token: str):
    """Get all children assigned to this observer"""
    try:
        user = verify_observer_token(token)
        
        children = await db.children.find(
            {"observer_id": user['id']},
            {"_id": 0}
        ).to_list(100)
        
        return {"children": children}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching children: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load children")

@router.get("/observer/child/{child_id}")
async def get_child_details(child_id: str, token: str):
    """Get detailed information about a child"""
    try:
        user = verify_observer_token(token)
        
        # Verify this observer has access to this child
        child = await db.children.find_one({
            "id": child_id,
            "observer_id": user['id']
        }, {"_id": 0})
        
        if not child:
            raise HTTPException(status_code=404, detail="Child not found or access denied")
        
        # Get guardians
        guardians = []
        for parent_id in child.get('parent_ids', []):
            parent = await db.parents.find_one({"id": parent_id}, {"_id": 0, "hashed_password": 0})
            if parent:
                guardians.append(parent)
        
        # Get recent appointments
        appointments = await db.appointments.find(
            {"child_id": child_id},
            {"_id": 0}
        ).sort("scheduled_date", -1).limit(5).to_list(5)
        
        # Get recent progress notes
        progress_notes = await db.progress_notes.find(
            {"child_id": child_id},
            {"_id": 0}
        ).sort("date", -1).limit(5).to_list(5)
        
        return {
            "child": child,
            "guardians": guardians,
            "recent_appointments": appointments,
            "recent_progress_notes": progress_notes
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching child details: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load child details")

# ==================== MOOD ENTRIES (Observer can create) ====================

@router.post("/observer/mood-entry")
async def create_mood_entry_observer(
    child_id: str,
    mood: str,
    mood_emoji: str,
    logged_date: str,
    notes: str,
    token: str,
    session_id: Optional[str] = None
):
    """Create a mood entry for a child (Observer)"""
    try:
        user = verify_observer_token(token)
        
        # Verify access
        child = await db.children.find_one({
            "id": child_id,
            "observer_id": user['id']
        }, {"_id": 0})
        
        if not child:
            raise HTTPException(status_code=404, detail="Child not found or access denied")
        
        entry = {
            "id": str(uuid.uuid4()),
            "child_id": child_id,
            "observer_id": user['id'],
            "session_id": session_id,
            "mood": mood,
            "mood_emoji": mood_emoji,
            "notes": notes,
            "triggers": [],
            "logged_date": logged_date,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.mood_entries.insert_one(entry)
        
        return {"success": True, "entry": {
            "id": entry["id"],
            "child_id": child_id,
            "mood": mood,
            "logged_date": logged_date
        }}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating mood entry: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create mood entry")

# ==================== GOALS (Observer can create/update) ====================

@router.post("/observer/goal")
async def create_goal_observer(
    child_id: str,
    title: str,
    description: str,
    category: str,
    token: str,
    target_date: Optional[str] = None
):
    """Create a goal for a child (Observer)"""
    try:
        user = verify_observer_token(token)
        
        # Verify access
        child = await db.children.find_one({
            "id": child_id,
            "observer_id": user['id']
        }, {"_id": 0})
        
        if not child:
            raise HTTPException(status_code=404, detail="Child not found or access denied")
        
        goal = {
            "id": str(uuid.uuid4()),
            "child_id": child_id,
            "observer_id": user['id'],
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
            "category": category
        }}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating goal: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create goal")

@router.patch("/observer/goal/{goal_id}/progress")
async def update_goal_progress_observer(goal_id: str, progress: int, token: str):
    """Update goal progress (Observer)"""
    try:
        user = verify_observer_token(token)
        
        if progress < 0 or progress > 100:
            raise HTTPException(status_code=400, detail="Progress must be between 0 and 100")
        
        # Verify observer created this goal
        goal = await db.goals.find_one({"id": goal_id, "observer_id": user['id']})
        if not goal:
            raise HTTPException(status_code=404, detail="Goal not found or access denied")
        
        update_data = {
            "progress": progress,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        if progress == 100:
            update_data["status"] = "completed"
            update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
        
        await db.goals.update_one(
            {"id": goal_id},
            {"$set": update_data}
        )
        
        return {"success": True, "progress": progress}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating goal: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update goal")
