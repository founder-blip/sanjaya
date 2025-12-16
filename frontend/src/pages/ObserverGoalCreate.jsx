import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { ArrowLeft, Target } from 'lucide-react';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CATEGORY_OPTIONS = [
  { value: 'emotional', icon: '💙', label: 'Emotional', color: 'bg-blue-100 text-blue-700' },
  { value: 'social', icon: '👥', label: 'Social', color: 'bg-green-100 text-green-700' },
  { value: 'academic', icon: '📚', label: 'Academic', color: 'bg-purple-100 text-purple-700' },
  { value: 'behavioral', icon: '⭐', label: 'Behavioral', color: 'bg-orange-100 text-orange-700' }
];

const ObserverGoalCreate = () => {
  const navigate = useNavigate();
  const { childId } = useParams();
  const [child, setChild] = useState(null);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('emotional');
  const [targetDate, setTargetDate] = useState('');
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !description) {
      alert('Please fill in all required fields');
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('observer_token');
      await axios.post(
        `${BACKEND_URL}/api/observer/goal`,
        null,
        {
          params: {
            token,
            child_id: childId,
            title,
            description,
            category,
            target_date: targetDate || null
          }
        }
      );

      alert('Goal created successfully!');
      navigate('/observer/dashboard');
    } catch (error) {
      console.error('Error creating goal:', error);
      alert(error.response?.data?.detail || 'Failed to create goal');
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
              Create Goal for {child?.name}
            </h1>
          </div>

          <Card>
            <CardContent className="p-8">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Goal Title *
                  </label>
                  <Input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Express feelings with words"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Category *
                  </label>
                  <div className="grid grid-cols-4 gap-3">
                    {CATEGORY_OPTIONS.map((cat) => (
                      <button
                        key={cat.value}
                        type="button"
                        onClick={() => setCategory(cat.value)}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          category === cat.value
                            ? 'border-purple-600 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-400'
                        }`}
                      >
                        <div className="text-2xl mb-1">{cat.icon}</div>
                        <p className="text-xs font-semibold">{cat.label}</p>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <Textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe the goal and what success looks like..."
                    rows={4}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Target Date (Optional)
                  </label>
                  <Input
                    type="date"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>

                <div className="flex gap-3">
                  <Button
                    type="submit"
                    disabled={submitting}
                    className="flex-1 bg-purple-600 hover:bg-purple-700"
                  >
                    <Target className="w-4 h-4 mr-2" />
                    {submitting ? 'Creating...' : 'Create Goal'}
                  </Button>
                  <Button
                    type="button"
                    onClick={() => navigate('/observer/dashboard')}
                    variant="outline"
                    className="px-8"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ObserverGoalCreate;