"""
Principal Routes - Authentication, School Overview, Analytics
"""
from fastapi import APIRouter, HTTPException
from passlib.context import CryptContext
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
import logging

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

def verify_principal_token(token: str):
    """Verify principal JWT token"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        principal_id = payload.get("sub")
        role = payload.get("role")
        if principal_id is None or role != "principal":
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"id": principal_id, "role": role, "email": payload.get("email")}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== AUTHENTICATION ====================

@router.post("/principal/login")
async def login_principal(email: str, password: str):
    """Principal login"""
    try:
        principal = await db.principals.find_one({"email": email})
        if not principal:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        if not pwd_context.verify(password, principal['hashed_password']):
            raise HTTPException(status_code=401, detail="Invalid credentials")
        
        # Update last login
        await db.principals.update_one(
            {"id": principal['id']},
            {"$set": {"last_login": datetime.now(timezone.utc).isoformat()}}
        )
        
        # Create access token
        access_token = jwt.encode(
            {
                "sub": principal['id'],
                "email": principal['email'],
                "role": "principal",
                "exp": datetime.now(timezone.utc) + timedelta(days=7)
            },
            SECRET_KEY,
            algorithm=ALGORITHM
        )
        
        return {
            "access_token": access_token,
            "token_type": "bearer",
            "principal": {
                "id": principal['id'],
                "email": principal['email'],
                "name": principal['name'],
                "school": principal['school'],
                "role": "principal"
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Login error: {str(e)}")
        raise HTTPException(status_code=500, detail="Login failed")

# ==================== DASHBOARD ====================

@router.get("/principal/dashboard")
async def get_principal_dashboard(token: str):
    """Get principal dashboard with school overview"""
    try:
        user = verify_principal_token(token)
        principal_id = user['id']
        
        # Get principal details
        principal = await db.principals.find_one({"id": principal_id}, {"_id": 0, "hashed_password": 0})
        if not principal:
            raise HTTPException(status_code=404, detail="Principal not found")
        
        school = principal.get('school', '')
        
        # Get all children from this school
        children = await db.children.find(
            {"school": school},
            {"_id": 0}
        ).to_list(1000)
        
        # Get all observers working with this school
        observer_ids = list(set([c.get('observer_id') for c in children if c.get('observer_id')]))
        observers = await db.observers.find(
            {"id": {"$in": observer_ids}},
            {"_id": 0, "hashed_password": 0}
        ).to_list(100)
        
        # Get recent appointments
        child_ids = [c['id'] for c in children]
        recent_appointments = await db.appointments.find(
            {"child_id": {"$in": child_ids}},
            {"_id": 0}
        ).sort("scheduled_date", -1).limit(20).to_list(20)
        
        # Calculate statistics
        total_students = len(children)
        active_students = len([c for c in children if c.get('status') == 'active'])
        total_observers = len(observers)
        
        # Appointments this month
        current_month = datetime.now(timezone.utc).strftime("%Y-%m")
        appointments_this_month = len([a for a in recent_appointments if a.get('scheduled_date', '').startswith(current_month)])
        
        return {
            "principal": principal,
            "school": school,
            "statistics": {
                "total_students": total_students,
                "active_students": active_students,
                "total_observers": total_observers,
                "appointments_this_month": appointments_this_month
            },
            "children": children[:10],  # Top 10 for overview
            "observers": observers,
            "recent_appointments": recent_appointments[:10]
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Dashboard error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load dashboard")

# ==================== SCHOOL MANAGEMENT ====================

@router.get("/principal/students")
async def get_all_students(token: str):
    """Get all students in the school"""
    try:
        user = verify_principal_token(token)
        
        principal = await db.principals.find_one({"id": user['id']}, {"_id": 0})
        if not principal:
            raise HTTPException(status_code=404, detail="Principal not found")
        
        children = await db.children.find(
            {"school": principal.get('school', '')},
            {"_id": 0}
        ).to_list(1000)
        
        return {"students": children, "school": principal.get('school')}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching students: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load students")

@router.get("/principal/observers")
async def get_all_observers(token: str):
    """Get all observers working with the school"""
    try:
        user = verify_principal_token(token)
        
        principal = await db.principals.find_one({"id": user['id']}, {"_id": 0})
        if not principal:
            raise HTTPException(status_code=404, detail="Principal not found")
        
        # Get children from this school to find observer IDs
        children = await db.children.find(
            {"school": principal.get('school', '')},
            {"_id": 0, "observer_id": 1}
        ).to_list(1000)
        
        observer_ids = list(set([c.get('observer_id') for c in children if c.get('observer_id')]))
        
        observers = await db.observers.find(
            {"id": {"$in": observer_ids}},
            {"_id": 0, "hashed_password": 0}
        ).to_list(100)
        
        # Add student count for each observer
        for observer in observers:
            observer['student_count'] = len([c for c in children if c.get('observer_id') == observer['id']])
        
        return {"observers": observers, "school": principal.get('school')}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching observers: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load observers")

# ==================== ANALYTICS ====================

@router.get("/principal/analytics")
async def get_school_analytics(token: str):
    """Get detailed analytics for the school"""
    try:
        user = verify_principal_token(token)
        
        principal = await db.principals.find_one({"id": user['id']}, {"_id": 0})
        if not principal:
            raise HTTPException(status_code=404, detail="Principal not found")
        
        school = principal.get('school', '')
        
        # Get all children
        children = await db.children.find({"school": school}, {"_id": 0}).to_list(1000)
        child_ids = [c['id'] for c in children]
        
        # Appointments data
        all_appointments = await db.appointments.find(
            {"child_id": {"$in": child_ids}},
            {"_id": 0}
        ).to_list(1000)
        
        # Mood entries data
        mood_entries = await db.mood_entries.find(
            {"child_id": {"$in": child_ids}},
            {"_id": 0}
        ).to_list(1000)
        
        # Goals data
        goals = await db.goals.find(
            {"child_id": {"$in": child_ids}},
            {"_id": 0}
        ).to_list(1000)
        
        # Calculate analytics
        total_appointments = len(all_appointments)
        completed_appointments = len([a for a in all_appointments if a.get('status') == 'completed'])
        
        total_goals = len(goals)
        active_goals = len([g for g in goals if g.get('status') == 'active'])
        completed_goals = len([g for g in goals if g.get('status') == 'completed'])
        
        # Mood distribution
        mood_distribution = {}
        for entry in mood_entries:
            mood = entry.get('mood', 'neutral')
            mood_distribution[mood] = mood_distribution.get(mood, 0) + 1
        
        # Age distribution
        age_distribution = {}
        for child in children:
            age = child.get('age', 'Unknown')
            age_distribution[str(age)] = age_distribution.get(str(age), 0) + 1
        
        return {
            "school": school,
            "engagement": {
                "total_appointments": total_appointments,
                "completed_appointments": completed_appointments,
                "attendance_rate": round(completed_appointments / total_appointments * 100, 1) if total_appointments > 0 else 0
            },
            "goals": {
                "total": total_goals,
                "active": active_goals,
                "completed": completed_goals,
                "completion_rate": round(completed_goals / total_goals * 100, 1) if total_goals > 0 else 0
            },
            "mood_insights": {
                "total_entries": len(mood_entries),
                "distribution": mood_distribution
            },
            "demographics": {
                "total_students": len(children),
                "age_distribution": age_distribution
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Analytics error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load analytics")
