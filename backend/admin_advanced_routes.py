"""
Admin Advanced Routes - System Health, Compliance, Safety & Escalation
Handles: System monitoring, Audit logs, Data privacy, Red flags, Incidents, Schools
"""
from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional, List
from datetime import datetime, timezone, timedelta
import uuid
import logging
import os
import jwt
import psutil

router = APIRouter()
db = None
logger = logging.getLogger(__name__)

SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"

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

# ==================== SYSTEM HEALTH & MONITORING ====================

@router.get("/admin/system/health")
async def get_system_health(current_user: dict = Depends(verify_admin_token)):
    """Get system health metrics"""
    try:
        # System metrics
        cpu_percent = psutil.cpu_percent(interval=1)
        memory = psutil.virtual_memory()
        disk = psutil.disk_usage('/')
        
        # Database health check
        db_healthy = True
        db_latency = 0
        try:
            start = datetime.now()
            await db.command('ping')
            db_latency = (datetime.now() - start).total_seconds() * 1000
        except Exception:
            db_healthy = False
        
        # Service status
        services = {
            "backend": {"status": "healthy", "uptime": "running"},
            "frontend": {"status": "healthy", "uptime": "running"},
            "database": {"status": "healthy" if db_healthy else "unhealthy", "latency_ms": round(db_latency, 2)},
            "ai_service": {"status": "healthy", "provider": "openai"}
        }
        
        # Recent errors (from logs)
        recent_errors = await db.error_logs.find({}, {"_id": 0}).sort("timestamp", -1).limit(10).to_list(10)
        
        return {
            "system": {
                "cpu_percent": cpu_percent,
                "memory_percent": memory.percent,
                "memory_used_gb": round(memory.used / (1024**3), 2),
                "memory_total_gb": round(memory.total / (1024**3), 2),
                "disk_percent": disk.percent,
                "disk_used_gb": round(disk.used / (1024**3), 2),
                "disk_total_gb": round(disk.total / (1024**3), 2)
            },
            "services": services,
            "database": {
                "healthy": db_healthy,
                "latency_ms": round(db_latency, 2)
            },
            "recent_errors": recent_errors,
            "checked_at": datetime.now(timezone.utc).isoformat()
        }
    except Exception as e:
        logger.error(f"Error getting system health: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to get system health")

