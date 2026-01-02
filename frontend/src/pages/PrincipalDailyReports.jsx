import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { 
  ArrowLeft, FileText, CheckCircle, AlertTriangle, Clock,
  User, Baby, Calendar, Brain, RefreshCw, Filter, Eye, MessageSquare
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import PrincipalNav from '../components/PrincipalNav';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PrincipalDailyReports = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [selectedReport, setSelectedReport] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [activeTab, setActiveTab] = useState('reports');

  useEffect(() => {
    const token = localStorage.getItem('principal_token');
    if (!token) {
      navigate('/principal/login');
      return;
    }
    fetchReports();
  }, [navigate, filterStatus]);

  const fetchReports = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('principal_token');
      let url = `${BACKEND_URL}/api/principal/daily-reports?token=${token}`;
      if (filterStatus !== 'all') {
        url += `&status=${filterStatus}`;
      }
      const response = await axios.get(url);
      setReports(response.data.reports || []);
      setAiInsights(response.data.ai_insights || []);
      setStatusCounts(response.data.status_counts || {});
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast({ title: "Error", description: "Failed to load reports", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (reportId, status) => {
    try {
      const token = localStorage.getItem('principal_token');
      const params = new URLSearchParams({
        token,
        review_status: status,
        feedback: reviewFeedback
      });
      
      await axios.put(`${BACKEND_URL}/api/principal/daily-reports/${reportId}/review?${params}`);
      toast({ title: "Success", description: `Report marked as ${status}` });
      setSelectedReport(null);
      setReviewFeedback('');
      fetchReports();
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit review", variant: "destructive" });
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending_review': return 'bg-amber-100 text-amber-700';
      case 'reviewed': return 'bg-blue-100 text-blue-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'flagged': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
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
      <PrincipalNav />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/principal/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Daily Reports</h1>
            <p className="text-gray-600">Review observer reports and AI insights</p>
          </div>
          <Button variant="outline" onClick={fetchReports}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card 
            className={`border-0 shadow-sm cursor-pointer ${filterStatus === 'pending_review' ? 'ring-2 ring-amber-500' : ''} bg-amber-50`}
            onClick={() => setFilterStatus('pending_review')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold text-amber-700">{statusCounts.pending_review || 0}</p>
                  <p className="text-sm text-amber-600">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`border-0 shadow-sm cursor-pointer ${filterStatus === 'approved' ? 'ring-2 ring-green-500' : ''} bg-green-50`}
            onClick={() => setFilterStatus('approved')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-700">{statusCounts.approved || 0}</p>
                  <p className="text-sm text-green-600">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`border-0 shadow-sm cursor-pointer ${filterStatus === 'flagged' ? 'ring-2 ring-red-500' : ''} bg-red-50`}
            onClick={() => setFilterStatus('flagged')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-700">{statusCounts.flagged || 0}</p>
                  <p className="text-sm text-red-600">Flagged</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`border-0 shadow-sm cursor-pointer ${filterStatus === 'all' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Eye className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-700">{reports.length}</p>
                  <p className="text-sm text-blue-600">All Reports</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <Button 
            variant={activeTab === 'reports' ? 'default' : 'outline'}
            onClick={() => setActiveTab('reports')}
          >
            <FileText className="w-4 h-4 mr-2" /> Observer Reports
          </Button>
          <Button 
            variant={activeTab === 'ai' ? 'default' : 'outline'}
            onClick={() => setActiveTab('ai')}
          >
            <Brain className="w-4 h-4 mr-2" /> AI Insights ({aiInsights.length})
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Reports/Insights List */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>{activeTab === 'reports' ? 'Daily Reports' : 'AI Session Insights'}</CardTitle>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                {activeTab === 'reports' ? (
                  reports.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No reports found</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {reports.map(report => (
                        <div 
                          key={report.id}
                          className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                            selectedReport?.id === report.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-100 bg-white'
                          }`}
                          onClick={() => setSelectedReport(report)}
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex items-start gap-3">
                              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-full flex items-center justify-center">
                                <FileText className="w-5 h-5 text-white" />
                              </div>
                              <div>
                                <p className="font-semibold text-gray-900">
                                  {report.child?.name || 'Daily Report'}
                                </p>
                                <p className="text-sm text-gray-600 flex items-center gap-2">
                                  <User className="w-3 h-3" />
                                  {report.observer?.name || 'Observer'}
                                </p>
                              </div>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(report.review_status || 'pending_review')}`}>
                              {(report.review_status || 'pending_review').replace('_', ' ')}
                            </span>
                          </div>
                          
                          <div className="mt-3 text-sm text-gray-600 line-clamp-2">
                            {report.summary || report.content || 'No summary available'}
                          </div>
                          
                          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500">
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {report.report_date || new Date(report.created_at).toLocaleDateString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                ) : (
                  aiInsights.length === 0 ? (
                    <div className="text-center py-12 text-gray-500">
                      <Brain className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                      <p>No AI insights available</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {aiInsights.map((insight, idx) => (
                        <div key={idx} className="p-4 rounded-lg border bg-gradient-to-r from-purple-50 to-indigo-50">
                          <div className="flex items-start gap-3">
                            <Brain className="w-8 h-8 text-purple-600" />
                            <div className="flex-1">
                              <p className="font-semibold text-purple-900">
                                {insight.child_name || 'AI Analysis'}
                              </p>
                              <p className="text-sm text-purple-700 mt-1">
                                {insight.summary || insight.analysis || 'No analysis available'}
                              </p>
                              {insight.recommendations && (
                                <div className="mt-2 p-2 bg-white/50 rounded">
                                  <p className="text-xs font-medium text-purple-600">Recommendations:</p>
                                  <p className="text-sm text-purple-700">{insight.recommendations}</p>
                                </div>
                              )}
                              <p className="text-xs text-purple-500 mt-2">
                                {new Date(insight.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )
                )}
              </CardContent>
            </Card>
          </div>

          {/* Review Panel */}
          <div>
            <Card className="border-0 shadow-sm sticky top-4">
              <CardHeader>
                <CardTitle>Review Report</CardTitle>
                <CardDescription>
                  {selectedReport ? `Report from ${selectedReport.observer?.name}` : 'Select a report to review'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedReport ? (
                  <div className="space-y-4">
                    {/* Report Info */}
                    <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <Baby className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{selectedReport.child?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{selectedReport.observer?.name || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{selectedReport.report_date || new Date(selectedReport.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>

                    {/* Report Content */}
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-700 mb-1">Report Content</p>
                      <p className="text-sm text-blue-600">
                        {selectedReport.content || selectedReport.summary || 'No content available'}
                      </p>
                    </div>

                    {/* Observations */}
                    {selectedReport.observations && (
                      <div className="p-3 bg-green-50 rounded-lg">
                        <p className="text-sm font-medium text-green-700 mb-1">Observations</p>
                        <p className="text-sm text-green-600">{selectedReport.observations}</p>
                      </div>
                    )}

                    {/* Review Form */}
                    <div className="space-y-3 pt-4 border-t">
                      <div>
                        <label className="text-sm font-medium">Your Feedback</label>
                        <textarea 
                          className="w-full border rounded-md p-2 mt-1"
                          rows={3}
                          placeholder="Add feedback for the observer..."
                          value={reviewFeedback}
                          onChange={(e) => setReviewFeedback(e.target.value)}
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <Button 
                          className="bg-green-500 hover:bg-green-600"
                          onClick={() => submitReview(selectedReport.id, 'approved')}
                        >
                          <CheckCircle className="w-4 h-4 mr-1" /> Approve
                        </Button>
                        <Button 
                          variant="outline"
                          className="text-red-600 border-red-200 hover:bg-red-50"
                          onClick={() => submitReview(selectedReport.id, 'flagged')}
                        >
                          <AlertTriangle className="w-4 h-4 mr-1" /> Flag
                        </Button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Select a report to review</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrincipalDailyReports;
