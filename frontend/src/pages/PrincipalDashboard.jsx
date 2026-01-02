import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { LogOut, Users, TrendingUp, Calendar, BarChart3, PartyPopper, Wallet, HelpCircle, UserPlus, Activity, MessageSquare, Play, FileText, IndianRupee } from 'lucide-react';
import PrincipalNav from '../components/PrincipalNav';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PrincipalDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('principal_token');
    if (!token) {
      navigate('/principal/login');
      return;
    }
    loadDashboard();
  }, [navigate]);

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem('principal_token');
      const response = await axios.get(
        `${BACKEND_URL}/api/principal/dashboard?token=${token}`
      );
      setData(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('principal_token');
        navigate('/principal/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('principal_token');
    localStorage.removeItem('principal_user');
    navigate('/principal/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const { principal, school, statistics, children, observers } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome, {principal.name}</h1>
              <p className="text-blue-100 mt-1">{school}</p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-4 gap-4 mt-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-white" />
                  <div>
                    <p className="text-2xl font-bold">{statistics.total_students}</p>
                    <p className="text-sm text-blue-100">Total Students</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-white" />
                  <div>
                    <p className="text-2xl font-bold">{statistics.active_students}</p>
                    <p className="text-sm text-blue-100">Active Students</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Users className="w-8 h-8 text-white" />
                  <div>
                    <p className="text-2xl font-bold">{statistics.total_observers}</p>
                    <p className="text-sm text-blue-100">Observers</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-white" />
                  <div>
                    <p className="text-2xl font-bold">{statistics.appointments_this_month}</p>
                    <p className="text-sm text-blue-100">Sessions This Month</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Primary Actions - Supervisor Functions */}
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Supervisor Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
          <Button
            onClick={() => navigate('/principal/recordings')}
            className="h-16 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
            data-testid="recordings-btn"
          >
            <Play className="w-5 h-5 mr-2" />
            Recordings
          </Button>
          <Button
            onClick={() => navigate('/principal/daily-reports')}
            className="h-16 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
            data-testid="daily-reports-btn"
          >
            <FileText className="w-5 h-5 mr-2" />
            Daily Reports
          </Button>
          <Button
            onClick={() => navigate('/principal/observer-performance')}
            className="h-16 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
            data-testid="observer-performance-btn"
          >
            <Activity className="w-5 h-5 mr-2" />
            Performance
          </Button>
          <Button
            onClick={() => navigate('/principal/consultations')}
            className="h-16 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
            data-testid="consultations-btn"
          >
            <MessageSquare className="w-5 h-5 mr-2" />
            Consultations
          </Button>
          <Button
            onClick={() => navigate('/principal/business')}
            className="h-16 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
            data-testid="business-btn"
          >
            <IndianRupee className="w-5 h-5 mr-2" />
            Business
          </Button>
          <Button
            onClick={() => navigate('/principal/student-assignment')}
            className="h-16 bg-gradient-to-r from-green-500 to-teal-500 hover:from-green-600 hover:to-teal-600 text-white"
            data-testid="assign-students-btn"
          >
            <UserPlus className="w-5 h-5 mr-2" />
            Assign
          </Button>
        </div>
        
        {/* Secondary Actions */}
        <h3 className="text-lg font-semibold text-gray-700 mb-3">Quick Links</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
          <Button
            onClick={() => navigate('/principal/students')}
            className="h-12 bg-white hover:bg-gray-50 text-gray-900 border-2"
          >
            <Users className="w-4 h-4 mr-2" />
            Students
          </Button>
          <Button
            onClick={() => navigate('/principal/analytics')}
            className="h-12 bg-white hover:bg-gray-50 text-gray-900 border-2"
          >
            <BarChart3 className="w-4 h-4 mr-2" />
            Analytics
          </Button>
          <Button
            onClick={() => navigate('/principal/events')}
            className="h-12 bg-gradient-to-r from-orange-500 to-pink-500 hover:from-orange-600 hover:to-pink-600 text-white"
          >
            <PartyPopper className="w-4 h-4 mr-2" />
            Events
          </Button>
          <Button
            onClick={() => navigate('/principal/earnings')}
            className="h-12 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Earnings
          </Button>
          <Button
            onClick={() => navigate('/principal/support')}
            className="h-12 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Support
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Recent Students */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Recent Students</h3>
              {children.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No students yet</p>
              ) : (
                <div className="space-y-3">
                  {children.map((child) => (
                    <div key={child.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-semibold">{child.name}</p>
                        <p className="text-sm text-gray-600">Age {child.age} • {child.grade}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        child.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100'
                      }`}>
                        {child.status}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Observers */}
          <Card>
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-4">Program Observers</h3>
              {observers.length === 0 ? (
                <p className="text-gray-500 text-center py-8">No observers assigned</p>
              ) : (
                <div className="space-y-3">
                  {observers.map((observer) => (
                    <div key={observer.id} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-semibold">{observer.name}</p>
                      <p className="text-sm text-gray-600">{observer.title}</p>
                      <p className="text-xs text-gray-500 mt-1">{observer.email}</p>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrincipalDashboard;