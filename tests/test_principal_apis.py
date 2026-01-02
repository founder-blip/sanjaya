"""
Principal Platform API Tests
Tests for: Student-Observer Assignment, Observer Performance, Parent Consultations
"""
import pytest
import requests
import os
from datetime import datetime, timedelta

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestPrincipalAuth:
    """Principal authentication tests"""
    
    def test_principal_login_success(self):
        """Test principal login with valid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/principal/login",
            params={"email": "principal@greenwood.edu", "password": "principal123"}
        )
        assert response.status_code == 200, f"Login failed: {response.text}"
        
        data = response.json()
        assert "access_token" in data, "No access_token in response"
        assert "principal" in data, "No principal info in response"
        assert data["principal"]["email"] == "principal@greenwood.edu"
        assert data["principal"]["role"] == "principal"
        print(f"✓ Principal login successful: {data['principal']['name']}")
        return data["access_token"]
    
    def test_principal_login_invalid_credentials(self):
        """Test principal login with invalid credentials"""
        response = requests.post(
            f"{BASE_URL}/api/principal/login",
            params={"email": "wrong@email.com", "password": "wrongpass"}
        )
        assert response.status_code == 401, f"Expected 401, got {response.status_code}"
        print("✓ Invalid credentials correctly rejected")


class TestPrincipalDashboard:
    """Principal dashboard tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(
            f"{BASE_URL}/api/principal/login",
            params={"email": "principal@greenwood.edu", "password": "principal123"}
        )
        self.token = response.json().get("access_token")
    
    def test_get_dashboard(self):
        """Test principal dashboard endpoint"""
        response = requests.get(
            f"{BASE_URL}/api/principal/dashboard",
            params={"token": self.token}
        )
        assert response.status_code == 200, f"Dashboard failed: {response.text}"
        
        data = response.json()
        assert "principal" in data
        assert "school" in data
        assert "statistics" in data
        assert "children" in data
        assert "observers" in data
        
        stats = data["statistics"]
        assert "total_students" in stats
        assert "active_students" in stats
        assert "total_observers" in stats
        print(f"✓ Dashboard loaded: {data['school']} - {stats['total_students']} students")


