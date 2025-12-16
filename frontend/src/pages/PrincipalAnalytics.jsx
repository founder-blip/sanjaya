import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, TrendingUp, Target, Smile, Calendar } from 'lucide-react';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PrincipalAnalytics = () => {
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('principal_token');
    if (!token) {
      navigate('/principal/login');
      return;
    }
    loadAnalytics();
  }, [navigate]);

  const loadAnalytics = async () => {
    try {
      const token = localStorage.getItem('principal_token');
      const response = await axios.get(
        `${BACKEND_URL}/api/principal/analytics?token=${token}`
      );
      setAnalytics(response.data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('principal_token');
        navigate('/principal/login');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!analytics) return null;

  const { school, engagement, goals, mood_insights, demographics } = analytics;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <Button onClick={() => navigate('/principal/dashboard')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">School Analytics</h1>
              <p className="text-gray-600">{school}</p>
            </div>
          </div>

          {/* Engagement Metrics */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              Appointment Engagement
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600 mb-1">Total Appointments</p>
                  <p className="text-3xl font-bold text-gray-900">{engagement.total_appointments}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{engagement.completed_appointments}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600 mb-1">Attendance Rate</p>
                  <p className="text-3xl font-bold text-blue-600">{engagement.attendance_rate}%</p>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Goals Metrics */}
          <div className="mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Target className="w-5 h-5 text-purple-600" />
              Goal Progress
            </h2>
            <div className="grid md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600 mb-1">Total Goals</p>
                  <p className="text-3xl font-bold text-gray-900">{goals.total}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600 mb-1">Active</p>
                  <p className="text-3xl font-bold text-blue-600">{goals.active}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600 mb-1">Completed</p>
                  <p className="text-3xl font-bold text-green-600">{goals.completed}</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-6">
                  <p className="text-sm text-gray-600 mb-1">Completion Rate</p>
                  <p className="text-3xl font-bold text-purple-600">{goals.completion_rate}%</p>
                </CardContent>
              </Card>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            {/* Mood Insights */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <Smile className="w-5 h-5 text-yellow-600" />
                  Mood Distribution
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Entries</span>
                    <span className="font-bold">{mood_insights.total_entries}</span>
                  </div>
                  {Object.entries(mood_insights.distribution).map(([mood, count]) => (
                    <div key={mood} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{mood.replace('_', ' ')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full"
                            style={{ width: `${(count / mood_insights.total_entries) * 100}%` }}
                          ></div>
                        </div>
                        <span className="font-semibold text-sm w-8 text-right">{count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Demographics */}
            <Card>
              <CardContent className="p-6">
                <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-600" />
                  Student Demographics
                </h2>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Total Students</span>
                    <span className="font-bold">{demographics.total_students}</span>
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-gray-700 mb-2">Age Distribution</p>
                    {Object.entries(demographics.age_distribution).map(([age, count]) => (
                      <div key={age} className="flex items-center justify-between mb-2">
                        <span className="text-sm">Age {age}</span>
                        <div className="flex items-center gap-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-green-600 h-2 rounded-full"
                              style={{ width: `${(count / demographics.total_students) * 100}%` }}
                            ></div>
                          </div>
                          <span className="font-semibold text-sm w-8 text-right">{count}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PrincipalAnalytics;