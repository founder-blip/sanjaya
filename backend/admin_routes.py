from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
import os
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from models import (
    AdminLogin, HeroContent, FounderContent, WhatIsSanjaya,
    WhatWeOffer, HowItWorks, TrustSafety, ContactInfo,
    AboutContent, FAQContent, HowItWorksPageContent,
    ObserverContent, PrincipalContent, GetStartedContent, Inquiry
)

router = APIRouter(prefix="/api/admin", tags=["admin"])

# Database will be injected from server.py
db = None

def set_database(database):
    global db
    db = database

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# JWT settings
SECRET_KEY = os.environ.get('JWT_SECRET_KEY', 'your-secret-key-change-in-production')
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 1440  # 24 hours

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def verify_token(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith('Bearer '):
        raise HTTPException(status_code=401, detail="Missing or invalid authorization header")
    
    token = authorization.replace('Bearer ', '')
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except jwt.JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

# Auth endpoints
@router.post("/login")
async def admin_login(credentials: AdminLogin):
    # Check if admin user exists
    admin = await db.admin_users.find_one({"username": credentials.username})
    
    if not admin:
        # Create default admin if none exists (only for first time)
        admin_count = await db.admin_users.count_documents({})
        if admin_count == 0 and credentials.username == "admin" and credentials.password == "admin123":
            hashed_password = pwd_context.hash(credentials.password)
            new_admin = {
                "username": credentials.username,
                "email": "admin@sanjaya.com",
                "password_hash": hashed_password,
                "created_at": datetime.utcnow()
            }
            await db.admin_users.insert_one(new_admin)
            admin = new_admin
        else:
            raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Verify password
    if not pwd_context.verify(credentials.password, admin["password_hash"]):
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    # Create access token
    access_token = create_access_token(data={"sub": admin["username"]})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "username": admin["username"]
    }

# Hero Content
@router.get("/content/hero")
async def get_hero_content(payload: dict = Depends(verify_token)):
    content = await db.hero_content.find_one()
    if content:
        content['_id'] = str(content['_id'])
    return content

@router.put("/content/hero")
async def update_hero_content(content: HeroContent, payload: dict = Depends(verify_token)):
    content_dict = content.dict()
    content_dict['updated_at'] = datetime.utcnow()
    
    await db.hero_content.delete_many({})
    await db.hero_content.insert_one(content_dict)
    
    return {"message": "Hero content updated successfully"}

# Founder Content
@router.get("/content/founder")
async def get_founder_content(payload: dict = Depends(verify_token)):
    content = await db.founder_content.find_one()
    if content:
        content['_id'] = str(content['_id'])
    return content

@router.put("/content/founder")
async def update_founder_content(content: FounderContent, payload: dict = Depends(verify_token)):
    content_dict = content.dict()
    content_dict['updated_at'] = datetime.utcnow()
    
    await db.founder_content.delete_many({})
    await db.founder_content.insert_one(content_dict)
    
    return {"message": "Founder content updated successfully"}

# What is Sanjaya
@router.get("/content/what-is-sanjaya")
async def get_what_is_sanjaya(payload: dict = Depends(verify_token)):
    content = await db.what_is_sanjaya.find_one()
    if content:
        content['_id'] = str(content['_id'])
    return content

@router.put("/content/what-is-sanjaya")
async def update_what_is_sanjaya(content: WhatIsSanjaya, payload: dict = Depends(verify_token)):
    content_dict = content.dict()
    content_dict['updated_at'] = datetime.utcnow()
    
    await db.what_is_sanjaya.delete_many({})
    await db.what_is_sanjaya.insert_one(content_dict)
    
    return {"message": "What is Sanjaya content updated successfully"}

# What We Offer
@router.get("/content/what-we-offer")
async def get_what_we_offer(payload: dict = Depends(verify_token)):
    content = await db.what_we_offer.find_one()
    if content:
        content['_id'] = str(content['_id'])
    return content

@router.put("/content/what-we-offer")
async def update_what_we_offer(content: WhatWeOffer, payload: dict = Depends(verify_token)):
    content_dict = content.dict()
    content_dict['updated_at'] = datetime.utcnow()
    
    await db.what_we_offer.delete_many({})
    await db.what_we_offer.insert_one(content_dict)
    
    return {"message": "What We Offer content updated successfully"}

# How It Works
@router.get("/content/how-it-works")
async def get_how_it_works(payload: dict = Depends(verify_token)):
    content = await db.how_it_works.find_one()
    if content:
        content['_id'] = str(content['_id'])
    return content

@router.put("/content/how-it-works")
async def update_how_it_works(content: HowItWorks, payload: dict = Depends(verify_token)):
    content_dict = content.dict()
    content_dict['updated_at'] = datetime.utcnow()
    
    await db.how_it_works.delete_many({})
    await db.how_it_works.insert_one(content_dict)
    
    return {"message": "How It Works content updated successfully"}