class TestStudentObserverAssignment:
    """Student-Observer Assignment API tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(
            f"{BASE_URL}/api/principal/login",
            params={"email": "principal@greenwood.edu", "password": "principal123"}
        )
        self.token = response.json().get("access_token")
    
    def test_get_all_students(self):
        """Test getting all students in school"""
        response = requests.get(
            f"{BASE_URL}/api/principal/students",
            params={"token": self.token}
        )
        assert response.status_code == 200, f"Get students failed: {response.text}"
        
        data = response.json()
        assert "students" in data
        assert isinstance(data["students"], list)
        print(f"✓ Got {len(data['students'])} students")
        return data["students"]
    
    def test_get_unassigned_students(self):
        """Test getting unassigned students"""
        response = requests.get(
            f"{BASE_URL}/api/principal/students/unassigned",
            params={"token": self.token}
        )
        assert response.status_code == 200, f"Get unassigned failed: {response.text}"
        
        data = response.json()
        assert "unassigned_students" in data
        assert "total" in data
        print(f"✓ Got {data['total']} unassigned students")
        return data["unassigned_students"]
    
    def test_get_available_observers(self):
        """Test getting available observers for assignment"""
        response = requests.get(
            f"{BASE_URL}/api/principal/available-observers",
            params={"token": self.token}
        )
        assert response.status_code == 200, f"Get observers failed: {response.text}"
        
        data = response.json()
        assert "observers" in data
        assert "total" in data
        
        # Check observer has capacity info
        if data["observers"]:
            observer = data["observers"][0]
            assert "current_students" in observer
            assert "capacity" in observer
            assert "available_slots" in observer
        
        print(f"✓ Got {data['total']} available observers")
        return data["observers"]
    
    def test_assign_and_unassign_student(self):
        """Test assigning and unassigning a student to an observer"""
        # Get unassigned students
        students_resp = requests.get(
            f"{BASE_URL}/api/principal/students/unassigned",
            params={"token": self.token}
        )
        unassigned = students_resp.json().get("unassigned_students", [])
        
        # Get available observers
        observers_resp = requests.get(
            f"{BASE_URL}/api/principal/available-observers",
            params={"token": self.token}
        )
        observers = observers_resp.json().get("observers", [])
        
        if not unassigned:
            # Get all students and find one to test with
            all_students_resp = requests.get(
                f"{BASE_URL}/api/principal/students",
                params={"token": self.token}
            )
            all_students = all_students_resp.json().get("students", [])
            if all_students and observers:
                # Find an assigned student to unassign first
                assigned_student = next((s for s in all_students if s.get("observer_id")), None)
                if assigned_student:
                    # Unassign first
                    unassign_resp = requests.post(
                        f"{BASE_URL}/api/principal/students/{assigned_student['id']}/unassign-observer",
                        params={"token": self.token}
                    )
                    assert unassign_resp.status_code == 200, f"Unassign failed: {unassign_resp.text}"
                    print(f"✓ Unassigned student: {assigned_student.get('name')}")
                    
                    # Now assign to an observer
                    assign_resp = requests.post(
                        f"{BASE_URL}/api/principal/students/{assigned_student['id']}/assign-observer",
                        params={"token": self.token, "observer_id": observers[0]["id"]}
                    )
                    assert assign_resp.status_code == 200, f"Assign failed: {assign_resp.text}"
                    
                    data = assign_resp.json()
                    assert data["success"] == True
                    print(f"✓ Assigned {data['student']['name']} to {data['observer']['name']}")
                    return
            
            print("⚠ No students available for assignment test - skipping")
            pytest.skip("No students available for assignment test")
        else:
            # Assign an unassigned student
            if observers:
                student = unassigned[0]
                observer = observers[0]
                
                assign_resp = requests.post(
                    f"{BASE_URL}/api/principal/students/{student['id']}/assign-observer",
                    params={"token": self.token, "observer_id": observer["id"]}
                )
                assert assign_resp.status_code == 200, f"Assign failed: {assign_resp.text}"
                
                data = assign_resp.json()
                assert data["success"] == True
                print(f"✓ Assigned {data['student']['name']} to {data['observer']['name']}")
                
                # Now unassign
                unassign_resp = requests.post(
                    f"{BASE_URL}/api/principal/students/{student['id']}/unassign-observer",
                    params={"token": self.token}
                )
                assert unassign_resp.status_code == 200, f"Unassign failed: {unassign_resp.text}"
                print(f"✓ Unassigned student: {student.get('name')}")


class TestObserverPerformance:
    """Observer Performance API tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(
            f"{BASE_URL}/api/principal/login",
            params={"email": "principal@greenwood.edu", "password": "principal123"}
        )
        self.token = response.json().get("access_token")
    
    def test_get_observer_performance(self):
        """Test getting observer performance metrics"""
        response = requests.get(
            f"{BASE_URL}/api/principal/observer-performance",
            params={"token": self.token}
        )
        assert response.status_code == 200, f"Performance failed: {response.text}"
        
        data = response.json()
        assert "observer_performance" in data
        assert "total_observers" in data
        assert "summary" in data
        
        summary = data["summary"]
        assert "excellent" in summary
        assert "good" in summary
        assert "needs_attention" in summary
        
        # Check performance data structure
        if data["observer_performance"]:
            perf = data["observer_performance"][0]
            assert "observer" in perf
            assert "metrics" in perf
            assert "status" in perf
            
            metrics = perf["metrics"]
            assert "assigned_students" in metrics
            assert "sessions_last_30_days" in metrics
            assert "consistency_score" in metrics
        
        print(f"✓ Got performance for {data['total_observers']} observers")
        print(f"  Summary: {summary['excellent']} excellent, {summary['good']} good, {summary['needs_attention']} needs attention")
        return data
    
    def test_get_observer_details(self):
        """Test getting detailed observer information"""
        # First get observers
        perf_resp = requests.get(
            f"{BASE_URL}/api/principal/observer-performance",
            params={"token": self.token}
        )
        perf_data = perf_resp.json()
        
        if not perf_data.get("observer_performance"):
            print("⚠ No observers found - skipping details test")
            pytest.skip("No observers available")
        
        observer_id = perf_data["observer_performance"][0]["observer"]["id"]
        
        response = requests.get(
            f"{BASE_URL}/api/principal/observer/{observer_id}/details",
            params={"token": self.token}
        )
        assert response.status_code == 200, f"Observer details failed: {response.text}"
        
        data = response.json()
        assert "observer" in data
        assert "assigned_students" in data
        assert "statistics" in data
        
        print(f"✓ Got details for observer: {data['observer'].get('name')}")
        print(f"  Students: {data['statistics'].get('total_students')}, Active: {data['statistics'].get('active_students')}")