@router.get("/admin/system/uptime")
async def get_system_uptime(current_user: dict = Depends(verify_admin_token)):
    """Get system uptime statistics"""
    try:
        # Get uptime records
        uptime_records = await db.uptime_logs.find({}, {"_id": 0}).sort("timestamp", -1).limit(100).to_list(100)
        
        # Calculate uptime percentage (last 30 days)
        total_checks = len(uptime_records) or 1
        healthy_checks = len([r for r in uptime_records if r.get("status") == "healthy"])
        uptime_percent = (healthy_checks / total_checks) * 100
        
        return {
            "uptime_percent": round(uptime_percent, 2),
            "total_checks": total_checks,
            "healthy_checks": healthy_checks,
            "recent_records": uptime_records[:20]
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get uptime stats")

# ==================== AUDIT LOGS ====================

@router.get("/admin/audit/logs")
async def get_audit_logs(
    action_type: Optional[str] = None,
    user_id: Optional[str] = None,
    days: int = 7,
    limit: int = 100,
    current_user: dict = Depends(verify_admin_token)
):
    """Get audit logs with filters"""
    try:
        query = {}
        
        if action_type:
            query["action_type"] = action_type
        if user_id:
            query["user_id"] = user_id
        
        # Date filter
        start_date = (datetime.now(timezone.utc) - timedelta(days=days)).isoformat()
        query["timestamp"] = {"$gte": start_date}
        
        logs = await db.audit_logs.find(query, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
        
        # Get action type counts
        action_types = await db.audit_logs.distinct("action_type")
        
        return {
            "logs": logs,
            "total": len(logs),
            "action_types": action_types,
            "period_days": days
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get audit logs")

@router.post("/admin/audit/log")
async def create_audit_log(
    action_type: str,
    action: str,
    details: str = "",
    target_type: Optional[str] = None,
    target_id: Optional[str] = None,
    current_user: dict = Depends(verify_admin_token)
):
    """Create an audit log entry"""
    try:
        log_entry = {
            "id": str(uuid.uuid4()),
            "action_type": action_type,  # user_action, system_action, security, data_access
            "action": action,
            "details": details,
            "target_type": target_type,
            "target_id": target_id,
            "user_id": current_user.get("sub", "admin"),
            "ip_address": "system",
            "timestamp": datetime.now(timezone.utc).isoformat()
        }
        
        await db.audit_logs.insert_one(log_entry)
        
        return {"success": True, "log_id": log_entry["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create audit log")

# ==================== DATA PRIVACY & RETENTION ====================

@router.get("/admin/privacy/settings")
async def get_privacy_settings(current_user: dict = Depends(verify_admin_token)):
    """Get data privacy and retention settings"""
    try:
        settings = await db.privacy_settings.find_one({}, {"_id": 0})
        
        if not settings:
            settings = {
                "data_retention_days": 365,
                "session_log_retention_days": 180,
                "audit_log_retention_days": 730,
                "auto_delete_inactive_accounts": False,
                "inactive_account_days": 365,
                "anonymize_on_delete": True,
                "export_format": "json",
                "gdpr_compliant": True,
                "consent_required": True,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.privacy_settings.insert_one(settings)
            settings.pop('_id', None)
        
        return {"settings": settings}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get privacy settings")

@router.put("/admin/privacy/settings")
async def update_privacy_settings(
    data_retention_days: Optional[int] = None,
    session_log_retention_days: Optional[int] = None,
    auto_delete_inactive_accounts: Optional[bool] = None,
    anonymize_on_delete: Optional[bool] = None,
    current_user: dict = Depends(verify_admin_token)
):
    """Update privacy settings"""
    try:
        update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
        
        if data_retention_days is not None:
            update_data["data_retention_days"] = data_retention_days
        if session_log_retention_days is not None:
            update_data["session_log_retention_days"] = session_log_retention_days
        if auto_delete_inactive_accounts is not None:
            update_data["auto_delete_inactive_accounts"] = auto_delete_inactive_accounts
        if anonymize_on_delete is not None:
            update_data["anonymize_on_delete"] = anonymize_on_delete
        
        await db.privacy_settings.update_one({}, {"$set": update_data}, upsert=True)
        
        # Log this action
        await db.audit_logs.insert_one({
            "id": str(uuid.uuid4()),
            "action_type": "settings_change",
            "action": "privacy_settings_updated",
            "details": str(update_data),
            "user_id": current_user.get("sub", "admin"),
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update privacy settings")

@router.get("/admin/privacy/data-requests")
async def get_data_requests(current_user: dict = Depends(verify_admin_token)):
    """Get data access/deletion requests"""
    try:
        requests = await db.data_requests.find({}, {"_id": 0}).sort("created_at", -1).to_list(100)
        
        pending = len([r for r in requests if r.get("status") == "pending"])
        completed = len([r for r in requests if r.get("status") == "completed"])
        
        return {
            "requests": requests,
            "total": len(requests),
            "pending": pending,
            "completed": completed
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get data requests")

@router.post("/admin/privacy/delete-user-data")
async def delete_user_data(
    user_type: str,
    user_id: str,
    anonymize: bool = True,
    current_user: dict = Depends(verify_admin_token)
):
    """Delete or anonymize user data"""
    try:
        collection = {
            "parent": db.parents,
            "observer": db.observers,
            "principal": db.principals
        }.get(user_type)
        
        if not collection:
            raise HTTPException(status_code=400, detail="Invalid user type")
        
        user = await collection.find_one({"id": user_id})
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        if anonymize:
            # Anonymize the data
            await collection.update_one(
                {"id": user_id},
                {"$set": {
                    "name": "DELETED_USER",
                    "email": f"deleted_{user_id[:8]}@removed.local",
                    "phone": "REMOVED",
                    "is_active": False,
                    "deleted_at": datetime.now(timezone.utc).isoformat()
                }}
            )
        else:
            # Hard delete
            await collection.delete_one({"id": user_id})
        
        # Log the action
        await db.audit_logs.insert_one({
            "id": str(uuid.uuid4()),
            "action_type": "data_deletion",
            "action": "user_data_deleted",
            "details": f"User {user_id} data {'anonymized' if anonymize else 'deleted'}",
            "target_type": user_type,
            "target_id": user_id,
            "user_id": current_user.get("sub", "admin"),
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        
        return {"success": True, "action": "anonymized" if anonymize else "deleted"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete user data")

# ==================== RED FLAG DETECTION & ESCALATION ====================

RED_FLAG_CATEGORIES = [
    {"id": "emotional_distress", "name": "Emotional Distress", "severity": "high", "icon": "😢"},
    {"id": "safety_concern", "name": "Safety Concern", "severity": "critical", "icon": "⚠️"},
    {"id": "behavioral_change", "name": "Significant Behavioral Change", "severity": "medium", "icon": "📊"},
    {"id": "communication_issue", "name": "Communication Difficulty", "severity": "low", "icon": "💬"},
    {"id": "attendance_pattern", "name": "Attendance Pattern", "severity": "medium", "icon": "📅"},
    {"id": "external_referral", "name": "Needs External Support", "severity": "high", "icon": "🏥"}
]

@router.get("/admin/safety/red-flags")
async def get_red_flags(
    status: Optional[str] = None,
    severity: Optional[str] = None,
    current_user: dict = Depends(verify_admin_token)
):
    """Get all red flags"""
    try:
        query = {}
        if status:
            query["status"] = status
        if severity:
            query["severity"] = severity
        
        flags = await db.red_flags.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
        
        # Enrich with child/observer info
        for flag in flags:
            if flag.get("child_id"):
                child = await db.children.find_one({"id": flag["child_id"]}, {"_id": 0, "name": 1})
                flag["child_name"] = child.get("name") if child else "Unknown"
            if flag.get("observer_id"):
                observer = await db.observers.find_one({"id": flag["observer_id"]}, {"_id": 0, "name": 1})
                flag["observer_name"] = observer.get("name") if observer else "Unknown"
        
        # Status counts
        status_counts = {
            "pending": await db.red_flags.count_documents({"status": "pending"}),
            "reviewing": await db.red_flags.count_documents({"status": "reviewing"}),
            "escalated": await db.red_flags.count_documents({"status": "escalated"}),
            "resolved": await db.red_flags.count_documents({"status": "resolved"}),
            "referred": await db.red_flags.count_documents({"status": "referred"})
        }
        
        return {
            "flags": flags,
            "total": len(flags),
            "status_counts": status_counts,
            "categories": RED_FLAG_CATEGORIES
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get red flags")

@router.post("/admin/safety/red-flag")
async def create_red_flag(
    child_id: str,
    observer_id: str,
    category: str,
    description: str,
    severity: str = "medium",
    session_id: Optional[str] = None,
    current_user: dict = Depends(verify_admin_token)
):
    """Create a red flag (usually auto-generated by AI or observer)"""
    try:
        flag = {
            "id": str(uuid.uuid4()),
            "child_id": child_id,
            "observer_id": observer_id,
            "category": category,
            "description": description,
            "severity": severity,
            "session_id": session_id,
            "status": "pending",
            "escalation_level": 0,  # 0=Observer, 1=Principal, 2=Admin
            "escalation_history": [],
            "actions_taken": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "created_by": current_user.get("sub", "system")
        }
        
        await db.red_flags.insert_one(flag)
        
        return {"success": True, "flag_id": flag["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create red flag")

@router.put("/admin/safety/red-flag/{flag_id}")
async def update_red_flag(
    flag_id: str,
    status: Optional[str] = None,
    action_taken: Optional[str] = None,
    notes: Optional[str] = None,
    escalate: bool = False,
    current_user: dict = Depends(verify_admin_token)
):
    """Update red flag status or escalate"""
    try:
        flag = await db.red_flags.find_one({"id": flag_id})
        if not flag:
            raise HTTPException(status_code=404, detail="Red flag not found")
        
        update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
        
        if status:
            update_data["status"] = status
        
        if action_taken:
            action = {
                "action": action_taken,
                "notes": notes or "",
                "taken_by": current_user.get("sub", "admin"),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            await db.red_flags.update_one(
                {"id": flag_id},
                {"$push": {"actions_taken": action}}
            )
        
        if escalate:
            new_level = min(flag.get("escalation_level", 0) + 1, 2)
            update_data["escalation_level"] = new_level
            update_data["status"] = "escalated"
            
            escalation = {
                "from_level": flag.get("escalation_level", 0),
                "to_level": new_level,
                "escalated_by": current_user.get("sub", "admin"),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }
            await db.red_flags.update_one(
                {"id": flag_id},
                {"$push": {"escalation_history": escalation}}
            )
        
        await db.red_flags.update_one({"id": flag_id}, {"$set": update_data})
        
        return {"success": True}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update red flag")

# ==================== INCIDENT MANAGEMENT ====================

@router.get("/admin/incidents")
async def get_incidents(
    status: Optional[str] = None,
    current_user: dict = Depends(verify_admin_token)
):
    """Get all incidents"""
    try:
        query = {}
        if status:
            query["status"] = status
        
        incidents = await db.incidents.find(query, {"_id": 0}).sort("created_at", -1).to_list(500)
        
        status_counts = {
            "open": await db.incidents.count_documents({"status": "open"}),
            "investigating": await db.incidents.count_documents({"status": "investigating"}),
            "resolved": await db.incidents.count_documents({"status": "resolved"}),
            "closed": await db.incidents.count_documents({"status": "closed"})
        }
        
        return {
            "incidents": incidents,
            "total": len(incidents),
            "status_counts": status_counts
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get incidents")

@router.post("/admin/incidents")
async def create_incident(
    title: str,
    description: str,
    incident_type: str,
    severity: str,
    related_flag_id: Optional[str] = None,
    child_id: Optional[str] = None,
    current_user: dict = Depends(verify_admin_token)
):
    """Create a new incident"""
    try:
        incident = {
            "id": str(uuid.uuid4()),
            "incident_number": f"INC-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}",
            "title": title,
            "description": description,
            "incident_type": incident_type,  # safety, technical, compliance, behavioral
            "severity": severity,  # low, medium, high, critical
            "status": "open",
            "related_flag_id": related_flag_id,
            "child_id": child_id,
            "timeline": [{
                "action": "Incident created",
                "by": current_user.get("sub", "admin"),
                "timestamp": datetime.now(timezone.utc).isoformat()
            }],
            "resolution": None,
            "external_referral": None,
            "created_by": current_user.get("sub", "admin"),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.incidents.insert_one(incident)
        
        return {"success": True, "incident": {"id": incident["id"], "number": incident["incident_number"]}}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create incident")

@router.put("/admin/incidents/{incident_id}")
async def update_incident(
    incident_id: str,
    status: Optional[str] = None,
    resolution: Optional[str] = None,
    external_referral: Optional[str] = None,
    timeline_entry: Optional[str] = None,
    current_user: dict = Depends(verify_admin_token)
):
    """Update incident"""
    try:
        update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
        
        if status:
            update_data["status"] = status
        if resolution:
            update_data["resolution"] = resolution
        if external_referral:
            update_data["external_referral"] = external_referral
        
        await db.incidents.update_one({"id": incident_id}, {"$set": update_data})
        
        if timeline_entry:
            await db.incidents.update_one(
                {"id": incident_id},
                {"$push": {"timeline": {
                    "action": timeline_entry,
                    "by": current_user.get("sub", "admin"),
                    "timestamp": datetime.now(timezone.utc).isoformat()
                }}}
            )
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update incident")

# ==================== SCHOOLS & PROGRAMS MANAGEMENT ====================

@router.get("/admin/schools")
async def get_all_schools(current_user: dict = Depends(verify_admin_token)):
    """Get all schools/programs"""
    try:
        schools = await db.schools.find({}, {"_id": 0}).to_list(500)
        
        # Enrich with stats
        for school in schools:
            school["student_count"] = await db.children.count_documents({"school": school.get("name", "")})
            school["principal_count"] = await db.principals.count_documents({"school": school.get("name", "")})
            school["observer_count"] = await db.observers.count_documents({"school": school.get("name", "")})
        
        return {"schools": schools, "total": len(schools)}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get schools")

@router.post("/admin/schools")
async def create_school(
    name: str,
    address: str,
    city: str,
    contact_email: str,
    contact_phone: str,
    program_type: str = "standard",
    current_user: dict = Depends(verify_admin_token)
):
    """Create a new school/program"""
    try:
        school = {
            "id": str(uuid.uuid4()),
            "name": name,
            "address": address,
            "city": city,
            "contact_email": contact_email,
            "contact_phone": contact_phone,
            "program_type": program_type,
            "status": "active",
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.schools.insert_one(school)
        
        return {"success": True, "school": {"id": school["id"], "name": name}}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create school")

@router.put("/admin/schools/{school_id}")
async def update_school(
    school_id: str,
    name: Optional[str] = None,
    status: Optional[str] = None,
    current_user: dict = Depends(verify_admin_token)
):
    """Update school details"""
    try:
        update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
        
        if name:
            update_data["name"] = name
        if status:
            update_data["status"] = status
        
        await db.schools.update_one({"id": school_id}, {"$set": update_data})
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update school")

# ==================== AI GUARDRAILS & EXPLAINABILITY ====================

@router.get("/admin/ai/guardrails")
async def get_ai_guardrails(current_user: dict = Depends(verify_admin_token)):
    """Get AI guardrail settings"""
    try:
        guardrails = await db.ai_guardrails.find_one({}, {"_id": 0})
        
        if not guardrails:
            guardrails = {
                "no_diagnosis": True,
                "no_medical_advice": True,
                "no_therapy_language": True,
                "no_comparative_assessment": True,
                "no_labeling": True,
                "neutral_language_only": True,
                "observation_based_only": True,
                "parent_safe_language": True,
                "blocked_terms": [
                    "diagnosis", "disorder", "syndrome", "condition",
                    "therapy", "treatment", "medication",
                    "abnormal", "problem child", "difficult"
                ],
                "required_disclaimers": [
                    "This is not a medical or psychological assessment",
                    "For professional evaluation, consult a licensed practitioner"
                ],
                "confidence_threshold": 0.7,
                "human_review_threshold": 0.5,
                "created_at": datetime.now(timezone.utc).isoformat()
            }
            await db.ai_guardrails.insert_one(guardrails)
            guardrails.pop('_id', None)
        
        return {"guardrails": guardrails}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get AI guardrails")

@router.put("/admin/ai/guardrails")
async def update_ai_guardrails(
    no_diagnosis: Optional[bool] = None,
    no_medical_advice: Optional[bool] = None,
    confidence_threshold: Optional[float] = None,
    human_review_threshold: Optional[float] = None,
    current_user: dict = Depends(verify_admin_token)
):
    """Update AI guardrails"""
    try:
        update_data = {"updated_at": datetime.now(timezone.utc).isoformat()}
        
        if no_diagnosis is not None:
            update_data["no_diagnosis"] = no_diagnosis
        if no_medical_advice is not None:
            update_data["no_medical_advice"] = no_medical_advice
        if confidence_threshold is not None:
            update_data["confidence_threshold"] = confidence_threshold
        if human_review_threshold is not None:
            update_data["human_review_threshold"] = human_review_threshold
        
        await db.ai_guardrails.update_one({}, {"$set": update_data}, upsert=True)
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update AI guardrails")

@router.get("/admin/ai/explainability-logs")
async def get_ai_explainability_logs(
    limit: int = 50,
    current_user: dict = Depends(verify_admin_token)
):
    """Get AI decision explainability logs"""
    try:
        logs = await db.ai_explainability.find({}, {"_id": 0}).sort("timestamp", -1).limit(limit).to_list(limit)
        
        return {
            "logs": logs,
            "total": len(logs)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get AI logs")

@router.get("/admin/ai/pending-approvals")
async def get_pending_ai_approvals(current_user: dict = Depends(verify_admin_token)):
    """Get AI outputs pending human approval"""
    try:
        pending = await db.ai_pending_approvals.find(
            {"status": "pending"},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        
        return {
            "pending_approvals": pending,
            "total": len(pending)
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get pending approvals")

@router.post("/admin/ai/approve/{approval_id}")
async def approve_ai_output(
    approval_id: str,
    approved: bool,
    reviewer_notes: str = "",
    current_user: dict = Depends(verify_admin_token)
):
    """Approve or reject AI output"""
    try:
        await db.ai_pending_approvals.update_one(
            {"id": approval_id},
            {"$set": {
                "status": "approved" if approved else "rejected",
                "reviewed_by": current_user.get("sub", "admin"),
                "reviewer_notes": reviewer_notes,
                "reviewed_at": datetime.now(timezone.utc).isoformat()
            }}
        )
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to process approval")

# ==================== HELP & FAQ MANAGEMENT ====================

@router.get("/admin/help/faqs")
async def get_faqs(current_user: dict = Depends(verify_admin_token)):
    """Get all FAQs"""
    try:
        faqs = await db.faqs.find({}, {"_id": 0}).sort("order", 1).to_list(500)
        
        categories = await db.faqs.distinct("category")
        
        return {
            "faqs": faqs,
            "total": len(faqs),
            "categories": categories
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to get FAQs")

@router.post("/admin/help/faq")
async def create_faq(
    question: str,
    answer: str,
    category: str,
    order: int = 0,
    current_user: dict = Depends(verify_admin_token)
):
    """Create a new FAQ"""
    try:
        faq = {
            "id": str(uuid.uuid4()),
            "question": question,
            "answer": answer,
            "category": category,
            "order": order,
            "is_active": True,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.faqs.insert_one(faq)
        
        return {"success": True, "faq_id": faq["id"]}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to create FAQ")

@router.put("/admin/help/faq/{faq_id}")
async def update_faq(
    faq_id: str,
    question: Optional[str] = None,
    answer: Optional[str] = None,
    is_active: Optional[bool] = None,
    current_user: dict = Depends(verify_admin_token)
):
    """Update FAQ"""
    try:
        update_data = {}
        if question:
            update_data["question"] = question
        if answer:
            update_data["answer"] = answer
        if is_active is not None:
            update_data["is_active"] = is_active
        
        await db.faqs.update_one({"id": faq_id}, {"$set": update_data})
        
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to update FAQ")

@router.delete("/admin/help/faq/{faq_id}")
async def delete_faq(faq_id: str, current_user: dict = Depends(verify_admin_token)):
    """Delete FAQ"""
    try:
        await db.faqs.delete_one({"id": faq_id})
        return {"success": True}
    except Exception as e:
        raise HTTPException(status_code=500, detail="Failed to delete FAQ")
