"""
Earnings & Support Routes - Payment tracking and support ticket management
For Observers and Principals
"""
from fastapi import APIRouter, HTTPException
from jose import JWTError, jwt
from datetime import datetime, timedelta, timezone
from typing import List, Optional
import logging
import uuid

router = APIRouter()
db = None
logger = logging.getLogger(__name__)

SECRET_KEY = 'your-secret-key-change-in-production'
ALGORITHM = "HS256"

# Payment rates (in INR)
RATES = {
    "observer": {
        "per_session": 150,  # ₹150 per session
        "bonus_weekly_5plus": 200,  # ₹200 bonus for 5+ sessions/week
    },
    "principal": {
        "per_student_enrolled": 50,  # ₹50 per active student per month
        "program_management": 2000,  # ₹2000 monthly for program management
    }
}

def set_database(database):
    """Set the database instance from main server"""
    global db
    db = database

def verify_token(token: str):
    """Verify JWT token for observer or principal"""
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        role = payload.get("role")
        if user_id is None or role not in ["observer", "principal"]:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"id": user_id, "role": role, "email": payload.get("email")}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# ==================== EARNINGS ====================

@router.get("/earnings/summary")
async def get_earnings_summary(token: str):
    """Get earnings summary for the current user"""
    try:
        user = verify_token(token)
        today = datetime.now(timezone.utc)
        current_month = today.strftime("%Y-%m")
        current_week_start = (today - timedelta(days=today.weekday())).date()
        
        if user['role'] == 'observer':
            # Get observer's sessions
            observer = await db.observers.find_one({"id": user['id']}, {"_id": 0})
            if not observer:
                raise HTTPException(status_code=404, detail="Observer not found")
            
            # Get all session logs for this observer
            sessions = await db.session_logs.find(
                {"observer_id": user['id']},
                {"_id": 0}
            ).to_list(1000)
            
            # Also count appointments marked as completed
            appointments = await db.appointments.find(
                {"observer_id": user['id'], "status": "completed"},
                {"_id": 0}
            ).to_list(1000)
            
            total_sessions = len(sessions) + len(appointments)
            
            # Sessions this month
            sessions_this_month = len([s for s in sessions if s.get('created_at', '').startswith(current_month)])
            appointments_this_month = len([a for a in appointments if a.get('scheduled_date', '').startswith(current_month)])
            monthly_sessions = sessions_this_month + appointments_this_month
            
            # Sessions this week
            sessions_this_week = len([s for s in sessions 
                if s.get('created_at', '')[:10] >= current_week_start.isoformat()])
            appointments_this_week = len([a for a in appointments 
                if a.get('scheduled_date', '')[:10] >= current_week_start.isoformat()])
            weekly_sessions = sessions_this_week + appointments_this_week
            
            # Calculate earnings
            base_earnings = monthly_sessions * RATES['observer']['per_session']
            bonus = RATES['observer']['bonus_weekly_5plus'] if weekly_sessions >= 5 else 0
            total_monthly_earnings = base_earnings + bonus
            
            # Get payment history
            payments = await db.payments.find(
                {"user_id": user['id']},
                {"_id": 0}
            ).sort("created_at", -1).limit(10).to_list(10)
            
            total_paid = sum(p.get('amount', 0) for p in payments if p.get('status') == 'paid')
            pending_amount = total_monthly_earnings - total_paid if total_monthly_earnings > total_paid else 0
            
            return {
                "role": "observer",
                "name": observer.get('name', ''),
                "rates": RATES['observer'],
                "current_month": current_month,
                "statistics": {
                    "total_sessions": total_sessions,
                    "sessions_this_month": monthly_sessions,
                    "sessions_this_week": weekly_sessions
                },
                "earnings": {
                    "base_earnings": base_earnings,
                    "weekly_bonus": bonus,
                    "total_this_month": total_monthly_earnings,
                    "total_paid": total_paid,
                    "pending_amount": pending_amount
                },
                "payment_history": payments
            }
        
        else:  # principal
            principal = await db.principals.find_one({"id": user['id']}, {"_id": 0})
            if not principal:
                raise HTTPException(status_code=404, detail="Principal not found")
            
            school = principal.get('school', '')
            
            # Get active students count
            children = await db.children.find(
                {"school": school, "status": "active"},
                {"_id": 0}
            ).to_list(1000)
            
            active_students = len(children)
            
            # Calculate earnings
            student_earnings = active_students * RATES['principal']['per_student_enrolled']
            management_fee = RATES['principal']['program_management']
            total_monthly_earnings = student_earnings + management_fee
            
            # Get payment history
            payments = await db.payments.find(
                {"user_id": user['id']},
                {"_id": 0}
            ).sort("created_at", -1).limit(10).to_list(10)
            
            total_paid = sum(p.get('amount', 0) for p in payments if p.get('status') == 'paid')
            pending_amount = total_monthly_earnings - total_paid if total_monthly_earnings > total_paid else 0
            
            return {
                "role": "principal",
                "name": principal.get('name', ''),
                "school": school,
                "rates": RATES['principal'],
                "current_month": current_month,
                "statistics": {
                    "active_students": active_students,
                    "total_students": len(children)
                },
                "earnings": {
                    "student_earnings": student_earnings,
                    "management_fee": management_fee,
                    "total_this_month": total_monthly_earnings,
                    "total_paid": total_paid,
                    "pending_amount": pending_amount
                },
                "payment_history": payments
            }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching earnings: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch earnings")

