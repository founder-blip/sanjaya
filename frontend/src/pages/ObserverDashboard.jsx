import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { User, Calendar, TrendingUp, Smile, Target, Sparkles, Brain, FileText, PartyPopper, Wallet, HelpCircle, Play, AlertTriangle } from 'lucide-react';
import ObserverNav from '../components/ObserverNav';

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
      <ObserverNav />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {observer.name}</h1>
            <p className="text-purple-100">{observer.title}</p>
          </div>

          {/* Statistics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <User className="w-8 h-8 text-white" />
                  <div>
                    <p className="text-2xl font-bold">{statistics.total_children}</p>
                    <p className="text-sm text-purple-100">Children</p>
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
                    <p className="text-sm text-purple-100">Active</p>
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
                    <p className="text-sm text-purple-100">This Week</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-white/10 border-white/20 backdrop-blur">
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <FileText className="w-8 h-8 text-white" />
                  <div>
                    <p className="text-2xl font-bold">0</p>
                    <p className="text-sm text-purple-100">Reports</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Primary Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <Button
            onClick={() => navigate('/observer/today')}
            className="h-16 bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 text-white"
          >
            <Play className="w-5 h-5 mr-2" />
            Start Sessions
          </Button>
          <Button
            onClick={() => navigate('/observer/reports')}
            className="h-16 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white"
          >
            <FileText className="w-5 h-5 mr-2" />
            My Reports
          </Button>
          <Button
            onClick={() => navigate('/observer/reflections')}
            className="h-16 bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white"
          >
            <Brain className="w-5 h-5 mr-2" />
            Self-Reflection
          </Button>
          <Button
            onClick={() => navigate('/observer/escalations')}
            className="h-16 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white"
          >
            <AlertTriangle className="w-5 h-5 mr-2" />
            Escalations
          </Button>
        </div>
        
        {/* Secondary Actions */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            onClick={() => navigate('/observer/events')}
            variant="outline"
            className="border-orange-300 text-orange-600 hover:bg-orange-50"
          >
            <PartyPopper className="w-4 h-4 mr-2" />
            Events
          </Button>
          <Button
            onClick={() => navigate('/observer/earnings')}
            variant="outline"
            className="border-green-300 text-green-600 hover:bg-green-50"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Earnings
          </Button>
          <Button
            onClick={() => navigate('/observer/support')}
            variant="outline"
            className="border-indigo-300 text-indigo-600 hover:bg-indigo-50"
          >
            <HelpCircle className="w-4 h-4 mr-2" />
            Support
          </Button>
        </div>

        <h2 className="text-xl font-bold mb-4">My Assigned Children</h2>
        
        {children.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 text-lg">No children assigned yet</p>
              <p className="text-gray-400">Ask your principal to assign children to you</p>
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