from fastapi import APIRouter, HTTPException, Depends, Header
from typing import Optional
import os
import jwt
from datetime import datetime, timedelta
from passlib.context import CryptContext
from models import (
    AdminLogin, HeroContent, FounderContent, WhatIsSanjaya,
    WhatWeOffer, HowItWorks, TrustSafety, ContactInfo
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
