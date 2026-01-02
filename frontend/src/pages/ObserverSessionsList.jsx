import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { 
  Play, RefreshCw, CheckCircle, Clock, Calendar, User, Filter
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import ObserverNav from '../components/ObserverNav';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ObserverSessionsList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState([]);
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('observer_token');
    if (!token) {
      navigate('/observer/login');
      return;
    }
    fetchSessions();
  }, [navigate, filterStatus]);

  const fetchSessions = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('observer_token');
      let url = `${BACKEND_URL}/api/observer/sessions?token=${token}`;
      if (filterStatus !== 'all') {
        url += `&status=${filterStatus}`;
      }
      const response = await axios.get(url);
      setSessions(response.data.sessions || []);
    } catch (error) {
      console.error('Error fetching sessions:', error);
      toast({ title: "Error", description: "Failed to load sessions", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-700';
      case 'in_progress': return 'bg-blue-100 text-blue-700';
      default: return 'bg-gray-100 text-gray-700';
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
            <h1 className="text-2xl font-bold text-gray-900">My Sessions</h1>
            <p className="text-gray-600">History of all your sessions</p>
          </div>
          <div className="flex gap-2">
            <select 
              className="border rounded-md px-3 py-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Sessions</option>
              <option value="completed">Completed</option>
              <option value="in_progress">In Progress</option>
            </select>
            <Button variant="outline" onClick={fetchSessions}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {sessions.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <Play className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No sessions yet</p>
              <p className="text-gray-400">Start your first session from Today's Schedule</p>
              <Button 
                className="mt-4 bg-purple-500 hover:bg-purple-600"
                onClick={() => navigate('/observer/today')}
              >
                Go to Schedule
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {sessions.map(session => (
              <Card 
                key={session.id} 
                className={`border-0 shadow-sm hover:shadow-md transition-shadow cursor-pointer ${
                  session.status === 'in_progress' ? 'border-2 border-blue-300' : ''
                }`}
                onClick={() => {
                  if (session.status === 'in_progress') {
                    navigate(`/observer/session/${session.id}`);
                  }
                }}
              >
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        session.status === 'completed' ? 'bg-green-100' : 'bg-blue-100'
                      }`}>
                        {session.status === 'completed' ? (
                          <CheckCircle className="w-6 h-6 text-green-600" />
                        ) : (
                          <Clock className="w-6 h-6 text-blue-600 animate-pulse" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold">{session.child_name}</p>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(session.started_at || session.created_at).toLocaleDateString()}
                          </span>
                          {session.duration_minutes && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {session.duration_minutes} min
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      {session.mood_observed && (
                        <span className={`px-2 py-1 rounded text-xs ${
                          session.mood_observed === 'happy' ? 'bg-green-100 text-green-700' :
                          session.mood_observed === 'upset' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-700'
                        }`}>
                          {session.mood_observed}
                        </span>
                      )}
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(session.status)}`}>
                        {session.status === 'in_progress' ? 'In Progress' : 'Completed'}
                      </span>
                    </div>
                  </div>
                  
                  {session.key_observations && (
                    <p className="mt-3 text-sm text-gray-600 line-clamp-2">{session.key_observations}</p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ObserverSessionsList;
