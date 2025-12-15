"""
Parent Portal Routes - Phase 1
Handles parent authentication, dashboard, and child management
"""
from fastapi import APIRouter, HTTPException, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from motor.motor_asyncio import AsyncIOMotorClient
import os
from passlib.hash import bcrypt
from jose import jwt, JWTError
from datetime import datetime, timedelta, timezone
from models import (
    ParentLogin, ParentRegistration, ParentUser, Child, 
    SessionNote, Appointment, ProgressMetric
)
import logging

router = APIRouter()

# Database will be set by main server.py
db = None

def set_database(database):
    """Set the database instance from main server"""
    global db
    db = database

# JWT configuration
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

security = HTTPBearer()

logger = logging.getLogger(__name__)

def create_access_token(data: dict):
    """Create JWT token for parent authentication"""
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

async def verify_parent_token(credentials: HTTPAuthorizationCredentials = Depends(security)):
    """Verify JWT token and return parent user"""
    try:
        token = credentials.credentials
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email = payload.get("sub")
        if email is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
        
        user = await db.parent_users.find_one({"email": email}, {"_id": 0})
        if not user:
            raise HTTPException(status_code=401, detail="User not found")
        
        return user
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Parent Authentication Routes

@router.post("/parent/register")
async def register_parent(registration: ParentRegistration):
    """Register a new parent user"""
    try:
        # Check if user already exists
        existing_user = await db.parent_users.find_one({"email": registration.email})
        if existing_user:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        # Hash password
        hashed_password = bcrypt.hash(registration.password)
        
        # Create user
        user_doc = {
            "id": str(uuid.uuid4()),
            "email": registration.email,
            "name": registration.name,
            "phone": registration.phone,
            "hashed_password": hashed_password,
            "role": "parent",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat(),
            "last_login": None
        }
        
        await db.parent_users.insert_one(user_doc)
        
        # Create access token
        access_token = create_access_token({"sub": registration.email})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "email": registration.email,
                "name": registration.name,
                "role": "parent"
            }
        }
    except Exception as e:
        logger.error(f"Error registering parent: {str(e)}")
        raise HTTPException(status_code=500, detail="Registration failed")

