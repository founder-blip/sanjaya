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
            self.test_chat_endpoint_basic,
            self.test_chat_context_persistence,
            self.test_chat_new_session,
            self.test_chat_error_handling
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