@router.get("/earnings/history")
async def get_earnings_history(token: str, months: int = 6):
    """Get detailed earnings history"""
    try:
        user = verify_token(token)
        
        # Get payment history
        payments = await db.payments.find(
            {"user_id": user['id']},
            {"_id": 0}
        ).sort("created_at", -1).limit(50).to_list(50)
        
        # Calculate monthly breakdown
        monthly_breakdown = {}
        for payment in payments:
            month = payment.get('month', payment.get('created_at', '')[:7])
            if month not in monthly_breakdown:
                monthly_breakdown[month] = {
                    "total": 0,
                    "paid": 0,
                    "pending": 0,
                    "payments": []
                }
            monthly_breakdown[month]["payments"].append(payment)
            if payment.get('status') == 'paid':
                monthly_breakdown[month]["paid"] += payment.get('amount', 0)
            else:
                monthly_breakdown[month]["pending"] += payment.get('amount', 0)
            monthly_breakdown[month]["total"] += payment.get('amount', 0)
        
        return {
            "payments": payments,
            "monthly_breakdown": monthly_breakdown,
            "total_payments": len(payments)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching earnings history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch earnings history")

# ==================== SUPPORT TICKETS ====================

TICKET_CATEGORIES = [
    {"id": "payment", "name": "Payment Issues", "icon": "💰"},
    {"id": "technical", "name": "Technical Problems", "icon": "🔧"},
    {"id": "session", "name": "Session Related", "icon": "📅"},
    {"id": "child", "name": "Child/Student Issues", "icon": "👦"},
    {"id": "account", "name": "Account Problems", "icon": "👤"},
    {"id": "other", "name": "Other", "icon": "❓"}
]

@router.get("/support/categories")
async def get_support_categories(token: str):
    """Get available support ticket categories"""
    try:
        verify_token(token)
        return {"categories": TICKET_CATEGORIES}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching categories: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch categories")

@router.post("/support/ticket")
async def create_support_ticket(
    token: str,
    category: str,
    subject: str,
    description: str,
    priority: str = "medium"
):
    """Create a new support ticket"""
    try:
        user = verify_token(token)
        
        # Get user details
        if user['role'] == 'observer':
            user_details = await db.observers.find_one({"id": user['id']}, {"_id": 0, "hashed_password": 0})
        else:
            user_details = await db.principals.find_one({"id": user['id']}, {"_id": 0, "hashed_password": 0})
        
        ticket = {
            "id": str(uuid.uuid4()),
            "ticket_number": f"TKT-{datetime.now(timezone.utc).strftime('%Y%m%d')}-{str(uuid.uuid4())[:6].upper()}",
            "user_id": user['id'],
            "user_role": user['role'],
            "user_name": user_details.get('name', '') if user_details else '',
            "user_email": user['email'],
            "category": category,
            "subject": subject,
            "description": description,
            "priority": priority,  # low, medium, high, urgent
            "status": "open",  # open, in_progress, resolved, closed
            "responses": [],
            "created_at": datetime.now(timezone.utc).isoformat(),
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.support_tickets.insert_one(ticket)
        
        return {
            "success": True,
            "ticket": {
                "id": ticket["id"],
                "ticket_number": ticket["ticket_number"],
                "status": ticket["status"]
            },
            "message": "Support ticket created successfully. Our team will respond within 24-48 hours."
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error creating ticket: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to create support ticket")

@router.get("/support/tickets")
async def get_user_tickets(token: str, status: Optional[str] = None):
    """Get all support tickets for the current user"""
    try:
        user = verify_token(token)
        
        query = {"user_id": user['id']}
        if status:
            query["status"] = status
        
        tickets = await db.support_tickets.find(
            query,
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        
        # Count by status
        all_tickets = await db.support_tickets.find(
            {"user_id": user['id']},
            {"_id": 0, "status": 1}
        ).to_list(100)
        
        status_counts = {
            "open": len([t for t in all_tickets if t.get('status') == 'open']),
            "in_progress": len([t for t in all_tickets if t.get('status') == 'in_progress']),
            "resolved": len([t for t in all_tickets if t.get('status') == 'resolved']),
            "closed": len([t for t in all_tickets if t.get('status') == 'closed'])
        }
        
        return {
            "tickets": tickets,
            "total": len(tickets),
            "status_counts": status_counts
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching tickets: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch tickets")

@router.get("/support/ticket/{ticket_id}")
async def get_ticket_details(ticket_id: str, token: str):
    """Get details of a specific ticket"""
    try:
        user = verify_token(token)
        
        ticket = await db.support_tickets.find_one(
            {"id": ticket_id, "user_id": user['id']},
            {"_id": 0}
        )
        
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        return {"ticket": ticket}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching ticket: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch ticket")

@router.post("/support/ticket/{ticket_id}/reply")
async def add_ticket_reply(
    ticket_id: str,
    token: str,
    message: str
):
    """Add a reply to an existing ticket"""
    try:
        user = verify_token(token)
        
        ticket = await db.support_tickets.find_one(
            {"id": ticket_id, "user_id": user['id']}
        )
        
        if not ticket:
            raise HTTPException(status_code=404, detail="Ticket not found")
        
        reply = {
            "id": str(uuid.uuid4()),
            "user_id": user['id'],
            "user_role": user['role'],
            "message": message,
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.support_tickets.update_one(
            {"id": ticket_id},
            {
                "$push": {"responses": reply},
                "$set": {"updated_at": datetime.now(timezone.utc).isoformat()}
            }
        )
        
        return {"success": True, "reply": reply}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error adding reply: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to add reply")