# Trust & Safety
@router.get("/content/trust-safety")
async def get_trust_safety(payload: dict = Depends(verify_token)):
    content = await db.trust_safety.find_one()
    if content:
        content['_id'] = str(content['_id'])
    return content

@router.put("/content/trust-safety")
async def update_trust_safety(content: TrustSafety, payload: dict = Depends(verify_token)):
    content_dict = content.dict()
    content_dict['updated_at'] = datetime.utcnow()
    
    await db.trust_safety.delete_many({})
    await db.trust_safety.insert_one(content_dict)
    
    return {"message": "Trust & Safety content updated successfully"}

# Contact Info
@router.get("/content/contact")
async def get_contact_info(payload: dict = Depends(verify_token)):
    content = await db.contact_info.find_one()
    if content:
        content['_id'] = str(content['_id'])
    return content

@router.put("/content/contact")
async def update_contact_info(content: ContactInfo, payload: dict = Depends(verify_token)):
    content_dict = content.dict()
    content_dict['updated_at'] = datetime.utcnow()
    
    await db.contact_info.delete_many({})
    await db.contact_info.insert_one(content_dict)
    
    return {"message": "Contact info updated successfully"}

# About Page
@router.get("/content/about")
async def get_about_content(payload: dict = Depends(verify_token)):
    content = await db.about_content.find_one()
    if content:
        content['_id'] = str(content['_id'])
    return content

@router.put("/content/about")
async def update_about_content(content: AboutContent, payload: dict = Depends(verify_token)):
    content_dict = content.dict()
    content_dict['updated_at'] = datetime.utcnow()
    
    await db.about_content.delete_many({})
    await db.about_content.insert_one(content_dict)
    
    return {"message": "About content updated successfully"}

# FAQ Page
@router.get("/content/faq")
async def get_faq_content(payload: dict = Depends(verify_token)):
    content = await db.faq_content.find_one()
    if content:
        content['_id'] = str(content['_id'])
    return content

@router.put("/content/faq")
async def update_faq_content(content: FAQContent, payload: dict = Depends(verify_token)):
    content_dict = content.dict()
    content_dict['updated_at'] = datetime.utcnow()
    
    await db.faq_content.delete_many({})
    await db.faq_content.insert_one(content_dict)
    
    return {"message": "FAQ content updated successfully"}

# How It Works Page
@router.get("/content/how-it-works-page")
async def get_how_it_works_page_content(payload: dict = Depends(verify_token)):
    content = await db.how_it_works_page_content.find_one()
    if content:
        content['_id'] = str(content['_id'])
    return content

@router.put("/content/how-it-works-page")
async def update_how_it_works_page_content(content: HowItWorksPageContent, payload: dict = Depends(verify_token)):
    content_dict = content.dict()
    content_dict['updated_at'] = datetime.utcnow()
    
    await db.how_it_works_page_content.delete_many({})
    await db.how_it_works_page_content.insert_one(content_dict)
    
    return {"message": "How It Works page content updated successfully"}

# Observer Landing Page
@router.get("/content/observer")
async def get_observer_content(payload: dict = Depends(verify_token)):
    content = await db.observer_content.find_one()
    if content:
        content['_id'] = str(content['_id'])
    return content

@router.put("/content/observer")
async def update_observer_content(content: ObserverContent, payload: dict = Depends(verify_token)):
    content_dict = content.dict()
    content_dict['updated_at'] = datetime.utcnow()
    
    await db.observer_content.delete_many({})
    await db.observer_content.insert_one(content_dict)
    
    return {"message": "Observer content updated successfully"}

# Principal Landing Page
@router.get("/content/principal")
async def get_principal_content(payload: dict = Depends(verify_token)):
    content = await db.principal_content.find_one()
    if content:
        content['_id'] = str(content['_id'])
    return content

@router.put("/content/principal")
async def update_principal_content(content: PrincipalContent, payload: dict = Depends(verify_token)):
    content_dict = content.dict()
    content_dict['updated_at'] = datetime.utcnow()
    
    await db.principal_content.delete_many({})
    await db.principal_content.insert_one(content_dict)
    
    return {"message": "Principal content updated successfully"}

# Get Started Page
@router.get("/content/get-started")
async def get_get_started_content(payload: dict = Depends(verify_token)):
    content = await db.get_started_content.find_one()
    if content:
        content['_id'] = str(content['_id'])
    return content

@router.put("/content/get-started")
async def update_get_started_content(content: GetStartedContent, payload: dict = Depends(verify_token)):
    content_dict = content.dict()
    content_dict['updated_at'] = datetime.utcnow()
    
    await db.get_started_content.delete_many({})
    await db.get_started_content.insert_one(content_dict)
    
    return {"message": "Get Started content updated successfully"}

# Inquiries Management
@router.get("/inquiries")
async def get_all_inquiries(payload: dict = Depends(verify_token)):
    """Get all form inquiries for admin view"""
    inquiries = await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(1000)
    return {"inquiries": inquiries, "total": len(inquiries)}

