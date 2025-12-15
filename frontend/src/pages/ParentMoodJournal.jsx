import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, TrendingUp, Calendar } from 'lucide-react';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const MOOD_CONFIG = {
  very_happy: { emoji: '😊', label: 'Very Happy', color: 'bg-green-500' },
  happy: { emoji: '🙂', label: 'Happy', color: 'bg-green-400' },
  neutral: { emoji: '😐', label: 'Neutral', color: 'bg-gray-400' },
  sad: { emoji: '😔', label: 'Sad', color: 'bg-orange-400' },
  very_sad: { emoji: '😢', label: 'Very Sad', color: 'bg-red-400' }
};

const ParentMoodJournal = () => {
  const navigate = useNavigate();
  const { childId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('parent_token')}` }
  });

  useEffect(() => {
    const token = localStorage.getItem('parent_token');
    if (!token) {
      navigate('/parent/login');
      return;
    }
    if (childId) {
      loadMoodData();
    }
  }, [navigate, childId]);

  const loadMoodData = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/parent/child/${childId}/mood-trends?days=30`,
        getAuthHeaders()
      );
      setData(response.data);
    } catch (error) {
      console.error('Error loading mood data:', error);
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

  if (!data) return null;

  const { child, entries, mood_counts, total_entries } = data;

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
            <h1 className="text-3xl font-bold text-gray-900">
              Mood Journal - {child.name}
            </h1>
          </div>

          {/* Mood Summary */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">Mood Overview (Last 30 Days)</h2>
              </div>
              
              <div className="grid grid-cols-5 gap-4 mb-6">
                {Object.entries(MOOD_CONFIG).map(([mood, config]) => (
                  <div key={mood} className="text-center p-4 bg-gray-50 rounded-lg">
                    <div className="text-4xl mb-2">{config.emoji}</div>
                    <p className="font-semibold text-sm">{config.label}</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">
                      {mood_counts[mood] || 0}
                    </p>
                    <p className="text-xs text-gray-500">
                      {total_entries > 0 ? Math.round((mood_counts[mood] || 0) / total_entries * 100) : 0}%
                    </p>
                  </div>
                ))}
              </div>

              <p className="text-sm text-gray-600">
                Total entries: {total_entries} | Most common mood: {
                  Object.entries(mood_counts).sort((a, b) => b[1] - a[1])[0] ? 
                  MOOD_CONFIG[Object.entries(mood_counts).sort((a, b) => b[1] - a[1])[0][0]].label : 
                  'N/A'
                }
              </p>
            </CardContent>
          </Card>

          {/* Mood History */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">Daily Mood History</h2>
              </div>

              {entries.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-gray-500">No mood entries yet</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {entries.map((entry) => (
                    <Card 
                      key={entry.id}
                      className="border-l-4 hover:shadow-md transition-shadow cursor-pointer"
                      style={{ borderLeftColor: MOOD_CONFIG[entry.mood]?.color.replace('bg-', '#') }}
                      onClick={() => setSelectedDate(entry.logged_date)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1">
                            <div className="text-3xl">{MOOD_CONFIG[entry.mood]?.emoji}</div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <p className="font-semibold">
                                  {new Date(entry.logged_date).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                  })}
                                </p>
                                <span className={`text-xs px-2 py-1 rounded-full text-white ${MOOD_CONFIG[entry.mood]?.color}`}>
                                  {MOOD_CONFIG[entry.mood]?.label}
                                </span>
                              </div>
                              {entry.notes && (
                                <p className="text-gray-700 text-sm">{entry.notes}</p>
                              )}
                              {entry.triggers && entry.triggers.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-1">
                                  {entry.triggers.map((trigger, i) => (
                                    <span key={i} className="text-xs bg-gray-100 px-2 py-1 rounded">
                                      {trigger}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ParentMoodJournal;
