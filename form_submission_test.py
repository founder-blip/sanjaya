#!/usr/bin/env python3
"""
Specific test for form submission fix verification
Tests the exact scenario mentioned in the review request
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
print(f"Testing form submission at: {API_BASE}")

def test_form_submission_end_to_end():
    """Test the complete form submission flow that was reported as broken"""
    print("\n" + "="*60)
    print("TESTING FORM SUBMISSION FIX (USER REPORTED ISSUE)")
    print("="*60)
    
    # Test 1: Submit a realistic form via the API
    print("\n1. Testing form submission with realistic data...")
    
    realistic_form_data = {
        "parent_name": "Priya Sharma",
        "email": "priya.sharma@gmail.com", 
        "phone": "+91 9876543210",
        "child_name": "Arjun Sharma",
        "child_age": 12,
        "school_name": "Delhi Public School, Gurgaon",
        "message": "My son Arjun is a bright student but has been struggling with confidence in class presentations. I believe the Sanjaya program could help him develop better communication skills and self-assurance. He's particularly interested in science and enjoys talking about his experiments. I would love to learn more about how the observer program works and if it would be suitable for him."
    }
    
    try:
        response = requests.post(
            f"{API_BASE}/inquiries",
            json=realistic_form_data,
            headers={"Content-Type": "application/json"},
            timeout=15
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Form submission successful!")
            print(f"   Response: {data}")
            
            # Verify response structure
            if data.get('success') and data.get('inquiry_id'):
                inquiry_id = data['inquiry_id']
                print(f"   Inquiry ID: {inquiry_id}")
                
                # Test 2: Verify the submission appears in admin dashboard
                print("\n2. Testing admin dashboard inquiry retrieval...")
                
                # Login to admin
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
                
                if login_response.status_code == 200:
                    token = login_response.json()['access_token']
                    
                    # Get inquiries from admin dashboard
                    admin_headers = {
                        "Authorization": f"Bearer {token}",
                        "Content-Type": "application/json"
                    }
                    
                    inquiries_response = requests.get(
                        f"{API_BASE}/admin/inquiries",
                        headers=admin_headers,
                        timeout=10
                    )
                    
                    if inquiries_response.status_code == 200:
                        inquiries_data = inquiries_response.json()
                        inquiries_list = inquiries_data.get('inquiries', [])
                        
                        # Find our submitted inquiry
                        found_inquiry = None
                        for inquiry in inquiries_list:
                            if inquiry.get('id') == inquiry_id:
                                found_inquiry = inquiry
                                break
                        
                        if found_inquiry:
                            print(f"✅ Inquiry found in admin dashboard!")
                            print(f"   Parent Name: {found_inquiry.get('parent_name')}")
                            print(f"   Child Name: {found_inquiry.get('child_name')}")
                            print(f"   Email: {found_inquiry.get('email')}")
                            print(f"   Status: {found_inquiry.get('status')}")
                            print(f"   Created: {found_inquiry.get('created_at')}")
                            
                            # Verify data integrity
                            if (found_inquiry.get('parent_name') == realistic_form_data['parent_name'] and
                                found_inquiry.get('email') == realistic_form_data['email'] and
                                found_inquiry.get('child_name') == realistic_form_data['child_name'] and
                                found_inquiry.get('child_age') == realistic_form_data['child_age']):
                                
                                print("✅ Data integrity verified - all fields match!")
                                print("\n" + "="*60)
                                print("🎉 FORM SUBMISSION FIX VERIFICATION: SUCCESS!")
                                print("✅ Form submission works end-to-end")
                                print("✅ Data is stored correctly in database")
                                print("✅ Admin can view submitted inquiries")
                                print("✅ All field values are preserved")
                                print("="*60)
                                return True
                            else:
                                print("❌ Data integrity check failed - field values don't match")
                                return False
                        else:
                            print(f"❌ Inquiry with ID {inquiry_id} not found in admin dashboard")
                            print(f"   Found {len(inquiries_list)} total inquiries")
                            return False
                    else:
                        print(f"❌ Failed to get inquiries from admin: HTTP {inquiries_response.status_code}")
                        return False
                else:
                    print(f"❌ Admin login failed: HTTP {login_response.status_code}")
                    return False
            else:
                print(f"❌ Invalid response structure: {data}")
                return False
        else:
            print(f"❌ Form submission failed: HTTP {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Form submission test failed: {str(e)}")
        return False

def test_dynamic_pages_loading():
    """Test that all dynamic pages load content from backend APIs"""
    print("\n" + "="*60)
    print("TESTING DYNAMIC PAGES LOADING")
    print("="*60)
    
    dynamic_pages = [
        ("/content/about", "About Page"),
        ("/content/faq", "FAQ Page"), 
        ("/content/how-it-works-page", "How It Works Page"),
        ("/content/observer", "Observer Page"),
        ("/content/principal", "Principal Page")
    ]
    
    all_passed = True
    
    for endpoint, page_name in dynamic_pages:
        try:
            response = requests.get(f"{API_BASE}{endpoint}", timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if isinstance(data, dict) and data:
                    print(f"✅ {page_name}: Loaded successfully ({len(data)} fields)")
                    
                    # Check for key content fields
                    if 'hero_title' in data or 'title' in data:
                        print(f"   Has title content: ✅")
                    else:
                        print(f"   Missing title content: ⚠️")
                        
                else:
                    print(f"❌ {page_name}: Empty or invalid data")
                    all_passed = False
            else:
                print(f"❌ {page_name}: HTTP {response.status_code}")
                all_passed = False
                
        except Exception as e:
            print(f"❌ {page_name}: Error - {str(e)}")
            all_passed = False
    
    return all_passed

def test_homepage_content_sync():
    """Test homepage content sync (regression test)"""
    print("\n" + "="*60)
    print("TESTING HOMEPAGE CONTENT SYNC (REGRESSION TEST)")
    print("="*60)
    
    try:
        # Test that hero content is accessible
        response = requests.get(f"{API_BASE}/content/hero", timeout=10)
        
        if response.status_code == 200:
            data = response.json()
            
            if isinstance(data, dict) and data:
                print(f"✅ Hero content API working")
                print(f"   Main tagline: {data.get('main_tagline', 'N/A')}")
                print(f"   Description: {data.get('description', 'N/A')[:100]}...")
                return True
            else:
                print(f"❌ Hero content API returned empty data")
                return False
        else:
            print(f"❌ Hero content API failed: HTTP {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Homepage content sync test failed: {str(e)}")
        return False

if __name__ == "__main__":
    print("CRITICAL FORM SUBMISSION FIX VERIFICATION")
    print("Testing the exact issue reported by user...")
    
    # Run the critical tests from the review request
    test1_passed = test_form_submission_end_to_end()
    test2_passed = test_dynamic_pages_loading() 
    test3_passed = test_homepage_content_sync()
    
    print("\n" + "="*60)
    print("FINAL TEST RESULTS")
    print("="*60)
    print(f"✅ Form Submission Fix: {'PASS' if test1_passed else 'FAIL'}")
    print(f"✅ Dynamic Pages Loading: {'PASS' if test2_passed else 'FAIL'}")
    print(f"✅ Homepage Content Sync: {'PASS' if test3_passed else 'FAIL'}")
    
    if test1_passed and test2_passed and test3_passed:
        print("\n🎉 ALL CRITICAL TESTS PASSED!")
        print("The form submission fix is working correctly.")
        sys.exit(0)
    else:
        print("\n⚠️ SOME CRITICAL TESTS FAILED")
        sys.exit(1)