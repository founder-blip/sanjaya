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


# ==================== PRE-SESSION READINESS CHECK ====================

@router.post("/observer/readiness-check")
async def create_readiness_check(
    child_id: str,
    token: str,
    environment_ready: bool = True,
    materials_ready: bool = True,
    personal_state: str = "good",
    distractions_minimized: bool = True,
    notes: str = ""
):
    """Complete a pre-session readiness check before starting a session"""
    try:
        user = verify_observer_token(token)
        
        # Verify observer has access to this child
        child = await db.children.find_one({
            "id": child_id,
            "observer_id": user['id']
        }, {"_id": 0})
        
        if not child:
            raise HTTPException(status_code=404, detail="Child not found or access denied")
        
        check_id = f"ready_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{child_id[:6]}"
        
        readiness = {
            "id": check_id,
            "observer_id": user['id'],
            "child_id": child_id,
            "child_name": child.get('name'),
            "environment_ready": environment_ready,
            "materials_ready": materials_ready,
            "personal_state": personal_state,  # good, tired, stressed, neutral
            "distractions_minimized": distractions_minimized,
            "notes": notes,
            "all_ready": environment_ready and materials_ready and distractions_minimized,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.readiness_checks.insert_one(readiness)
        
        # If all ready, create a session placeholder
        if readiness['all_ready']:
            session_id = f"sess_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{child_id[:6]}"
            session = {
                "id": session_id,
                "readiness_check_id": check_id,
                "observer_id": user['id'],
                "child_id": child_id,
                "child_name": child.get('name'),
                "status": "in_progress",
                "started_at": datetime.now(timezone.utc).isoformat(),
                "ended_at": None,
                "duration_minutes": 0
            }
            await db.session_logs.insert_one(session)
            readiness['session_id'] = session_id
        
        return {
            "success": True,
            "readiness_check": readiness,
            "can_start_session": readiness['all_ready'],
            "session_id": readiness.get('session_id')
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Readiness check error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create readiness check")

@router.get("/observer/readiness-checks")
async def get_readiness_checks(token: str, child_id: str = None, limit: int = 20):
    """Get readiness check history"""
    try:
        user = verify_observer_token(token)
        
        query = {"observer_id": user['id']}
        if child_id:
            query["child_id"] = child_id
        
        checks = await db.readiness_checks.find(
            query, {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        
        return {"readiness_checks": checks, "total": len(checks)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching readiness checks: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load readiness checks")

# ==================== SESSION MANAGEMENT ====================

@router.post("/observer/session/{session_id}/end")
async def end_session(
    session_id: str,
    token: str,
    duration_minutes: int,
    session_notes: str = "",
    mood_observed: str = "",
    engagement_level: str = "",
    key_observations: str = ""
):
    """End a session and record basic observations"""
    try:
        user = verify_observer_token(token)
        
        session = await db.session_logs.find_one({
            "id": session_id,
            "observer_id": user['id']
        })
        
        if not session:
            raise HTTPException(status_code=404, detail="Session not found")
        
        update_data = {
            "status": "completed",
            "ended_at": datetime.now(timezone.utc).isoformat(),
            "duration_minutes": duration_minutes,
            "session_notes": session_notes,
            "mood_observed": mood_observed,
            "engagement_level": engagement_level,  # high, medium, low
            "key_observations": key_observations
        }
        
        await db.session_logs.update_one(
            {"id": session_id},
            {"$set": update_data}
        )
        
        return {"success": True, "message": "Session ended successfully"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"End session error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to end session")

@router.get("/observer/sessions")
async def get_observer_sessions(token: str, child_id: str = None, status: str = None, limit: int = 50):
    """Get observer's sessions"""
    try:
        user = verify_observer_token(token)
        
        query = {"observer_id": user['id']}
        if child_id:
            query["child_id"] = child_id
        if status:
            query["status"] = status
        
        sessions = await db.session_logs.find(
            query, {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        
        return {"sessions": sessions, "total": len(sessions)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching sessions: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load sessions")

# ==================== DAILY REPORTS ====================

@router.post("/observer/daily-report")
async def create_daily_report(
    token: str,
    child_id: str,
    report_date: str,
    session_summary: str,
    child_mood: str,
    engagement_level: str,
    key_observations: str,
    concerns: str = "",
    positive_moments: str = "",
    recommendations: str = "",
    session_id: str = None
):
    """Submit a daily report for a child"""
    try:
        user = verify_observer_token(token)
        
        # Verify access
        child = await db.children.find_one({
            "id": child_id,
            "observer_id": user['id']
        }, {"_id": 0})
        
        if not child:
            raise HTTPException(status_code=404, detail="Child not found or access denied")
        
        report_id = f"rpt_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{child_id[:6]}"
        
        report = {
            "id": report_id,
            "observer_id": user['id'],
            "observer_name": (await db.observers.find_one({"id": user['id']}, {"name": 1})).get('name', ''),
            "child_id": child_id,
            "child_name": child.get('name'),
            "session_id": session_id,
            "report_date": report_date,
            "session_summary": session_summary,
            "child_mood": child_mood,
            "engagement_level": engagement_level,
            "key_observations": key_observations,
            "concerns": concerns,
            "positive_moments": positive_moments,
            "recommendations": recommendations,
            "review_status": "pending_review",
            "reviewed_by": None,
            "principal_feedback": "",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.daily_reports.insert_one(report)
        
        return {"success": True, "report_id": report_id, "message": "Daily report submitted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Daily report error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create daily report")

@router.get("/observer/daily-reports")
async def get_observer_daily_reports(token: str, child_id: str = None, limit: int = 30):
    """Get observer's daily reports"""
    try:
        user = verify_observer_token(token)
        
        query = {"observer_id": user['id']}
        if child_id:
            query["child_id"] = child_id
        
        reports = await db.daily_reports.find(
            query, {"_id": 0}
        ).sort("report_date", -1).limit(limit).to_list(limit)
        
        return {"reports": reports, "total": len(reports)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching reports: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load reports")

# ==================== SESSION RECORDINGS ====================

@router.post("/observer/session-recording")
async def upload_session_recording(
    token: str,
    child_id: str,
    session_id: str,
    recording_url: str,
    duration_seconds: int,
    recording_type: str = "audio",
    notes: str = ""
):
    """Upload/register a session recording"""
    try:
        user = verify_observer_token(token)
        
        # Verify access
        child = await db.children.find_one({
            "id": child_id,
            "observer_id": user['id']
        }, {"_id": 0})
        
        if not child:
            raise HTTPException(status_code=404, detail="Child not found or access denied")
        
        recording_id = f"rec_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{child_id[:6]}"
        
        recording = {
            "id": recording_id,
            "observer_id": user['id'],
            "child_id": child_id,
            "child_name": child.get('name'),
            "session_id": session_id,
            "recording_url": recording_url,
            "recording_type": recording_type,  # audio, video
            "duration_seconds": duration_seconds,
            "duration": f"{duration_seconds // 60}:{duration_seconds % 60:02d}",
            "notes": notes,
            "review_status": "pending_review",
            "reviewed_by": None,
            "review_notes": "",
            "rating": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.session_recordings.insert_one(recording)
        
        return {"success": True, "recording_id": recording_id}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Recording upload error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to upload recording")

# ==================== SELF-REFLECTION LOG ====================

@router.post("/observer/self-reflection")
async def create_self_reflection(
    token: str,
    reflection_date: str,
    session_count: int,
    what_went_well: str,
    what_could_improve: str,
    challenges_faced: str,
    learning_moments: str,
    emotional_state: str,
    support_needed: str = "",
    goals_for_tomorrow: str = ""
):
    """Submit a self-reflection log"""
    try:
        user = verify_observer_token(token)
        
        observer = await db.observers.find_one({"id": user['id']}, {"_id": 0, "hashed_password": 0})
        if not observer:
            raise HTTPException(status_code=404, detail="Observer not found")
        
        reflection_id = f"ref_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{user['id'][:6]}"
        
        reflection = {
            "id": reflection_id,
            "observer_id": user['id'],
            "observer_name": observer.get('name'),
            "reflection_date": reflection_date,
            "session_count": session_count,
            "what_went_well": what_went_well,
            "what_could_improve": what_could_improve,
            "challenges_faced": challenges_faced,
            "learning_moments": learning_moments,
            "emotional_state": emotional_state,  # energized, neutral, tired, stressed
            "support_needed": support_needed,
            "goals_for_tomorrow": goals_for_tomorrow,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.self_reflections.insert_one(reflection)
        
        return {"success": True, "reflection_id": reflection_id, "message": "Self-reflection submitted"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Self-reflection error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create self-reflection")

@router.get("/observer/self-reflections")
async def get_self_reflections(token: str, limit: int = 30):
    """Get observer's self-reflection history"""
    try:
        user = verify_observer_token(token)
        
        reflections = await db.self_reflections.find(
            {"observer_id": user['id']}, {"_id": 0}
        ).sort("reflection_date", -1).limit(limit).to_list(limit)
        
        return {"reflections": reflections, "total": len(reflections)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching reflections: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load reflections")

# ==================== ESCALATION / RED FLAGS ====================

@router.post("/observer/escalation")
async def create_escalation(
    token: str,
    child_id: str,
    escalation_type: str,
    severity: str,
    description: str,
    observed_behaviors: str,
    immediate_actions_taken: str = "",
    session_id: str = None
):
    """Create an escalation/red flag report"""
    try:
        user = verify_observer_token(token)
        
        # Verify access
        child = await db.children.find_one({
            "id": child_id,
            "observer_id": user['id']
        }, {"_id": 0})
        
        if not child:
            raise HTTPException(status_code=404, detail="Child not found or access denied")
        
        escalation_id = f"esc_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{child_id[:6]}"
        
        escalation = {
            "id": escalation_id,
            "observer_id": user['id'],
            "observer_name": (await db.observers.find_one({"id": user['id']}, {"name": 1})).get('name', ''),
            "child_id": child_id,
            "child_name": child.get('name'),
            "school": child.get('school'),
            "session_id": session_id,
            "escalation_type": escalation_type,  # behavioral, emotional, safety, other
            "severity": severity,  # low, medium, high, critical
            "description": description,
            "observed_behaviors": observed_behaviors,
            "immediate_actions_taken": immediate_actions_taken,
            "status": "open",
            "assigned_to": None,
            "resolution": "",
            "resolved_at": None,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.escalations.insert_one(escalation)
        
        # Also create a red flag entry for principal visibility
        red_flag = {
            "id": f"rf_{escalation_id}",
            "escalation_id": escalation_id,
            "observer_id": user['id'],
            "child_id": child_id,
            "child_name": child.get('name'),
            "school": child.get('school'),
            "flag_type": escalation_type,
            "severity": severity,
            "description": description,
            "status": "pending",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.red_flags.insert_one(red_flag)
        
        return {
            "success": True, 
            "escalation_id": escalation_id, 
            "message": "Escalation reported. Your principal will be notified."
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Escalation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create escalation")

@router.get("/observer/escalations")
async def get_observer_escalations(token: str, child_id: str = None, status: str = None):
    """Get observer's escalation history"""
    try:
        user = verify_observer_token(token)
        
        query = {"observer_id": user['id']}
        if child_id:
            query["child_id"] = child_id
        if status:
            query["status"] = status
        
        escalations = await db.escalations.find(
            query, {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        
        return {"escalations": escalations, "total": len(escalations)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching escalations: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load escalations")

# ==================== TODAY'S SCHEDULE ====================

@router.get("/observer/today-schedule")
async def get_today_schedule(token: str):
    """Get observer's schedule for today"""
    try:
        user = verify_observer_token(token)
        
        today = datetime.now(timezone.utc).date().isoformat()
        
        # Get assigned children
        children = await db.children.find(
            {"observer_id": user['id'], "status": "active"},
            {"_id": 0}
        ).to_list(100)
        
        # Check which children have had sessions today
        child_ids = [c['id'] for c in children]
        today_sessions = await db.session_logs.find({
            "observer_id": user['id'],
            "child_id": {"$in": child_ids},
            "created_at": {"$regex": f"^{today}"}
        }, {"_id": 0}).to_list(100)
        
        sessions_by_child = {s['child_id']: s for s in today_sessions}
        
        schedule = []
        for child in children:
            session_status = "pending"
            session_info = None
            
            if child['id'] in sessions_by_child:
                session = sessions_by_child[child['id']]
                session_status = session.get('status', 'completed')
                session_info = session
            
            schedule.append({
                "child": child,
                "session_status": session_status,  # pending, in_progress, completed
                "session": session_info
            })
        
        # Get today's readiness checks
        readiness_checks = await db.readiness_checks.find({
            "observer_id": user['id'],
            "created_at": {"$regex": f"^{today}"}
        }, {"_id": 0}).to_list(100)
        
        return {
            "date": today,
            "schedule": schedule,
            "total_children": len(children),
            "sessions_completed": len([s for s in schedule if s['session_status'] == 'completed']),
            "sessions_pending": len([s for s in schedule if s['session_status'] == 'pending']),
            "readiness_checks_today": len(readiness_checks)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Schedule error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load schedule")
