#!/usr/bin/env python3
"""
Frontend Navigation Testing Script for Sanjaya Application
Tests navigation links and page accessibility.
"""

import requests
import sys
from datetime import datetime

# Get frontend URL from .env
def get_frontend_url():
    try:
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    backend_url = line.split('=', 1)[1].strip()
                    # Convert backend URL to frontend URL (remove /api suffix if present)
                    frontend_url = backend_url.replace('/api', '')
                    return frontend_url
    except Exception as e:
        print(f"Error reading frontend .env: {e}")
        return None

FRONTEND_URL = get_frontend_url()
if not FRONTEND_URL:
    print("ERROR: Could not get frontend URL from .env")
    sys.exit(1)

print(f"Testing frontend at: {FRONTEND_URL}")

class FrontendTester:
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
    
    def test_navigation_pages(self):
        """Test that all navigation pages are accessible"""
        try:
            pages = [
                ("/", "Home Page"),
                ("/about", "About Page"),
                ("/how-it-works", "How It Works Page"),
                ("/faq", "FAQ Page"),
                ("/observer", "Observer Landing Page"),
                ("/principal", "Principal Landing Page")
            ]
            
            all_passed = True
            
            for path, name in pages:
                try:
                    response = requests.get(f"{FRONTEND_URL}{path}", timeout=10)
                    
                    if response.status_code == 200:
                        # Check if it's actually HTML content
                        content_type = response.headers.get('content-type', '')
                        if 'text/html' in content_type:
                            self.log_result(f"Navigation - {name}", True, f"Page accessible and returns HTML content")
                        else:
                            self.log_result(f"Navigation - {name}", False, f"Page accessible but wrong content type: {content_type}")
                            all_passed = False
                    else:
                        self.log_result(f"Navigation - {name}", False, f"HTTP {response.status_code}")
                        all_passed = False
                        
                except Exception as e:
                    self.log_result(f"Navigation - {name}", False, f"Request error: {str(e)}")
                    all_passed = False
            
            return all_passed
            
        except Exception as e:
            self.log_result("Navigation Pages", False, f"Test error: {str(e)}")
            return False
    
    def test_admin_pages(self):
        """Test admin pages accessibility"""
        try:
            admin_pages = [
                ("/admin/login", "Admin Login Page")
            ]
            
            all_passed = True
            
            for path, name in admin_pages:
                try:
                    response = requests.get(f"{FRONTEND_URL}{path}", timeout=10)
                    
                    if response.status_code == 200:
                        content_type = response.headers.get('content-type', '')
                        if 'text/html' in content_type:
                            self.log_result(f"Admin - {name}", True, f"Page accessible and returns HTML content")
                        else:
                            self.log_result(f"Admin - {name}", False, f"Page accessible but wrong content type: {content_type}")
                            all_passed = False
                    else:
                        self.log_result(f"Admin - {name}", False, f"HTTP {response.status_code}")
                        all_passed = False
                        
                except Exception as e:
                    self.log_result(f"Admin - {name}", False, f"Request error: {str(e)}")
                    all_passed = False
            
            return all_passed
            
        except Exception as e:
            self.log_result("Admin Pages", False, f"Test error: {str(e)}")
            return False
    
    def run_all_tests(self):
        """Run all frontend tests"""
        print("=" * 60)
        print("STARTING FRONTEND NAVIGATION TESTS")
        print("=" * 60)
        
        tests = [
            self.test_navigation_pages,
            self.test_admin_pages
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
        print(f"Total Test Categories: {total}")
        print(f"Passed: {passed}")
        print(f"Failed: {total - passed}")
        print(f"Success Rate: {(passed/total)*100:.1f}%")
        
        if passed == total:
            print("🎉 ALL NAVIGATION TESTS PASSED!")
        else:
            print("⚠️  SOME TESTS FAILED - Check details above")
        
        return passed == total

if __name__ == "__main__":
    tester = FrontendTester()
    success = tester.run_all_tests()
    sys.exit(0 if success else 1)