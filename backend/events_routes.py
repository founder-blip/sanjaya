"""
Events Routes - Birthday & National Events Management for Observers and Principals
Allows wishing children on birthdays and important national events
"""
from fastapi import APIRouter, HTTPException
from passlib.context import CryptContext
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

# Pre-defined national events for India
NATIONAL_EVENTS = [
    {"name": "Republic Day", "date": "01-26", "type": "national", "icon": "🇮🇳", "default_wish": "Happy Republic Day! May our nation continue to grow stronger. 🇮🇳"},
    {"name": "Independence Day", "date": "08-15", "type": "national", "icon": "🇮🇳", "default_wish": "Happy Independence Day! Jai Hind! 🇮🇳"},
    {"name": "Gandhi Jayanti", "date": "10-02", "type": "national", "icon": "🕊️", "default_wish": "Remembering the Father of our Nation. Happy Gandhi Jayanti! 🕊️"},
    {"name": "Children's Day", "date": "11-14", "type": "national", "icon": "👧", "default_wish": "Happy Children's Day! You are special and loved! 🎉"},
    {"name": "Teacher's Day", "date": "09-05", "type": "national", "icon": "📚", "default_wish": "Happy Teacher's Day! Thank you for all that you teach us! 📚"},
    {"name": "Holi", "date": "03-25", "type": "festival", "icon": "🎨", "default_wish": "Happy Holi! May your life be filled with colors of joy! 🎨"},
    {"name": "Diwali", "date": "11-01", "type": "festival", "icon": "🪔", "default_wish": "Happy Diwali! May the festival of lights brighten your life! 🪔"},
    {"name": "Eid", "date": "04-10", "type": "festival", "icon": "🌙", "default_wish": "Eid Mubarak! May this day bring peace and happiness! 🌙"},
    {"name": "Christmas", "date": "12-25", "type": "festival", "icon": "🎄", "default_wish": "Merry Christmas! May joy and happiness be with you! 🎄"},
    {"name": "New Year", "date": "01-01", "type": "festival", "icon": "🎉", "default_wish": "Happy New Year! Wishing you a wonderful year ahead! 🎉"},
    {"name": "Raksha Bandhan", "date": "08-19", "type": "festival", "icon": "🎀", "default_wish": "Happy Raksha Bandhan! Celebrating the beautiful bond of siblings! 🎀"},
]

# ==================== EVENT MANAGEMENT ====================

@router.get("/events/national")
async def get_national_events(token: str):
    """Get list of all national events"""
    try:
        verify_token(token)
        return {"events": NATIONAL_EVENTS}
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching national events: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch events")

