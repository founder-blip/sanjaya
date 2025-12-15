import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { LogOut, Calendar, TrendingUp, Clock, User, Heart } from 'lucide-react';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ParentDashboard = () => {
  const navigate = useNavigate();
  const [dashboard Data, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedChild, setSelectedChild] = useState(null);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('parent_token')}` }
  });

  useEffect(() => {
    const token = localStorage.getItem('parent_token');
    if (!token) {
      navigate('/parent/login');
      return;
    }
    loadDashboard();
  }, [navigate]);

  const loadDashboard = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/parent/dashboard`,
        getAuthHeaders()
      );
      setDashboardData(response.data);
      if (response.data.children.length > 0) {
        setSelectedChild(response.data.children[0]);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('parent_token');
        navigate('/parent/login');
      }
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('parent_token');
    localStorage.removeItem('parent_user');
    navigate('/parent/login');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { parent, children, summary } = dashboardData;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, {parent.name}!</h1>
              <p className="text-blue-100">Here's your child's progress overview</p>
            </div>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="bg-white/10 hover:bg-white/20 text-white border-white/30"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Logout
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Total Children</p>
                    <p className="text-3xl font-bold mt-1">{summary.total_children}</p>
                  </div>
                  <User className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Active Children</p>
                    <p className="text-3xl font-bold mt-1">{summary.active_children}</p>
                  </div>
                  <Heart className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Sessions This Month</p>
                    <p className="text-3xl font-bold mt-1">{summary.total_sessions_this_month}</p>
                  </div>
                  <Clock className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur border-white/20">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100 text-sm">Upcoming</p>
                    <p className="text-3xl font-bold mt-1">{summary.upcoming_appointments}</p>
                  </div>
                  <Calendar className="w-8 h-8 text-blue-200" />
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Children Selector */}
      <div className="max-w-7xl mx-auto px-4 -mt-6 mb-6">
        <div className="flex gap-4">
          {children.map((child) => (
            <Card
              key={child.id}
              onClick={() => setSelectedChild(child)}
              className={`cursor-pointer transition-all ${
                selectedChild?.id === child.id
                  ? 'ring-2 ring-blue-500 shadow-lg'
                  : 'hover:shadow-md'
              }`}
            >
              <CardContent className="p-4">
                <h3 className="font-bold text-lg">{child.name}</h3>
                <p className="text-sm text-gray-600">Age {child.age} • {child.grade}</p>
                <p className="text-xs text-gray-500 mt-1">{child.school}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Main Content */}
      {selectedChild && (
        <div className="max-w-7xl mx-auto px-4 pb-12">
          <div className="grid md:grid-cols-3 gap-6">
            {/* Progress Overview */}
            <Card className="md:col-span-2">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Progress Overview
                </h2>
                
                {selectedChild.progress_metrics && selectedChild.progress_metrics.length > 0 ? (
                  <div className="space-y-4">
                    {['emotional_regulation', 'confidence', 'communication', 'social_skills'].map((metric) => {
                      const latestMetric = selectedChild.progress_metrics.find(
                        (m) => m.metric_type === metric
                      );
                      return latestMetric ? (
                        <div key={metric}>
                          <div className="flex justify-between mb-2">
                            <span className="text-sm font-medium capitalize">
                              {metric.replace('_', ' ')}
                            </span>
                            <span className="text-sm text-gray-600">
                              {latestMetric.score}/10
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-500 h-2 rounded-full transition-all"
                              style={{ width: `${latestMetric.score * 10}%` }}
                            ></div>
                          </div>
                        </div>
                      ) : null;
                    })}
                  </div>
                ) : (
                  <p className="text-gray-500">No progress data yet</p>
                )}
              </CardContent>
            </Card>

            {/* Upcoming Appointments */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  Upcoming Sessions
                </h2>
                
                {selectedChild.upcoming_appointments && selectedChild.upcoming_appointments.length > 0 ? (
                  <div className="space-y-3">
                    {selectedChild.upcoming_appointments.map((appt) => (
                      <div key={appt.id} className="border-l-4 border-blue-500 pl-3 py-2">
                        <p className="font-medium">
                          {new Date(appt.scheduled_time).toLocaleDateString()}
                        </p>
                        <p className="text-sm text-gray-600">
                          {new Date(appt.scheduled_time).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No upcoming sessions</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Sessions */}
            <Card className="md:col-span-3">
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4">Recent Session Notes</h2>
                
                {selectedChild.recent_sessions && selectedChild.recent_sessions.length > 0 ? (
                  <div className="space-y-4">
                    {selectedChild.recent_sessions.slice(0, 5).map((session) => (
                      <Card key={session.id} className="border-l-4 border-orange-400">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className="font-semibold">
                                {new Date(session.session_date).toLocaleDateString('en-US', {
                                  weekday: 'long',
                                  year: 'numeric',
                                  month: 'long',
                                  day: 'numeric'
                                })}
                              </p>
                              <div className="flex gap-2 mt-1">
                                {session.topics_discussed && session.topics_discussed.map((topic, i) => (
                                  <span key={i} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                    {topic}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className="text-sm text-gray-600">Mood:</span>
                              <span className="text-lg">
                                {session.mood_rating >= 4 ? '😊' : session.mood_rating >= 3 ? '😐' : '😔'}
                              </span>
                            </div>
                          </div>
                          
                          <p className="text-gray-700 mt-2">{session.key_observations}</p>
                          
                          {session.recommended_activities && session.recommended_activities.length > 0 && (
                            <div className="mt-3 p-3 bg-green-50 rounded-lg">
                              <p className="text-sm font-semibold text-green-800 mb-1">
                                Recommended Activities:
                              </p>
                              <ul className="text-sm text-green-700 space-y-1">
                                {session.recommended_activities.map((activity, i) => (
                                  <li key={i}>• {activity}</li>
                                ))}
                              </ul>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500">No session notes yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default ParentDashboard;
