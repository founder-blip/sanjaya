import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { 
  FileText, RefreshCw, CheckCircle, Clock, AlertCircle,
  Calendar, User, Filter
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import ObserverNav from '../components/ObserverNav';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ObserverReportsList = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('observer_token');
    if (!token) {
      navigate('/observer/login');
      return;
    }
    fetchReports();
  }, [navigate]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('observer_token');
      const response = await axios.get(`${BACKEND_URL}/api/observer/daily-reports?token=${token}`);
      setReports(response.data.reports || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({ title: "Error", description: "Failed to load reports", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'flagged': return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'reviewed': return <CheckCircle className="w-4 h-4 text-blue-500" />;
      default: return <Clock className="w-4 h-4 text-amber-500" />;
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'flagged': return 'bg-red-100 text-red-700';
      case 'reviewed': return 'bg-blue-100 text-blue-700';
      default: return 'bg-amber-100 text-amber-700';
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
            <h1 className="text-2xl font-bold text-gray-900">My Reports</h1>
            <p className="text-gray-600">Daily reports you've submitted</p>
          </div>
          <Button variant="outline" onClick={fetchReports}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        {reports.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <FileText className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No reports submitted yet</p>
              <p className="text-gray-400">Complete a session to submit your first report</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map(report => (
              <Card key={report.id} className="border-0 shadow-sm hover:shadow-md transition-shadow">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                        <FileText className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <p className="font-semibold">{report.child_name}</p>
                        <p className="text-sm text-gray-500">{report.report_date}</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 ${getStatusStyle(report.review_status)}`}>
                      {getStatusIcon(report.review_status)}
                      {(report.review_status || 'pending_review').replace('_', ' ')}
                    </span>
                  </div>
                  
                  <p className="text-gray-700 mb-3 line-clamp-2">{report.session_summary}</p>
                  
                  <div className="flex items-center gap-4 text-sm">
                    <span className={`px-2 py-1 rounded ${
                      report.child_mood === 'happy' ? 'bg-green-100 text-green-700' :
                      report.child_mood === 'calm' ? 'bg-blue-100 text-blue-700' :
                      report.child_mood === 'upset' || report.child_mood === 'anxious' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      Mood: {report.child_mood}
                    </span>
                    <span className={`px-2 py-1 rounded ${
                      report.engagement_level === 'high' ? 'bg-green-100 text-green-700' :
                      report.engagement_level === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      Engagement: {report.engagement_level}
                    </span>
                  </div>
                  
                  {report.principal_feedback && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-700">Principal Feedback</p>
                      <p className="text-sm text-blue-600">{report.principal_feedback}</p>
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

export default ObserverReportsList;
