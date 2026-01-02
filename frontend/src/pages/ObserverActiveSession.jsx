import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { 
  Clock, User, CheckCircle, AlertTriangle, Play, Pause,
  FileText, Mic, MicOff, Save
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import ObserverNav from '../components/ObserverNav';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ObserverActiveSession = () => {
  const navigate = useNavigate();
  const { sessionId } = useParams();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [showEndForm, setShowEndForm] = useState(false);
  const [endData, setEndData] = useState({
    session_notes: '',
    mood_observed: '',
    engagement_level: '',
    key_observations: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('observer_token');
    if (!token) {
      navigate('/observer/login');
      return;
    }
    fetchSession();
  }, [navigate, sessionId]);

  useEffect(() => {
    // Timer
    const timer = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const fetchSession = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('observer_token');
      const response = await axios.get(`${BACKEND_URL}/api/observer/sessions?token=${token}`);
      const currentSession = response.data.sessions.find(s => s.id === sessionId);
      if (currentSession) {
        setSession(currentSession);
        // Calculate elapsed time if session already started
        if (currentSession.started_at) {
          const start = new Date(currentSession.started_at);
          const now = new Date();
          setElapsedTime(Math.floor((now - start) / 1000));
        }
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      toast({ title: "Error", description: "Failed to load session", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const endSession = async () => {
    if (!endData.mood_observed || !endData.engagement_level) {
      toast({ title: "Required", description: "Please fill mood and engagement level", variant: "destructive" });
      return;
    }
    
    try {
      const token = localStorage.getItem('observer_token');
      const params = new URLSearchParams({
        token,
        duration_minutes: Math.ceil(elapsedTime / 60),
        ...endData
      });
      
      await axios.post(`${BACKEND_URL}/api/observer/session/${sessionId}/end?${params}`);
      toast({ title: "Session Ended", description: "Now submit your daily report" });
      navigate(`/observer/report/${session.child_id}?session_id=${sessionId}`);
    } catch (error) {
      toast({ title: "Error", description: "Failed to end session", variant: "destructive" });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ObserverNav />
        <div className="max-w-4xl mx-auto px-4 py-12 text-center">
          <p className="text-gray-500">Session not found</p>
          <Button onClick={() => navigate('/observer/today')} className="mt-4">
            Back to Schedule
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <ObserverNav />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Session Header */}
        <Card className="border-0 shadow-sm bg-gradient-to-r from-purple-500 to-indigo-600 text-white mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">Active Session</p>
                <h1 className="text-2xl font-bold">{session.child_name}</h1>
                <p className="text-purple-100">Session ID: {sessionId}</p>
              </div>
              <div className="text-center">
                <p className="text-5xl font-mono font-bold">{formatTime(elapsedTime)}</p>
                <p className="text-purple-100 text-sm">Duration</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          <Button 
            variant={isRecording ? "default" : "outline"}
            className={`h-20 ${isRecording ? 'bg-red-500 hover:bg-red-600' : ''}`}
            onClick={() => setIsRecording(!isRecording)}
          >
            {isRecording ? (
              <>
                <MicOff className="w-6 h-6 mr-2" />
                Stop Recording
              </>
            ) : (
              <>
                <Mic className="w-6 h-6 mr-2" />
                Start Recording
              </>
            )}
          </Button>
          
          <Button 
            className="h-20 bg-amber-500 hover:bg-amber-600"
            onClick={() => navigate(`/observer/escalation/${session.child_id}?session_id=${sessionId}`)}
          >
            <AlertTriangle className="w-6 h-6 mr-2" />
            Report Concern
          </Button>
        </div>

        {/* Session Notes */}
        <Card className="border-0 shadow-sm mb-6">
          <CardHeader>
            <CardTitle>Quick Notes</CardTitle>
            <CardDescription>Jot down observations during the session</CardDescription>
          </CardHeader>
          <CardContent>
            <textarea 
              className="w-full border rounded-md p-3 min-h-[150px]"
              placeholder="Type your observations here..."
              value={endData.session_notes}
              onChange={(e) => setEndData({...endData, session_notes: e.target.value})}
            />
          </CardContent>
        </Card>

        {/* End Session Button */}
        <Button 
          className="w-full h-14 bg-red-500 hover:bg-red-600 text-lg"
          onClick={() => setShowEndForm(true)}
        >
          <CheckCircle className="w-6 h-6 mr-2" />
          End Session
        </Button>
      </div>

      {/* End Session Modal */}
      {showEndForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-md max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>End Session</CardTitle>
              <CardDescription>
                Duration: {Math.ceil(elapsedTime / 60)} minutes with {session.child_name}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Child's Mood *</label>
                <select 
                  className="w-full border rounded-md p-2 mt-1"
                  value={endData.mood_observed}
                  onChange={(e) => setEndData({...endData, mood_observed: e.target.value})}
                >
                  <option value="">Select mood...</option>
                  <option value="happy">Happy / Cheerful</option>
                  <option value="calm">Calm / Relaxed</option>
                  <option value="neutral">Neutral</option>
                  <option value="tired">Tired</option>
                  <option value="anxious">Anxious / Worried</option>
                  <option value="upset">Upset / Sad</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Engagement Level *</label>
                <select 
                  className="w-full border rounded-md p-2 mt-1"
                  value={endData.engagement_level}
                  onChange={(e) => setEndData({...endData, engagement_level: e.target.value})}
                >
                  <option value="">Select level...</option>
                  <option value="high">High - Very engaged and responsive</option>
                  <option value="medium">Medium - Moderately engaged</option>
                  <option value="low">Low - Distracted or unresponsive</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Key Observations</label>
                <textarea 
                  className="w-full border rounded-md p-2 mt-1"
                  rows={3}
                  placeholder="What stood out during this session?"
                  value={endData.key_observations}
                  onChange={(e) => setEndData({...endData, key_observations: e.target.value})}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  className="flex-1 bg-green-500 hover:bg-green-600"
                  onClick={endSession}
                >
                  <Save className="w-4 h-4 mr-2" /> Save & Continue to Report
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowEndForm(false)}
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

export default ObserverActiveSession;
