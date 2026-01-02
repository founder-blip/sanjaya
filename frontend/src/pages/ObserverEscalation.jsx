import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { 
  AlertTriangle, Send, RefreshCw, CheckCircle, Clock,
  User, Calendar
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import ObserverNav from '../components/ObserverNav';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ObserverEscalation = () => {
  const navigate = useNavigate();
  const { childId } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState(null);
  const [escalations, setEscalations] = useState([]);
  const [showForm, setShowForm] = useState(!!childId);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    escalation_type: '',
    severity: '',
    description: '',
    observed_behaviors: '',
    immediate_actions_taken: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('observer_token');
    if (!token) {
      navigate('/observer/login');
      return;
    }
    fetchData();
  }, [navigate, childId]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('observer_token');
      
      // Fetch escalations
      const escalationsRes = await axios.get(`${BACKEND_URL}/api/observer/escalations?token=${token}`);
      setEscalations(escalationsRes.data.escalations || []);
      
      // Fetch child if childId provided
      if (childId) {
        const childRes = await axios.get(`${BACKEND_URL}/api/observer/child/${childId}?token=${token}`);
        setChild(childRes.data.child);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitEscalation = async () => {
    if (!formData.escalation_type || !formData.severity || !formData.description || !formData.observed_behaviors) {
      toast({ title: "Required", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('observer_token');
      const params = new URLSearchParams({
        token,
        child_id: childId,
        session_id: sessionId || '',
        ...formData
      });
      
      await axios.post(`${BACKEND_URL}/api/observer/escalation?${params}`);
      toast({ title: "Reported", description: "Your concern has been escalated to your principal" });
      navigate('/observer/escalations');
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit escalation", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-200';
      case 'low': return 'bg-blue-100 text-blue-700 border-blue-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'resolved': return 'bg-green-100 text-green-700';
      case 'open': return 'bg-red-100 text-red-700';
      case 'investigating': return 'bg-amber-100 text-amber-700';
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

  // If showing form for a specific child
  if (showForm && childId && child) {
    return (
      <div className="min-h-screen bg-gray-50">
        <ObserverNav />
        
        <div className="max-w-2xl mx-auto px-4 py-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">Report Concern</h1>
            <p className="text-gray-600">For {child.name}</p>
          </div>

          <Card className="border-2 border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-red-700">
                <AlertTriangle className="w-5 h-5" />
                Escalation Report
              </CardTitle>
              <CardDescription>Your concern will be sent to your principal for review</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Type of Concern *</label>
                <select 
                  className="w-full border rounded-md p-2 mt-1"
                  value={formData.escalation_type}
                  onChange={(e) => setFormData({...formData, escalation_type: e.target.value})}
                >
                  <option value="">Select type...</option>
                  <option value="behavioral">Behavioral Issue</option>
                  <option value="emotional">Emotional Distress</option>
                  <option value="safety">Safety Concern</option>
                  <option value="health">Health Related</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Severity *</label>
                <select 
                  className="w-full border rounded-md p-2 mt-1"
                  value={formData.severity}
                  onChange={(e) => setFormData({...formData, severity: e.target.value})}
                >
                  <option value="">Select severity...</option>
                  <option value="low">Low - Minor concern, can wait</option>
                  <option value="medium">Medium - Needs attention soon</option>
                  <option value="high">High - Urgent, needs prompt attention</option>
                  <option value="critical">Critical - Immediate action required</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description *</label>
                <textarea 
                  className="w-full border rounded-md p-2 mt-1"
                  rows={3}
                  placeholder="Describe the situation in detail..."
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Observed Behaviors *</label>
                <textarea 
                  className="w-full border rounded-md p-2 mt-1"
                  rows={3}
                  placeholder="What specific behaviors did you observe?"
                  value={formData.observed_behaviors}
                  onChange={(e) => setFormData({...formData, observed_behaviors: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Immediate Actions Taken</label>
                <textarea 
                  className="w-full border rounded-md p-2 mt-1"
                  rows={2}
                  placeholder="What did you do in response?"
                  value={formData.immediate_actions_taken}
                  onChange={(e) => setFormData({...formData, immediate_actions_taken: e.target.value})}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  className="flex-1 bg-red-500 hover:bg-red-600"
                  onClick={submitEscalation}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : (
                    <>
                      <Send className="w-4 h-4 mr-2" /> Submit Escalation
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(-1)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Show escalations list
  return (
    <div className="min-h-screen bg-gray-50">
      <ObserverNav />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Escalations</h1>
            <p className="text-gray-600">Your reported concerns and their status</p>
          </div>
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        {escalations.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <AlertTriangle className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No escalations reported</p>
              <p className="text-gray-400">When you report concerns, they will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {escalations.map(escalation => (
              <Card key={escalation.id} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        escalation.severity === 'critical' ? 'bg-red-500' :
                        escalation.severity === 'high' ? 'bg-orange-500' :
                        escalation.severity === 'medium' ? 'bg-amber-500' :
                        'bg-blue-500'
                      } text-white`}>
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-semibold">{escalation.child_name}</p>
                        <p className="text-sm text-gray-500 capitalize">{escalation.escalation_type} Issue</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getSeverityColor(escalation.severity)}`}>
                        {escalation.severity}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(escalation.status)}`}>
                        {escalation.status}
                      </span>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 mb-3">{escalation.description}</p>
                  
                  <div className="flex items-center gap-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(escalation.created_at).toLocaleDateString()}
                    </span>
                    {escalation.resolution && (
                      <span className="flex items-center gap-1 text-green-600">
                        <CheckCircle className="w-4 h-4" />
                        Resolved
                      </span>
                    )}
                  </div>
                  
                  {escalation.resolution && (
                    <div className="mt-3 p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-700">Resolution</p>
                      <p className="text-sm text-green-600">{escalation.resolution}</p>
                    </div>
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

export default ObserverEscalation;
