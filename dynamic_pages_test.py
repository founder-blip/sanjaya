#!/usr/bin/env python3
"""
Focused test for Dynamic Pages + Form Submission System
Tests the specific functionality mentioned in the review request.
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
print(f"Testing dynamic pages and form submission at: {API_BASE}")

class DynamicPagesTester:
    def __init__(self):
        self.test_results = []
        
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
    
    def test_dynamic_about_page(self):
        """Test 1: Dynamic About Page - verify content loads from backend API"""
        try:
            response = requests.get(f"{API_BASE}/content/about", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check for expected about page fields
                expected_fields = ['hero_title', 'hero_subtitle', 'hero_description', 'core_values']
                missing_fields = []
                
                for field in expected_fields:
                    if field not in data:
                        missing_fields.append(field)
                
                if missing_fields:
                    self.log_result("Dynamic About Page", False, f"Missing expected fields: {missing_fields}", data)
                    return False
                
                # Check core values structure (should have 4 values)
                core_values = data.get('core_values', [])
                if not isinstance(core_values, list) or len(core_values) < 4:
                    self.log_result("Dynamic About Page", False, f"Expected at least 4 core values, got {len(core_values) if isinstance(core_values, list) else 'invalid format'}")
                    return False
                
                # Check for intent sections (actual field names from API)
                intent_fields = ['intent_for_children', 'intent_for_parents', 'intent_for_families']
                missing_intent_fields = []
                
                for field in intent_fields:
                    if field not in data:
                        missing_intent_fields.append(field)
                
                if missing_intent_fields:
                    self.log_result("Dynamic About Page", False, f"Missing intent sections: {missing_intent_fields}")
                    return False
                
                # Check for "What We're Not" list
                if 'what_we_are_not' not in data:
                    self.log_result("Dynamic About Page", False, "Missing 'what_we_are_not' list")
                    return False
                
                what_we_are_not = data.get('what_we_are_not', [])
                if not isinstance(what_we_are_not, list) or len(what_we_are_not) < 3:
                    self.log_result("Dynamic About Page", False, f"Expected at least 3 'what we are not' items, got {len(what_we_are_not) if isinstance(what_we_are_not, list) else 'invalid format'}")
                    return False
                
                self.log_result("Dynamic About Page", True, f"About page API working correctly with {len(data)} fields including hero content, {len(core_values)} core values, intent sections, and {len(what_we_are_not)} 'what we are not' items")
                return True
                
            else:
                self.log_result("Dynamic About Page", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Dynamic About Page", False, f"Request error: {str(e)}")
            return False
    
    def test_dynamic_faq_page(self):
        """Test 2: Dynamic FAQ Page - verify FAQ items load from backend"""
        try:
            response = requests.get(f"{API_BASE}/content/faq", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check for expected FAQ page fields
                expected_fields = ['hero_title', 'faq_items']
                missing_fields = []
                
                for field in expected_fields:
                    if field not in data:
                        missing_fields.append(field)
                
                if missing_fields:
                    self.log_result("Dynamic FAQ Page", False, f"Missing expected fields: {missing_fields}", data)
                    return False
                
                # Check FAQ items structure
                faq_items = data.get('faq_items', [])
                if not isinstance(faq_items, list):
                    self.log_result("Dynamic FAQ Page", False, f"FAQ items should be a list, got {type(faq_items)}")
                    return False
                
                if len(faq_items) < 10:  # Expecting around 15 FAQ questions
                    self.log_result("Dynamic FAQ Page", False, f"Expected at least 10 FAQ items, got {len(faq_items)}")
                    return False
                
                # Check structure of first FAQ item
                if faq_items:
                    first_faq = faq_items[0]
                    if not isinstance(first_faq, dict) or 'question' not in first_faq or 'answer' not in first_faq:
                        self.log_result("Dynamic FAQ Page", False, "FAQ items should have 'question' and 'answer' fields")
                        return False
                
                self.log_result("Dynamic FAQ Page", True, f"FAQ page API working correctly with {len(faq_items)} FAQ items")
                return True
                
            else:
                self.log_result("Dynamic FAQ Page", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Dynamic FAQ Page", False, f"Request error: {str(e)}")
            return False
    
    def test_form_submission_backend(self):
        """Test 3: Form Submission Backend - test POST /api/inquiries endpoint"""
        try:
            # Test with comprehensive realistic data
            test_inquiry = {
                "parent_name": "Priya Sharma",
                "email": "priya.sharma@gmail.com",
                "phone": "+91 9876543210",
                "child_name": "Arjun Sharma",
                "child_age": 12,
                "school_name": "Delhi Public School, Gurgaon",
                "message": "My son Arjun has been quite shy lately and I think the Sanjaya program could really help him build confidence. He's in 7th grade and sometimes struggles to express himself. I'd love to learn more about how the observer program works and if it would be suitable for him."
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
                        self.log_result("Form Submission Backend", False, f"Missing required field '{field}' in response", data)
                        return False
                
                # Check success status
                if not data.get('success'):
                    self.log_result("Form Submission Backend", False, f"Success field is False: {data}")
                    return False
                
                # Check inquiry_id is valid
                inquiry_id = data.get('inquiry_id')
                if not inquiry_id or len(inquiry_id) < 10:
                    self.log_result("Form Submission Backend", False, f"Invalid inquiry_id: {inquiry_id}")
                    return False
                
                self.log_result("Form Submission Backend", True, f"Form submission working correctly, inquiry stored with ID: {inquiry_id}")
                self.test_inquiry_id = inquiry_id  # Store for later verification
                return True
                
            else:
                self.log_result("Form Submission Backend", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Form Submission Backend", False, f"Request error: {str(e)}")
            return False
    
    def test_admin_inquiries_view(self):
        """Test 4: Admin Inquiries View - verify admin can view submitted inquiries"""
        try:
            # First login to get admin token
            login_payload = {
                "username": "admin",
                "password": "admin123"
            }
            
            login_response = requests.post(
                f"{API_BASE}/admin/login",
                json=login_payload,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if login_response.status_code != 200:
                self.log_result("Admin Inquiries View", False, f"Admin login failed: HTTP {login_response.status_code}")
                return False
            
            token_data = login_response.json()
            token = token_data.get('access_token')
            
            if not token:
                self.log_result("Admin Inquiries View", False, "No access token received from login")
                return False
            
            # Now test admin inquiries endpoint
            headers = {
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            }
            
            response = requests.get(f"{API_BASE}/admin/inquiries", headers=headers, timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                # Check response structure
                if not isinstance(data, dict) or 'inquiries' not in data or 'total' not in data:
                    self.log_result("Admin Inquiries View", False, f"Invalid response structure: {data}")
                    return False
                
                inquiries_list = data['inquiries']
                total_count = data['total']
                
                if not isinstance(inquiries_list, list):
                    self.log_result("Admin Inquiries View", False, f"Inquiries should be a list, got {type(inquiries_list)}")
                    return False
                
                # Check if we have inquiries (should have at least the one we just submitted)
                if len(inquiries_list) == 0:
                    self.log_result("Admin Inquiries View", False, "No inquiries found in admin view")
                    return False
                
                # Check structure of inquiry data
                first_inquiry = inquiries_list[0]
                required_fields = ['id', 'parent_name', 'email', 'child_name', 'child_age', 'status', 'created_at']
                
                for field in required_fields:
                    if field not in first_inquiry:
                        self.log_result("Admin Inquiries View", False, f"Missing required field '{field}' in inquiry data")
                        return False
                
                # Check if status is "new" for new inquiries
                if first_inquiry.get('status') != 'new':
                    self.log_result("Admin Inquiries View", False, f"Expected status 'new', got '{first_inquiry.get('status')}'")
                    return False
                
                self.log_result("Admin Inquiries View", True, f"Admin inquiries view working correctly, found {len(inquiries_list)} inquiries with proper structure and 'new' status")
                return True
                
            else:
                self.log_result("Admin Inquiries View", False, f"HTTP {response.status_code}: {response.text}")
                return False
                
        except Exception as e:
            self.log_result("Admin Inquiries View", False, f"Request error: {str(e)}")
            return False
    
    def test_end_to_end_form_flow(self):
        """Test 5: End-to-End Form Flow - verify complete submission and admin visibility"""
        try:
            # Submit a new inquiry
            test_inquiry = {
                "parent_name": "Rajesh Kumar",
                "email": "rajesh.kumar@yahoo.com",
                "phone": "+91 8765432109",
                "child_name": "Kavya Kumar",
                "child_age": 9,
                "school_name": "Ryan International School",
                "message": "I'm interested in enrolling my daughter Kavya in the Sanjaya program. She's a bright child but sometimes lacks confidence when speaking in class. I believe having a caring observer to talk to would help her express herself better."
            }
            
            # Step 1: Submit form
            submit_response = requests.post(
                f"{API_BASE}/inquiries",
                json=test_inquiry,
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if submit_response.status_code != 200:
                self.log_result("End-to-End Form Flow", False, f"Form submission failed: HTTP {submit_response.status_code}")
                return False
            
            submit_data = submit_response.json()
            inquiry_id = submit_data.get('inquiry_id')
            
            if not inquiry_id:
                self.log_result("End-to-End Form Flow", False, "No inquiry_id returned from submission")
                return False
            
            # Step 2: Login as admin
            login_response = requests.post(
                f"{API_BASE}/admin/login",
                json={"username": "admin", "password": "admin123"},
                headers={"Content-Type": "application/json"},
                timeout=10
            )
            
            if login_response.status_code != 200:
                self.log_result("End-to-End Form Flow", False, f"Admin login failed: HTTP {login_response.status_code}")
                return False
            
            token = login_response.json().get('access_token')
            
            # Step 3: Check if inquiry appears in admin dashboard
            headers = {"Authorization": f"Bearer {token}"}
            admin_response = requests.get(f"{API_BASE}/admin/inquiries", headers=headers, timeout=10)
            
            if admin_response.status_code != 200:
                self.log_result("End-to-End Form Flow", False, f"Admin inquiries fetch failed: HTTP {admin_response.status_code}")
                return False
            
            admin_data = admin_response.json()
            inquiries = admin_data.get('inquiries', [])
            
            # Step 4: Verify our inquiry is in the list
            found_inquiry = None
            for inquiry in inquiries:
                if inquiry.get('id') == inquiry_id:
                    found_inquiry = inquiry
                    break
            
            if not found_inquiry:
                self.log_result("End-to-End Form Flow", False, f"Submitted inquiry with ID {inquiry_id} not found in admin dashboard")
                return False
            
            # Step 5: Verify inquiry data matches what we submitted
            if found_inquiry.get('parent_name') != test_inquiry['parent_name']:
                self.log_result("End-to-End Form Flow", False, f"Parent name mismatch: expected '{test_inquiry['parent_name']}', got '{found_inquiry.get('parent_name')}'")
                return False
            
            if found_inquiry.get('email') != test_inquiry['email']:
                self.log_result("End-to-End Form Flow", False, f"Email mismatch: expected '{test_inquiry['email']}', got '{found_inquiry.get('email')}'")
                return False
            
            if found_inquiry.get('child_name') != test_inquiry['child_name']:
                self.log_result("End-to-End Form Flow", False, f"Child name mismatch: expected '{test_inquiry['child_name']}', got '{found_inquiry.get('child_name')}'")
                return False
            
            self.log_result("End-to-End Form Flow", True, f"Complete end-to-end flow working correctly: form submission → database storage → admin dashboard visibility with matching data")
            return True
            
        except Exception as e:
            self.log_result("End-to-End Form Flow", False, f"Request error: {str(e)}")
            return False
    
    def test_form_validation(self):
        """Test 6: Form Validation - verify validation prevents invalid submissions"""
        try:
            # Test case 1: Missing required fields
            invalid_cases = [
                {
                    "name": "Missing parent_name",
                    "data": {
                        "email": "test@example.com",
                        "phone": "+91 1234567890",
                        "child_name": "Test Child",
                        "child_age": 10
                    }
                },
                {
                    "name": "Missing email",
                    "data": {
                        "parent_name": "Test Parent",
                        "phone": "+91 1234567890",
                        "child_name": "Test Child",
                        "child_age": 10
                    }
                },
                {
                    "name": "Missing child_name",
                    "data": {
                        "parent_name": "Test Parent",
                        "email": "test@example.com",
                        "phone": "+91 1234567890",
                        "child_age": 10
                    }
                }
            ]
            
            validation_passed = 0
            total_validations = len(invalid_cases)
            
            for case in invalid_cases:
                try:
                    response = requests.post(
                        f"{API_BASE}/inquiries",
                        json=case["data"],
                        headers={"Content-Type": "application/json"},
                        timeout=10
                    )
                    
                    # Should return 422 for validation errors
                    if response.status_code == 422:
                        validation_passed += 1
                        print(f"   ✅ {case['name']}: Correctly rejected with HTTP 422")
                    elif response.status_code == 400:
                        validation_passed += 1
                        print(f"   ✅ {case['name']}: Correctly rejected with HTTP 400")
                    else:
                        print(f"   ❌ {case['name']}: Expected HTTP 422/400, got {response.status_code}")
                        
                except Exception as e:
                    print(f"   ❌ {case['name']}: Request error: {str(e)}")
            
            if validation_passed == total_validations:
                self.log_result("Form Validation", True, f"All {total_validations} validation tests passed - required fields properly validated")
                return True
            else:
                self.log_result("Form Validation", False, f"Only {validation_passed}/{total_validations} validation tests passed")
                return False
                
        except Exception as e:
            self.log_result("Form Validation", False, f"General error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all dynamic pages and form submission tests"""
        print("=" * 80)
        print("DYNAMIC PAGES + FORM SUBMISSION SYSTEM TESTING")
        print("=" * 80)
        
        tests = [
            ("Test 1: Dynamic About Page", self.test_dynamic_about_page),
            ("Test 2: Dynamic FAQ Page", self.test_dynamic_faq_page),
            ("Test 3: Form Submission Backend", self.test_form_submission_backend),
            ("Test 4: Admin Inquiries View", self.test_admin_inquiries_view),
            ("Test 5: End-to-End Form Flow", self.test_end_to_end_form_flow),
            ("Test 6: Form Validation", self.test_form_validation)
        ]
        
        passed = 0
        total = len(tests)
        
        for test_name, test_func in tests:
            print(f"\n--- {test_name} ---")
            try:
                if test_func():
                    passed += 1
            except Exception as e:
                print(f"❌ FAIL: {test_name} - Unexpected error: {str(e)}")
        
        print("\n" + "=" * 80)
        print("DYNAMIC PAGES + FORM SUBMISSION TEST SUMMARY")
        print("=" * 80)
        print(f"Total Tests: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("🎉 ALL DYNAMIC PAGES + FORM SUBMISSION TESTS PASSED!")
            print("\n✅ Expected Results Achieved:")
            print("✅ About page loads dynamic content from backend")
            print("✅ FAQ page loads dynamic content from backend")
            print("✅ POST /api/inquiries stores data successfully")
            print("✅ Admin can view all inquiries")
            print("✅ End-to-end form submission works")
            print("✅ Form validation prevents invalid submissions")
        else:
            print("⚠️  SOME TESTS FAILED - Check details above")
        
        return passed == total

if __name__ == "__main__":
    tester = DynamicPagesTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)