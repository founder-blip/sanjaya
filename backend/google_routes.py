"""
Google Integration Routes - Gmail and Google Drive for Admin Panel
Allows admin to connect Gmail and Google Drive for communications management
"""
from fastapi import APIRouter, HTTPException, Query, UploadFile, File
from fastapi.responses import RedirectResponse, StreamingResponse
from googleapiclient.discovery import build
from googleapiclient.http import MediaFileUpload, MediaIoBaseDownload
from google_auth_oauthlib.flow import Flow
from google.oauth2.credentials import Credentials
from google.auth.transport.requests import Request as GoogleRequest
from datetime import datetime, timezone
from typing import List, Optional
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import base64
import os
import io
import logging
import tempfile

router = APIRouter()
db = None
logger = logging.getLogger(__name__)

# OAuth Configuration
GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID", "")
GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET", "")
FRONTEND_URL = os.getenv("REACT_APP_BACKEND_URL", "").replace("/api", "")

# Scopes for Gmail and Drive
GMAIL_SCOPES = [
    'https://www.googleapis.com/auth/gmail.send',
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    'openid',
    'email',
    'profile'
]

DRIVE_SCOPES = [
    'https://www.googleapis.com/auth/drive',
    'openid',
    'email',
    'profile'
]

def set_database(database):
    """Set the database instance from main server"""
    global db
    db = database

def get_redirect_uri(service_type: str) -> str:
    """Get redirect URI for OAuth callback"""
    backend_url = os.getenv("REACT_APP_BACKEND_URL", "http://localhost:8001/api")
    return f"{backend_url}/google/{service_type}/callback"

# ==================== GMAIL INTEGRATION ====================

