from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import asyncio
import resend
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
from admin_routes import router as admin_router
from parent_routes import router as parent_router


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Email configuration
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

RESEND_API_KEY = os.environ.get('RESEND_API_KEY', '')
SENDER_EMAIL = os.environ.get('SENDER_EMAIL', 'onboarding@resend.dev')
ADMIN_EMAIL = os.environ.get('ADMIN_EMAIL', 'founder@sanjaya.com')

if RESEND_API_KEY and RESEND_API_KEY != 're_placeholder_get_real_key_from_resend':
    resend.api_key = RESEND_API_KEY
    logger.info("Resend email service configured")
else:
    logger.warning("Resend API key not configured - emails will be logged only")

async def send_email_async(to_email: str, subject: str, html_content: str):
    """Send email using Resend API (non-blocking)"""
    if not RESEND_API_KEY or RESEND_API_KEY == 're_placeholder_get_real_key_from_resend':
        logger.info(f"[EMAIL MOCK] To: {to_email}, Subject: {subject}")
        return {"status": "mocked", "message": "Email mocked (API key not configured)"}
    
    try:
        params = {
            "from": SENDER_EMAIL,
            "to": [to_email],
            "subject": subject,
            "html": html_content
        }
        
        email_response = await asyncio.to_thread(resend.Emails.send, params)
        logger.info(f"Email sent to {to_email}: {email_response.get('id')}")
        return {"status": "success", "email_id": email_response.get("id")}
    except Exception as e:
        logger.error(f"Failed to send email to {to_email}: {str(e)}")
        return {"status": "error", "message": str(e)}

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class ChatMessage(BaseModel):
    message: str
    session_id: str

class ChatResponse(BaseModel):
    response: str
    session_id: str

class ChatHistoryItem(BaseModel):
    role: str
    content: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class InquirySubmission(BaseModel):
    parent_name: str
    email: str
    phone: str
    child_name: str
    child_age: int
    school_name: Optional[str] = ""
    message: Optional[str] = ""

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# Public content endpoints (no auth required)
@api_router.get("/content/hero")
async def get_public_hero_content():
    content = await db.hero_content.find_one()
    if content:
        content['_id'] = str(content['_id'])
    return content or {}

@api_router.get("/content/founder")
async def get_public_founder_content():
    content = await db.founder_content.find_one()
    if content:
        content['_id'] = str(content['_id'])
    return content or {}

@api_router.get("/content/what-is-sanjaya")
async def get_public_what_is_sanjaya():
    content = await db.what_is_sanjaya.find_one()
    if content:
        content['_id'] = str(content['_id'])
    return content or {}

@api_router.get("/content/contact")
async def get_public_contact_info():
    content = await db.contact_info.find_one()
    if content:
        content['_id'] = str(content['_id'])
    return content or {}

@api_router.get("/content/about")
async def get_public_about_content():
    content = await db.about_content.find_one()
    if content:
        content['_id'] = str(content['_id'])
    return content or {}

@api_router.get("/content/faq")
async def get_public_faq_content():
    content = await db.faq_content.find_one()
    if content:
        content['_id'] = str(content['_id'])
    return content or {}

@api_router.get("/content/how-it-works-page")
async def get_public_how_it_works_page_content():
    content = await db.how_it_works_page_content.find_one()
    if content:
        content['_id'] = str(content['_id'])
    return content or {}

@api_router.get("/content/observer")
async def get_public_observer_content():
    content = await db.observer_content.find_one()
    if content:
        content['_id'] = str(content['_id'])
    return content or {}

@api_router.get("/content/principal")
async def get_public_principal_content():
    content = await db.principal_content.find_one()
    if content:
        content['_id'] = str(content['_id'])
    return content or {}

@api_router.get("/content/get-started")
async def get_public_get_started_content():
    content = await db.get_started_content.find_one()
    if content:
        content['_id'] = str(content['_id'])
    return content or {}

