import React, { useState, useEffect } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { 
  FileText, Send, CheckCircle, AlertCircle
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import ObserverNav from '../components/ObserverNav';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ObserverDailyReport = () => {
  const navigate = useNavigate();
  const { childId } = useParams();
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [child, setChild] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [reportData, setReportData] = useState({
    report_date: new Date().toISOString().split('T')[0],
    session_summary: '',
    child_mood: '',
    engagement_level: '',
    key_observations: '',
    concerns: '',
    positive_moments: '',
    recommendations: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('observer_token');
    if (!token) {
      navigate('/observer/login');
      return;
    }
    fetchChild();
  }, [navigate, childId]);

  const fetchChild = async () => {
    try {
      const token = localStorage.getItem('observer_token');
      const response = await axios.get(`${BACKEND_URL}/api/observer/child/${childId}?token=${token}`);
      setChild(response.data.child);
    } catch (error) {
      console.error('Error fetching child:', error);
      toast({ title: "Error", description: "Failed to load child info", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const submitReport = async () => {
    if (!reportData.session_summary || !reportData.child_mood || !reportData.engagement_level || !reportData.key_observations) {
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
        ...reportData
      });
      
      await axios.post(`${BACKEND_URL}/api/observer/daily-report?${params}`);
      toast({ title: "Success", description: "Daily report submitted!" });
      navigate('/observer/today');
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit report", variant: "destructive" });
    } finally {
      setSubmitting(false);
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
      
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Daily Report</h1>
          <p className="text-gray-600">Session with {child?.name}</p>
        </div>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-purple-500" />
              Session Report
            </CardTitle>
            <CardDescription>Share your observations from today's session</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Report Date</label>
              <input 
                type="date" 
                className="w-full border rounded-md p-2 mt-1"
                value={reportData.report_date}
                onChange={(e) => setReportData({...reportData, report_date: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Session Summary *</label>
              <textarea 
                className="w-full border rounded-md p-2 mt-1"
                rows={3}
                placeholder="What happened during the session? Main activities and interactions..."
                value={reportData.session_summary}
                onChange={(e) => setReportData({...reportData, session_summary: e.target.value})}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Child's Mood *</label>
                <select 
                  className="w-full border rounded-md p-2 mt-1"
                  value={reportData.child_mood}
                  onChange={(e) => setReportData({...reportData, child_mood: e.target.value})}
                >
                  <option value="">Select...</option>
                  <option value="happy">Happy</option>
                  <option value="calm">Calm</option>
                  <option value="neutral">Neutral</option>
                  <option value="tired">Tired</option>
                  <option value="anxious">Anxious</option>
                  <option value="upset">Upset</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Engagement *</label>
                <select 
                  className="w-full border rounded-md p-2 mt-1"
                  value={reportData.engagement_level}
                  onChange={(e) => setReportData({...reportData, engagement_level: e.target.value})}
                >
                  <option value="">Select...</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium">Key Observations *</label>
              <textarea 
                className="w-full border rounded-md p-2 mt-1"
                rows={3}
                placeholder="Notable behaviors, responses, or patterns you observed..."
                value={reportData.key_observations}
                onChange={(e) => setReportData({...reportData, key_observations: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-green-600">Positive Moments</label>
              <textarea 
                className="w-full border border-green-200 rounded-md p-2 mt-1 bg-green-50"
                rows={2}
                placeholder="What went well? Achievements, breakthroughs..."
                value={reportData.positive_moments}
                onChange={(e) => setReportData({...reportData, positive_moments: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium text-amber-600">Concerns (if any)</label>
              <textarea 
                className="w-full border border-amber-200 rounded-md p-2 mt-1 bg-amber-50"
                rows={2}
                placeholder="Any worries or issues you noticed..."
                value={reportData.concerns}
                onChange={(e) => setReportData({...reportData, concerns: e.target.value})}
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Recommendations</label>
              <textarea 
                className="w-full border rounded-md p-2 mt-1"
                rows={2}
                placeholder="Suggestions for next session or for parents..."
                value={reportData.recommendations}
                onChange={(e) => setReportData({...reportData, recommendations: e.target.value})}
              />
            </div>
            
            <div className="pt-4">
              <Button 
                className="w-full h-12 bg-purple-500 hover:bg-purple-600"
                onClick={submitReport}
                disabled={submitting}
              >
                {submitting ? (
                  <span>Submitting...</span>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" /> Submit Report
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ObserverDailyReport;