@router.post("/parent/login")
async def login_parent(login: ParentLogin):
    """Parent login"""
    try:
        user = await db.parent_users.find_one({"email": login.email})
        if not user:
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Verify password
        if not bcrypt.verify(login.password, user['hashed_password']):
            raise HTTPException(status_code=401, detail="Invalid email or password")
        
        # Update last login
        await db.parent_users.update_one(
            {"email": login.email},
            {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
        )
        
        # Create access token
        access_token = create_access_token({"sub": login.email})
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "user": {
                "email": user['email'],
                "name": user['name'],
                "role": user.get('role', 'parent')
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error during login: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")

# Parent Dashboard Routes

@router.get("/parent/dashboard")
async def get_parent_dashboard(current_user: dict = Depends(verify_parent_token)):
    """Get parent dashboard with all children and their recent activity"""
    try:
        parent_id = current_user['id']
        
        # Get all children for this parent
        children = await db.children.find(
            {"parent_ids": parent_id},
            {"_id": 0}
        ).to_list(100)
        
        dashboard_data = {
            "parent": {
                "name": current_user['name'],
                "email": current_user['email']
            },
            "children": [],
            "summary": {
                "total_children": len(children),
                "active_children": len([c for c in children if c.get('status') == 'active']),
                "total_sessions_this_month": 0,
                "upcoming_appointments": 0
            }
        }
        
        # Get detailed data for each child
        for child in children:
            child_id = child['id']
            
            # Get recent sessions
            recent_sessions = await db.session_notes.find(
                {"child_id": child_id, "parent_visible": True},
                {"_id": 0}
            ).sort("session_date", -1).limit(5).to_list(5)
            
            # Get upcoming appointments
            upcoming_appts = await db.appointments.find(
                {
                    "child_id": child_id,
                    "status": "scheduled",
                    "scheduled_time": {"$gte": datetime.now(timezone.utc).isoformat()}
                },
                {"_id": 0}
            ).sort("scheduled_time", 1).limit(3).to_list(3)
            
            # Get progress metrics
            progress_metrics = await db.progress_metrics.find(
                {"child_id": child_id},
                {"_id": 0}
            ).sort("recorded_at", -1).limit(10).to_list(10)
            
            child_data = {
                **child,
                "recent_sessions": recent_sessions,
                "upcoming_appointments": upcoming_appts,
                "progress_metrics": progress_metrics,
                "session_count": len(recent_sessions)
            }
            
            dashboard_data["children"].append(child_data)
            dashboard_data["summary"]["total_sessions_this_month"] += len(recent_sessions)
            dashboard_data["summary"]["upcoming_appointments"] += len(upcoming_appts)
        
        return dashboard_data
    except Exception as e:
        logger.error(f"Error fetching dashboard: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load dashboard")

@router.get("/parent/child/{child_id}")
async def get_child_details(child_id: str, current_user: dict = Depends(verify_parent_token)):
    """Get detailed information about a specific child"""
    try:
        parent_id = current_user['id']
        
        # Verify parent has access to this child
        child = await db.children.find_one(
            {"id": child_id, "parent_ids": parent_id},
            {"_id": 0}
        )
        
        if not child:
            raise HTTPException(status_code=404, detail="Child not found or access denied")
        
        # Get all session notes
        sessions = await db.session_notes.find(
            {"child_id": child_id, "parent_visible": True},
            {"_id": 0}
        ).sort("session_date", -1).to_list(100)
        
        # Get progress metrics
        metrics = await db.progress_metrics.find(
            {"child_id": child_id},
            {"_id": 0}
        ).sort("recorded_at", -1).to_list(100)
        
        # Get appointments
        appointments = await db.appointments.find(
            {"child_id": child_id},
            {"_id": 0}
        ).sort("scheduled_time", -1).to_list(50)
        
        return {
            "child": child,
            "sessions": sessions,
            "progress_metrics": metrics,
            "appointments": appointments,
            "stats": {
                "total_sessions": len(sessions),
                "average_mood": sum(s.get('mood_rating', 0) for s in sessions if s.get('mood_rating')) / len(sessions) if sessions else 0,
                "total_appointments": len(appointments)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching child details: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load child details")

@router.get("/parent/sessions/{child_id}")
async def get_child_sessions(child_id: str, limit: int = 20, current_user: dict = Depends(verify_parent_token)):
    """Get session notes for a child"""
    try:
        parent_id = current_user['id']
        
        # Verify access
        child = await db.children.find_one({"id": child_id, "parent_ids": parent_id})
        if not child:
            raise HTTPException(status_code=404, detail="Child not found or access denied")
        
        sessions = await db.session_notes.find(
            {"child_id": child_id, "parent_visible": True},
            {"_id": 0}
        ).sort("session_date", -1).limit(limit).to_list(limit)
        
        return {"sessions": sessions, "total": len(sessions)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching sessions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load sessions")

@router.get("/parent/appointments/{child_id}")
async def get_child_appointments(child_id: str, current_user: dict = Depends(verify_parent_token)):
    """Get appointments for a child"""
    try:
        parent_id = current_user['id']
        
        # Verify access
        child = await db.children.find_one({"id": child_id, "parent_ids": parent_id})
        if not child:
            raise HTTPException(status_code=404, detail="Child not found or access denied")
        
        # Get upcoming appointments
        upcoming = await db.appointments.find(
            {
                "child_id": child_id,
                "status": "scheduled",
                "scheduled_time": {"$gte": datetime.now(timezone.utc).isoformat()}
            },
            {"_id": 0}
        ).sort("scheduled_time", 1).to_list(10)
        
        # Get past appointments
        past = await db.appointments.find(
            {
                "child_id": child_id,
                "status": {"$in": ["completed", "cancelled", "missed"]},
            },
            {"_id": 0}
        ).sort("scheduled_time", -1).limit(20).to_list(20)
        
        return {
            "upcoming": upcoming,
            "past": past
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching appointments: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load appointments")

# Import uuid at top of file
import uuid


# ==================== GUARDIAN MANAGEMENT (PARENT VIEW) ====================

@router.get("/child/{child_id}/co-guardians")
async def get_co_guardians(
    child_id: str,
    current_user: dict = Depends(verify_parent_token)
):
    """Get all co-guardians for a child (excluding current user)"""
    try:
        parent_id = current_user['id']
        
        # Verify parent has access to this child
        child = await db.children.find_one({
            "id": child_id,
            "parent_ids": parent_id
        }, {"_id": 0})
        
        if not child:
            raise HTTPException(status_code=404, detail="Child not found or access denied")
        
        # Get all guardians except current user
        co_guardians = []
        for guardian_id in child.get('parent_ids', []):
            if guardian_id != parent_id:
                guardian = await db.parents.find_one(
                    {"id": guardian_id},
                    {"_id": 0, "hashed_password": 0}
                )
                if guardian:
                    co_guardians.append(guardian)
        
        return {
            "child": child,
            "co_guardians": co_guardians,
            "total_guardians": len(child.get('parent_ids', []))
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching co-guardians: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load co-guardians")

