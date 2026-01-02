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

# ==================== STUDENT-OBSERVER ASSIGNMENT ====================

@router.get("/principal/students/unassigned")
async def get_unassigned_students(token: str):
    """Get students not assigned to any observer"""
    try:
        user = verify_principal_token(token)
        principal = await db.principals.find_one({"id": user['id']}, {"_id": 0})
        if not principal:
            raise HTTPException(status_code=404, detail="Principal not found")
        
        students = await db.children.find(
            {"school": principal.get('school', ''), "$or": [{"observer_id": None}, {"observer_id": ""}]},
            {"_id": 0}
        ).to_list(1000)
        
        return {"unassigned_students": students, "total": len(students)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching unassigned students: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load unassigned students")

@router.post("/principal/students/{student_id}/assign-observer")
async def assign_student_to_observer(student_id: str, observer_id: str, token: str):
    """Assign a student to an observer"""
    try:
        user = verify_principal_token(token)
        principal = await db.principals.find_one({"id": user['id']}, {"_id": 0})
        if not principal:
            raise HTTPException(status_code=404, detail="Principal not found")
        
        # Verify student belongs to this school
        student = await db.children.find_one({"id": student_id, "school": principal.get('school', '')})
        if not student:
            raise HTTPException(status_code=404, detail="Student not found in your school")
        
        # Verify observer exists
        observer = await db.observers.find_one({"id": observer_id}, {"_id": 0, "hashed_password": 0})
        if not observer:
            raise HTTPException(status_code=404, detail="Observer not found")
        
        # Update student with observer assignment
        await db.children.update_one(
            {"id": student_id},
            {"$set": {
                "observer_id": observer_id,
                "observer_assigned_at": datetime.now(timezone.utc).isoformat(),
                "observer_assigned_by": user['id']
            }}
        )
        
        # Create assignment log
        await db.assignment_logs.insert_one({
            "id": f"asgn_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{student_id[:8]}",
            "student_id": student_id,
            "student_name": student.get('name', ''),
            "observer_id": observer_id,
            "observer_name": observer.get('name', ''),
            "assigned_by": user['id'],
            "assigned_by_name": principal.get('name', ''),
            "school": principal.get('school', ''),
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {
            "success": True,
            "message": f"{student.get('name', 'Student')} assigned to {observer.get('name', 'Observer')}",
            "student": {"id": student_id, "name": student.get('name')},
            "observer": {"id": observer_id, "name": observer.get('name')}
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Assignment error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to assign student")

@router.post("/principal/students/{student_id}/unassign-observer")
async def unassign_student_from_observer(student_id: str, token: str):
    """Remove observer assignment from a student"""
    try:
        user = verify_principal_token(token)
        principal = await db.principals.find_one({"id": user['id']}, {"_id": 0})
        if not principal:
            raise HTTPException(status_code=404, detail="Principal not found")
        
        student = await db.children.find_one({"id": student_id, "school": principal.get('school', '')})
        if not student:
            raise HTTPException(status_code=404, detail="Student not found in your school")
        
        await db.children.update_one(
            {"id": student_id},
            {"$set": {"observer_id": None, "observer_assigned_at": None, "observer_assigned_by": None}}
        )
        
        return {"success": True, "message": f"{student.get('name', 'Student')} unassigned from observer"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Unassignment error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to unassign student")

@router.get("/principal/available-observers")
async def get_available_observers(token: str):
    """Get all available observers for assignment"""
    try:
        user = verify_principal_token(token)
        principal = await db.principals.find_one({"id": user['id']}, {"_id": 0})
        if not principal:
            raise HTTPException(status_code=404, detail="Principal not found")
        
        # Get all active observers
        observers = await db.observers.find(
            {"is_active": {"$ne": False}},
            {"_id": 0, "hashed_password": 0}
        ).to_list(500)
        
        # Add workload info
        for observer in observers:
            count = await db.children.count_documents({"observer_id": observer['id'], "status": "active"})
            observer['current_students'] = count
            observer['capacity'] = observer.get('max_capacity', 10)
            observer['available_slots'] = max(0, observer['capacity'] - count)
        
        return {"observers": observers, "total": len(observers)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching observers: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load observers")

# ==================== OBSERVER PERFORMANCE ====================

@router.get("/principal/observer-performance")
async def get_observer_performance(token: str):
    """Get performance metrics for all observers in the school"""
    try:
        user = verify_principal_token(token)
        principal = await db.principals.find_one({"id": user['id']}, {"_id": 0})
        if not principal:
            raise HTTPException(status_code=404, detail="Principal not found")
        
        school = principal.get('school', '')
        
        # Get children from this school
        children = await db.children.find({"school": school}, {"_id": 0}).to_list(1000)
        child_ids = [c['id'] for c in children]
        observer_ids = list(set([c.get('observer_id') for c in children if c.get('observer_id')]))
        
        # Get observers
        observers = await db.observers.find(
            {"id": {"$in": observer_ids}},
            {"_id": 0, "hashed_password": 0}
        ).to_list(100)
        
        performance_data = []
        
        for observer in observers:
            obs_id = observer['id']
            
            # Get sessions by this observer
            sessions = await db.session_logs.find(
                {"observer_id": obs_id, "child_id": {"$in": child_ids}},
                {"_id": 0}
            ).to_list(1000)
            
            # Get observer's students
            obs_students = [c for c in children if c.get('observer_id') == obs_id]
            
            # Calculate metrics
            total_sessions = len(sessions)
            last_30_days = datetime.now(timezone.utc) - timedelta(days=30)
            recent_sessions = [s for s in sessions if s.get('created_at', '') >= last_30_days.isoformat()]
            
            # Average session rating (if available)
            ratings = [s.get('rating', 0) for s in sessions if s.get('rating')]
            avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else 0
            
            # Consistency score (sessions per week average)
            if total_sessions > 0 and obs_students:
                expected_weekly = len(obs_students) * 5  # 5 sessions per student per week
                actual_weekly = len(recent_sessions) / 4  # Last 4 weeks
                consistency = min(100, round((actual_weekly / expected_weekly) * 100)) if expected_weekly > 0 else 0
            else:
                consistency = 0
            
            # Red flags raised
            red_flags = await db.red_flags.count_documents({"observer_id": obs_id})
            
            # Escalations
            escalations = await db.incidents.count_documents({"created_by": obs_id})
            
            performance_data.append({
                "observer": {
                    "id": obs_id,
                    "name": observer.get('name', ''),
                    "email": observer.get('email', ''),
                    "specialization": observer.get('specialization', '')
                },
                "metrics": {
                    "assigned_students": len(obs_students),
                    "total_sessions": total_sessions,
                    "sessions_last_30_days": len(recent_sessions),
                    "average_rating": avg_rating,
                    "consistency_score": consistency,
                    "red_flags_raised": red_flags,
                    "escalations": escalations
                },
                "status": "excellent" if consistency >= 80 else "good" if consistency >= 60 else "needs_attention"
            })
        
        # Sort by consistency score
        performance_data.sort(key=lambda x: x['metrics']['consistency_score'], reverse=True)
        
        return {
            "school": school,
            "observer_performance": performance_data,
            "total_observers": len(performance_data),
            "summary": {
                "excellent": len([p for p in performance_data if p['status'] == 'excellent']),
                "good": len([p for p in performance_data if p['status'] == 'good']),
                "needs_attention": len([p for p in performance_data if p['status'] == 'needs_attention'])
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Performance error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load observer performance")

@router.get("/principal/observer/{observer_id}/details")
async def get_observer_details(observer_id: str, token: str):
    """Get detailed information about a specific observer"""
    try:
        user = verify_principal_token(token)
        principal = await db.principals.find_one({"id": user['id']}, {"_id": 0})
        if not principal:
            raise HTTPException(status_code=404, detail="Principal not found")
        
        observer = await db.observers.find_one({"id": observer_id}, {"_id": 0, "hashed_password": 0})
        if not observer:
            raise HTTPException(status_code=404, detail="Observer not found")
        
        # Get assigned students
        students = await db.children.find(
            {"observer_id": observer_id, "school": principal.get('school', '')},
            {"_id": 0}
        ).to_list(100)
        
        # Get recent sessions
        student_ids = [s['id'] for s in students]
        recent_sessions = await db.session_logs.find(
            {"observer_id": observer_id, "child_id": {"$in": student_ids}},
            {"_id": 0}
        ).sort("created_at", -1).limit(20).to_list(20)
        
        # Get AI insights for this observer's sessions
        ai_insights = await db.ai_reports.find(
            {"observer_id": observer_id},
            {"_id": 0}
        ).sort("created_at", -1).limit(10).to_list(10)
        
        return {
            "observer": observer,
            "assigned_students": students,
            "recent_sessions": recent_sessions,
            "ai_insights": ai_insights,
            "statistics": {
                "total_students": len(students),
                "active_students": len([s for s in students if s.get('status') == 'active']),
                "total_sessions": len(recent_sessions)
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Observer details error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load observer details")

# ==================== PARENT CONSULTATIONS ====================

@router.get("/principal/consultations")
async def get_consultations(token: str, status: str = None):
    """Get all parent consultations"""
    try:
        user = verify_principal_token(token)
        principal = await db.principals.find_one({"id": user['id']}, {"_id": 0})
        if not principal:
            raise HTTPException(status_code=404, detail="Principal not found")
        
        query = {"principal_id": user['id']}
        if status:
            query["status"] = status
        
        consultations = await db.consultations.find(query, {"_id": 0}).sort("scheduled_date", -1).to_list(500)
        
        # Enrich with parent and child info
        for consultation in consultations:
            if consultation.get('parent_id'):
                parent = await db.parents.find_one({"id": consultation['parent_id']}, {"_id": 0, "hashed_password": 0})
                consultation['parent'] = parent
            if consultation.get('child_id'):
                child = await db.children.find_one({"id": consultation['child_id']}, {"_id": 0})
                consultation['child'] = child
        
        # Count by status
        status_counts = {
            "scheduled": await db.consultations.count_documents({"principal_id": user['id'], "status": "scheduled"}),
            "completed": await db.consultations.count_documents({"principal_id": user['id'], "status": "completed"}),
            "cancelled": await db.consultations.count_documents({"principal_id": user['id'], "status": "cancelled"}),
            "pending_approval": await db.consultations.count_documents({"principal_id": user['id'], "status": "pending_approval"})
        }
        
        return {
            "consultations": consultations,
            "total": len(consultations),
            "status_counts": status_counts
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Consultations error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load consultations")

@router.post("/principal/consultations")
async def create_consultation(
    token: str,
    parent_id: str,
    child_id: str,
    scheduled_date: str,
    scheduled_time: str,
    consultation_type: str = "progress_review",
    notes: str = ""
):
    """Schedule a new parent consultation"""
    try:
        user = verify_principal_token(token)
        principal = await db.principals.find_one({"id": user['id']}, {"_id": 0})
        if not principal:
            raise HTTPException(status_code=404, detail="Principal not found")
        
        # Verify parent and child
        parent = await db.parents.find_one({"id": parent_id}, {"_id": 0, "hashed_password": 0})
        if not parent:
            raise HTTPException(status_code=404, detail="Parent not found")
        
        child = await db.children.find_one({"id": child_id}, {"_id": 0})
        if not child:
            raise HTTPException(status_code=404, detail="Child not found")
        
        consultation_id = f"cons_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{child_id[:6]}"
        
        consultation = {
            "id": consultation_id,
            "principal_id": user['id'],
            "principal_name": principal.get('name', ''),
            "parent_id": parent_id,
            "parent_name": parent.get('name', ''),
            "parent_email": parent.get('email', ''),
            "child_id": child_id,
            "child_name": child.get('name', ''),
            "school": principal.get('school', ''),
            "scheduled_date": scheduled_date,
            "scheduled_time": scheduled_time,
            "consultation_type": consultation_type,  # progress_review, concern_discussion, general
            "status": "scheduled",
            "notes": notes,
            "meeting_link": "",  # Can be added later
            "summary": "",
            "action_items": [],
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.consultations.insert_one(consultation)
        
        return {
            "success": True,
            "consultation": {
                "id": consultation_id,
                "scheduled_date": scheduled_date,
                "scheduled_time": scheduled_time,
                "parent_name": parent.get('name'),
                "child_name": child.get('name')
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Create consultation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create consultation")

@router.put("/principal/consultations/{consultation_id}")
async def update_consultation(
    consultation_id: str,
    token: str,
    status: str = None,
    summary: str = None,
    action_items: str = None,
    meeting_link: str = None,
    notes: str = None
):
    """Update a consultation"""
    try:
        user = verify_principal_token(token)
        
        consultation = await db.consultations.find_one({"id": consultation_id, "principal_id": user['id']})
        if not consultation:
            raise HTTPException(status_code=404, detail="Consultation not found")
        
        update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
        
        if status:
            update_data["status"] = status
            if status == "completed":
                update_data["completed_at"] = datetime.now(timezone.utc).isoformat()
        if summary:
            update_data["summary"] = summary
        if action_items:
            update_data["action_items"] = action_items.split(',') if action_items else []
        if meeting_link:
            update_data["meeting_link"] = meeting_link
        if notes:
            update_data["notes"] = notes
        
        await db.consultations.update_one({"id": consultation_id}, {"$set": update_data})
        
        return {"success": True, "message": "Consultation updated"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Update consultation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update consultation")

@router.delete("/principal/consultations/{consultation_id}")
async def cancel_consultation(consultation_id: str, token: str, reason: str = ""):
    """Cancel a consultation"""
    try:
        user = verify_principal_token(token)
        
        consultation = await db.consultations.find_one({"id": consultation_id, "principal_id": user['id']})
        if not consultation:
            raise HTTPException(status_code=404, detail="Consultation not found")
        
        await db.consultations.update_one(
            {"id": consultation_id},
            {"$set": {
                "status": "cancelled",
                "cancelled_at": datetime.now(timezone.utc).isoformat(),
                "cancellation_reason": reason
            }}
        )
        
        return {"success": True, "message": "Consultation cancelled"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Cancel consultation error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to cancel consultation")

@router.get("/principal/consultation-requests")
async def get_consultation_requests(token: str):
    """Get consultation requests from parents"""
    try:
        user = verify_principal_token(token)
        principal = await db.principals.find_one({"id": user['id']}, {"_id": 0})
        if not principal:
            raise HTTPException(status_code=404, detail="Principal not found")
        
        # Get pending consultation requests for this school
        requests = await db.consultation_requests.find(
            {"school": principal.get('school', ''), "status": "pending"},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        
        # Enrich with parent and child info
        for request in requests:
            if request.get('parent_id'):
                parent = await db.parents.find_one({"id": request['parent_id']}, {"_id": 0, "hashed_password": 0})
                request['parent'] = parent
            if request.get('child_id'):
                child = await db.children.find_one({"id": request['child_id']}, {"_id": 0})
                request['child'] = child
        
        return {"requests": requests, "total": len(requests)}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Consultation requests error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load consultation requests")

@router.post("/principal/consultation-requests/{request_id}/approve")
async def approve_consultation_request(
    request_id: str,
    token: str,
    scheduled_date: str,
    scheduled_time: str
):
    """Approve a consultation request and schedule it"""
    try:
        user = verify_principal_token(token)
        principal = await db.principals.find_one({"id": user['id']}, {"_id": 0})
        if not principal:
            raise HTTPException(status_code=404, detail="Principal not found")
        
        request = await db.consultation_requests.find_one({"id": request_id})
        if not request:
            raise HTTPException(status_code=404, detail="Request not found")
        
        # Create the consultation
        consultation_id = f"cons_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}_{request['child_id'][:6]}"
        
        consultation = {
            "id": consultation_id,
            "principal_id": user['id'],
            "principal_name": principal.get('name', ''),
            "parent_id": request['parent_id'],
            "parent_name": request.get('parent_name', ''),
            "parent_email": request.get('parent_email', ''),
            "child_id": request['child_id'],
            "child_name": request.get('child_name', ''),
            "school": principal.get('school', ''),
            "scheduled_date": scheduled_date,
            "scheduled_time": scheduled_time,
            "consultation_type": request.get('consultation_type', 'general'),
            "status": "scheduled",
            "notes": request.get('notes', ''),
            "request_id": request_id,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.consultations.insert_one(consultation)
        
        # Update request status
        await db.consultation_requests.update_one(
            {"id": request_id},
            {"$set": {"status": "approved", "consultation_id": consultation_id, "approved_at": datetime.now(timezone.utc).isoformat()}}
        )
        
        return {
            "success": True,
            "consultation_id": consultation_id,
            "message": "Consultation scheduled successfully"
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Approve request error: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to approve request")
