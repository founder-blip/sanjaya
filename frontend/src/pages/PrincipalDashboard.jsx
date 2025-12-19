import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { LogOut, Users, TrendingUp, Calendar, BarChart3, PartyPopper } from 'lucide-react';
import Navigation from '../components/Navigation';

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
        {/* Quick Actions */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          <Button
            onClick={() => navigate('/principal/students')}
            className="h-16 bg-white hover:bg-gray-50 text-gray-900 border-2"
          >
            <Users className="w-5 h-5 mr-2" />
            View All Students
          </Button>
          <Button
            onClick={() => navigate('/principal/observers')}
            className="h-16 bg-white hover:bg-gray-50 text-gray-900 border-2"
          >
            <Users className="w-5 h-5 mr-2" />
            View All Observers
          </Button>
          <Button
            onClick={() => navigate('/principal/analytics')}
            className="h-16 bg-white hover:bg-gray-50 text-gray-900 border-2"
          >
            <BarChart3 className="w-5 h-5 mr-2" />
            Analytics
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