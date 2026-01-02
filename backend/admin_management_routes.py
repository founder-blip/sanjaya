"""
Admin Management Routes - Complete Admin Platform
Handles: Student Enrollment, User Management, Analytics, Support, AI Settings, Billing
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from passlib.context import CryptContext
import uuid
import logging
import os
import jwt

router = APIRouter()
db = None
logger = logging.getLogger(__name__)

SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def set_database(database):
    global db
    db = database

def verify_admin_token(authorization: Optional[str] = Header(None)):
    """Verify admin JWT token"""
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Missing authorization")
    
    token = authorization.replace('Bearer ', '')
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token expired")
    except Exception as e:
        logger.error(f"JWT decode error: {str(e)}")
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== DASHBOARD STATS ====================

@router.get("/admin/dashboard/stats")
async def get_dashboard_stats(current_user: dict = Depends(verify_admin_token)):
    """Get overview stats for admin dashboard"""
    try:
        # Count all entities
        total_students = await db.children.count_documents({})
        active_students = await db.children.count_documents({"status": "active"})
        total_principals = await db.principals.count_documents({})
        total_observers = await db.observers.count_documents({})
        total_parents = await db.parents.count_documents({})
        
        # Session stats
        total_sessions = await db.session_logs.count_documents({})
        today = datetime.now(timezone.utc).date().isoformat()
        sessions_today = await db.session_logs.count_documents({
            "created_at": {"$regex": f"^{today}"}
        })
        
        # Support tickets
        open_tickets = await db.support_tickets.count_documents({"status": "open"})
        pending_tickets = await db.support_tickets.count_documents({"status": "in_progress"})
        
        # Inquiries
        new_inquiries = await db.inquiries.count_documents({"status": "new"})
        
        # Revenue (placeholder - would need actual billing data)
        total_revenue = 0
        
        return {
            "students": {
                "total": total_students,
                "active": active_students,
                "inactive": total_students - active_students
            },
            "users": {
                "principals": total_principals,
                "observers": total_observers,
                "parents": total_parents,
                "total": total_principals + total_observers + total_parents
            },
            "sessions": {
                "total": total_sessions,
                "today": sessions_today
            },
            "support": {
                "open_tickets": open_tickets,
                "pending_tickets": pending_tickets
            },
            "inquiries": {
                "new": new_inquiries
            },
            "revenue": {
                "total": total_revenue
            }
        }
    except Exception as e:
        logger.error(f"Error getting dashboard stats: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load stats")

# ==================== STUDENT ENROLLMENT ====================

@router.post("/admin/students/enroll")
async def enroll_student(
    name: str,
    date_of_birth: str,
    grade: str,
    school: str,
    parent_email: str,
    parent_name: str,
    parent_phone: str,
    principal_id: Optional[str] = None,
    observer_id: Optional[str] = None,
    notes: str = "",
    current_user: dict = Depends(verify_admin_token)
):
    """Enroll a new student into the program"""
    try:
        # Check if parent exists, create if not
        parent = await db.parents.find_one({"email": parent_email})
        
        if not parent:
            # Create new parent account
            parent_id = str(uuid.uuid4())
            temp_password = f"Sanjaya{str(uuid.uuid4())[:6]}"
            
            parent = {
                "id": parent_id,
                "email": parent_email,
                "name": parent_name,
                "phone": parent_phone,
                "hashed_password": pwd_context.hash(temp_password),
                "role": "parent",
                "is_active": True,
                "created_at": datetime.now(timezone.utc).isoformat(),
                "temp_password": temp_password  # Store temporarily for admin to share
            }
            await db.parents.insert_one(parent)
        else:
            parent_id = parent["id"]
        
        # Create student record
        student_id = str(uuid.uuid4())
        student = {
            "id": student_id,
            "name": name,
            "date_of_birth": date_of_birth,
            "grade": grade,
            "school": school,
            "parent_ids": [parent_id],
            "principal_id": principal_id,
            "observer_id": observer_id,
            "status": "active",
            "enrollment_date": datetime.now(timezone.utc).isoformat(),
            "notes": notes,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.children.insert_one(student)
        
        # Create enrollment record
        enrollment = {
            "id": str(uuid.uuid4()),
            "student_id": student_id,
            "student_name": name,
            "parent_id": parent_id,
            "parent_email": parent_email,
            "school": school,
            "enrolled_by": current_user.get("sub", "admin"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        await db.enrollments.insert_one(enrollment)
        
        return {
            "success": True,
            "student": {
                "id": student_id,
                "name": name
            },
            "parent": {
                "id": parent_id,
                "email": parent_email,
                "temp_password": parent.get("temp_password", None)  # Only for new parents
            }
        }
    except Exception as e:
        logger.error(f"Error enrolling student: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to enroll student: {str(e)}")

@router.get("/admin/students")
async def get_all_students(
    status: Optional[str] = None,
    school: Optional[str] = None,
    current_user: dict = Depends(verify_admin_token)
):
    """Get all students with filters"""
    try:
        query = {}
        if status:
            query["status"] = status
        if school:
            query["school"] = school
        
        students = await db.children.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
        
        # Enrich with related data
        for student in students:
            # Get parent info
            if student.get("parent_ids"):
                parents = await db.parents.find(
                    {"id": {"$in": student["parent_ids"]}},
                    {"_id": 0, "hashed_password": 0}
                ).to_list(10)
                student["parents"] = parents
            
            # Get principal info
            if student.get("principal_id"):
                principal = await db.principals.find_one(
                    {"id": student["principal_id"]},
                    {"_id": 0, "hashed_password": 0}
                )
                student["principal"] = principal
            
            # Get observer info
            if student.get("observer_id"):
                observer = await db.observers.find_one(
                    {"id": student["observer_id"]},
                    {"_id": 0, "hashed_password": 0}
                )
                student["observer"] = observer
        
        return {"students": students, "total": len(students)}
    except Exception as e:
        logger.error(f"Error getting students: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load students")

@router.put("/admin/students/{student_id}")
async def update_student(
    student_id: str,
    name: Optional[str] = None,
    grade: Optional[str] = None,
    school: Optional[str] = None,
    status: Optional[str] = None,
    principal_id: Optional[str] = None,
    observer_id: Optional[str] = None,
    notes: Optional[str] = None,
    current_user: dict = Depends(verify_admin_token)
):
    """Update student details"""
    try:
        update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
        
        if name: update_data["name"] = name
        if grade: update_data["grade"] = grade
        if school: update_data["school"] = school
        if status: update_data["status"] = status
        if principal_id is not None: update_data["principal_id"] = principal_id
        if observer_id is not None: update_data["observer_id"] = observer_id
        if notes is not None: update_data["notes"] = notes
        
        result = await db.children.update_one(
            {"id": student_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Student not found")
        
        return {"success": True, "message": "Student updated"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error updating student: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to update student")

@router.post("/admin/students/{student_id}/assign-principal")
async def assign_student_to_principal(
    student_id: str,
    principal_id: str,
    current_user: dict = Depends(verify_admin_token)
):
    """Assign a student to a principal"""
    try:
        # Verify principal exists
        principal = await db.principals.find_one({"id": principal_id})
        if not principal:
            raise HTTPException(status_code=404, detail="Principal not found")
        
        # Update student
        result = await db.children.update_one(
            {"id": student_id},
            {"$set": {
                "principal_id": principal_id,
                "school": principal.get("school", ""),
                "updated_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Student not found")
        
        return {"success": True, "message": f"Student assigned to {principal.get('name', 'principal')}"}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error assigning student: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to assign student")

# ==================== USER MANAGEMENT ====================

@router.get("/admin/users/principals")
async def get_all_principals(current_user: dict = Depends(verify_admin_token)):
    """Get all principals"""
    try:
        principals = await db.principals.find({}, {"_id": 0, "hashed_password": 0}).to_list(1000)
        
        # Add student count
        for principal in principals:
            count = await db.children.count_documents({"principal_id": principal["id"]})
            principal["student_count"] = count
        
        return {"principals": principals, "total": len(principals)}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to load principals")

@router.get("/admin/users/observers")
async def get_all_observers(current_user: dict = Depends(verify_admin_token)):
    """Get all observers"""
    try:
        observers = await db.observers.find({}, {"_id": 0, "hashed_password": 0}).to_list(1000)
        
        # Add assigned children count
        for observer in observers:
            count = await db.children.count_documents({"observer_id": observer["id"]})
            observer["assigned_children"] = count
        
        return {"observers": observers, "total": len(observers)}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to load observers")

@router.get("/admin/users/parents")
async def get_all_parents(current_user: dict = Depends(verify_admin_token)):
    """Get all parents"""
    try:
        parents = await db.parents.find({}, {"_id": 0, "hashed_password": 0}).to_list(1000)
        
        # Add children count
        for parent in parents:
            count = await db.children.count_documents({"parent_ids": parent["id"]})
            parent["children_count"] = count
        
        return {"parents": parents, "total": len(parents)}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to load parents")

@router.post("/admin/users/principal")
async def create_principal(
    name: str,
    email: str,
    phone: str,
    school: str,
    password: str,
    current_user: dict = Depends(verify_admin_token)
):
    """Create a new principal account"""
    try:
        existing = await db.principals.find_one({"email": email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")
        
        principal = {
            "id": str(uuid.uuid4()),
            "name": name,
            "email": email,
            "phone": phone,
            "school": school,
            "hashed_password": pwd_context.hash(password),
            "role": "principal",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.principals.insert_one(principal)
        
        return {
            "success": True,
            "principal": {
                "id": principal["id"],
                "name": name,
                "email": email,
                "school": school
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create principal: {str(e)}")

@router.post("/admin/users/observer")
async def create_observer(
    name: str,
    email: str,
    phone: str,
    specialization: str,
    password: str,
    current_user: dict = Depends(verify_admin_token)
):
    """Create a new observer account"""
    try:
        existing = await db.observers.find_one({"email": email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already exists")
        
        observer = {
            "id": str(uuid.uuid4()),
            "name": name,
            "email": email,
            "phone": phone,
            "specialization": specialization,
            "hashed_password": pwd_context.hash(password),
            "role": "observer",
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.observers.insert_one(observer)
        
        return {
            "success": True,
            "observer": {
                "id": observer["id"],
                "name": name,
                "email": email
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create observer: {str(e)}")

@router.put("/admin/users/{user_type}/{user_id}/status")
async def toggle_user_status(
    user_type: str,
    user_id: str,
    is_active: bool,
    current_user: dict = Depends(verify_admin_token)
):
    """Toggle user active status"""
    try:
        collection = {
            "principal": db.principals,
            "observer": db.observers,
            "parent": db.parents
        }.get(user_type)
        
        if not collection:
            raise HTTPException(status_code=400, detail="Invalid user type")
        
        result = await collection.update_one(
            {"id": user_id},
            {"$set": {"is_active": is_active}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="User not found")
        
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update user")

# ==================== ANALYTICS ====================

@router.get("/admin/analytics/overview")
async def get_analytics_overview(
    days: int = 30,
    current_user: dict = Depends(verify_admin_token)
):
    """Get analytics overview"""
    try:
        end_date = datetime.now(timezone.utc)
        start_date = end_date - timedelta(days=days)
        
        # Session trends
        sessions = await db.session_logs.find({}, {"_id": 0, "created_at": 1}).to_list(10000)
        
        # Group by date
        session_by_date = {}
        for session in sessions:
            date = session.get("created_at", "")[:10]
            session_by_date[date] = session_by_date.get(date, 0) + 1
        
        # Enrollment trends
        enrollments = await db.enrollments.find({}, {"_id": 0, "created_at": 1}).to_list(10000)
        enrollment_by_date = {}
        for enrollment in enrollments:
            date = enrollment.get("created_at", "")[:10]
            enrollment_by_date[date] = enrollment_by_date.get(date, 0) + 1
        
        # Get schools breakdown
        schools = await db.children.distinct("school")
        school_stats = []
        for school in schools:
            if school:
                count = await db.children.count_documents({"school": school})
                school_stats.append({"school": school, "students": count})
        
        return {
            "period_days": days,
            "sessions": {
                "by_date": session_by_date,
                "total": len(sessions)
            },
            "enrollments": {
                "by_date": enrollment_by_date,
                "total": len(enrollments)
            },
            "schools": school_stats
        }
    except Exception as e:
        logger.error(f"Error getting analytics: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load analytics")

@router.get("/admin/analytics/sessions")
async def get_session_analytics(
    days: int = 30,
    current_user: dict = Depends(verify_admin_token)
):
    """Get detailed session analytics"""
    try:
        # Get all sessions with observer info
        sessions = await db.session_logs.find({}, {"_id": 0}).to_list(10000)
        
        # Observer performance
        observer_stats = {}
        for session in sessions:
            obs_id = session.get("observer_id", "unknown")
            if obs_id not in observer_stats:
                observer_stats[obs_id] = {"sessions": 0, "moods": {}}
            observer_stats[obs_id]["sessions"] += 1
            mood = session.get("mood", "neutral")
            observer_stats[obs_id]["moods"][mood] = observer_stats[obs_id]["moods"].get(mood, 0) + 1
        
        # Get observer names
        for obs_id in observer_stats:
            observer = await db.observers.find_one({"id": obs_id}, {"_id": 0, "name": 1})
            observer_stats[obs_id]["name"] = observer.get("name", "Unknown") if observer else "Unknown"
        
        return {
            "total_sessions": len(sessions),
            "observer_performance": observer_stats
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to load session analytics")

# ==================== SUPPORT TICKET MANAGEMENT ====================

@router.get("/admin/support/tickets")
async def get_all_support_tickets(
    status: Optional[str] = None,
    priority: Optional[str] = None,
    current_user: dict = Depends(verify_admin_token)
):
    """Get all support tickets for admin management"""
    try:
        query = {}
        if status:
            query["status"] = status
        if priority:
            query["priority"] = priority
        
        tickets = await db.support_tickets.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
        
        # Count by status
        status_counts = {
            "open": await db.support_tickets.count_documents({"status": "open"}),
            "in_progress": await db.support_tickets.count_documents({"status": "in_progress"}),
            "resolved": await db.support_tickets.count_documents({"status": "resolved"}),
            "closed": await db.support_tickets.count_documents({"status": "closed"})
        }
        
        return {
            "tickets": tickets,
            "total": len(tickets),
            "status_counts": status_counts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to load tickets")

@router.put("/admin/support/tickets/{ticket_id}")
async def update_ticket(
    ticket_id: str,
    status: Optional[str] = None,
    priority: Optional[str] = None,
    assigned_to: Optional[str] = None,
    current_user: dict = Depends(verify_admin_token)
):
    """Update ticket status/priority/assignment"""
    try:
        update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
        
        if status:
            update_data["status"] = status
        if priority:
            update_data["priority"] = priority
        if assigned_to is not None:
            update_data["assigned_to"] = assigned_to
        
        result = await db.support_tickets.update_one(
            {"id": ticket_id},
            {"$set": update_data}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update ticket")

@router.post("/admin/support/tickets/{ticket_id}/reply")
async def admin_reply_ticket(
    ticket_id: str,
    message: str,
    current_user: dict = Depends(verify_admin_token)
):
    """Add admin reply to ticket"""
    try:
        reply = {
            "id": str(uuid.uuid4()),
            "user_id": "admin",
            "user_role": "admin",
            "user_name": current_user.get("sub", "Admin"),
            "message": message,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.support_tickets.update_one(
            {"id": ticket_id},
            {
                "$push": {"responses": reply},
                "$set": {
                    "updated_at": datetime.now(timezone.utc).isoformat(),
                    "status": "in_progress"
                }
            }
        )
        
        return {"success": True, "reply": reply}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to add reply")

# ==================== AI SYSTEM MANAGEMENT ====================

@router.get("/admin/ai/settings")
async def get_ai_settings(current_user: dict = Depends(verify_admin_token)):
    """Get AI system settings"""
    try:
        settings = await db.ai_settings.find_one({}, {"_id": 0})
        
        if not settings:
            # Default settings
            settings = {
                "behavioral_tags_enabled": True,
                "auto_report_generation": True,
                "report_types": ["daily", "weekly", "fortnightly", "monthly"],
                "trend_analysis_enabled": True,
                "sentiment_analysis_enabled": True,
                "min_sessions_for_report": 3,
                "notification_on_concerns": True,
                "model_provider": "openai",
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.ai_settings.insert_one(settings)
            # Remove _id that was added by insert
            settings.pop('_id', None)
        
        return {"settings": settings}
    except Exception as e:
        logger.error(f"Error loading AI settings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to load AI settings")

@router.put("/admin/ai/settings")
async def update_ai_settings(
    behavioral_tags_enabled: Optional[bool] = None,
    auto_report_generation: Optional[bool] = None,
    trend_analysis_enabled: Optional[bool] = None,
    sentiment_analysis_enabled: Optional[bool] = None,
    min_sessions_for_report: Optional[int] = None,
    notification_on_concerns: Optional[bool] = None,
    current_user: dict = Depends(verify_admin_token)
):
    """Update AI system settings"""
    try:
        update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
        
        if behavioral_tags_enabled is not None:
            update_data["behavioral_tags_enabled"] = behavioral_tags_enabled
        if auto_report_generation is not None:
            update_data["auto_report_generation"] = auto_report_generation
        if trend_analysis_enabled is not None:
            update_data["trend_analysis_enabled"] = trend_analysis_enabled
        if sentiment_analysis_enabled is not None:
            update_data["sentiment_analysis_enabled"] = sentiment_analysis_enabled
        if min_sessions_for_report is not None:
            update_data["min_sessions_for_report"] = min_sessions_for_report
        if notification_on_concerns is not None:
            update_data["notification_on_concerns"] = notification_on_concerns
        
        await db.ai_settings.update_one({}, {"$set": update_data}, upsert=True)
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update AI settings")

@router.get("/admin/ai/reports")
async def get_ai_reports(
    limit: int = 50,
    current_user: dict = Depends(verify_admin_token)
):
    """Get all AI-generated reports"""
    try:
        reports = await db.ai_reports.find({}, {"_id": 0}).sort("created_at", -1).limit(limit).to_list(limit)
        return {"reports": reports, "total": len(reports)}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to load reports")

# ==================== BILLING MANAGEMENT ====================

@router.get("/admin/billing/subscriptions")
async def get_all_subscriptions(current_user: dict = Depends(verify_admin_token)):
    """Get all subscriptions"""
    try:
        subscriptions = await db.subscriptions.find({}, {"_id": 0}).to_list(1000)
        
        # Count by status
        active = len([s for s in subscriptions if s.get("status") == "active"])
        expired = len([s for s in subscriptions if s.get("status") == "expired"])
        
        return {
            "subscriptions": subscriptions,
            "total": len(subscriptions),
            "active": active,
            "expired": expired
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to load subscriptions")

@router.post("/admin/billing/subscription")
async def create_subscription(
    parent_id: str,
    child_id: str,
    plan: str,
    amount: float,
    start_date: str,
    end_date: str,
    payment_status: str = "pending",
    current_user: dict = Depends(verify_admin_token)
):
    """Create a subscription record"""
    try:
        subscription = {
            "id": str(uuid.uuid4()),
            "parent_id": parent_id,
            "child_id": child_id,
            "plan": plan,
            "amount": amount,
            "start_date": start_date,
            "end_date": end_date,
            "status": "active",
            "payment_status": payment_status,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.subscriptions.insert_one(subscription)
        
        return {"success": True, "subscription": {"id": subscription["id"]}}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create subscription")

@router.get("/admin/billing/payments")
async def get_all_payments(
    status: Optional[str] = None,
    current_user: dict = Depends(verify_admin_token)
):
    """Get all payment records"""
    try:
        query = {}
        if status:
            query["status"] = status
        
        payments = await db.payments.find(query, {"_id": 0}).sort("created_at", -1).to_list(1000)
        
        total_amount = sum(p.get("amount", 0) for p in payments if p.get("status") == "paid")
        pending_amount = sum(p.get("amount", 0) for p in payments if p.get("status") == "pending")
        
        return {
            "payments": payments,
            "total": len(payments),
            "total_collected": total_amount,
            "pending_amount": pending_amount
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to load payments")

@router.post("/admin/billing/payment")
async def record_payment(
    subscription_id: str,
    amount: float,
    payment_method: str,
    transaction_id: str,
    status: str = "paid",
    notes: str = "",
    current_user: dict = Depends(verify_admin_token)
):
    """Record a payment"""
    try:
        payment = {
            "id": str(uuid.uuid4()),
            "subscription_id": subscription_id,
            "amount": amount,
            "payment_method": payment_method,
            "transaction_id": transaction_id,
            "status": status,
            "notes": notes,
            "recorded_by": current_user.get("sub", "admin"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.payments.insert_one(payment)
        
        # Update subscription payment status
        if status == "paid":
            await db.subscriptions.update_one(
                {"id": subscription_id},
                {"$set": {"payment_status": "paid"}}
            )
        
        return {"success": True, "payment": {"id": payment["id"]}}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to record payment")

# ==================== ACTIVITY LOG ====================

@router.get("/admin/activity/log")
async def get_activity_log(
    limit: int = 100,
    current_user: dict = Depends(verify_admin_token)
):
    """Get platform activity log"""
    try:
        # Combine activities from various sources
        activities = []
        
        # Recent sessions
        sessions = await db.session_logs.find({}, {"_id": 0}).sort("created_at", -1).limit(20).to_list(20)
        for s in sessions:
            activities.append({
                "type": "session",
                "description": f"Session logged for child",
                "user": s.get("observer_id", "Unknown"),
                "timestamp": s.get("created_at", "")
            })
        
        # Recent enrollments
        enrollments = await db.enrollments.find({}, {"_id": 0}).sort("created_at", -1).limit(20).to_list(20)
        for e in enrollments:
            activities.append({
                "type": "enrollment",
                "description": f"Student {e.get('student_name', 'Unknown')} enrolled",
                "user": e.get("enrolled_by", "admin"),
                "timestamp": e.get("created_at", "")
            })
        
        # Recent tickets
        tickets = await db.support_tickets.find({}, {"_id": 0}).sort("created_at", -1).limit(20).to_list(20)
        for t in tickets:
            activities.append({
                "type": "support",
                "description": f"Support ticket: {t.get('subject', 'No subject')}",
                "user": t.get("user_email", "Unknown"),
                "timestamp": t.get("created_at", "")
            })
        
        # Sort by timestamp
        activities.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        
        return {"activities": activities[:limit]}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to load activity log")