@router.get("/events/upcoming")
async def get_upcoming_events(token: str, days: int = 30):
    """Get upcoming events (birthdays + national events) within specified days"""
    try:
        user = verify_token(token)
        today = datetime.now(timezone.utc).date()
        end_date = today + timedelta(days=days)
        
        upcoming = []
        
        # Get children based on role
        if user['role'] == 'observer':
            children = await db.children.find(
                {"observer_id": user['id']},
                {"_id": 0}
            ).to_list(100)
        else:  # principal
            principal = await db.principals.find_one({"id": user['id']}, {"_id": 0})
            if principal:
                children = await db.children.find(
                    {"school": principal.get('school', '')},
                    {"_id": 0}
                ).to_list(1000)
            else:
                children = []
        
        # Check for birthdays
        for child in children:
            dob = child.get('date_of_birth', '')
            if dob:
                try:
                    # Parse date of birth (expecting YYYY-MM-DD format)
                    dob_date = datetime.strptime(dob, "%Y-%m-%d").date()
                    # Get birthday this year
                    birthday_this_year = dob_date.replace(year=today.year)
                    # If birthday already passed this year, check next year
                    if birthday_this_year < today:
                        birthday_this_year = dob_date.replace(year=today.year + 1)
                    
                    if today <= birthday_this_year <= end_date:
                        days_until = (birthday_this_year - today).days
                        upcoming.append({
                            "id": f"bday_{child['id']}",
                            "type": "birthday",
                            "name": f"{child['name']}'s Birthday",
                            "child_id": child['id'],
                            "child_name": child['name'],
                            "date": birthday_this_year.isoformat(),
                            "days_until": days_until,
                            "icon": "🎂",
                            "age_turning": today.year - dob_date.year if birthday_this_year.year == today.year else today.year - dob_date.year + 1,
                            "default_wish": f"Happy Birthday {child['name']}! 🎂🎉 Wishing you a wonderful year ahead filled with joy and happiness!"
                        })
                except ValueError:
                    pass  # Skip invalid dates
        
        # Check for national events
        current_year = today.year
        for event in NATIONAL_EVENTS:
            try:
                event_date_str = f"{current_year}-{event['date']}"
                event_date = datetime.strptime(event_date_str, "%Y-%m-%d").date()
                
                # If event already passed this year, check next year
                if event_date < today:
                    event_date = event_date.replace(year=current_year + 1)
                
                if today <= event_date <= end_date:
                    days_until = (event_date - today).days
                    upcoming.append({
                        "id": f"event_{event['name'].lower().replace(' ', '_')}_{event_date.year}",
                        "type": "national",
                        "event_type": event['type'],
                        "name": event['name'],
                        "date": event_date.isoformat(),
                        "days_until": days_until,
                        "icon": event['icon'],
                        "default_wish": event['default_wish'],
                        "children_count": len(children)
                    })
            except ValueError:
                pass
        
        # Sort by days until
        upcoming.sort(key=lambda x: x['days_until'])
        
        return {
            "upcoming_events": upcoming,
            "total_children": len(children),
            "period_days": days
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching upcoming events: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch upcoming events")

@router.get("/events/today")
async def get_todays_events(token: str):
    """Get events happening today"""
    try:
        user = verify_token(token)
        today = datetime.now(timezone.utc).date()
        today_str = today.strftime("%m-%d")
        
        todays_events = []
        
        # Get children based on role
        if user['role'] == 'observer':
            children = await db.children.find(
                {"observer_id": user['id']},
                {"_id": 0}
            ).to_list(100)
        else:  # principal
            principal = await db.principals.find_one({"id": user['id']}, {"_id": 0})
            if principal:
                children = await db.children.find(
                    {"school": principal.get('school', '')},
                    {"_id": 0}
                ).to_list(1000)
            else:
                children = []
        
        # Check for birthdays today
        for child in children:
            dob = child.get('date_of_birth', '')
            if dob:
                try:
                    dob_date = datetime.strptime(dob, "%Y-%m-%d").date()
                    if dob_date.strftime("%m-%d") == today_str:
                        age = today.year - dob_date.year
                        todays_events.append({
                            "id": f"bday_{child['id']}",
                            "type": "birthday",
                            "name": f"{child['name']}'s Birthday",
                            "child_id": child['id'],
                            "child_name": child['name'],
                            "icon": "🎂",
                            "age_turning": age,
                            "default_wish": f"Happy {age}th Birthday {child['name']}! 🎂🎉 Wishing you a year filled with joy, laughter, and wonderful moments!"
                        })
                except ValueError:
                    pass
        
        # Check for national events today
        for event in NATIONAL_EVENTS:
            if event['date'] == today_str:
                todays_events.append({
                    "id": f"event_{event['name'].lower().replace(' ', '_')}",
                    "type": "national",
                    "event_type": event['type'],
                    "name": event['name'],
                    "icon": event['icon'],
                    "default_wish": event['default_wish'],
                    "children_count": len(children)
                })
        
        return {
            "todays_events": todays_events,
            "date": today.isoformat()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching today's events: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch today's events")

# ==================== WISH MANAGEMENT ====================

@router.post("/events/wish")
async def send_wish(
    token: str,
    event_type: str,  # "birthday" or "national"
    child_ids: List[str],  # List of children to wish
    message: str,
    event_name: str,
    event_date: Optional[str] = None
):
    """Send wishes to children for an event"""
    try:
        user = verify_token(token)
        
        wishes_sent = []
        
        for child_id in child_ids:
            # Verify access to child
            if user['role'] == 'observer':
                child = await db.children.find_one(
                    {"id": child_id, "observer_id": user['id']},
                    {"_id": 0}
                )
            else:  # principal
                principal = await db.principals.find_one({"id": user['id']}, {"_id": 0})
                if principal:
                    child = await db.children.find_one(
                        {"id": child_id, "school": principal.get('school', '')},
                        {"_id": 0}
                    )
                else:
                    child = None
            
            if child:
                wish = {
                    "id": str(uuid.uuid4()),
                    "sender_id": user['id'],
                    "sender_role": user['role'],
                    "child_id": child_id,
                    "child_name": child['name'],
                    "event_type": event_type,
                    "event_name": event_name,
                    "event_date": event_date or datetime.now(timezone.utc).date().isoformat(),
                    "message": message,
                    "created_at": datetime.now(timezone.utc).isoformat()
                }
                
                await db.event_wishes.insert_one(wish)
                wishes_sent.append({
                    "child_id": child_id,
                    "child_name": child['name'],
                    "wish_id": wish['id']
                })
        
        return {
            "success": True,
            "wishes_sent": len(wishes_sent),
            "details": wishes_sent
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending wishes: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send wishes")

@router.post("/events/wish-all")
async def send_wish_to_all(
    token: str,
    event_type: str,
    message: str,
    event_name: str,
    event_date: Optional[str] = None
):
    """Send wishes to all children for a national event"""
    try:
        user = verify_token(token)
        
        # Get all children based on role
        if user['role'] == 'observer':
            children = await db.children.find(
                {"observer_id": user['id']},
                {"_id": 0}
            ).to_list(100)
        else:  # principal
            principal = await db.principals.find_one({"id": user['id']}, {"_id": 0})
            if principal:
                children = await db.children.find(
                    {"school": principal.get('school', '')},
                    {"_id": 0}
                ).to_list(1000)
            else:
                children = []
        
        child_ids = [c['id'] for c in children]
        
        # Create batch wish record
        batch_wish = {
            "id": str(uuid.uuid4()),
            "sender_id": user['id'],
            "sender_role": user['role'],
            "event_type": event_type,
            "event_name": event_name,
            "event_date": event_date or datetime.now(timezone.utc).date().isoformat(),
            "message": message,
            "child_ids": child_ids,
            "children_count": len(children),
            "created_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.event_batch_wishes.insert_one(batch_wish)
        
        return {
            "success": True,
            "batch_id": batch_wish['id'],
            "children_wished": len(children)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error sending batch wishes: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to send wishes")

@router.get("/events/wish-history")
async def get_wish_history(token: str, limit: int = 50):
    """Get history of wishes sent"""
    try:
        user = verify_token(token)
        
        # Get individual wishes
        wishes = await db.event_wishes.find(
            {"sender_id": user['id']},
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        
        # Get batch wishes
        batch_wishes = await db.event_batch_wishes.find(
            {"sender_id": user['id']},
            {"_id": 0}
        ).sort("created_at", -1).limit(limit).to_list(limit)
        
        return {
            "individual_wishes": wishes,
            "batch_wishes": batch_wishes,
            "total_individual": len(wishes),
            "total_batch": len(batch_wishes)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching wish history: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch wish history")

@router.get("/events/child/{child_id}/wishes")
async def get_child_wishes(child_id: str, token: str):
    """Get all wishes received by a specific child"""
    try:
        user = verify_token(token)
        
        # Verify access
        if user['role'] == 'observer':
            child = await db.children.find_one(
                {"id": child_id, "observer_id": user['id']},
                {"_id": 0}
            )
        else:
            principal = await db.principals.find_one({"id": user['id']}, {"_id": 0})
            if principal:
                child = await db.children.find_one(
                    {"id": child_id, "school": principal.get('school', '')},
                    {"_id": 0}
                )
            else:
                child = None
        
        if not child:
            raise HTTPException(status_code=404, detail="Child not found or access denied")
        
        wishes = await db.event_wishes.find(
            {"child_id": child_id},
            {"_id": 0}
        ).sort("created_at", -1).to_list(100)
        
        return {
            "child": child,
            "wishes": wishes,
            "total_wishes": len(wishes)
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error fetching child wishes: {str(e)}")
        raise HTTPException(status_code=500, detail="Failed to fetch child wishes")
