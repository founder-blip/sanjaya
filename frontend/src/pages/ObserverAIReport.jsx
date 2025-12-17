import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Sparkles, FileText, Loader2, Calendar, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Clock, Sun, CalendarDays, CalendarRange, Settings } from 'lucide-react';
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
  const [reportType, setReportType] = useState('weekly');
  const [customDays, setCustomDays] = useState(7);
  const [expandedReport, setExpandedReport] = useState(null);

  const reportTypes = [
    { id: 'daily', label: 'Daily Report', icon: Sun, days: 1, description: "Today's session highlights" },
    { id: 'weekly', label: 'Weekly Report', icon: CalendarDays, days: 7, description: 'Past 7 days analysis' },
    { id: 'fortnightly', label: 'Fortnightly', icon: CalendarRange, days: 14, description: 'Past 14 days trends' },
    { id: 'monthly', label: 'Monthly Report', icon: Calendar, days: 30, description: 'Full month overview' },
    { id: 'custom', label: 'Custom', icon: Settings, days: null, description: 'Choose your own period' }
  ];

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
        `${BACKEND_URL}/api/observer/parent-reports/${childId}?token=${token}`
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
      const days = reportType === 'custom' ? customDays : reportTypes.find(r => r.id === reportType)?.days || 7;
      
      const response = await axios.post(
        `${BACKEND_URL}/api/observer/generate-parent-report/${childId}?token=${token}&report_type=${reportType}&days=${days}`
      );
      
      if (response.data.success) {
        setReport(response.data.report);
        loadPastReports();
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

  const getReportTypeColor = (type) => {
    const colors = {
      daily: 'bg-yellow-100 text-yellow-700 border-yellow-200',
      weekly: 'bg-blue-100 text-blue-700 border-blue-200',
      fortnightly: 'bg-purple-100 text-purple-700 border-purple-200',
      monthly: 'bg-green-100 text-green-700 border-green-200',
      custom: 'bg-gray-100 text-gray-700 border-gray-200'
    };
    return colors[type] || colors.custom;
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
        <div className="max-w-5xl mx-auto px-4">
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
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Parent Reports</h1>
              {child && (
                <p className="text-purple-100 mt-1">
                  Generate AI reports for {child.name} • Age {child.age} • {child.grade}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 py-8">
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

        {/* Report Type Selection */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-600" />
              Generate New Report
            </h2>
            <p className="text-gray-600 mb-6">
              Select a report type based on the analysis period you need.
            </p>

            {/* Report Type Cards */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
              {reportTypes.map((type) => {
                const Icon = type.icon;
                const isSelected = reportType === type.id;
                return (
                  <button
                    key={type.id}
                    onClick={() => setReportType(type.id)}
                    className={`p-4 rounded-xl border-2 transition-all text-left ${
                      isSelected 
                        ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200' 
                        : 'border-gray-200 hover:border-purple-300 bg-white'
                    }`}
                  >
                    <Icon className={`w-6 h-6 mb-2 ${isSelected ? 'text-purple-600' : 'text-gray-400'}`} />
                    <div className={`font-semibold text-sm ${isSelected ? 'text-purple-700' : 'text-gray-900'}`}>
                      {type.label}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      {type.description}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Custom Days Input */}
            {reportType === 'custom' && (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom Period (Days)
                </label>
                <div className="flex items-center gap-4">
                  <input
                    type="number"
                    value={customDays}
                    onChange={(e) => setCustomDays(Math.max(1, Math.min(90, parseInt(e.target.value) || 1)))}
                    min="1"
                    max="90"
                    className="w-24 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
                  />
                  <span className="text-gray-600">days (1-90)</span>
                </div>
              </div>
            )}

            {/* Generate Button */}
            <Button
              onClick={generateReport}
              disabled={generating}
              size="lg"
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8"
            >
              {generating ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Generating {reportTypes.find(r => r.id === reportType)?.label || 'Report'}...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Generate {reportTypes.find(r => r.id === reportType)?.label || 'Report'}
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Generated Report Display */}
        {report && (
          <Card className="mb-8 border-green-200 bg-green-50/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h2 className="text-xl font-bold text-green-700">Report Generated Successfully</h2>
                </div>
                <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getReportTypeColor(report.report_type)}`}>
                  {report.report_type_label}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600 mb-4 flex-wrap">
                <span className="flex items-center gap-1">
                  <Calendar className="w-4 h-4" />
                  Generated: {formatDate(report.generated_at)}
                </span>
                <span>• Period: {report.data_period_days} day(s)</span>
                <span>• Sessions: {report.sessions_analyzed}</span>
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
                <Clock className="w-5 h-5 text-purple-600" />
                Past Reports ({pastReports.length})
              </h2>

              <div className="space-y-3">
                {pastReports.map((pastReport) => (
                  <div key={pastReport.id} className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                      onClick={() => setExpandedReport(expandedReport === pastReport.id ? null : pastReport.id)}
                      className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 flex items-center justify-between transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <FileText className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{formatDate(pastReport.generated_at)}</span>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${getReportTypeColor(pastReport.report_type)}`}>
                          {pastReport.report_type_label || pastReport.report_type}
                        </span>
                        <span className="text-sm text-gray-500">
                          • {pastReport.data_period_days} day(s) • {pastReport.sessions_analyzed} sessions
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
