import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { LogOut, User, Calendar, TrendingUp, Smile, Target, Sparkles, Brain, FileText } from 'lucide-react';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ObserverDashboard = () => {
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('observer_token');
    if (!token) {
      navigate('/observer/login');
      return;
    }
    loadDashboard();
  }, [navigate]);

  const loadDashboard = async () => {
    try {
      const token = localStorage.getItem('observer_token');
      const response = await axios.get(
        `${BACKEND_URL}/api/observer/dashboard?token=${token}`
      );
      setData(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('observer_token');
        navigate('/observer/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('observer_token');
    localStorage.removeItem('observer_user');
    navigate('/observer/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!data) return null;

  const { observer, children, statistics } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Welcome, {observer.name}</h1>
              <p className="text-purple-100 mt-1">{observer.title}</p>
            </div>
            <Button onClick={handleLogout} variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-3 gap-4 mt-6">
            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <User className="w-8 h-8 text-white" />
                  <div>
                    <p className="text-2xl font-bold">{statistics.total_children}</p>
                    <p className="text-sm text-purple-100">Assigned Children</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <TrendingUp className="w-8 h-8 text-white" />
                  <div>
                    <p className="text-2xl font-bold">{statistics.active_children}</p>
                    <p className="text-sm text-purple-100">Active Children</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-8 h-8 text-white" />
                  <div>
                    <p className="text-2xl font-bold">{statistics.sessions_this_week}</p>
                    <p className="text-sm text-purple-100">Sessions This Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h2 className="text-2xl font-bold mb-4">My Assigned Children</h2>
        
        {children.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No children assigned yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {children.map((child) => (
              <Card key={child.id} className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate(`/observer/child/${child.id}`)}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-lg">{child.name}</h3>
                      <p className="text-sm text-gray-600">Age {child.age} • {child.grade}</p>
                      <p className="text-xs text-gray-500 mt-1">{child.school}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      child.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}>
                      {child.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/observer/mood-entry/${child.id}`);
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Smile className="w-4 h-4 mr-2" />
                      Log Mood
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/observer/goal-create/${child.id}`);
                      }}
                      variant="outline"
                      size="sm"
                      className="w-full"
                    >
                      <Target className="w-4 h-4 mr-2" />
                      Add Goal
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/observer/sessions/${child.id}`);
                      }}
                      size="sm"
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
                    >
                      <Brain className="w-4 h-4 mr-2" />
                      AI Sessions
                    </Button>
                    <Button
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/observer/ai-report/${child.id}`);
                      }}
                      size="sm"
                      variant="outline"
                      className="w-full border-purple-300 text-purple-600 hover:bg-purple-50"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Reports
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ObserverDashboard;