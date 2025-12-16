import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Sparkles, FileText, Loader2, Calendar, CheckCircle, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ObserverAIReport = () => {
  const navigate = useNavigate();
  const { childId } = useParams();
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [report, setReport] = useState(null);
  const [pastReports, setPastReports] = useState([]);
  const [error, setError] = useState(null);
  const [days, setDays] = useState(30);
  const [expandedReport, setExpandedReport] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('observer_token');
    if (!token) {
      navigate('/observer/login');
      return;
    }
    loadChildData();
    loadPastReports();
  }, [navigate, childId]);

  const loadChildData = async () => {
    try {
      const token = localStorage.getItem('observer_token');
      const response = await axios.get(
        `${BACKEND_URL}/api/observer/dashboard?token=${token}`
      );
      const foundChild = response.data.children.find(c => c.id === childId);
      if (foundChild) {
        setChild(foundChild);
      } else {
        setError('Child not found');
      }
    } catch (error) {
      console.error('Error loading child data:', error);
      setError('Failed to load child data');
    } finally {
      setLoading(false);
    }
  };

  const loadPastReports = async () => {
    try {
      const token = localStorage.getItem('observer_token');
      const response = await axios.get(
        `${BACKEND_URL}/api/ai/observer/reports/${childId}?token=${token}`
      );
      setPastReports(response.data.reports || []);
    } catch (error) {
      console.error('Error loading past reports:', error);
    }
  };

  const generateReport = async () => {
    setGenerating(true);
    setError(null);
    setReport(null);

    try {
      const token = localStorage.getItem('observer_token');
      const response = await axios.post(
        `${BACKEND_URL}/api/ai/observer/generate-report/${childId}?token=${token}&days=${days}`
      );
      
      if (response.data.success) {
        setReport(response.data.report);
        loadPastReports(); // Refresh past reports list
      } else {
        setError('Failed to generate report');
      }
    } catch (error) {
      console.error('Error generating report:', error);
      setError(error.response?.data?.detail || 'Failed to generate report. Please try again.');
    } finally {
      setGenerating(false);
    }
  };

  const formatDate = (isoString) => {
    return new Date(isoString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/observer/dashboard')}
            className="mb-4 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">AI Report Generation</h1>
              {child && (
                <p className="text-purple-100 mt-1">
                  Generate insights for {child.name} • Age {child.age} • {child.grade}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {error && !report && (
          <Card className="mb-6 border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 text-red-700">
                <AlertCircle className="w-5 h-5" />
                <p>{error}</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generate New Report Section */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Generate New Report
            </h2>
            
            <p className="text-gray-600 mb-6">
              Our AI will analyze mood entries, goals, session notes, and progress data to generate a comprehensive emotional support report.
            </p>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Analysis Period
              </label>
              <select
                value={days}
                onChange={(e) => setDays(Number(e.target.value))}
                className="w-full md:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value={7}>Last 7 days</option>
                <option value={14}>Last 14 days</option>
                <option value={30}>Last 30 days</option>
                <option value={60}>Last 60 days</option>
                <option value={90}>Last 90 days</option>
              </select>
            </div>

            <Button
              onClick={generateReport}
              disabled={generating}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-2"
            >
              {generating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Generating Report...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate AI Report
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Report Display */}
        {report && (
          <Card className="mb-8 border-green-200 bg-green-50/50">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <h2 className="text-xl font-bold text-green-700">Report Generated Successfully</h2>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Generated: {formatDate(report.generated_at)}
                </span>
                <span>• Analysis Period: {report.data_period_days} days</span>
                <span>• Sessions Analyzed: {report.sessions_analyzed}</span>
                <span>• Mood Entries: {report.mood_entries_analyzed}</span>
              </div>

              <div className="bg-white rounded-lg p-6 border border-gray-200">
                <div className="prose prose-purple max-w-none">
                  {report.content.split('\n').map((line, idx) => {
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return <h3 key={idx} className="text-lg font-bold text-gray-900 mt-4 mb-2">{line.replace(/\*\*/g, '')}</h3>;
                    }
                    if (line.startsWith('# ')) {
                      return <h2 key={idx} className="text-xl font-bold text-gray-900 mt-6 mb-3">{line.replace('# ', '')}</h2>;
                    }
                    if (line.startsWith('## ')) {
                      return <h3 key={idx} className="text-lg font-bold text-gray-900 mt-4 mb-2">{line.replace('## ', '')}</h3>;
                    }
                    if (line.startsWith('### ')) {
                      return <h4 key={idx} className="text-md font-bold text-gray-800 mt-3 mb-2">{line.replace('### ', '')}</h4>;
                    }
                    if (line.startsWith('- ') || line.startsWith('• ')) {
                      return <li key={idx} className="ml-4 text-gray-700">{line.replace(/^[-•] /, '')}</li>;
                    }
                    if (line.trim() === '') {
                      return <br key={idx} />;
                    }
                    return <p key={idx} className="text-gray-700 mb-2">{line}</p>;
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Past Reports Section */}
        {pastReports.length > 0 && (
          <Card>
            <CardContent className="p-6">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-purple-600" />
                Past Reports ({pastReports.length})
              </h2>

              <div className="space-y-4">
                {pastReports.map((pastReport) => (
                  <div key={pastReport.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedReport(expandedReport === pastReport.id ? null : pastReport.id)}
                      className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{formatDate(pastReport.generated_at)}</span>
                        <span className="text-sm text-gray-500">
                          • {pastReport.data_period_days} days • {pastReport.sessions_analyzed} sessions
                        </span>
                      </div>
                      {expandedReport === pastReport.id ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </button>

                    {expandedReport === pastReport.id && (
                      <div className="p-4 bg-white border-t border-gray-200">
                        <div className="prose prose-sm max-w-none">
                          {pastReport.report_content.split('\n').map((line, idx) => {
                            if (line.startsWith('**') && line.endsWith('**')) {
                              return <h3 key={idx} className="text-md font-bold text-gray-900 mt-3 mb-2">{line.replace(/\*\*/g, '')}</h3>;
                            }
                            if (line.startsWith('# ') || line.startsWith('## ') || line.startsWith('### ')) {
                              return <h4 key={idx} className="text-md font-bold text-gray-800 mt-3 mb-2">{line.replace(/^#+\s/, '')}</h4>;
                            }
                            if (line.startsWith('- ') || line.startsWith('• ')) {
                              return <li key={idx} className="ml-4 text-gray-600 text-sm">{line.replace(/^[-•] /, '')}</li>;
                            }
                            if (line.trim() === '') return null;
                            return <p key={idx} className="text-gray-600 text-sm mb-1">{line}</p>;
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default ObserverAIReport;