class TestParentConsultations:
    """Parent Consultations API tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(
            f"{BASE_URL}/api/principal/login",
            params={"email": "principal@greenwood.edu", "password": "principal123"}
        )
        self.token = response.json().get("access_token")
    
    def test_get_consultations(self):
        """Test getting all consultations"""
        response = requests.get(
            f"{BASE_URL}/api/principal/consultations",
            params={"token": self.token}
        )
        assert response.status_code == 200, f"Get consultations failed: {response.text}"
        
        data = response.json()
        assert "consultations" in data
        assert "total" in data
        assert "status_counts" in data
        
        counts = data["status_counts"]
        assert "scheduled" in counts
        assert "completed" in counts
        assert "cancelled" in counts
        
        print(f"✓ Got {data['total']} consultations")
        print(f"  Status: {counts['scheduled']} scheduled, {counts['completed']} completed")
        return data
    
    def test_get_consultation_requests(self):
        """Test getting consultation requests from parents"""
        response = requests.get(
            f"{BASE_URL}/api/principal/consultation-requests",
            params={"token": self.token}
        )
        assert response.status_code == 200, f"Get requests failed: {response.text}"
        
        data = response.json()
        assert "requests" in data
        assert "total" in data
        
        print(f"✓ Got {data['total']} consultation requests")
        return data
    
    def test_create_consultation(self):
        """Test creating a new consultation"""
        # Get students to find parent info
        students_resp = requests.get(
            f"{BASE_URL}/api/principal/students",
            params={"token": self.token}
        )
        students = students_resp.json().get("students", [])
        
        if not students:
            print("⚠ No students found - skipping consultation creation test")
            pytest.skip("No students available")
        
        # Find a student with parent_ids
        student_with_parent = next((s for s in students if s.get("parent_ids")), None)
        
        if not student_with_parent:
            print("⚠ No students with parents found - skipping consultation creation test")
            pytest.skip("No students with parents available")
        
        # Create consultation
        tomorrow = (datetime.now() + timedelta(days=1)).strftime("%Y-%m-%d")
        
        response = requests.post(
            f"{BASE_URL}/api/principal/consultations",
            params={
                "token": self.token,
                "parent_id": student_with_parent["parent_ids"][0],
                "child_id": student_with_parent["id"],
                "scheduled_date": tomorrow,
                "scheduled_time": "10:00",
                "consultation_type": "progress_review",
                "notes": "TEST_Consultation - Progress review meeting"
            }
        )
        assert response.status_code == 200, f"Create consultation failed: {response.text}"
        
        data = response.json()
        assert data["success"] == True
        assert "consultation" in data
        
        consultation_id = data["consultation"]["id"]
        print(f"✓ Created consultation: {consultation_id}")
        
        # Update consultation
        update_resp = requests.put(
            f"{BASE_URL}/api/principal/consultations/{consultation_id}",
            params={
                "token": self.token,
                "notes": "Updated notes for test"
            }
        )
        assert update_resp.status_code == 200, f"Update failed: {update_resp.text}"
        print(f"✓ Updated consultation")
        
        # Cancel consultation (cleanup)
        cancel_resp = requests.delete(
            f"{BASE_URL}/api/principal/consultations/{consultation_id}",
            params={"token": self.token, "reason": "Test cleanup"}
        )
        assert cancel_resp.status_code == 200, f"Cancel failed: {cancel_resp.text}"
        print(f"✓ Cancelled consultation (cleanup)")


class TestPrincipalAnalytics:
    """Principal Analytics API tests"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Get auth token before each test"""
        response = requests.post(
            f"{BASE_URL}/api/principal/login",
            params={"email": "principal@greenwood.edu", "password": "principal123"}
        )
        self.token = response.json().get("access_token")
    
    def test_get_analytics(self):
        """Test getting school analytics"""
        response = requests.get(
            f"{BASE_URL}/api/principal/analytics",
            params={"token": self.token}
        )
        assert response.status_code == 200, f"Analytics failed: {response.text}"
        
        data = response.json()
        assert "school" in data
        assert "engagement" in data
        assert "goals" in data
        assert "mood_insights" in data
        assert "demographics" in data
        
        print(f"✓ Got analytics for: {data['school']}")
        print(f"  Students: {data['demographics'].get('total_students')}")
        print(f"  Attendance rate: {data['engagement'].get('attendance_rate')}%")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