@router.put("/inquiries/{inquiry_id}")
async def update_inquiry_status(inquiry_id: str, status: str, notes: str = "", payload: dict = Depends(verify_token)):
    """Update inquiry status and add notes"""
    result = await db.inquiries.update_one(
        {"id": inquiry_id},
        {"$set": {"status": status, "notes": notes}}
    )
    
    if result.modified_count > 0:
        return {"message": "Inquiry updated successfully"}
    else:
        raise HTTPException(status_code=404, detail="Inquiry not found")


# ==================== GUARDIAN MANAGEMENT ====================

@router.get("/children")
async def get_all_children(current_user: dict = Depends(verify_token)):
    """Get all children with their guardians"""
    try:
        children = await db.children.find({}, {"_id": 0}).to_list(1000)
        
        # For each child, get guardian details
        for child in children:
            guardians = []
            for parent_id in child.get('parent_ids', []):
                parent = await db.parents.find_one({"id": parent_id}, {"_id": 0, "hashed_password": 0})
                if parent:
                    guardians.append(parent)
            child['guardians'] = guardians
        
        return {"children": children}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load children: {str(e)}")

@router.get("/child/{child_id}/guardians")
async def get_child_guardians(child_id: str, current_user: dict = Depends(verify_token)):
    """Get all guardians for a specific child"""
    try:
        child = await db.children.find_one({"id": child_id}, {"_id": 0})
        if not child:
            raise HTTPException(status_code=404, detail="Child not found")
        
        guardians = []
        for parent_id in child.get('parent_ids', []):
            parent = await db.parents.find_one({"id": parent_id}, {"_id": 0, "hashed_password": 0})
            if parent:
                guardians.append(parent)
        
        return {"child": child, "guardians": guardians}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load guardians: {str(e)}")

@router.post("/guardian")
async def create_guardian(
    name: str,
    email: str,
    phone: str,
    password: str,
    current_user: dict = Depends(verify_token)
):
    """Create a new guardian (parent) account"""
    try:
        # Check if email already exists
        existing = await db.parents.find_one({"email": email})
        if existing:
            raise HTTPException(status_code=400, detail="Email already registered")
        
        import uuid
        guardian = {
            "id": str(uuid.uuid4()),
            "email": email,
            "name": name,
            "phone": phone,
            "hashed_password": pwd_context.hash(password),
            "role": "parent",
            "is_active": True,
            "created_at": datetime.utcnow().isoformat(),
            "last_login": None
        }
        
        await db.parents.insert_one(guardian)
        
        return {
            "success": True,
            "guardian": {
                "id": guardian["id"],
                "name": name,
                "email": email,
                "phone": phone
            }
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to create guardian: {str(e)}")

@router.post("/child/{child_id}/guardian")
async def add_guardian_to_child(
    child_id: str,
    guardian_id: str,
    current_user: dict = Depends(verify_token)
):
    """Add an existing guardian to a child"""
    try:
        # Verify child exists
        child = await db.children.find_one({"id": child_id}, {"_id": 0})
        if not child:
            raise HTTPException(status_code=404, detail="Child not found")
        
        # Verify guardian exists
        guardian = await db.parents.find_one({"id": guardian_id}, {"_id": 0})
        if not guardian:
            raise HTTPException(status_code=404, detail="Guardian not found")
        
        # Check if already added
        if guardian_id in child.get('parent_ids', []):
            raise HTTPException(status_code=400, detail="Guardian already has access to this child")
        
        # Add guardian to child's parent_ids
        await db.children.update_one(
            {"id": child_id},
            {"$push": {"parent_ids": guardian_id}}
        )
        
        return {"success": True, "message": "Guardian added successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to add guardian: {str(e)}")

@router.delete("/child/{child_id}/guardian/{guardian_id}")
async def remove_guardian_from_child(
    child_id: str,
    guardian_id: str,
    current_user: dict = Depends(verify_token)
):
    """Remove a guardian from a child"""
    try:
        # Verify child exists
        child = await db.children.find_one({"id": child_id}, {"_id": 0})
        if not child:
            raise HTTPException(status_code=404, detail="Child not found")
        
        # Check if this is the last guardian
        if len(child.get('parent_ids', [])) <= 1:
            raise HTTPException(status_code=400, detail="Cannot remove the last guardian. Child must have at least one guardian.")
        
        # Remove guardian from child's parent_ids
        result = await db.children.update_one(
            {"id": child_id},
            {"$pull": {"parent_ids": guardian_id}}
        )
        
        if result.modified_count == 0:
            raise HTTPException(status_code=404, detail="Guardian not found for this child")
        
        return {"success": True, "message": "Guardian removed successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to remove guardian: {str(e)}")

@router.get("/guardians")
async def get_all_guardians(current_user: dict = Depends(verify_token)):
    """Get all guardian (parent) accounts"""
    try:
        guardians = await db.parents.find({}, {"_id": 0, "hashed_password": 0}).to_list(1000)
        return {"guardians": guardians}
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load guardians: {str(e)}")

