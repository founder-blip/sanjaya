#!/usr/bin/env python3
"""
Backend API Testing Script for Sanjaya Application
Tests the chat endpoint functionality, session persistence, error handling,
and admin-to-frontend content sync functionality.
"""

import requests
import json
import time
import sys
from datetime import datetime

# Get backend URL from frontend .env
def get_backend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    return line.split('=', 1)[1].strip()
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

BACKEND_URL = get_backend_url()
if not BACKEND_URL:
    print("ERROR: Could not get REACT_APP_BACKEND_URL from frontend/.env")
    sys.exit(1)

API_BASE = f"{BACKEND_URL}/api"
print(f"Testing backend at: {API_BASE}")

class BackendTester:
    def __init__(self):
        self.test_results = []
        self.session_id = f"test_session_{int(time.time())}"
        
    def log_result(self, test_name, success, message, details=None):
        """Log test result"""
        result = {
            'test': test_name,
            'success': success,
            'message': message,
            'timestamp': datetime.now().isoformat(),
            'details': details
        }
        self.test_results.append(result)
        status = "✅ PASS" if success else "❌ FAIL"
        print(f"{status}: {test_name} - {message}")
        if details and not success:
            print(f"   Details: {details}")
    
    def test_root_endpoint(self):
        """Test the root API endpoint"""
        try:
            response = requests.get(f"{API_BASE}/", timeout=10)
            if response.status_code == 200:
                data = response.json()
                if data.get('message') == 'Hello World':
                    self.log_result("Root Endpoint", True, "Root endpoint working correctly")
                    return True
                else:
                    self.log_result("Root Endpoint", False, f"Unexpected response: {data}")
                    return False
            else:
                self.log_result("Root Endpoint", False, f"HTTP {response.status_code}: {response.text}")
                return False
        except Exception as e:
            self.log_result("Root Endpoint", False, f"Connection error: {str(e)}")
            return False
    
    def test_chat_endpoint_basic(self):
        """Test basic chat functionality with 'What is Sanjaya?' question"""
        try:
            payload = {
                "message": "What is Sanjaya?",
                "session_id": self.session_id
            }
            
            response = requests.post(
                f"{API_BASE}/chat",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                if 'response' not in data or 'session_id' not in data:
                    self.log_result("Chat Basic", False, "Missing required fields in response", data)
                    return False
                
                # Check session_id matches
                if data['session_id'] != self.session_id:
                    self.log_result("Chat Basic", False, f"Session ID mismatch: expected {self.session_id}, got {data['session_id']}")
                    return False
                
                # Check response content
                response_text = data['response']
                if not response_text or len(response_text.strip()) < 10:
                    self.log_result("Chat Basic", False, "Response too short or empty", data)
                    return False
                
                # Check if response mentions Sanjaya (should be contextually relevant)
                if 'sanjaya' not in response_text.lower():
                    self.log_result("Chat Basic", False, "Response doesn't mention Sanjaya", {"response": response_text})
                    return False
                
                self.log_result("Chat Basic", True, f"Chat working correctly. Response length: {len(response_text)} chars")
                return True
                
            else:
                self.log_result("Chat Basic", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Chat Basic", False, f"Request error: {str(e)}")
            return False
    
    def test_chat_context_persistence(self):
        """Test that chat remembers context from previous messages"""
        try:
            # Send a follow-up message that requires context
            payload = {
                "message": "Can you tell me more about the observers?",
                "session_id": self.session_id  # Same session as previous test
            }
            
            response = requests.post(
                f"{API_BASE}/chat",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                if 'response' not in data or 'session_id' not in data:
                    self.log_result("Chat Context", False, "Missing required fields in response", data)
                    return False
                
                response_text = data['response']
                if not response_text or len(response_text.strip()) < 10:
                    self.log_result("Chat Context", False, "Response too short or empty", data)
                    return False
                
                # Check if response is contextually relevant to observers
                context_keywords = ['observer', 'listen', 'children', 'sanjaya']
                has_context = any(keyword in response_text.lower() for keyword in context_keywords)
                
                if not has_context:
                    self.log_result("Chat Context", False, "Response lacks contextual relevance", {"response": response_text})
                    return False
                
                self.log_result("Chat Context", True, "Context persistence working correctly")
                return True
                
            else:
                self.log_result("Chat Context", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Chat Context", False, f"Request error: {str(e)}")
            return False
    
    def test_chat_new_session(self):
        """Test chat with a new session ID"""
        try:
            new_session_id = f"test_session_new_{int(time.time())}"
            payload = {
                "message": "Hello, what can you help me with?",
                "session_id": new_session_id
            }
            
            response = requests.post(
                f"{API_BASE}/chat",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=30
            )
            
            if response.status_code == 200:
                data = response.json()
                
                if data['session_id'] != new_session_id:
                    self.log_result("Chat New Session", False, f"Session ID mismatch: expected {new_session_id}, got {data['session_id']}")
                    return False
                
                response_text = data['response']
                if not response_text or len(response_text.strip()) < 5:
                    self.log_result("Chat New Session", False, "Response too short or empty", data)
                    return False
                
                self.log_result("Chat New Session", True, "New session creation working correctly")
                return True
                
            else:
                self.log_result("Chat New Session", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Chat New Session", False, f"Request error: {str(e)}")
            return False
    
    def test_chat_error_handling(self):
        """Test error handling for invalid requests"""
        test_cases = [
            {
                "name": "Missing message field",
                "payload": {"session_id": "test_error_session"},
                "expected_status": [400, 422]
            },
            {
                "name": "Missing session_id field", 
                "payload": {"message": "Hello"},
                "expected_status": [400, 422]
            },
            {
                "name": "Empty message",
                "payload": {"message": "", "session_id": "test_error_session"},
                "expected_status": [400, 422]
            },
            {
                "name": "Invalid JSON",
                "payload": "invalid json",
                "expected_status": [400, 422]
            }
        ]
        
        all_passed = True
        
        for test_case in test_cases:
            try:
                if isinstance(test_case["payload"], str):
                    # Send invalid JSON
                    response = requests.post(
                        f"{API_BASE}/chat",
                        data=test_case["payload"],
                        headers={"Content-Type": "application/json"},
                        timeout=10
                    )
                else:
                    response = requests.post(
                        f"{API_BASE}/chat",
                        json=test_case["payload"],
                        headers={"Content-Type": "application/json"},
                        timeout=10
                    )
                
                if response.status_code in test_case["expected_status"]:
                    self.log_result(f"Error Handling - {test_case['name']}", True, f"Correctly returned HTTP {response.status_code}")
                else:
                    self.log_result(f"Error Handling - {test_case['name']}", False, f"Expected HTTP {test_case['expected_status']}, got {response.status_code}")
                    all_passed = False
                    
            except Exception as e:
                self.log_result(f"Error Handling - {test_case['name']}", False, f"Request error: {str(e)}")
                all_passed = False
        
        return all_passed
    
    def test_status_endpoints(self):
        """Test status check endpoints"""
        try:
            # Test GET status
            response = requests.get(f"{API_BASE}/status", timeout=10)
            if response.status_code == 200:
                data = response.json()
                self.log_result("Status GET", True, f"Status endpoint working, returned {len(data)} items")
            else:
                self.log_result("Status GET", False, f"HTTP {response.status_code}: {response.text}")
                return False
            
            # Test POST status
            payload = {"client_name": "test_client"}
            response = requests.post(
                f"{API_BASE}/status",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                if 'id' in data and 'client_name' in data and data['client_name'] == 'test_client':
                    self.log_result("Status POST", True, "Status creation working correctly")
                    return True
                else:
                    self.log_result("Status POST", False, "Invalid response structure", data)
                    return False
            else:
                self.log_result("Status POST", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Status Endpoints", False, f"Request error: {str(e)}")
            return False
    
    def test_admin_login(self):
        """Test admin login functionality"""
        try:
            payload = {
                "username": "admin",
                "password": "admin123"
            }
            
            response = requests.post(
                f"{API_BASE}/admin/login",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                if 'access_token' not in data or 'token_type' not in data or 'username' not in data:
                    self.log_result("Admin Login", False, "Missing required fields in response", data)
                    return False, None
                
                # Check token type
                if data['token_type'] != 'bearer':
                    self.log_result("Admin Login", False, f"Expected token_type 'bearer', got '{data['token_type']}'")
                    return False, None
                
                # Check username
                if data['username'] != 'admin':
                    self.log_result("Admin Login", False, f"Expected username 'admin', got '{data['username']}'")
                    return False, None
                
                self.log_result("Admin Login", True, "Admin login successful")
                return True, data['access_token']
                
            else:
                self.log_result("Admin Login", False, f"HTTP {response.status_code}: {response.text}")
                return False, None
                
        except Exception as e:
            self.log_result("Admin Login", False, f"Request error: {str(e)}")
            return False, None
    
    def test_admin_content_update_and_sync(self):
        """Test admin content update and frontend sync"""
        try:
            # First login to get token
            login_success, token = self.test_admin_login()
            if not login_success or not token:
                self.log_result("Admin Content Sync", False, "Failed to login to admin")
                return False
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # Test Hero Content Update
            test_hero_content = {
                "main_tagline": "TEST: Updated Tagline from Admin",
                "sub_headline": "This is a test to verify admin-to-frontend sync is working correctly",
                "description": "Test description for admin sync verification",
                "cta_primary": "Test Primary CTA",
                "cta_secondary": "Test Secondary CTA"
            }
            
            # Update hero content via admin API
            response = requests.put(
                f"{API_BASE}/admin/content/hero",
                json=test_hero_content,
                headers=headers,
                timeout=10
            )
            
            if response.status_code != 200:
                self.log_result("Admin Content Sync", False, f"Failed to update hero content: HTTP {response.status_code}")
                return False
            
            # Wait a moment for database update
            time.sleep(1)
            
            # Fetch content from public API (what frontend uses)
            public_response = requests.get(f"{API_BASE}/content/hero", timeout=10)
            
            if public_response.status_code != 200:
                self.log_result("Admin Content Sync", False, f"Failed to fetch public hero content: HTTP {public_response.status_code}")
                return False
            
            public_data = public_response.json()
            
            # Verify the content matches
            if public_data.get('main_tagline') != test_hero_content['main_tagline']:
                self.log_result("Admin Content Sync", False, f"Hero tagline mismatch: expected '{test_hero_content['main_tagline']}', got '{public_data.get('main_tagline')}'")
                return False
            
            if public_data.get('description') != test_hero_content['description']:
                self.log_result("Admin Content Sync", False, f"Hero description mismatch")
                return False
            
            # Test Founder Content Update
            test_founder_content = {
                "name": "TEST: Dr. Punam Jaiswal Updated",
                "title": "Test Founder Title",
                "description": "Test founder description",
                "quote": "Test quote to verify sync",
                "image_url": "/test-image.jpg"
            }
            
            # Update founder content via admin API
            response = requests.put(
                f"{API_BASE}/admin/content/founder",
                json=test_founder_content,
                headers=headers,
                timeout=10
            )
            
            if response.status_code != 200:
                self.log_result("Admin Content Sync", False, f"Failed to update founder content: HTTP {response.status_code}")
                return False
            
            # Wait a moment for database update
            time.sleep(1)
            
            # Fetch founder content from public API
            public_response = requests.get(f"{API_BASE}/content/founder", timeout=10)
            
            if public_response.status_code != 200:
                self.log_result("Admin Content Sync", False, f"Failed to fetch public founder content: HTTP {public_response.status_code}")
                return False
            
            public_data = public_response.json()
            
            # Verify the founder content matches
            if public_data.get('name') != test_founder_content['name']:
                self.log_result("Admin Content Sync", False, f"Founder name mismatch: expected '{test_founder_content['name']}', got '{public_data.get('name')}'")
                return False
            
            if public_data.get('quote') != test_founder_content['quote']:
                self.log_result("Admin Content Sync", False, f"Founder quote mismatch")
                return False
            
            self.log_result("Admin Content Sync", True, "Admin-to-frontend content sync working correctly for both Hero and Founder sections")
            return True
            
        except Exception as e:
            self.log_result("Admin Content Sync", False, f"Request error: {str(e)}")
            return False
    
    def test_public_content_endpoints(self):
        """Test all public content endpoints that frontend uses"""
        try:
            endpoints = [
                ("/content/hero", "Hero Content"),
                ("/content/founder", "Founder Content"),
                ("/content/what-is-sanjaya", "What is Sanjaya Content"),
                ("/content/contact", "Contact Info")
            ]
            
            all_passed = True
            
            for endpoint, name in endpoints:
                response = requests.get(f"{API_BASE}{endpoint}", timeout=10)
                
                if response.status_code == 200:
                    data = response.json()
                    self.log_result(f"Public Content - {name}", True, f"Endpoint accessible, returned data: {len(str(data))} chars")
                else:
                    self.log_result(f"Public Content - {name}", False, f"HTTP {response.status_code}: {response.text}")
                    all_passed = False
            
            return all_passed
            
        except Exception as e:
            self.log_result("Public Content Endpoints", False, f"Request error: {str(e)}")
            return False

    def test_new_cms_content_endpoints(self):
        """Test all 6 new CMS content endpoints from the integration"""
        try:
            # Test the 6 new content endpoints mentioned in the review request
            new_endpoints = [
                ("/content/about", "About Page Content"),
                ("/content/faq", "FAQ Page Content"),
                ("/content/how-it-works-page", "How It Works Page Content"),
                ("/content/observer", "Observer Page Content"),
                ("/content/principal", "Principal Page Content"),
                ("/content/get-started", "Get Started Page Content")
            ]
            
            all_passed = True
            
            for endpoint, name in new_endpoints:
                try:
                    response = requests.get(f"{API_BASE}{endpoint}", timeout=10)
                    
                    if response.status_code == 200:
                        data = response.json()
                        
                        # Check if we got valid JSON data
                        if isinstance(data, dict):
                            # Check if it has some content (not just empty dict)
                            if data:  # Non-empty dict
                                self.log_result(f"CMS Content - {name}", True, f"Endpoint working, returned valid data with {len(data)} fields")
                            else:  # Empty dict - still valid but note it
                                self.log_result(f"CMS Content - {name}", True, f"Endpoint accessible but returned empty data (may need seeding)")
                        else:
                            self.log_result(f"CMS Content - {name}", False, f"Invalid response format: expected dict, got {type(data)}")
                            all_passed = False
                    else:
                        self.log_result(f"CMS Content - {name}", False, f"HTTP {response.status_code}: {response.text}")
                        all_passed = False
                        
                except requests.exceptions.Timeout:
                    self.log_result(f"CMS Content - {name}", False, "Request timeout")
                    all_passed = False
                except Exception as e:
                    self.log_result(f"CMS Content - {name}", False, f"Request error: {str(e)}")
                    all_passed = False
            
            return all_passed
            
        except Exception as e:
            self.log_result("New CMS Content Endpoints", False, f"General error: {str(e)}")
            return False
    
    def test_admin_authentication_protection(self):
        """Test that admin endpoints are properly protected"""
        try:
            # Test accessing admin endpoint without token
            response = requests.get(f"{API_BASE}/admin/content/hero", timeout=10)
            
            if response.status_code == 401:
                self.log_result("Admin Auth Protection", True, "Admin endpoints properly protected - returns 401 without token")
                return True
            else:
                self.log_result("Admin Auth Protection", False, f"Expected HTTP 401, got {response.status_code}")
                return False
                
        except Exception as e:
            self.log_result("Admin Auth Protection", False, f"Request error: {str(e)}")
            return False

    def test_admin_cms_endpoints_access(self):
        """Test that admin CMS endpoints are accessible with proper authentication"""
        try:
            # First login to get token
            login_success, token = self.test_admin_login()
            if not login_success or not token:
                self.log_result("Admin CMS Access", False, "Failed to login to admin")
                return False
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # Test admin endpoints for the 6 new CMS pages
            admin_endpoints = [
                ("/admin/content/about", "About Admin"),
                ("/admin/content/faq", "FAQ Admin"),
                ("/admin/content/how-it-works-page", "How It Works Page Admin"),
                ("/admin/content/observer", "Observer Admin"),
                ("/admin/content/principal", "Principal Admin"),
                ("/admin/content/get-started", "Get Started Admin")
            ]
            
            all_passed = True
            
            for endpoint, name in admin_endpoints:
                try:
                    response = requests.get(f"{API_BASE}{endpoint}", headers=headers, timeout=10)
                    
                    if response.status_code == 200:
                        data = response.json()
                        if isinstance(data, dict):
                            self.log_result(f"Admin CMS - {name}", True, f"Admin endpoint accessible, returned {len(data)} fields")
                        else:
                            self.log_result(f"Admin CMS - {name}", False, f"Invalid response format: expected dict, got {type(data)}")
                            all_passed = False
                    else:
                        self.log_result(f"Admin CMS - {name}", False, f"HTTP {response.status_code}: {response.text}")
                        all_passed = False
                        
                except Exception as e:
                    self.log_result(f"Admin CMS - {name}", False, f"Request error: {str(e)}")
                    all_passed = False
            
            return all_passed
            
        except Exception as e:
            self.log_result("Admin CMS Access", False, f"General error: {str(e)}")
            return False

    def test_inquiry_submission(self):
        """Test POST /api/inquiries endpoint for form submission"""
        try:
            # Test valid inquiry submission
            test_inquiry = {
                "parent_name": "Sarah Johnson",
                "email": "sarah.johnson@example.com",
                "phone": "+91 9876543210",
                "child_name": "Emma Johnson",
                "child_age": 10,
                "school_name": "Greenwood Elementary School",
                "message": "I'm interested in enrolling my daughter Emma in the Sanjaya program. She's been struggling with confidence lately and I think having a caring observer to talk to would really help her."
            }
            
            response = requests.post(
                f"{API_BASE}/inquiries",
                json=test_inquiry,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                required_fields = ['success', 'message', 'inquiry_id']
                for field in required_fields:
                    if field not in data:
                        self.log_result("Inquiry Submission", False, f"Missing required field '{field}' in response", data)
                        return False
                
                # Check success status
                if not data.get('success'):
                    self.log_result("Inquiry Submission", False, f"Success field is False: {data}")
                    return False
                
                # Check inquiry_id is valid UUID format
                inquiry_id = data.get('inquiry_id')
                if not inquiry_id or len(inquiry_id) < 10:
                    self.log_result("Inquiry Submission", False, f"Invalid inquiry_id: {inquiry_id}")
                    return False
                
                self.log_result("Inquiry Submission", True, f"Inquiry submitted successfully with ID: {inquiry_id}")
                self.test_inquiry_id = inquiry_id  # Store for later tests
                return True
                
            else:
                self.log_result("Inquiry Submission", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Inquiry Submission", False, f"Request error: {str(e)}")
            return False

    def test_inquiry_validation(self):
        """Test form validation for inquiry submission"""
        try:
            # Test cases for validation
            validation_tests = [
                {
                    "name": "Missing parent_name",
                    "data": {
                        "email": "test@example.com",
                        "phone": "+91 1234567890",
                        "child_name": "Test Child",
                        "child_age": 10
                    },
                    "expected_status": [400, 422]
                },
                {
                    "name": "Missing email",
                    "data": {
                        "parent_name": "Test Parent",
                        "phone": "+91 1234567890",
                        "child_name": "Test Child",
                        "child_age": 10
                    },
                    "expected_status": [400, 422]
                },
                {
                    "name": "Invalid email format",
                    "data": {
                        "parent_name": "Test Parent",
                        "email": "invalid-email",
                        "phone": "+91 1234567890",
                        "child_name": "Test Child",
                        "child_age": 10
                    },
                    "expected_status": [400, 422]
                },
                {
                    "name": "Missing child_age",
                    "data": {
                        "parent_name": "Test Parent",
                        "email": "test@example.com",
                        "phone": "+91 1234567890",
                        "child_name": "Test Child"
                    },
                    "expected_status": [400, 422]
                },
                {
                    "name": "Invalid child_age (too young)",
                    "data": {
                        "parent_name": "Test Parent",
                        "email": "test@example.com",
                        "phone": "+91 1234567890",
                        "child_name": "Test Child",
                        "child_age": 3
                    },
                    "expected_status": [200, 400, 422]  # May accept but note it
                },
                {
                    "name": "Invalid child_age (too old)",
                    "data": {
                        "parent_name": "Test Parent",
                        "email": "test@example.com",
                        "phone": "+91 1234567890",
                        "child_name": "Test Child",
                        "child_age": 25
                    },
                    "expected_status": [200, 400, 422]  # May accept but note it
                }
            ]
            
            all_passed = True
            
            for test_case in validation_tests:
                try:
                    response = requests.post(
                        f"{API_BASE}/inquiries",
                        json=test_case["data"],
                        headers={"Content-Type": "application/json"},
                        timeout=10
                    )
                    
                    if response.status_code in test_case["expected_status"]:
                        if response.status_code == 200:
                            self.log_result(f"Validation - {test_case['name']}", True, f"Accepted (HTTP 200) - validation may be lenient")
                        else:
                            self.log_result(f"Validation - {test_case['name']}", True, f"Correctly rejected with HTTP {response.status_code}")
                    else:
                        self.log_result(f"Validation - {test_case['name']}", False, f"Expected HTTP {test_case['expected_status']}, got {response.status_code}")
                        all_passed = False
                        
                except Exception as e:
                    self.log_result(f"Validation - {test_case['name']}", False, f"Request error: {str(e)}")
                    all_passed = False
            
            return all_passed
            
        except Exception as e:
            self.log_result("Inquiry Validation", False, f"General error: {str(e)}")
            return False

    def test_admin_inquiries_view(self):
        """Test admin endpoint for viewing inquiries"""
        try:
            # First login to get token
            login_success, token = self.test_admin_login()
            if not login_success or not token:
                self.log_result("Admin Inquiries View", False, "Failed to login to admin")
                return False
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # Test admin inquiries endpoint
            response = requests.get(f"{API_BASE}/admin/inquiries", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check if response has the expected structure
                if not isinstance(data, dict) or 'inquiries' not in data or 'total' not in data:
                    self.log_result("Admin Inquiries View", False, f"Expected dict with 'inquiries' and 'total' fields, got {type(data)} with keys: {list(data.keys()) if isinstance(data, dict) else 'N/A'}")
                    return False
                
                inquiries_list = data['inquiries']
                total_count = data['total']
                
                # Check if inquiries is a list
                if not isinstance(inquiries_list, list):
                    self.log_result("Admin Inquiries View", False, f"Expected inquiries to be a list, got {type(inquiries_list)}")
                    return False
                
                # Check if we have at least one inquiry (from previous test)
                if len(inquiries_list) == 0:
                    self.log_result("Admin Inquiries View", True, "Admin inquiries endpoint accessible but no inquiries found (may need to submit one first)")
                    return True
                
                # Check structure of first inquiry
                first_inquiry = inquiries_list[0]
                required_fields = ['id', 'parent_name', 'email', 'child_name', 'child_age', 'status', 'created_at']
                
                for field in required_fields:
                    if field not in first_inquiry:
                        self.log_result("Admin Inquiries View", False, f"Missing required field '{field}' in inquiry data")
                        return False
                
                # Check if total count matches list length
                if total_count != len(inquiries_list):
                    self.log_result("Admin Inquiries View", False, f"Total count mismatch: total={total_count}, list length={len(inquiries_list)}")
                    return False
                
                self.log_result("Admin Inquiries View", True, f"Admin inquiries view working correctly, found {len(inquiries_list)} inquiries (total: {total_count})")
                return True
                
            elif response.status_code == 404:
                self.log_result("Admin Inquiries View", False, "Admin inquiries endpoint not found (may not be implemented yet)")
                return False
            else:
                self.log_result("Admin Inquiries View", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Admin Inquiries View", False, f"Request error: {str(e)}")
            return False

    # ===== PARENT PORTAL PHASE 1 TESTS =====
    
    def test_parent_authentication(self):
        """Test parent login with demo credentials"""
        try:
            payload = {
                "email": "demo@parent.com",
                "password": "demo123"
            }
            
            response = requests.post(
                f"{API_BASE}/parent/login",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                required_fields = ['access_token', 'token_type', 'user']
                for field in required_fields:
                    if field not in data:
                        self.log_result("Parent Authentication", False, f"Missing required field '{field}' in response", data)
                        return False, None
                
                # Check token type
                if data['token_type'] != 'bearer':
                    self.log_result("Parent Authentication", False, f"Expected token_type 'bearer', got '{data['token_type']}'")
                    return False, None
                
                # Check user data
                user = data['user']
                if user.get('email') != 'demo@parent.com':
                    self.log_result("Parent Authentication", False, f"Expected email 'demo@parent.com', got '{user.get('email')}'")
                    return False, None
                
                if user.get('role') != 'parent':
                    self.log_result("Parent Authentication", False, f"Expected role 'parent', got '{user.get('role')}'")
                    return False, None
                
                self.log_result("Parent Authentication", True, f"Parent login successful for {user.get('name', 'Demo Parent')}")
                return True, data['access_token']
                
            else:
                self.log_result("Parent Authentication", False, f"HTTP {response.status_code}: {response.text}")
                return False, None
                
        except Exception as e:
            self.log_result("Parent Authentication", False, f"Request error: {str(e)}")
            return False, None
    
    def test_parent_dashboard_api(self):
        """Test parent dashboard API with authentication"""
        try:
            # First login to get token
            login_success, token = self.test_parent_authentication()
            if not login_success or not token:
                self.log_result("Parent Dashboard API", False, "Failed to login as parent")
                return False
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # Test dashboard endpoint
            response = requests.get(f"{API_BASE}/parent/dashboard", headers=headers, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                required_top_fields = ['parent', 'children', 'summary']
                for field in required_top_fields:
                    if field not in data:
                        self.log_result("Parent Dashboard API", False, f"Missing required field '{field}' in response")
                        return False
                
                # Check parent info
                parent = data['parent']
                if 'name' not in parent or 'email' not in parent:
                    self.log_result("Parent Dashboard API", False, "Missing parent name or email in response")
                    return False
                
                # Check children array
                children = data['children']
                if not isinstance(children, list):
                    self.log_result("Parent Dashboard API", False, f"Expected children to be a list, got {type(children)}")
                    return False
                
                # Verify we have 2 children as per demo data
                if len(children) != 2:
                    self.log_result("Parent Dashboard API", False, f"Expected 2 children, got {len(children)}")
                    return False
                
                # Check each child has required data
                for i, child in enumerate(children):
                    required_child_fields = ['id', 'name', 'age', 'recent_sessions', 'upcoming_appointments', 'progress_metrics']
                    for field in required_child_fields:
                        if field not in child:
                            self.log_result("Parent Dashboard API", False, f"Child {i+1} missing required field '{field}'")
                            return False
                    
                    # Verify child names match demo data
                    child_name = child['name']
                    if child_name not in ['Aarav Kumar', 'Priya Sharma']:
                        self.log_result("Parent Dashboard API", False, f"Unexpected child name: {child_name}. Expected 'Aarav Kumar' or 'Priya Sharma'")
                        return False
                    
                    # Verify ages match demo data
                    expected_age = 8 if child_name == 'Aarav Kumar' else 10
                    if child['age'] != expected_age:
                        self.log_result("Parent Dashboard API", False, f"Child {child_name} has age {child['age']}, expected {expected_age}")
                        return False
                
                # Check summary stats
                summary = data['summary']
                required_summary_fields = ['total_children', 'active_children', 'total_sessions_this_month', 'upcoming_appointments']
                for field in required_summary_fields:
                    if field not in summary:
                        self.log_result("Parent Dashboard API", False, f"Missing summary field '{field}'")
                        return False
                
                # Verify summary stats
                if summary['total_children'] != 2:
                    self.log_result("Parent Dashboard API", False, f"Summary shows {summary['total_children']} children, expected 2")
                    return False
                
                # Count total sessions and appointments from children data
                total_sessions = sum(len(child.get('recent_sessions', [])) for child in children)
                total_appointments = sum(len(child.get('upcoming_appointments', [])) for child in children)
                
                self.log_result("Parent Dashboard API", True, 
                    f"Dashboard API working correctly. Parent: {parent['name']}, "
                    f"Children: {len(children)}, Sessions: {total_sessions}, "
                    f"Appointments: {total_appointments}, Progress metrics available")
                return True
                
            else:
                self.log_result("Parent Dashboard API", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Parent Dashboard API", False, f"Request error: {str(e)}")
            return False
    
    def test_parent_dashboard_data_integrity(self):
        """Test that dashboard data contains expected demo data volumes"""
        try:
            # First login to get token
            login_success, token = self.test_parent_authentication()
            if not login_success or not token:
                self.log_result("Parent Dashboard Data", False, "Failed to login as parent")
                return False
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # Get dashboard data
            response = requests.get(f"{API_BASE}/parent/dashboard", headers=headers, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                children = data['children']
                
                # Analyze data volumes for each child
                total_sessions = 0
                total_progress_metrics = 0
                total_appointments = 0
                
                for child in children:
                    child_name = child['name']
                    sessions = child.get('recent_sessions', [])
                    progress = child.get('progress_metrics', [])
                    appointments = child.get('upcoming_appointments', [])
                    
                    total_sessions += len(sessions)
                    total_progress_metrics += len(progress)
                    total_appointments += len(appointments)
                    
                    # Verify session notes structure
                    for session in sessions[:3]:  # Check first 3 sessions
                        required_session_fields = ['id', 'child_id', 'session_date', 'key_observations']
                        for field in required_session_fields:
                            if field not in session:
                                self.log_result("Parent Dashboard Data", False, f"Session missing field '{field}' for child {child_name}")
                                return False
                    
                    # Verify progress metrics structure
                    for metric in progress[:3]:  # Check first 3 metrics
                        required_metric_fields = ['id', 'child_id', 'metric_type', 'score']
                        for field in required_metric_fields:
                            if field not in metric:
                                self.log_result("Parent Dashboard Data", False, f"Progress metric missing field '{field}' for child {child_name}")
                                return False
                        
                        # Verify score is in valid range (1-10)
                        score = metric.get('score', 0)
                        if not (1 <= score <= 10):
                            self.log_result("Parent Dashboard Data", False, f"Invalid progress score {score} for child {child_name} (should be 1-10)")
                            return False
                
                # Check if we have reasonable amounts of demo data
                # Note: The review mentions 40 session notes, 80 progress metrics, 44 appointments total
                # But dashboard may show limited recent data
                
                data_summary = f"Sessions: {total_sessions}, Progress: {total_progress_metrics}, Appointments: {total_appointments}"
                
                if total_sessions == 0:
                    self.log_result("Parent Dashboard Data", False, f"No session data found. {data_summary}")
                    return False
                
                if total_progress_metrics == 0:
                    self.log_result("Parent Dashboard Data", False, f"No progress metrics found. {data_summary}")
                    return False
                
                self.log_result("Parent Dashboard Data", True, 
                    f"Dashboard data integrity verified. {data_summary}. "
                    f"All required fields present in session notes and progress metrics.")
                return True
                
            else:
                self.log_result("Parent Dashboard Data", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Parent Dashboard Data", False, f"Request error: {str(e)}")
            return False
    
    def test_parent_child_details_api(self):
        """Test individual child details API"""
        try:
            # First login to get token
            login_success, token = self.test_parent_authentication()
            if not login_success or not token:
                self.log_result("Parent Child Details", False, "Failed to login as parent")
                return False
            
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            # Get dashboard to find child IDs
            dashboard_response = requests.get(f"{API_BASE}/parent/dashboard", headers=headers, timeout=15)
            if dashboard_response.status_code != 200:
                self.log_result("Parent Child Details", False, "Failed to get dashboard data")
                return False
            
            dashboard_data = dashboard_response.json()
            children = dashboard_data['children']
            
            if len(children) == 0:
                self.log_result("Parent Child Details", False, "No children found in dashboard")
                return False
            
            # Test child details for first child
            first_child = children[0]
            child_id = first_child['id']
            child_name = first_child['name']
            
            response = requests.get(f"{API_BASE}/parent/child/{child_id}", headers=headers, timeout=15)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                required_fields = ['child', 'sessions', 'progress_metrics', 'appointments', 'stats']
                for field in required_fields:
                    if field not in data:
                        self.log_result("Parent Child Details", False, f"Missing required field '{field}' in response")
                        return False
                
                # Verify child data
                child_data = data['child']
                if child_data['id'] != child_id or child_data['name'] != child_name:
                    self.log_result("Parent Child Details", False, f"Child data mismatch: expected {child_name} ({child_id})")
                    return False
                
                # Check sessions data
                sessions = data['sessions']
                if not isinstance(sessions, list):
                    self.log_result("Parent Child Details", False, f"Expected sessions to be a list, got {type(sessions)}")
                    return False
                
                # Check progress metrics
                progress_metrics = data['progress_metrics']
                if not isinstance(progress_metrics, list):
                    self.log_result("Parent Child Details", False, f"Expected progress_metrics to be a list, got {type(progress_metrics)}")
                    return False
                
                # Check appointments
                appointments = data['appointments']
                if not isinstance(appointments, list):
                    self.log_result("Parent Child Details", False, f"Expected appointments to be a list, got {type(appointments)}")
                    return False
                
                # Check stats
                stats = data['stats']
                required_stats = ['total_sessions', 'average_mood', 'total_appointments']
                for stat in required_stats:
                    if stat not in stats:
                        self.log_result("Parent Child Details", False, f"Missing stat '{stat}' in response")
                        return False
                
                self.log_result("Parent Child Details", True, 
                    f"Child details API working for {child_name}. "
                    f"Sessions: {len(sessions)}, Progress: {len(progress_metrics)}, "
                    f"Appointments: {len(appointments)}, Avg mood: {stats['average_mood']:.1f}")
                return True
                
            else:
                self.log_result("Parent Child Details", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Parent Child Details", False, f"Request error: {str(e)}")
            return False

    # ===== EVENTS & CELEBRATIONS TESTS =====
    
    def test_observer_login(self):
        """Test observer login with demo credentials"""
        try:
            response = requests.post(
                f"{API_BASE}/observer/login?email=observer@sanjaya.com&password=observer123",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                required_fields = ['access_token', 'token_type', 'observer']
                for field in required_fields:
                    if field not in data:
                        self.log_result("Observer Login", False, f"Missing required field '{field}' in response", data)
                        return False, None
                
                # Check token type
                if data['token_type'] != 'bearer':
                    self.log_result("Observer Login", False, f"Expected token_type 'bearer', got '{data['token_type']}'")
                    return False, None
                
                # Check observer data
                observer = data['observer']
                if observer.get('email') != 'observer@sanjaya.com':
                    self.log_result("Observer Login", False, f"Expected email 'observer@sanjaya.com', got '{observer.get('email')}'")
                    return False, None
                
                if observer.get('role') != 'observer':
                    self.log_result("Observer Login", False, f"Expected role 'observer', got '{observer.get('role')}'")
                    return False, None
                
                self.log_result("Observer Login", True, f"Observer login successful for {observer.get('name', 'Observer')}")
                return True, data['access_token']
                
            else:
                self.log_result("Observer Login", False, f"HTTP {response.status_code}: {response.text}")
                return False, None
                
        except Exception as e:
            self.log_result("Observer Login", False, f"Request error: {str(e)}")
            return False, None
    
    def test_principal_login(self):
        """Test principal login with demo credentials"""
        try:
            response = requests.post(
                f"{API_BASE}/principal/login?email=principal@greenwood.edu&password=principal123",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                required_fields = ['access_token', 'token_type', 'principal']
                for field in required_fields:
                    if field not in data:
                        self.log_result("Principal Login", False, f"Missing required field '{field}' in response", data)
                        return False, None
                
                # Check token type
                if data['token_type'] != 'bearer':
                    self.log_result("Principal Login", False, f"Expected token_type 'bearer', got '{data['token_type']}'")
                    return False, None
                
                # Check principal data
                principal = data['principal']
                if principal.get('email') != 'principal@greenwood.edu':
                    self.log_result("Principal Login", False, f"Expected email 'principal@greenwood.edu', got '{principal.get('email')}'")
                    return False, None
                
                if principal.get('role') != 'principal':
                    self.log_result("Principal Login", False, f"Expected role 'principal', got '{principal.get('role')}'")
                    return False, None
                
                self.log_result("Principal Login", True, f"Principal login successful for {principal.get('name', 'Principal')} at {principal.get('school', 'School')}")
                return True, data['access_token']
                
            else:
                self.log_result("Principal Login", False, f"HTTP {response.status_code}: {response.text}")
                return False, None
                
        except Exception as e:
            self.log_result("Principal Login", False, f"Request error: {str(e)}")
            return False, None
    
    def test_events_national_api(self):
        """Test GET /api/events/national endpoint"""
        try:
            # Get observer token first
            login_success, token = self.test_observer_login()
            if not login_success or not token:
                self.log_result("Events National API", False, "Failed to login as observer")
                return False
            
            response = requests.get(
                f"{API_BASE}/events/national?token={token}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                if 'events' not in data:
                    self.log_result("Events National API", False, "Missing 'events' field in response", data)
                    return False
                
                events = data['events']
                if not isinstance(events, list):
                    self.log_result("Events National API", False, f"Expected events to be a list, got {type(events)}")
                    return False
                
                # Check if we have expected national events
                expected_events = ['Republic Day', 'Independence Day', 'Gandhi Jayanti', 'Children\'s Day', 'Christmas', 'New Year']
                found_events = [event.get('name') for event in events]
                
                missing_events = [e for e in expected_events if e not in found_events]
                if missing_events:
                    self.log_result("Events National API", False, f"Missing expected events: {missing_events}")
                    return False
                
                # Check event structure
                if events:
                    first_event = events[0]
                    required_fields = ['name', 'date', 'type', 'icon', 'default_wish']
                    for field in required_fields:
                        if field not in first_event:
                            self.log_result("Events National API", False, f"Event missing required field '{field}'")
                            return False
                
                self.log_result("Events National API", True, f"National events API working correctly, returned {len(events)} events")
                return True
                
            else:
                self.log_result("Events National API", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Events National API", False, f"Request error: {str(e)}")
            return False
    
    def test_events_upcoming_observer(self):
        """Test GET /api/events/upcoming for observer"""
        try:
            # Get observer token first
            login_success, token = self.test_observer_login()
            if not login_success or not token:
                self.log_result("Events Upcoming Observer", False, "Failed to login as observer")
                return False
            
            response = requests.get(
                f"{API_BASE}/events/upcoming?token={token}&days=60",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                required_fields = ['upcoming_events', 'total_children', 'period_days']
                for field in required_fields:
                    if field not in data:
                        self.log_result("Events Upcoming Observer", False, f"Missing required field '{field}' in response")
                        return False
                
                upcoming_events = data['upcoming_events']
                if not isinstance(upcoming_events, list):
                    self.log_result("Events Upcoming Observer", False, f"Expected upcoming_events to be a list, got {type(upcoming_events)}")
                    return False
                
                total_children = data['total_children']
                if total_children != 1:  # Observer should see 1 child
                    self.log_result("Events Upcoming Observer", False, f"Expected observer to see 1 child, got {total_children}")
                    return False
                
                # Check event structure if any events exist
                if upcoming_events:
                    first_event = upcoming_events[0]
                    required_event_fields = ['id', 'type', 'name', 'date', 'days_until', 'icon']
                    for field in required_event_fields:
                        if field not in first_event:
                            self.log_result("Events Upcoming Observer", False, f"Event missing required field '{field}'")
                            return False
                    
                    # Check if events are sorted by days_until
                    if len(upcoming_events) > 1:
                        for i in range(1, len(upcoming_events)):
                            if upcoming_events[i]['days_until'] < upcoming_events[i-1]['days_until']:
                                self.log_result("Events Upcoming Observer", False, "Events not sorted by days_until")
                                return False
                
                self.log_result("Events Upcoming Observer", True, f"Upcoming events API working for observer, found {len(upcoming_events)} events for {total_children} child")
                return True
                
            else:
                self.log_result("Events Upcoming Observer", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Events Upcoming Observer", False, f"Request error: {str(e)}")
            return False
    
    def test_events_upcoming_principal(self):
        """Test GET /api/events/upcoming for principal"""
        try:
            # Get principal token first
            login_success, token = self.test_principal_login()
            if not login_success or not token:
                self.log_result("Events Upcoming Principal", False, "Failed to login as principal")
                return False
            
            response = requests.get(
                f"{API_BASE}/events/upcoming?token={token}&days=60",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                required_fields = ['upcoming_events', 'total_children', 'period_days']
                for field in required_fields:
                    if field not in data:
                        self.log_result("Events Upcoming Principal", False, f"Missing required field '{field}' in response")
                        return False
                
                upcoming_events = data['upcoming_events']
                total_children = data['total_children']
                
                if total_children != 2:  # Principal should see 2 students
                    self.log_result("Events Upcoming Principal", False, f"Expected principal to see 2 students, got {total_children}")
                    return False
                
                self.log_result("Events Upcoming Principal", True, f"Upcoming events API working for principal, found {len(upcoming_events)} events for {total_children} students")
                return True
                
            else:
                self.log_result("Events Upcoming Principal", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Events Upcoming Principal", False, f"Request error: {str(e)}")
            return False
    
    def test_events_today_api(self):
        """Test GET /api/events/today endpoint"""
        try:
            # Get observer token first
            login_success, token = self.test_observer_login()
            if not login_success or not token:
                self.log_result("Events Today API", False, "Failed to login as observer")
                return False
            
            response = requests.get(
                f"{API_BASE}/events/today?token={token}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                required_fields = ['todays_events', 'date']
                for field in required_fields:
                    if field not in data:
                        self.log_result("Events Today API", False, f"Missing required field '{field}' in response")
                        return False
                
                todays_events = data['todays_events']
                if not isinstance(todays_events, list):
                    self.log_result("Events Today API", False, f"Expected todays_events to be a list, got {type(todays_events)}")
                    return False
                
                # Check date format
                date_str = data['date']
                try:
                    datetime.fromisoformat(date_str)
                except ValueError:
                    self.log_result("Events Today API", False, f"Invalid date format: {date_str}")
                    return False
                
                self.log_result("Events Today API", True, f"Today's events API working correctly, found {len(todays_events)} events for today")
                return True
                
            else:
                self.log_result("Events Today API", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Events Today API", False, f"Request error: {str(e)}")
            return False
    
    def test_events_wish_history_api(self):
        """Test GET /api/events/wish-history endpoint"""
        try:
            # Get observer token first
            login_success, token = self.test_observer_login()
            if not login_success or not token:
                self.log_result("Events Wish History API", False, "Failed to login as observer")
                return False
            
            response = requests.get(
                f"{API_BASE}/events/wish-history?token={token}",
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                required_fields = ['individual_wishes', 'batch_wishes', 'total_individual', 'total_batch']
                for field in required_fields:
                    if field not in data:
                        self.log_result("Events Wish History API", False, f"Missing required field '{field}' in response")
                        return False
                
                individual_wishes = data['individual_wishes']
                batch_wishes = data['batch_wishes']
                
                if not isinstance(individual_wishes, list):
                    self.log_result("Events Wish History API", False, f"Expected individual_wishes to be a list, got {type(individual_wishes)}")
                    return False
                
                if not isinstance(batch_wishes, list):
                    self.log_result("Events Wish History API", False, f"Expected batch_wishes to be a list, got {type(batch_wishes)}")
                    return False
                
                # Should be empty initially
                if len(individual_wishes) == 0 and len(batch_wishes) == 0:
                    self.log_result("Events Wish History API", True, "Wish history API working correctly, empty initially as expected")
                else:
                    self.log_result("Events Wish History API", True, f"Wish history API working, found {len(individual_wishes)} individual and {len(batch_wishes)} batch wishes")
                
                return True
                
            else:
                self.log_result("Events Wish History API", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Events Wish History API", False, f"Request error: {str(e)}")
            return False
    
    def test_events_wish_all_api(self):
        """Test POST /api/events/wish-all endpoint"""
        try:
            # Get observer token first
            login_success, token = self.test_observer_login()
            if not login_success or not token:
                self.log_result("Events Wish All API", False, "Failed to login as observer")
                return False
            
            # Test sending wishes for a national event
            payload = {
                "event_type": "national",
                "message": "Happy Republic Day! May our nation continue to grow stronger! 🇮🇳",
                "event_name": "Republic Day",
                "event_date": "2024-01-26"
            }
            
            response = requests.post(
                f"{API_BASE}/events/wish-all?token={token}",
                json=payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                required_fields = ['success', 'batch_id', 'children_wished']
                for field in required_fields:
                    if field not in data:
                        self.log_result("Events Wish All API", False, f"Missing required field '{field}' in response")
                        return False
                
                if not data['success']:
                    self.log_result("Events Wish All API", False, f"Success field is False: {data}")
                    return False
                
                children_wished = data['children_wished']
                if children_wished != 1:  # Observer should have 1 child
                    self.log_result("Events Wish All API", False, f"Expected to wish 1 child, got {children_wished}")
                    return False
                
                batch_id = data['batch_id']
                if not batch_id or len(batch_id) < 10:
                    self.log_result("Events Wish All API", False, f"Invalid batch_id: {batch_id}")
                    return False
                
                self.log_result("Events Wish All API", True, f"Wish all API working correctly, sent wishes to {children_wished} children with batch ID: {batch_id}")
                return True
                
            else:
                self.log_result("Events Wish All API", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Events Wish All API", False, f"Request error: {str(e)}")
            return False

    def run_all_tests(self):
        """Run all backend tests"""
        print("=" * 60)
        print("STARTING COMPREHENSIVE BACKEND API TESTS")
        print("=" * 60)
        
        tests = [
            self.test_root_endpoint,
            self.test_status_endpoints,
            self.test_public_content_endpoints,
            self.test_new_cms_content_endpoints,
            self.test_admin_authentication_protection,
            self.test_admin_cms_endpoints_access,
            self.test_admin_content_update_and_sync,
            self.test_inquiry_submission,
            self.test_inquiry_validation,
            self.test_admin_inquiries_view,
            # Parent Portal Phase 1 Tests
            self.test_parent_authentication,
            self.test_parent_dashboard_api,
            self.test_parent_dashboard_data_integrity,
            self.test_parent_child_details_api,
            # Chat functionality tests
            self.test_chat_endpoint_basic,
            self.test_chat_context_persistence,
            self.test_chat_new_session,
            self.test_chat_error_handling,
            # Events & Celebrations Tests
            self.test_observer_login,
            self.test_principal_login,
            self.test_events_national_api,
            self.test_events_upcoming_observer,
            self.test_events_upcoming_principal,
            self.test_events_today_api,
            self.test_events_wish_history_api,
            self.test_events_wish_all_api
        ]
        
        passed = 0
        total = len(tests)
        
        for test in tests:
            try:
                if test():
                    passed += 1
            except Exception as e:
                print(f"❌ FAIL: {test.__name__} - Unexpected error: {str(e)}")
        
        print("\n" + "=" * 60)
        print("TEST SUMMARY")
        print("=" * 60)
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("🎉 ALL TESTS PASSED!")
        else:
            print("⚠️  SOME TESTS FAILED - Check details above")
        
        return passed == total

if __name__ == "__main__":
    tester = BackendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)