import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { 
  ArrowLeft, Users, TrendingUp, Star, AlertTriangle,
  CheckCircle, Clock, Activity, ChevronRight, RefreshCw,
  Award, Target, BarChart3
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import PrincipalNav from '../components/PrincipalNav';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PrincipalObserverPerformance = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [performanceData, setPerformanceData] = useState(null);
  const [selectedObserver, setSelectedObserver] = useState(null);
  const [observerDetails, setObserverDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('principal_token');
    if (!token) {
      navigate('/principal/login');
      return;
    }
    fetchPerformance();
  }, [navigate]);

  const fetchPerformance = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('principal_token');
      const response = await axios.get(
        `${BACKEND_URL}/api/principal/observer-performance?token=${token}`
      );
      setPerformanceData(response.data);
    } catch (error) {
      console.error('Error fetching performance:', error);
      toast({ title: "Error", description: "Failed to load performance data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const fetchObserverDetails = async (observerId) => {
    setLoadingDetails(true);
    try {
      const token = localStorage.getItem('principal_token');
      const response = await axios.get(
        `${BACKEND_URL}/api/principal/observer/${observerId}/details?token=${token}`
      );
      setObserverDetails(response.data);
    } catch (error) {
      console.error('Error fetching details:', error);
      toast({ title: "Error", description: "Failed to load observer details", variant: "destructive" });
    } finally {
      setLoadingDetails(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'bg-green-100 text-green-700 border-green-200';
      case 'good': return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'needs_attention': return 'bg-amber-100 text-amber-700 border-amber-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'excellent': return <Award className="w-5 h-5 text-green-600" />;
      case 'good': return <CheckCircle className="w-5 h-5 text-blue-600" />;
      case 'needs_attention': return <AlertTriangle className="w-5 h-5 text-amber-600" />;
      default: return <Activity className="w-5 h-5 text-gray-600" />;
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
            <h1 className="text-2xl font-bold text-gray-900">Observer Performance</h1>
            <p className="text-gray-600">Monitor and track observer engagement metrics</p>
          </div>
          <Button variant="outline" onClick={fetchPerformance}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Users className="w-5 h-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{performanceData?.total_observers || 0}</p>
                  <p className="text-sm text-gray-600">Total Observers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <Award className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-green-700">{performanceData?.summary?.excellent || 0}</p>
                  <p className="text-sm text-green-600">Excellent</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <CheckCircle className="w-5 h-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-blue-700">{performanceData?.summary?.good || 0}</p>
                  <p className="text-sm text-blue-600">Good</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-amber-700">{performanceData?.summary?.needs_attention || 0}</p>
                  <p className="text-sm text-amber-600">Needs Attention</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Performance List */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Observer Performance Overview</CardTitle>
                <CardDescription>Click on an observer to view detailed metrics</CardDescription>
              </CardHeader>
              <CardContent>
                {performanceData?.observer_performance?.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No observers found</p>
                ) : (
                  <div className="space-y-4">
                    {performanceData?.observer_performance?.map((item, index) => (
                      <div 
                        key={item.observer.id}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                          selectedObserver?.id === item.observer.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-100 bg-white'
                        }`}
                        onClick={() => {
                          setSelectedObserver(item.observer);
                          fetchObserverDetails(item.observer.id);
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">{item.observer.name}</p>
                              <p className="text-sm text-gray-600">{item.observer.specialization || 'Observer'}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(item.status)}`}>
                              <div className="flex items-center gap-1">
                                {getStatusIcon(item.status)}
                                <span className="capitalize">{item.status.replace('_', ' ')}</span>
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-gray-400" />
                          </div>
                        </div>
                        
                        {/* Quick Metrics */}
                        <div className="grid grid-cols-4 gap-4 mt-4 pt-4 border-t">
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{item.metrics.assigned_students}</p>
                            <p className="text-xs text-gray-500">Students</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{item.metrics.sessions_last_30_days}</p>
                            <p className="text-xs text-gray-500">Sessions (30d)</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-bold text-gray-900">{item.metrics.consistency_score}%</p>
                            <p className="text-xs text-gray-500">Consistency</p>
                          </div>
                          <div className="text-center">
                            <div className="flex items-center justify-center gap-1">
                              <Star className="w-4 h-4 text-amber-500" />
                              <p className="text-lg font-bold text-gray-900">{item.metrics.average_rating || 'N/A'}</p>
                            </div>
                            <p className="text-xs text-gray-500">Rating</p>
                          </div>
                        </div>
                        
                        {/* Consistency Bar */}
                        <div className="mt-3">
                          <div className="flex justify-between text-xs text-gray-500 mb-1">
                            <span>Consistency Score</span>
                            <span>{item.metrics.consistency_score}%</span>
                          </div>
                          <div className="bg-gray-200 rounded-full h-2">
                            <div 
                              className={`h-2 rounded-full transition-all ${
                                item.metrics.consistency_score >= 80 ? 'bg-green-500' :
                                item.metrics.consistency_score >= 60 ? 'bg-blue-500' :
                                'bg-amber-500'
                              }`}
                              style={{ width: `${item.metrics.consistency_score}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Observer Details Panel */}
          <div>
            <Card className="border-0 shadow-sm sticky top-4">
              <CardHeader>
                <CardTitle>Observer Details</CardTitle>
                <CardDescription>
                  {selectedObserver ? selectedObserver.name : 'Select an observer to view details'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingDetails ? (
                  <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : observerDetails ? (
                  <div className="space-y-6">
                    {/* Observer Info */}
                    <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg">
                      <p className="font-semibold text-lg">{observerDetails.observer?.name}</p>
                      <p className="text-sm text-gray-600">{observerDetails.observer?.email}</p>
                      <p className="text-sm text-gray-500 mt-1">
                        {observerDetails.observer?.specialization || 'General Observer'}
                      </p>
                    </div>

                    {/* Statistics */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Statistics</h4>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="p-3 bg-blue-50 rounded-lg text-center">
                          <p className="text-xl font-bold text-blue-700">
                            {observerDetails.statistics?.total_students || 0}
                          </p>
                          <p className="text-xs text-blue-600">Total Students</p>
                        </div>
                        <div className="p-3 bg-green-50 rounded-lg text-center">
                          <p className="text-xl font-bold text-green-700">
                            {observerDetails.statistics?.active_students || 0}
                          </p>
                          <p className="text-xs text-green-600">Active</p>
                        </div>
                      </div>
                    </div>

                    {/* Assigned Students */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Assigned Students</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {observerDetails.assigned_students?.length === 0 ? (
                          <p className="text-sm text-gray-500">No students assigned</p>
                        ) : (
                          observerDetails.assigned_students?.map(student => (
                            <div key={student.id} className="p-2 bg-gray-50 rounded flex justify-between items-center">
                              <span className="text-sm font-medium">{student.name}</span>
                              <span className={`text-xs px-2 py-0.5 rounded ${
                                student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100'
                              }`}>
                                {student.status || 'active'}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Recent Sessions */}
                    <div>
                      <h4 className="font-medium text-gray-900 mb-3">Recent Sessions</h4>
                      <div className="space-y-2 max-h-40 overflow-y-auto">
                        {observerDetails.recent_sessions?.length === 0 ? (
                          <p className="text-sm text-gray-500">No sessions recorded</p>
                        ) : (
                          observerDetails.recent_sessions?.slice(0, 5).map((session, i) => (
                            <div key={i} className="p-2 bg-gray-50 rounded">
                              <div className="flex justify-between items-center">
                                <span className="text-sm">{session.child_name || 'Student'}</span>
                                <span className="text-xs text-gray-500">
                                  {new Date(session.created_at).toLocaleDateString()}
                                </span>
                              </div>
                              {session.mood && (
                                <span className="text-xs text-gray-500">Mood: {session.mood}</span>
                              )}
                            </div>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t">
                      <Button 
                        className="w-full"
                        onClick={() => navigate(`/principal/observer/${selectedObserver.id}`)}
                      >
                        <BarChart3 className="w-4 h-4 mr-2" /> View Full Report
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Select an observer to view their performance details</p>
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

export default PrincipalObserverPerformance;