@router.get("/google/gmail/connect")
async def connect_gmail(admin_token: str):
    """Initiate Gmail OAuth flow for admin"""
    try:
        # Verify admin token (simple check for now)
        if not admin_token:
            raise HTTPException(status_code=401, detail="Admin authentication required")
        
        redirect_uri = get_redirect_uri("gmail")
        
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [redirect_uri]
                }
            },
            scopes=GMAIL_SCOPES,
            redirect_uri=redirect_uri
        )
        
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
        
        # Store state for verification
        await db.oauth_states.insert_one({
            "state": state,
            "service": "gmail",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {"authorization_url": authorization_url, "state": state}
    
    except Exception as e:
        logger.error(f"Failed to initiate Gmail OAuth: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OAuth initiation failed: {str(e)}")

@router.get("/google/gmail/callback")
async def gmail_callback(code: str = Query(...), state: str = Query(...)):
    """Handle Gmail OAuth callback"""
    try:
        redirect_uri = get_redirect_uri("gmail")
        
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [redirect_uri]
                }
            },
            scopes=None,
            redirect_uri=redirect_uri
        )
        
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        # Get user email from Gmail
        gmail_service = build('gmail', 'v1', credentials=credentials)
        profile = gmail_service.users().getProfile(userId='me').execute()
        user_email = profile.get('emailAddress', '')
        
        # Store credentials
        await db.google_credentials.update_one(
            {"service": "gmail"},
            {"$set": {
                "service": "gmail",
                "email": user_email,
                "access_token": credentials.token,
                "refresh_token": credentials.refresh_token,
                "token_uri": credentials.token_uri,
                "client_id": credentials.client_id,
                "client_secret": credentials.client_secret,
                "scopes": list(credentials.scopes) if credentials.scopes else [],
                "expiry": credentials.expiry.isoformat() if credentials.expiry else None,
                "connected_at": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )
        
        logger.info(f"Gmail connected successfully: {user_email}")
        
        # Redirect to admin dashboard
        return RedirectResponse(url=f"{FRONTEND_URL}/admin/dashboard?gmail_connected=true")
    
    except Exception as e:
        logger.error(f"Gmail OAuth callback failed: {str(e)}")
        return RedirectResponse(url=f"{FRONTEND_URL}/admin/dashboard?gmail_error={str(e)}")

@router.get("/google/gmail/status")
async def get_gmail_status():
    """Check if Gmail is connected"""
    try:
        creds = await db.google_credentials.find_one({"service": "gmail"}, {"_id": 0})
        if creds:
            return {
                "connected": True,
                "email": creds.get("email", ""),
                "connected_at": creds.get("connected_at", "")
            }
        return {"connected": False}
    except Exception as e:
        logger.error(f"Error checking Gmail status: {str(e)}")
        return {"connected": False, "error": str(e)}

async def get_gmail_service():
    """Get authenticated Gmail service"""
    creds_doc = await db.google_credentials.find_one({"service": "gmail"})
    if not creds_doc:
        raise HTTPException(status_code=400, detail="Gmail not connected")
    
    creds = Credentials(
        token=creds_doc["access_token"],
        refresh_token=creds_doc.get("refresh_token"),
        token_uri=creds_doc["token_uri"],
        client_id=creds_doc["client_id"],
        client_secret=creds_doc["client_secret"],
        scopes=creds_doc.get("scopes", [])
    )
    
    # Auto-refresh if expired
    if creds.expired and creds.refresh_token:
        creds.refresh(GoogleRequest())
        await db.google_credentials.update_one(
            {"service": "gmail"},
            {"$set": {
                "access_token": creds.token,
                "expiry": creds.expiry.isoformat() if creds.expiry else None
            }}
        )
    
    return build('gmail', 'v1', credentials=creds)

@router.post("/google/gmail/send")
async def send_gmail(
    to: str,
    subject: str,
    body_html: str,
    body_text: Optional[str] = None
):
    """Send email via Gmail"""
    try:
        service = await get_gmail_service()
        
        message = MIMEMultipart('alternative')
        message['to'] = to
        message['subject'] = subject
        
        if body_text:
            message.attach(MIMEText(body_text, 'plain'))
        message.attach(MIMEText(body_html, 'html'))
        
        raw = base64.urlsafe_b64encode(message.as_bytes()).decode()
        
        result = service.users().messages().send(
            userId='me',
            body={'raw': raw}
        ).execute()
        
        # Log the email
        await db.email_logs.insert_one({
            "gmail_id": result['id'],
            "to": to,
            "subject": subject,
            "direction": "sent",
            "sent_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {"success": True, "message_id": result['id']}
    
    except Exception as e:
        logger.error(f"Failed to send email: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to send email: {str(e)}")

@router.get("/google/gmail/inbox")
async def get_gmail_inbox(max_results: int = 20, query: str = ""):
    """Get emails from Gmail inbox"""
    try:
        service = await get_gmail_service()
        
        results = service.users().messages().list(
            userId='me',
            maxResults=max_results,
            q=query if query else "in:inbox"
        ).execute()
        
        messages = results.get('messages', [])
        email_list = []
        
        for msg in messages[:max_results]:
            msg_data = service.users().messages().get(
                userId='me',
                id=msg['id'],
                format='metadata',
                metadataHeaders=['From', 'Subject', 'Date']
            ).execute()
            
            headers = {h['name']: h['value'] for h in msg_data.get('payload', {}).get('headers', [])}
            
            email_list.append({
                "id": msg['id'],
                "from": headers.get('From', 'Unknown'),
                "subject": headers.get('Subject', 'No Subject'),
                "date": headers.get('Date', ''),
                "snippet": msg_data.get('snippet', ''),
                "labels": msg_data.get('labelIds', [])
            })
        
        return {"emails": email_list, "total": len(email_list)}
    
    except Exception as e:
        logger.error(f"Failed to fetch inbox: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to fetch inbox: {str(e)}")

@router.get("/google/gmail/message/{message_id}")
async def get_gmail_message(message_id: str):
    """Get full email message"""
    try:
        service = await get_gmail_service()
        
        message = service.users().messages().get(
            userId='me',
            id=message_id,
            format='full'
        ).execute()
        
        headers = {h['name']: h['value'] for h in message.get('payload', {}).get('headers', [])}
        
        # Extract body
        body = ""
        payload = message.get('payload', {})
        
        if 'body' in payload and payload['body'].get('data'):
            body = base64.urlsafe_b64decode(payload['body']['data']).decode('utf-8')
        elif 'parts' in payload:
            for part in payload['parts']:
                if part.get('mimeType') == 'text/html' and part.get('body', {}).get('data'):
                    body = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')
                    break
                elif part.get('mimeType') == 'text/plain' and part.get('body', {}).get('data'):
                    body = base64.urlsafe_b64decode(part['body']['data']).decode('utf-8')
        
        return {
            "id": message_id,
            "from": headers.get('From', ''),
            "to": headers.get('To', ''),
            "subject": headers.get('Subject', ''),
            "date": headers.get('Date', ''),
            "body": body,
            "labels": message.get('labelIds', [])
        }
    
    except Exception as e:
        logger.error(f"Failed to get message: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get message: {str(e)}")

# ==================== GOOGLE DRIVE INTEGRATION ====================

@router.get("/google/drive/connect")
async def connect_drive(admin_token: str):
    """Initiate Google Drive OAuth flow"""
    try:
        if not admin_token:
            raise HTTPException(status_code=401, detail="Admin authentication required")
        
        redirect_uri = get_redirect_uri("drive")
        
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [redirect_uri]
                }
            },
            scopes=DRIVE_SCOPES,
            redirect_uri=redirect_uri
        )
        
        authorization_url, state = flow.authorization_url(
            access_type='offline',
            include_granted_scopes='true',
            prompt='consent'
        )
        
        await db.oauth_states.insert_one({
            "state": state,
            "service": "drive",
            "created_at": datetime.now(timezone.utc).isoformat()
        })
        
        return {"authorization_url": authorization_url, "state": state}
    
    except Exception as e:
        logger.error(f"Failed to initiate Drive OAuth: {str(e)}")
        raise HTTPException(status_code=500, detail=f"OAuth initiation failed: {str(e)}")

@router.get("/google/drive/callback")
async def drive_callback(code: str = Query(...), state: str = Query(...)):
    """Handle Google Drive OAuth callback"""
    try:
        redirect_uri = get_redirect_uri("drive")
        
        flow = Flow.from_client_config(
            {
                "web": {
                    "client_id": GOOGLE_CLIENT_ID,
                    "client_secret": GOOGLE_CLIENT_SECRET,
                    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
                    "token_uri": "https://oauth2.googleapis.com/token",
                    "redirect_uris": [redirect_uri]
                }
            },
            scopes=None,
            redirect_uri=redirect_uri
        )
        
        flow.fetch_token(code=code)
        credentials = flow.credentials
        
        # Get user info
        from google.oauth2 import id_token
        from google.auth.transport import requests
        
        # Store credentials
        await db.google_credentials.update_one(
            {"service": "drive"},
            {"$set": {
                "service": "drive",
                "access_token": credentials.token,
                "refresh_token": credentials.refresh_token,
                "token_uri": credentials.token_uri,
                "client_id": credentials.client_id,
                "client_secret": credentials.client_secret,
                "scopes": list(credentials.scopes) if credentials.scopes else [],
                "expiry": credentials.expiry.isoformat() if credentials.expiry else None,
                "connected_at": datetime.now(timezone.utc).isoformat()
            }},
            upsert=True
        )
        
        logger.info("Google Drive connected successfully")
        return RedirectResponse(url=f"{FRONTEND_URL}/admin/dashboard?drive_connected=true")
    
    except Exception as e:
        logger.error(f"Drive OAuth callback failed: {str(e)}")
        return RedirectResponse(url=f"{FRONTEND_URL}/admin/dashboard?drive_error={str(e)}")

@router.get("/google/drive/status")
async def get_drive_status():
    """Check if Google Drive is connected"""
    try:
        creds = await db.google_credentials.find_one({"service": "drive"}, {"_id": 0})
        if creds:
            return {
                "connected": True,
                "connected_at": creds.get("connected_at", "")
            }
        return {"connected": False}
    except Exception as e:
        return {"connected": False, "error": str(e)}

async def get_drive_service():
    """Get authenticated Drive service"""
    creds_doc = await db.google_credentials.find_one({"service": "drive"})
    if not creds_doc:
        raise HTTPException(status_code=400, detail="Google Drive not connected")
    
    creds = Credentials(
        token=creds_doc["access_token"],
        refresh_token=creds_doc.get("refresh_token"),
        token_uri=creds_doc["token_uri"],
        client_id=creds_doc["client_id"],
        client_secret=creds_doc["client_secret"],
        scopes=creds_doc.get("scopes", [])
    )
    
    if creds.expired and creds.refresh_token:
        creds.refresh(GoogleRequest())
        await db.google_credentials.update_one(
            {"service": "drive"},
            {"$set": {
                "access_token": creds.token,
                "expiry": creds.expiry.isoformat() if creds.expiry else None
            }}
        )
    
    return build('drive', 'v3', credentials=creds)

@router.get("/google/drive/files")
async def list_drive_files(folder_id: str = "root", page_size: int = 20):
    """List files in Google Drive"""
    try:
        service = await get_drive_service()
        
        query = f"'{folder_id}' in parents and trashed = false"
        
        results = service.files().list(
            q=query,
            pageSize=page_size,
            fields="files(id, name, mimeType, size, createdTime, modifiedTime, webViewLink, iconLink, parents)"
        ).execute()
        
        files = results.get('files', [])
        
        return {
            "files": files,
            "folder_id": folder_id,
            "total": len(files)
        }
    
    except Exception as e:
        logger.error(f"Failed to list files: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to list files: {str(e)}")

@router.post("/google/drive/folder")
async def create_drive_folder(name: str, parent_id: str = "root"):
    """Create folder in Google Drive"""
    try:
        service = await get_drive_service()
        
        file_metadata = {
            'name': name,
            'mimeType': 'application/vnd.google-apps.folder',
            'parents': [parent_id]
        }
        
        folder = service.files().create(
            body=file_metadata,
            fields='id, name, webViewLink'
        ).execute()
        
        return {"success": True, "folder": folder}
    
    except Exception as e:
        logger.error(f"Failed to create folder: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to create folder: {str(e)}")

@router.post("/google/drive/upload")
async def upload_to_drive(
    file: UploadFile = File(...),
    folder_id: str = "root",
    description: str = ""
):
    """Upload file to Google Drive"""
    try:
        service = await get_drive_service()
        
        # Save to temp file
        with tempfile.NamedTemporaryFile(delete=False) as tmp:
            content = await file.read()
            tmp.write(content)
            tmp_path = tmp.name
        
        try:
            file_metadata = {
                'name': file.filename,
                'parents': [folder_id],
                'description': description
            }
            
            media = MediaFileUpload(
                tmp_path,
                mimetype=file.content_type or 'application/octet-stream',
                resumable=True
            )
            
            uploaded = service.files().create(
                body=file_metadata,
                media_body=media,
                fields='id, name, webViewLink, size'
            ).execute()
            
            return {"success": True, "file": uploaded}
        
        finally:
            os.unlink(tmp_path)
    
    except Exception as e:
        logger.error(f"Failed to upload file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to upload file: {str(e)}")

@router.post("/google/drive/share")
async def share_drive_file(file_id: str, email: str, role: str = "reader"):
    """Share file with a user"""
    try:
        service = await get_drive_service()
        
        permission = {
            'type': 'user',
            'role': role,  # reader, writer, commenter
            'emailAddress': email
        }
        
        result = service.permissions().create(
            fileId=file_id,
            body=permission,
            sendNotificationEmail=True
        ).execute()
        
        return {"success": True, "permission_id": result.get('id')}
    
    except Exception as e:
        logger.error(f"Failed to share file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to share file: {str(e)}")

@router.delete("/google/drive/file/{file_id}")
async def delete_drive_file(file_id: str):
    """Delete file from Google Drive"""
    try:
        service = await get_drive_service()
        service.files().delete(fileId=file_id).execute()
        return {"success": True}
    
    except Exception as e:
        logger.error(f"Failed to delete file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to delete file: {str(e)}")

# ==================== EMAIL TEMPLATES ====================

DEFAULT_TEMPLATES = [
    {
        "id": "welcome",
        "name": "Welcome Email",
        "subject": "Welcome to Sanjaya Program",
        "body_html": """
        <div style="font-family: 'Nunito', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #f97316, #ec4899); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0;">Welcome to Sanjaya! 🌟</h1>
            </div>
            <div style="padding: 30px; background: #fff;">
                <p>Dear {{name}},</p>
                <p>We are thrilled to welcome you to the Sanjaya family! Our emotional support program is designed to help children grow, express, and thrive.</p>
                <p>Here's what you can expect:</p>
                <ul>
                    <li>Regular sessions with trained observers</li>
                    <li>Progress reports and insights</li>
                    <li>Resources for emotional well-being</li>
                </ul>
                <p>If you have any questions, feel free to reach out!</p>
                <p>Warm regards,<br>The Sanjaya Team</p>
            </div>
        </div>
        """
    },
    {
        "id": "session_reminder",
        "name": "Session Reminder",
        "subject": "Upcoming Session Reminder - {{child_name}}",
        "body_html": """
        <div style="font-family: 'Nunito', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0;">Session Reminder 📅</h1>
            </div>
            <div style="padding: 30px; background: #fff;">
                <p>Dear {{parent_name}},</p>
                <p>This is a friendly reminder about {{child_name}}'s upcoming session:</p>
                <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Date:</strong> {{session_date}}</p>
                    <p><strong>Time:</strong> {{session_time}}</p>
                    <p><strong>Observer:</strong> {{observer_name}}</p>
                </div>
                <p>Please ensure {{child_name}} is ready for the session.</p>
                <p>Best regards,<br>The Sanjaya Team</p>
            </div>
        </div>
        """
    },
    {
        "id": "report_ready",
        "name": "Report Ready",
        "subject": "New Report Available for {{child_name}}",
        "body_html": """
        <div style="font-family: 'Nunito', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981, #14b8a6); padding: 30px; text-align: center; border-radius: 12px 12px 0 0;">
                <h1 style="color: white; margin: 0;">Report Ready! 📊</h1>
            </div>
            <div style="padding: 30px; background: #fff;">
                <p>Dear {{parent_name}},</p>
                <p>A new {{report_type}} report is now available for {{child_name}}.</p>
                <p>You can view the report by logging into your parent portal.</p>
                <div style="text-align: center; margin: 30px 0;">
                    <a href="{{portal_link}}" style="background: #10b981; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none;">View Report</a>
                </div>
                <p>Best regards,<br>The Sanjaya Team</p>
            </div>
        </div>
        """
    }
]

@router.get("/google/templates")
async def get_email_templates():
    """Get all email templates"""
    try:
        templates = await db.email_templates.find({}, {"_id": 0}).to_list(100)
        if not templates:
            # Initialize with default templates
            for tpl in DEFAULT_TEMPLATES:
                await db.email_templates.insert_one(tpl)
            templates = DEFAULT_TEMPLATES
        return {"templates": templates}
    
    except Exception as e:
        logger.error(f"Failed to get templates: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to get templates: {str(e)}")

@router.post("/google/templates")
async def create_email_template(
    template_id: str,
    name: str,
    subject: str,
    body_html: str
):
    """Create or update email template"""
    try:
        template = {
            "id": template_id,
            "name": name,
            "subject": subject,
            "body_html": body_html,
            "updated_at": datetime.now(timezone.utc).isoformat()
        }
        
        await db.email_templates.update_one(
            {"id": template_id},
            {"$set": template},
            upsert=True
        )
        
        return {"success": True, "template": template}
    
    except Exception as e:
        logger.error(f"Failed to save template: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to save template: {str(e)}")
