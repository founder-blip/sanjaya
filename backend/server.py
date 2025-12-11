from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List
import uuid
from datetime import datetime, timezone
from emergentintegrations.llm.chat import LlmChat, UserMessage
from admin_routes import router as admin_router


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

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