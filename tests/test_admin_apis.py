"""
Admin Module API Tests
Tests for: Dashboard, Students, Users, Support, Billing, System Health, Safety, Incidents, Privacy, Audit Logs, AI Guardrails, Schools
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestAdminAuth:
    """Admin authentication tests"""
    
    def test_admin_login_success(self):
        """Test admin login with valid credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin",
            "password": "admin123"
        })
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data, "access_token not in response"
        assert "username" in data, "Username not in response"
        assert data["username"] == "admin"
        print(f"SUCCESS: Admin login - token received")
        return data["access_token"]
    
    def test_admin_login_invalid_credentials(self):
        """Test admin login with invalid credentials"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "wrong",
            "password": "wrong"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("SUCCESS: Invalid credentials rejected")
    
    def test_admin_login_missing_fields(self):
        """Test admin login with missing fields"""
        response = requests.post(f"{BASE_URL}/api/admin/login", json={
            "username": "admin"
        })
        assert response.status_code in [400, 422], f"Expected 400/422, got {response.status_code}"
        print("SUCCESS: Missing fields rejected")


@pytest.fixture(scope="module")
def auth_token():
    """Get authentication token for tests"""
    response = requests.post(f"{BASE_URL}/api/admin/login", json={
        "username": "admin",
        "password": "admin123"
    })
    if response.status_code == 200:
        return response.json().get("access_token")
    pytest.skip("Authentication failed - skipping authenticated tests")


@pytest.fixture
def auth_headers(auth_token):
    """Get auth headers"""
    return {"Authorization": f"Bearer {auth_token}"}


class TestDashboard:
    """Dashboard API tests"""
    
    def test_get_dashboard_stats(self, auth_headers):
        """Test dashboard stats endpoint"""
        response = requests.get(f"{BASE_URL}/api/admin/dashboard/stats", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "students" in data, "Missing students in response"
        assert "users" in data, "Missing users in response"
        assert "sessions" in data, "Missing sessions in response"
        assert "support" in data, "Missing support in response"
        
        # Verify nested structure
        assert "total" in data["students"], "Missing total in students"
        assert "total" in data["users"], "Missing total in users"
        print(f"SUCCESS: Dashboard stats - Students: {data['students']['total']}, Users: {data['users']['total']}")
    
    def test_dashboard_stats_unauthorized(self):
        """Test dashboard stats without auth"""
        response = requests.get(f"{BASE_URL}/api/admin/dashboard/stats")
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("SUCCESS: Unauthorized access rejected")


class TestStudentEnrollment:
    """Student enrollment API tests"""
    
    def test_get_students(self, auth_headers):
        """Test get all students"""
        response = requests.get(f"{BASE_URL}/api/admin/students", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "students" in data, "Missing students in response"
        assert isinstance(data["students"], list), "Students should be a list"
        print(f"SUCCESS: Get students - {len(data['students'])} students found")
    
    def test_enroll_student(self, auth_headers):
        """Test student enrollment"""
        params = {
            "name": "TEST_Student_John",
            "date_of_birth": "2015-05-15",
            "grade": "Grade 3",
            "school": "Test School",
            "parent_email": "test_parent@example.com",
            "parent_name": "Test Parent",
            "parent_phone": "1234567890"
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/students/enroll",
            params=params,
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data.get("success") == True, "Enrollment should succeed"
        print(f"SUCCESS: Student enrolled - ID: {data.get('student', {}).get('id', 'N/A')}")


class TestUserManagement:
    """User management API tests"""
    
    def test_get_principals(self, auth_headers):
        """Test get all principals"""
        response = requests.get(f"{BASE_URL}/api/admin/users/principals", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "principals" in data, "Missing principals in response"
        print(f"SUCCESS: Get principals - {len(data['principals'])} found")
    
    def test_get_observers(self, auth_headers):
        """Test get all observers"""
        response = requests.get(f"{BASE_URL}/api/admin/users/observers", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "observers" in data, "Missing observers in response"
        print(f"SUCCESS: Get observers - {len(data['observers'])} found")
    
    def test_get_parents(self, auth_headers):
        """Test get all parents"""
        response = requests.get(f"{BASE_URL}/api/admin/users/parents", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "parents" in data, "Missing parents in response"
        print(f"SUCCESS: Get parents - {len(data['parents'])} found")
    
    def test_create_principal(self, auth_headers):
        """Test create principal"""
        params = {
            "name": "TEST_Principal_Jane",
            "email": "test_principal@example.com",
            "phone": "9876543210",
            "school": "Test School",
            "password": "testpass123"
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/users/principal",
            params=params,
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data.get("success") == True, "Principal creation should succeed"
        print(f"SUCCESS: Principal created")
    
    def test_create_observer(self, auth_headers):
        """Test create observer"""
        params = {
            "name": "TEST_Observer_Bob",
            "email": "test_observer@example.com",
            "phone": "5555555555",
            "specialization": "Child Psychology",
            "password": "testpass123"
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/users/observer",
            params=params,
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data.get("success") == True, "Observer creation should succeed"
        print(f"SUCCESS: Observer created")


class TestSupportTickets:
    """Support ticket API tests"""
    
    def test_get_tickets(self, auth_headers):
        """Test get all support tickets"""
        response = requests.get(f"{BASE_URL}/api/admin/support/tickets", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "tickets" in data, "Missing tickets in response"
        assert "status_counts" in data, "Missing status_counts in response"
        print(f"SUCCESS: Get tickets - {len(data['tickets'])} tickets found")


class TestSystemHealth:
    """System health API tests"""
    
    def test_get_system_health(self, auth_headers):
        """Test system health endpoint"""
        response = requests.get(f"{BASE_URL}/api/admin/system/health", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        
        # Verify response structure
        assert "system" in data, "Missing system in response"
        assert "services" in data, "Missing services in response"
        assert "database" in data, "Missing database in response"
        
        # Verify system metrics
        assert "cpu_percent" in data["system"], "Missing cpu_percent"
        assert "memory_percent" in data["system"], "Missing memory_percent"
        assert "disk_percent" in data["system"], "Missing disk_percent"
        
        print(f"SUCCESS: System health - CPU: {data['system']['cpu_percent']}%, Memory: {data['system']['memory_percent']}%")
    
    def test_get_system_uptime(self, auth_headers):
        """Test system uptime endpoint"""
        response = requests.get(f"{BASE_URL}/api/admin/system/uptime", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "uptime_percent" in data, "Missing uptime_percent"
        print(f"SUCCESS: System uptime - {data['uptime_percent']}%")


class TestAIGuardrails:
    """AI Guardrails API tests"""
    
    def test_get_ai_guardrails(self, auth_headers):
        """Test get AI guardrails"""
        response = requests.get(f"{BASE_URL}/api/admin/ai/guardrails", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "guardrails" in data, "Missing guardrails in response"
        
        guardrails = data["guardrails"]
        assert "no_diagnosis" in guardrails, "Missing no_diagnosis setting"
        assert "no_medical_advice" in guardrails, "Missing no_medical_advice setting"
        print(f"SUCCESS: AI guardrails retrieved - no_diagnosis: {guardrails['no_diagnosis']}")
    
    def test_update_ai_guardrails(self, auth_headers):
        """Test update AI guardrails"""
        response = requests.put(
            f"{BASE_URL}/api/admin/ai/guardrails",
            params={"no_diagnosis": True, "confidence_threshold": 0.8},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data.get("success") == True, "Update should succeed"
        print("SUCCESS: AI guardrails updated")


class TestSafetyEscalation:
    """Safety & Escalation API tests"""
    
    def test_get_red_flags(self, auth_headers):
        """Test get red flags"""
        response = requests.get(f"{BASE_URL}/api/admin/safety/red-flags", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "flags" in data, "Missing flags in response"
        assert "status_counts" in data, "Missing status_counts in response"
        assert "categories" in data, "Missing categories in response"
        print(f"SUCCESS: Red flags - {len(data['flags'])} flags found")


class TestIncidents:
    """Incident management API tests"""
    
    def test_get_incidents(self, auth_headers):
        """Test get incidents"""
        response = requests.get(f"{BASE_URL}/api/admin/incidents", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "incidents" in data, "Missing incidents in response"
        assert "status_counts" in data, "Missing status_counts in response"
        print(f"SUCCESS: Incidents - {len(data['incidents'])} incidents found")
    
    def test_create_incident(self, auth_headers):
        """Test create incident"""
        params = {
            "title": "TEST_Incident_Safety_Concern",
            "description": "Test incident for safety concern",
            "incident_type": "safety",
            "severity": "medium"
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/incidents",
            params=params,
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data.get("success") == True, "Incident creation should succeed"
        assert "incident" in data, "Missing incident in response"
        print(f"SUCCESS: Incident created - Number: {data['incident'].get('number', 'N/A')}")


class TestDataPrivacy:
    """Data privacy API tests"""
    
    def test_get_privacy_settings(self, auth_headers):
        """Test get privacy settings"""
        response = requests.get(f"{BASE_URL}/api/admin/privacy/settings", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "settings" in data, "Missing settings in response"
        
        settings = data["settings"]
        assert "data_retention_days" in settings, "Missing data_retention_days"
        assert "gdpr_compliant" in settings, "Missing gdpr_compliant"
        print(f"SUCCESS: Privacy settings - Retention: {settings['data_retention_days']} days")
    
    def test_get_data_requests(self, auth_headers):
        """Test get data requests"""
        response = requests.get(f"{BASE_URL}/api/admin/privacy/data-requests", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "requests" in data, "Missing requests in response"
        print(f"SUCCESS: Data requests - {len(data['requests'])} requests found")


class TestAuditLogs:
    """Audit logs API tests"""
    
    def test_get_audit_logs(self, auth_headers):
        """Test get audit logs"""
        response = requests.get(f"{BASE_URL}/api/admin/audit/logs", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "logs" in data, "Missing logs in response"
        assert "action_types" in data, "Missing action_types in response"
        print(f"SUCCESS: Audit logs - {len(data['logs'])} logs found")
    
    def test_create_audit_log(self, auth_headers):
        """Test create audit log"""
        params = {
            "action_type": "user_action",
            "action": "test_action",
            "details": "Test audit log entry"
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/audit/log",
            params=params,
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data.get("success") == True, "Audit log creation should succeed"
        print("SUCCESS: Audit log created")


class TestSchools:
    """Schools management API tests"""
    
    def test_get_schools(self, auth_headers):
        """Test get all schools"""
        response = requests.get(f"{BASE_URL}/api/admin/schools", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "schools" in data, "Missing schools in response"
        print(f"SUCCESS: Schools - {len(data['schools'])} schools found")
    
    def test_create_school(self, auth_headers):
        """Test create school"""
        params = {
            "name": "TEST_School_Academy",
            "address": "123 Test Street",
            "city": "Test City",
            "contact_email": "test_school@example.com",
            "contact_phone": "1112223333",
            "program_type": "standard"
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/schools",
            params=params,
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data.get("success") == True, "School creation should succeed"
        print(f"SUCCESS: School created - Name: {data.get('school', {}).get('name', 'N/A')}")


class TestBilling:
    """Billing API tests"""
    
    def test_get_subscriptions(self, auth_headers):
        """Test get subscriptions"""
        response = requests.get(f"{BASE_URL}/api/admin/billing/subscriptions", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "subscriptions" in data, "Missing subscriptions in response"
        print(f"SUCCESS: Subscriptions - {len(data['subscriptions'])} found")
    
    def test_get_payments(self, auth_headers):
        """Test get payments"""
        response = requests.get(f"{BASE_URL}/api/admin/billing/payments", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "payments" in data, "Missing payments in response"
        print(f"SUCCESS: Payments - {len(data['payments'])} found")


class TestAISystem:
    """AI System API tests"""
    
    def test_get_ai_settings(self, auth_headers):
        """Test get AI settings"""
        response = requests.get(f"{BASE_URL}/api/admin/ai/settings", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "settings" in data, "Missing settings in response"
        
        settings = data["settings"]
        assert "behavioral_tags_enabled" in settings, "Missing behavioral_tags_enabled"
        print(f"SUCCESS: AI settings retrieved")
    
    def test_update_ai_settings(self, auth_headers):
        """Test update AI settings"""
        response = requests.put(
            f"{BASE_URL}/api/admin/ai/settings",
            params={"behavioral_tags_enabled": True},
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data.get("success") == True, "Update should succeed"
        print("SUCCESS: AI settings updated")


class TestAnalytics:
    """Analytics API tests"""
    
    def test_get_analytics_overview(self, auth_headers):
        """Test get analytics overview"""
        response = requests.get(f"{BASE_URL}/api/admin/analytics/overview", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "sessions" in data, "Missing sessions in response"
        assert "enrollments" in data, "Missing enrollments in response"
        print(f"SUCCESS: Analytics overview retrieved")


class TestHelpFAQs:
    """Help & FAQs API tests"""
    
    def test_get_faqs(self, auth_headers):
        """Test get FAQs"""
        response = requests.get(f"{BASE_URL}/api/admin/help/faqs", headers=auth_headers)
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert "faqs" in data, "Missing faqs in response"
        print(f"SUCCESS: FAQs - {len(data['faqs'])} found")
    
    def test_create_faq(self, auth_headers):
        """Test create FAQ"""
        params = {
            "question": "TEST_FAQ_Question?",
            "answer": "This is a test FAQ answer",
            "category": "General"
        }
        response = requests.post(
            f"{BASE_URL}/api/admin/help/faq",
            params=params,
            headers=auth_headers
        )
        assert response.status_code == 200, f"Failed: {response.text}"
        data = response.json()
        assert data.get("success") == True, "FAQ creation should succeed"
        print("SUCCESS: FAQ created")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
