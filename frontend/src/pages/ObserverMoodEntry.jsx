import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Textarea } from '../components/ui/textarea';
import { ArrowLeft, Smile } from 'lucide-react';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const MOOD_OPTIONS = [
  { value: 'very_happy', emoji: '😊', label: 'Very Happy', color: 'bg-green-500' },
  { value: 'happy', emoji: '🙂', label: 'Happy', color: 'bg-green-400' },
  { value: 'neutral', emoji: '😐', label: 'Neutral', color: 'bg-gray-400' },
  { value: 'sad', emoji: '😔', label: 'Sad', color: 'bg-orange-400' },
  { value: 'very_sad', emoji: '😢', label: 'Very Sad', color: 'bg-red-400' }
];

const ObserverMoodEntry = () => {
  const navigate = useNavigate();
  const { childId } = useParams();
  const [child, setChild] = useState(null);
  const [selectedMood, setSelectedMood] = useState(null);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('observer_token');
    if (!token) {
      navigate('/observer/login');
      return;
    }
    loadChild();
  }, [navigate, childId]);

  const loadChild = async () => {
    try {
      const token = localStorage.getItem('observer_token');
      const response = await axios.get(
        `${BACKEND_URL}/api/observer/child/${childId}?token=${token}`
      );
      setChild(response.data.child);
    } catch (error) {
      console.error('Error loading child:', error);
      alert('Failed to load child details');
      navigate('/observer/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!selectedMood) {
      alert('Please select a mood');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('observer_token');
      const today = new Date().toISOString().split('T')[0];
      const mood = MOOD_OPTIONS.find(m => m.value === selectedMood);

      await axios.post(
        `${BACKEND_URL}/api/observer/mood-entry`,
        null,
        {
          params: {
            token,
            child_id: childId,
            mood: selectedMood,
            mood_emoji: mood.emoji,
            logged_date: today,
            notes: notes
          }
        }
      );

      alert('Mood entry created successfully!');
      navigate('/observer/dashboard');
    } catch (error) {
      console.error('Error creating mood entry:', error);
      alert(error.response?.data?.detail || 'Failed to create mood entry');
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
      <Navigation />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <Button onClick={() => navigate('/observer/dashboard')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              Log Mood for {child?.name}
            </h1>
          </div>

          <Card>
            <CardContent className="p-8">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-4">
                  How is {child?.name} feeling today?
                </label>
                <div className="grid grid-cols-5 gap-3">
                  {MOOD_OPTIONS.map((mood) => (
                    <button
                      key={mood.value}
                      onClick={() => setSelectedMood(mood.value)}
                      className={`p-4 rounded-xl border-2 transition-all ${
                        selectedMood === mood.value
                          ? `${mood.color} border-gray-900 text-white scale-105 shadow-lg`
                          : 'bg-white border-gray-200 hover:border-gray-400'
                      }`}
                    >
                      <div className="text-4xl mb-2">{mood.emoji}</div>
                      <p className={`text-xs font-semibold ${
                        selectedMood === mood.value ? 'text-white' : 'text-gray-700'
                      }`}>
                        {mood.label}
                      </p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Observer Notes (Optional)
                </label>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any observations about the child's mood, behavior, or any triggers..."
                  rows={6}
                  className="w-full"
                />
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleSubmit}
                  disabled={!selectedMood || submitting}
                  className="flex-1 bg-purple-600 hover:bg-purple-700"
                >
                  <Smile className="w-4 h-4 mr-2" />
                  {submitting ? 'Saving...' : 'Save Mood Entry'}
                </Button>
                <Button
                  onClick={() => navigate('/observer/dashboard')}
                  variant="outline"
                  className="px-8"
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ObserverMoodEntry;