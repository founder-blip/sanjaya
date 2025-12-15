import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Calendar, Clock, Users, Video, CheckCircle2, XCircle } from 'lucide-react';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const TOPIC_CONFIG = {
  managing_emotions: { icon: '💙', label: 'Managing Emotions', color: 'bg-blue-100 text-blue-700' },
  communication_skills: { icon: '💬', label: 'Communication Skills', color: 'bg-green-100 text-green-700' },
  parent_wellness: { icon: '🧘', label: 'Parent Wellness', color: 'bg-purple-100 text-purple-700' },
  building_confidence: { icon: '⭐', label: 'Building Confidence', color: 'bg-orange-100 text-orange-700' }
};

const ParentGroupSessions = () => {
  const navigate = useNavigate();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [registering, setRegistering] = useState(null);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('parent_token')}` }
  });

  useEffect(() => {
    const token = localStorage.getItem('parent_token');
    if (!token) {
      navigate('/parent/login');
      return;
    }
    loadSessions();
  }, [navigate]);

  const loadSessions = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/group-sessions`,
        getAuthHeaders()
      );
      setSessions(response.data.sessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const registerForSession = async (sessionId) => {
    setRegistering(sessionId);
    try {
      await axios.post(
        `${BACKEND_URL}/api/group-sessions/${sessionId}/register`,
        null,
        getAuthHeaders()
      );
      loadSessions(); // Refresh to update registration status
      alert('Successfully registered for the session!');
    } catch (error) {
      console.error('Error registering:', error);
      alert(error.response?.data?.detail || 'Failed to register. Please try again.');
    } finally {
      setRegistering(null);
    }
  };

  const cancelRegistration = async (sessionId) => {
    if (!confirm('Are you sure you want to cancel your registration?')) return;

    try {
      await axios.delete(
        `${BACKEND_URL}/api/group-sessions/${sessionId}/register`,
        getAuthHeaders()
      );
      loadSessions();
      alert('Registration cancelled successfully.');
    } catch (error) {
      console.error('Error cancelling:', error);
      alert('Failed to cancel registration.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <Button onClick={() => navigate('/parent/dashboard')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">Group Coaching Sessions</h1>
          </div>

          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <h2 className="font-bold text-lg mb-2">Welcome to Group Coaching</h2>
              <p className="text-gray-700 text-sm">
                Join our expert-led group sessions designed for parents. Connect with other parents, learn valuable skills, 
                and get support on your parenting journey. All sessions are held online via Zoom.
              </p>
            </CardContent>
          </Card>

          {/* Sessions Grid */}
          {sessions.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No upcoming sessions available</p>
                <p className="text-gray-400 text-sm mt-2">Check back soon for new coaching opportunities!</p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {sessions.map((session) => {
                const sessionDate = new Date(session.session_date);
                const spotsLeft = session.max_participants - session.current_participants;
                
                return (
                  <Card key={session.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      {/* Topic Badge */}
                      <div className="flex items-start justify-between mb-4">
                        <span className={`text-xs px-3 py-1 rounded-full ${TOPIC_CONFIG[session.topic]?.color || 'bg-gray-100 text-gray-700'}`}>
                          <span className="mr-1">{TOPIC_CONFIG[session.topic]?.icon}</span>
                          {TOPIC_CONFIG[session.topic]?.label || session.topic}
                        </span>
                        {session.is_registered && (
                          <span className="flex items-center text-xs font-semibold text-green-600">
                            <CheckCircle2 className="w-4 h-4 mr-1" />
                            Registered
                          </span>
                        )}
                      </div>

                      {/* Title & Description */}
                      <h3 className="font-bold text-xl mb-2">{session.title}</h3>
                      <p className="text-gray-600 text-sm mb-4">{session.description}</p>

                      {/* Facilitator */}
                      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                        <p className="font-semibold text-sm">{session.facilitator_name}</p>
                        <p className="text-xs text-gray-600">{session.facilitator_title}</p>
                      </div>

                      {/* Details Grid */}
                      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-700">
                            {sessionDate.toLocaleDateString('en-US', { 
                              month: 'short', 
                              day: 'numeric'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-700">
                            {sessionDate.toLocaleTimeString('en-US', { 
                              hour: 'numeric', 
                              minute: '2-digit'
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-700">
                            {spotsLeft} spots left
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Video className="w-4 h-4 text-blue-600" />
                          <span className="text-gray-700">
                            {session.duration_minutes} min
                          </span>
                        </div>
                      </div>

                      {/* Registration Button */}
                      {session.is_registered ? (
                        <div className="space-y-2">
                          <Button
                            onClick={() => window.open(session.meeting_link, '_blank')}
                            className="w-full bg-green-500 hover:bg-green-600"
                          >
                            <Video className="w-4 h-4 mr-2" />
                            Join Meeting
                          </Button>
                          <Button
                            onClick={() => cancelRegistration(session.id)}
                            variant="outline"
                            className="w-full text-red-600 hover:bg-red-50"
                          >
                            <XCircle className="w-4 h-4 mr-2" />
                            Cancel Registration
                          </Button>
                        </div>
                      ) : (
                        <Button
                          onClick={() => registerForSession(session.id)}
                          disabled={spotsLeft === 0 || registering === session.id}
                          className="w-full bg-blue-500 hover:bg-blue-600"
                        >
                          {registering === session.id ? (
                            'Registering...'
                          ) : spotsLeft === 0 ? (
                            'Session Full'
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4 mr-2" />
                              Register for Session
                            </>
                          )}
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentGroupSessions;
