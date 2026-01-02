import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { 
  Calendar, Clock, User, CheckCircle, AlertCircle, Play,
  FileText, RefreshCw, ChevronRight
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import ObserverNav from '../components/ObserverNav';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ObserverToday = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [schedule, setSchedule] = useState(null);
  const [selectedChild, setSelectedChild] = useState(null);
  const [showReadinessForm, setShowReadinessForm] = useState(false);
  const [readinessData, setReadinessData] = useState({
    environment_ready: true,
    materials_ready: true,
    personal_state: 'good',
    distractions_minimized: true,
    notes: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('observer_token');
    if (!token) {
      navigate('/observer/login');
      return;
    }
    fetchSchedule();
  }, [navigate]);

  const fetchSchedule = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('observer_token');
      const response = await axios.get(`${BACKEND_URL}/api/observer/today-schedule?token=${token}`);
      setSchedule(response.data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      toast({ title: "Error", description: "Failed to load schedule", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const startReadinessCheck = (child) => {
    setSelectedChild(child);
    setShowReadinessForm(true);
    setReadinessData({
      environment_ready: true,
      materials_ready: true,
      personal_state: 'good',
      distractions_minimized: true,
      notes: ''
    });
  };

  const submitReadinessCheck = async () => {
    try {
      const token = localStorage.getItem('observer_token');
      const params = new URLSearchParams({
        token,
        child_id: selectedChild.id,
        ...readinessData
      });
      
      const response = await axios.post(`${BACKEND_URL}/api/observer/readiness-check?${params}`);
      
      if (response.data.can_start_session) {
        toast({ title: "Ready!", description: "Session started. Good luck!" });
        navigate(`/observer/session/${response.data.session_id}`);
      } else {
        toast({ 
          title: "Not Ready", 
          description: "Please ensure all readiness criteria are met", 
          variant: "destructive" 
        });
      }
      
      setShowReadinessForm(false);
      fetchSchedule();
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit readiness check", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ObserverNav />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Today's Schedule</h1>
            <p className="text-gray-600">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <Button variant="outline" onClick={fetchSchedule}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <Card className="border-0 shadow-sm bg-blue-50">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-blue-700">{schedule?.total_children || 0}</p>
              <p className="text-sm text-blue-600">Children</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-green-50">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-green-700">{schedule?.sessions_completed || 0}</p>
              <p className="text-sm text-green-600">Completed</p>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-sm bg-amber-50">
            <CardContent className="p-4 text-center">
              <p className="text-3xl font-bold text-amber-700">{schedule?.sessions_pending || 0}</p>
              <p className="text-sm text-amber-600">Pending</p>
            </CardContent>
          </Card>
        </div>

        {/* Schedule List */}
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>Sessions</CardTitle>
            <CardDescription>Click on a child to start or continue their session</CardDescription>
          </CardHeader>
          <CardContent>
            {schedule?.schedule?.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No children assigned</p>
            ) : (
              <div className="space-y-3">
                {schedule?.schedule?.map((item, idx) => (
                  <div 
                    key={item.child.id}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      item.session_status === 'completed' 
                        ? 'border-green-200 bg-green-50' 
                        : item.session_status === 'in_progress'
                          ? 'border-blue-200 bg-blue-50'
                          : 'border-gray-100 bg-white hover:border-purple-200 cursor-pointer'
                    }`}
                    onClick={() => item.session_status === 'pending' && startReadinessCheck(item.child)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${
                          item.session_status === 'completed' 
                            ? 'bg-green-500' 
                            : item.session_status === 'in_progress'
                              ? 'bg-blue-500'
                              : 'bg-purple-500'
                        }`}>
                          {idx + 1}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{item.child.name}</p>
                          <p className="text-sm text-gray-600">
                            Age {item.child.age} • {item.child.grade}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        {item.session_status === 'completed' ? (
                          <div className="flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-green-600">Completed</span>
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/observer/report/${item.child.id}`);
                              }}
                            >
                              <FileText className="w-4 h-4 mr-1" /> Report
                            </Button>
                          </div>
                        ) : item.session_status === 'in_progress' ? (
                          <div className="flex items-center gap-2">
                            <Clock className="w-5 h-5 text-blue-600 animate-pulse" />
                            <span className="text-sm font-medium text-blue-600">In Progress</span>
                            <Button 
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate(`/observer/session/${item.session.id}`);
                              }}
                            >
                              Continue
                            </Button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-500">Tap to start</span>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Readiness Check Modal */}
      {showReadinessForm && selectedChild && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Pre-Session Readiness Check</CardTitle>
              <CardDescription>Session with {selectedChild.name}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={readinessData.environment_ready}
                    onChange={(e) => setReadinessData({...readinessData, environment_ready: e.target.checked})}
                    className="w-5 h-5 rounded"
                  />
                  <div>
                    <p className="font-medium">Environment Ready</p>
                    <p className="text-sm text-gray-500">Quiet, private space prepared</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={readinessData.materials_ready}
                    onChange={(e) => setReadinessData({...readinessData, materials_ready: e.target.checked})}
                    className="w-5 h-5 rounded"
                  />
                  <div>
                    <p className="font-medium">Materials Ready</p>
                    <p className="text-sm text-gray-500">Notes, activities prepared</p>
                  </div>
                </label>
                
                <label className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={readinessData.distractions_minimized}
                    onChange={(e) => setReadinessData({...readinessData, distractions_minimized: e.target.checked})}
                    className="w-5 h-5 rounded"
                  />
                  <div>
                    <p className="font-medium">Distractions Minimized</p>
                    <p className="text-sm text-gray-500">Phone on silent, notifications off</p>
                  </div>
                </label>
                
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="font-medium mb-2">Your Current State</p>
                  <select 
                    className="w-full border rounded-md p-2"
                    value={readinessData.personal_state}
                    onChange={(e) => setReadinessData({...readinessData, personal_state: e.target.value})}
                  >
                    <option value="good">Feeling Good & Focused</option>
                    <option value="neutral">Neutral</option>
                    <option value="tired">A Bit Tired</option>
                    <option value="stressed">Stressed</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Notes (optional)</label>
                  <textarea 
                    className="w-full border rounded-md p-2 mt-1"
                    rows={2}
                    placeholder="Any notes before starting..."
                    value={readinessData.notes}
                    onChange={(e) => setReadinessData({...readinessData, notes: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  className="flex-1 bg-purple-500 hover:bg-purple-600"
                  onClick={submitReadinessCheck}
                  disabled={!readinessData.environment_ready || !readinessData.materials_ready || !readinessData.distractions_minimized}
                >
                  <Play className="w-4 h-4 mr-2" /> Start Session
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowReadinessForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ObserverToday;
