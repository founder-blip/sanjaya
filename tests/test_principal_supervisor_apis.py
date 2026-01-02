"""
Test Principal Supervisor APIs - Session Recordings, Daily Reports, Business, Payments
Tests the new supervisor features for Principal role
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Test credentials
PRINCIPAL_EMAIL = "principal@greenwood.edu"
PRINCIPAL_PASSWORD = "principal123"
ADMIN_USERNAME = "admin"
ADMIN_PASSWORD = "admin123"


class TestPrincipalLogin:
    """Test Principal authentication"""
    
    def test_principal_login_success(self):
        """Test principal login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/principal/login",
            params={"email": PRINCIPAL_EMAIL, "password": PRINCIPAL_PASSWORD}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        data = response.json()
        assert "access_token" in data
        assert "principal" in data
        assert data["principal"]["email"] == PRINCIPAL_EMAIL
        print(f"✓ Principal login successful, token received")
        return data["access_token"]
    
    def test_principal_login_invalid_credentials(self):
        """Test principal login with invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/principal/login",
            params={"email": "wrong@email.com", "password": "wrongpass"}
        )
        assert response.status_code == 401
        print(f"✓ Invalid credentials correctly rejected")


class TestPrincipalDashboard:
    """Test Principal Dashboard API"""
    
    @pytest.fixture
    def principal_token(self):
        """Get principal auth token"""
        response = requests.post(
            f"{BASE_URL}/api/principal/login",
            params={"email": PRINCIPAL_EMAIL, "password": PRINCIPAL_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Principal login failed")
    
    def test_dashboard_loads(self, principal_token):
        """Test dashboard API returns correct data structure"""
        response = requests.get(
            f"{BASE_URL}/api/principal/dashboard",
            params={"token": principal_token}
        )
        assert response.status_code == 200, f"Dashboard failed: {response.text}"
        data = response.json()
        
        # Verify data structure
        assert "principal" in data
        assert "school" in data
        assert "statistics" in data
        assert "children" in data
        assert "observers" in data
        
        # Verify statistics structure
        stats = data["statistics"]
        assert "total_students" in stats
        assert "active_students" in stats
        assert "total_observers" in stats
        assert "appointments_this_month" in stats
        
        print(f"✓ Dashboard loaded: {stats['total_students']} students, {stats['total_observers']} observers")


class TestSessionRecordingsAPI:
    """Test Session Recordings Review API"""
    
    @pytest.fixture
    def principal_token(self):
        """Get principal auth token"""
        response = requests.post(
            f"{BASE_URL}/api/principal/login",
            params={"email": PRINCIPAL_EMAIL, "password": PRINCIPAL_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Principal login failed")
    
    def test_get_session_recordings(self, principal_token):
        """Test fetching session recordings"""
        response = requests.get(
            f"{BASE_URL}/api/principal/session-recordings",
            params={"token": principal_token}
        )
        assert response.status_code == 200, f"Session recordings failed: {response.text}"
        data = response.json()
        
        # Verify data structure
        assert "recordings" in data
        assert "total" in data
        assert "status_counts" in data
        
        # Verify status counts structure
        status_counts = data["status_counts"]
        assert "pending_review" in status_counts
        assert "reviewed" in status_counts
        assert "flagged" in status_counts
        assert "approved" in status_counts
        
        print(f"✓ Session recordings API working: {data['total']} recordings, status_counts: {status_counts}")
    
    def test_get_session_recordings_with_filter(self, principal_token):
        """Test fetching session recordings with status filter"""
        response = requests.get(
            f"{BASE_URL}/api/principal/session-recordings",
            params={"token": principal_token, "status": "pending_review"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "recordings" in data
        print(f"✓ Session recordings filter working: {len(data['recordings'])} pending_review recordings")


class TestDailyReportsAPI:
    """Test Daily Reports Review API"""
    
    @pytest.fixture
    def principal_token(self):
        """Get principal auth token"""
        response = requests.post(
            f"{BASE_URL}/api/principal/login",
            params={"email": PRINCIPAL_EMAIL, "password": PRINCIPAL_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Principal login failed")
    
    def test_get_daily_reports(self, principal_token):
        """Test fetching daily reports"""
        response = requests.get(
            f"{BASE_URL}/api/principal/daily-reports",
            params={"token": principal_token}
        )
        assert response.status_code == 200, f"Daily reports failed: {response.text}"
        data = response.json()
        
        # Verify data structure
        assert "reports" in data
        assert "total" in data
        assert "status_counts" in data
        assert "ai_insights" in data
        
        # Verify status counts structure
        status_counts = data["status_counts"]
        assert "pending_review" in status_counts
        assert "reviewed" in status_counts
        assert "flagged" in status_counts
        assert "approved" in status_counts
        
        print(f"✓ Daily reports API working: {data['total']} reports, {len(data['ai_insights'])} AI insights")
    
    def test_get_daily_reports_with_filter(self, principal_token):
        """Test fetching daily reports with status filter"""
        response = requests.get(
            f"{BASE_URL}/api/principal/daily-reports",
            params={"token": principal_token, "status": "pending_review"}
        )
        assert response.status_code == 200
        data = response.json()
        assert "reports" in data
        print(f"✓ Daily reports filter working: {len(data['reports'])} pending_review reports")


class TestBusinessSummaryAPI:
    """Test Business Summary API"""
    
    @pytest.fixture
    def principal_token(self):
        """Get principal auth token"""
        response = requests.post(
            f"{BASE_URL}/api/principal/login",
            params={"email": PRINCIPAL_EMAIL, "password": PRINCIPAL_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Principal login failed")
    
    def test_get_business_summary(self, principal_token):
        """Test fetching business summary"""
        response = requests.get(
            f"{BASE_URL}/api/principal/business-summary",
            params={"token": principal_token}
        )
        assert response.status_code == 200, f"Business summary failed: {response.text}"
        data = response.json()
        
        # Verify data structure
        assert "principal" in data
        assert "business_metrics" in data
        assert "team" in data
        
        # Verify principal info
        principal = data["principal"]
        assert "name" in principal
        assert "school" in principal
        assert "consultation_rate" in principal
        
        # Verify business metrics
        metrics = data["business_metrics"]
        assert "total_children" in metrics
        assert "premium_children" in metrics
        assert "standard_children" in metrics
        assert "total_monthly_revenue" in metrics
        assert "sessions_this_month" in metrics
        
        # Verify team info
        team = data["team"]
        assert "total_observers" in team
        assert "observers" in team
        
        print(f"✓ Business summary API working: {metrics['total_children']} children, {team['total_observers']} observers, ₹{metrics['total_monthly_revenue']} revenue")


class TestObserverPaymentsAPI:
    """Test Observer Payments API"""
    
    @pytest.fixture
    def principal_token(self):
        """Get principal auth token"""
        response = requests.post(
            f"{BASE_URL}/api/principal/login",
            params={"email": PRINCIPAL_EMAIL, "password": PRINCIPAL_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Principal login failed")
    
    def test_get_observer_payments(self, principal_token):
        """Test fetching observer payments"""
        response = requests.get(
            f"{BASE_URL}/api/principal/observer-payments",
            params={"token": principal_token}
        )
        assert response.status_code == 200, f"Observer payments failed: {response.text}"
        data = response.json()
        
        # Verify data structure
        assert "month" in data
        assert "observer_payments" in data
        assert "summary" in data
        
        # Verify summary structure
        summary = data["summary"]
        assert "total_observers" in summary
        assert "total_sessions" in summary
        assert "total_earnings" in summary
        assert "total_paid" in summary
        assert "total_pending" in summary
        
        print(f"✓ Observer payments API working: {summary['total_observers']} observers, {summary['total_sessions']} sessions, ₹{summary['total_earnings']} total earnings")
    
    def test_get_observer_payments_with_month(self, principal_token):
        """Test fetching observer payments for specific month"""
        response = requests.get(
            f"{BASE_URL}/api/principal/observer-payments",
            params={"token": principal_token, "month": "2025-01"}
        )
        assert response.status_code == 200
        data = response.json()
        assert data["month"] == "2025-01"
        print(f"✓ Observer payments month filter working")


class TestPrincipalEarningsAPI:
    """Test Principal's Own Earnings API"""
    
    @pytest.fixture
    def principal_token(self):
        """Get principal auth token"""
        response = requests.post(
            f"{BASE_URL}/api/principal/login",
            params={"email": PRINCIPAL_EMAIL, "password": PRINCIPAL_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Principal login failed")
    
    def test_get_my_earnings(self, principal_token):
        """Test fetching principal's own earnings"""
        response = requests.get(
            f"{BASE_URL}/api/principal/my-earnings",
            params={"token": principal_token}
        )
        assert response.status_code == 200, f"My earnings failed: {response.text}"
        data = response.json()
        
        # Verify data structure
        assert "principal" in data
        assert "earnings" in data
        assert "payments" in data
        assert "monthly_breakdown" in data
        
        # Verify principal info
        principal = data["principal"]
        assert "name" in principal
        assert "consultation_rate" in principal
        
        # Verify earnings structure
        earnings = data["earnings"]
        assert "total_consultations" in earnings
        assert "total_earnings" in earnings
        assert "total_paid" in earnings
        assert "pending" in earnings
        
        print(f"✓ My earnings API working: {earnings['total_consultations']} consultations, ₹{earnings['total_earnings']} total earnings")


class TestAdminPayRatesAPI:
    """Test Admin Pay Rates API"""
    
    @pytest.fixture
    def admin_token(self):
        """Get admin auth token"""
        response = requests.post(
            f"{BASE_URL}/api/admin/login",
            json={"username": ADMIN_USERNAME, "password": ADMIN_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Admin login failed")
    
    def test_get_pay_rates(self, admin_token):
        """Test fetching pay rates"""
        response = requests.get(
            f"{BASE_URL}/api/admin/pay-rates",
            headers={"Authorization": f"Bearer {admin_token}"}
        )
        assert response.status_code == 200, f"Pay rates failed: {response.text}"
        data = response.json()
        
        # Verify data structure
        assert "default_rates" in data
        assert "observer_rates" in data
        assert "principal_rates" in data
        
        # Verify default rates
        default_rates = data["default_rates"]
        assert "observer_session_rate" in default_rates
        assert "principal_consultation_rate" in default_rates
        
        print(f"✓ Pay rates API working: {len(data['observer_rates'])} observers, {len(data['principal_rates'])} principals")


class TestExistingPrincipalAPIs:
    """Test existing Principal APIs still work"""
    
    @pytest.fixture
    def principal_token(self):
        """Get principal auth token"""
        response = requests.post(
            f"{BASE_URL}/api/principal/login",
            params={"email": PRINCIPAL_EMAIL, "password": PRINCIPAL_PASSWORD}
        )
        if response.status_code == 200:
            return response.json()["access_token"]
        pytest.skip("Principal login failed")
    
    def test_get_students(self, principal_token):
        """Test fetching students"""
        response = requests.get(
            f"{BASE_URL}/api/principal/students",
            params={"token": principal_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "students" in data
        print(f"✓ Students API working: {len(data['students'])} students")
    
    def test_get_observers(self, principal_token):
        """Test fetching observers"""
        response = requests.get(
            f"{BASE_URL}/api/principal/observers",
            params={"token": principal_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "observers" in data
        print(f"✓ Observers API working: {len(data['observers'])} observers")
    
    def test_get_analytics(self, principal_token):
        """Test fetching analytics"""
        response = requests.get(
            f"{BASE_URL}/api/principal/analytics",
            params={"token": principal_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "engagement" in data
        assert "goals" in data
        print(f"✓ Analytics API working")
    
    def test_get_consultations(self, principal_token):
        """Test fetching consultations"""
        response = requests.get(
            f"{BASE_URL}/api/principal/consultations",
            params={"token": principal_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "consultations" in data
        assert "status_counts" in data
        print(f"✓ Consultations API working: {len(data['consultations'])} consultations")
    
    def test_get_observer_performance(self, principal_token):
        """Test fetching observer performance"""
        response = requests.get(
            f"{BASE_URL}/api/principal/observer-performance",
            params={"token": principal_token}
        )
        assert response.status_code == 200
        data = response.json()
        assert "observer_performance" in data
        assert "summary" in data
        print(f"✓ Observer performance API working: {len(data['observer_performance'])} observers")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