@api_router.post("/inquiries")
async def submit_inquiry(inquiry: InquirySubmission):
    """Public endpoint for submitting Get Started form"""
    try:
        inquiry_doc = {
            "id": str(uuid.uuid4()),
            "parent_name": inquiry.parent_name,
            "email": inquiry.email,
            "phone": inquiry.phone,
            "child_name": inquiry.child_name,
            "child_age": inquiry.child_age,
            "school_name": inquiry.school_name or "",
            "message": inquiry.message or "",
            "status": "new",
            "created_at": datetime.now(timezone.utc).isoformat(),
            "notes": ""
        }
        
        await db.inquiries.insert_one(inquiry_doc)
        
        # Send email notifications
        # 1. Admin notification
        admin_html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <h2 style="color: #f97316; border-bottom: 2px solid #f97316; padding-bottom: 10px;">
                    🎉 New Inquiry Received!
                </h2>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #4f46e5; margin-top: 0;">Parent Information</h3>
                    <p><strong>Name:</strong> {inquiry.parent_name}</p>
                    <p><strong>Email:</strong> <a href="mailto:{inquiry.email}">{inquiry.email}</a></p>
                    <p><strong>Phone:</strong> <a href="tel:{inquiry.phone}">{inquiry.phone}</a></p>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #8b5cf6; margin-top: 0;">Child Information</h3>
                    <p><strong>Name:</strong> {inquiry.child_name}</p>
                    <p><strong>Age:</strong> {inquiry.child_age} years</p>
                    <p><strong>School:</strong> {inquiry.school_name or 'Not provided'}</p>
                </div>
                
                {f'''<div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <h3 style="color: #059669; margin-top: 0;">Parent's Message</h3>
                    <p style="background: #f3f4f6; padding: 15px; border-radius: 5px; border-left: 4px solid #f97316;">
                        {inquiry.message}
                    </p>
                </div>''' if inquiry.message else ''}
                
                <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>📅 Submitted:</strong> {datetime.now(timezone.utc).strftime('%B %d, %Y at %I:%M %p UTC')}</p>
                    <p style="margin: 10px 0 0 0;"><strong>🆔 Inquiry ID:</strong> {inquiry_doc['id']}</p>
                </div>
                
                <p style="color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    Please respond to this inquiry within 24 hours for best parent experience.
                </p>
            </div>
        </body>
        </html>
        """
        
        # 2. Parent confirmation email
        parent_html = f"""
        <html>
        <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
            <div style="max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
                <h2 style="color: #f97316; border-bottom: 2px solid #f97316; padding-bottom: 10px;">
                    Thank You for Your Interest in Sanjaya!
                </h2>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p>Dear {inquiry.parent_name},</p>
                    
                    <p>Thank you for reaching out to us about <strong>{inquiry.child_name}</strong>. We're excited about the opportunity to support your child's emotional growth journey.</p>
                    
                    <p><strong>What happens next?</strong></p>
                    <ol style="color: #666;">
                        <li>Our team will review your inquiry within 24 hours</li>
                        <li>We'll contact you at <strong>{inquiry.email}</strong> or <strong>{inquiry.phone}</strong></li>
                        <li>We'll schedule a call to discuss how Sanjaya can best support {inquiry.child_name}</li>
                    </ol>
                </div>
                
                <div style="background: #dbeafe; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p style="margin: 0;"><strong>Your Inquiry Details:</strong></p>
                    <p style="margin: 10px 0 0 0;">Child: {inquiry.child_name}, Age {inquiry.child_age}</p>
                    {f"<p style='margin: 5px 0 0 0;'>School: {inquiry.school_name}</p>" if inquiry.school_name else ""}
                    <p style="margin: 5px 0 0 0;">Inquiry ID: {inquiry_doc['id']}</p>
                </div>
                
                <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>In the meantime, learn more about Sanjaya:</strong></p>
                    <ul style="color: #666;">
                        <li><a href="https://sanjaya-support.preview.emergentagent.com/about" style="color: #f97316;">Why Sanjaya Exists</a></li>
                        <li><a href="https://sanjaya-support.preview.emergentagent.com/how-it-works" style="color: #f97316;">How It Works</a></li>
                        <li><a href="https://sanjaya-support.preview.emergentagent.com/faq" style="color: #f97316;">Frequently Asked Questions</a></li>
                    </ul>
                </div>
                
                <p style="color: #666; font-size: 14px; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    If you have any immediate questions, feel free to reply to this email or call us.
                </p>
                
                <p style="color: #666; font-size: 14px;">
                    Warm regards,<br>
                    <strong>The Sanjaya Team</strong>
                </p>
            </div>
        </body>
        </html>
        """
        
        # Send emails asynchronously (non-blocking)
        asyncio.create_task(send_email_async(
            ADMIN_EMAIL,
            f"🎉 New Inquiry: {inquiry.parent_name} for {inquiry.child_name}",
            admin_html
        ))
        
        asyncio.create_task(send_email_async(
            inquiry.email,
            "Thank You for Your Interest in Sanjaya",
            parent_html
        ))
        
        logger.info(f"Inquiry submitted and emails queued for {inquiry.email}")
        
        return {
            "success": True,
            "message": "Inquiry submitted successfully",
            "inquiry_id": inquiry_doc["id"]
        }
    except Exception as e:
        logger.error(f"Error submitting inquiry: {str(e)}")
        raise HTTPException(status_code=500, detail="Error submitting inquiry")

@api_router.post("/chat", response_model=ChatResponse)
async def chat(chat_message: ChatMessage):
    try:
        # Get or create chat history for this session
        session = await db.chat_sessions.find_one({"session_id": chat_message.session_id})
        
        if not session:
            # Create new session
            session = {
                "session_id": chat_message.session_id,
                "messages": [],
                "created_at": datetime.now(timezone.utc)
            }
        
        # System message for the chatbot
        system_message = """You are a helpful AI assistant for Sanjaya - The Observer, 
        an educational platform that connects children with caring observers who listen to them daily.
        
        Key information about Sanjaya:
        - We provide a 5-minute daily listening session for children
        - Children are paired with trained observers who patiently listen
        - AI captures cues and patterns from conversations
        - Principals review performance and guide parents
        - The program helps children develop confidence and soft skills
        - We have three main roles: Parents (for their children), Observers (who listen), and Principals (who manage)
        - Everything is 100% private and secure with no recordings
        
        Answer questions about the program, explain how it works, help users understand which role 
        is right for them, and provide information about the benefits. Be warm, friendly, and helpful."""
        
        # Initialize LLM chat
        emergent_key = os.environ.get('EMERGENT_LLM_KEY')
        if not emergent_key:
            raise HTTPException(status_code=500, detail="LLM key not configured")
        
        chat_instance = LlmChat(
            api_key=emergent_key,
            session_id=chat_message.session_id,
            system_message=system_message
        )
        
        # Use GPT-4o-mini for cost-effective responses
        chat_instance.with_model("openai", "gpt-4o-mini")
        
        # Create user message
        user_msg = UserMessage(text=chat_message.message)
        
        # Get response from LLM
        response = await chat_instance.send_message(user_msg)
        
        # Save messages to database
        session["messages"].append({
            "role": "user",
            "content": chat_message.message,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        session["messages"].append({
            "role": "assistant",
            "content": response,
            "timestamp": datetime.now(timezone.utc).isoformat()
        })
        session["updated_at"] = datetime.now(timezone.utc).isoformat()
        
        # Update session in database
        await db.chat_sessions.update_one(
            {"session_id": chat_message.session_id},
            {"$set": session},
            upsert=True
        )
        
        return ChatResponse(response=response, session_id=chat_message.session_id)
        
    except Exception as e:
        logging.error(f"Error in chat endpoint: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Error processing chat: {str(e)}")

# Set database for admin routes
import admin_routes
admin_routes.set_database(db)

# Include the router in the main app
app.include_router(api_router)
app.include_router(admin_router)
app.include_router(parent_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()