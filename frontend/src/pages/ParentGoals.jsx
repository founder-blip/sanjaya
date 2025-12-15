import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Target, CheckCircle2, Clock, TrendingUp } from 'lucide-react';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const CATEGORY_CONFIG = {
  emotional: { icon: '💙', label: 'Emotional', color: 'bg-blue-100 text-blue-700' },
  social: { icon: '👥', label: 'Social', color: 'bg-green-100 text-green-700' },
  academic: { icon: '📚', label: 'Academic', color: 'bg-purple-100 text-purple-700' },
  behavioral: { icon: '⭐', label: 'Behavioral', color: 'bg-orange-100 text-orange-700' }
};

const ParentGoals = () => {
  const navigate = useNavigate();
  const { childId } = useParams();
  const [goals, setGoals] = useState([]);
  const [child, setChild] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active');

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
      loadGoals();
    }
  }, [navigate, childId, filter]);

  const loadGoals = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/parent/child/${childId}/goals?status=${filter}`,
        getAuthHeaders()
      );
      setGoals(response.data.goals);
      setChild(response.data.child);
    } catch (error) {
      console.error('Error loading goals:', error);
    } finally {
      setLoading(false);
    }
  };

  const getProgressColor = (progress) => {
    if (progress >= 80) return 'bg-green-500';
    if (progress >= 50) return 'bg-blue-500';
    if (progress >= 25) return 'bg-yellow-500';
    return 'bg-gray-300';
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
      <Navigation />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <Button onClick={() => navigate('/parent/dashboard')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              Goals - {child?.name}
            </h1>
          </div>

          {/* Filter Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              onClick={() => setFilter('active')}
              variant={filter === 'active' ? 'default' : 'outline'}
              className={filter === 'active' ? 'bg-blue-500' : ''}
            >
              <Target className="w-4 h-4 mr-2" />
              Active Goals
            </Button>
            <Button
              onClick={() => setFilter('completed')}
              variant={filter === 'completed' ? 'default' : 'outline'}
              className={filter === 'completed' ? 'bg-green-500' : ''}
            >
              <CheckCircle2 className="w-4 h-4 mr-2" />
              Completed
            </Button>
          </div>

          {/* Goals Grid */}
          {goals.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {filter === 'active' ? 'No active goals yet' : 'No completed goals yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 gap-6">
              {goals.map((goal) => (
                <Card key={goal.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-start gap-3 flex-1">
                        <div className="text-3xl">{CATEGORY_CONFIG[goal.category]?.icon}</div>
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{goal.title}</h3>
                          <span className={`text-xs px-2 py-1 rounded-full ${CATEGORY_CONFIG[goal.category]?.color}`}>
                            {CATEGORY_CONFIG[goal.category]?.label}
                          </span>
                        </div>
                      </div>
                      {goal.status === 'completed' && (
                        <CheckCircle2 className="w-6 h-6 text-green-500" />
                      )}
                    </div>

                    <p className="text-gray-600 text-sm mb-4">{goal.description}</p>

                    {/* Progress Bar */}
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-bold text-gray-900">{goal.progress}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div
                          className={`${getProgressColor(goal.progress)} h-3 rounded-full transition-all duration-500`}
                          style={{ width: `${goal.progress}%` }}
                        ></div>
                      </div>
                    </div>

                    {/* Milestones */}
                    {goal.milestones && goal.milestones.length > 0 && (
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-700 mb-2">Milestones:</p>
                        <ul className="space-y-2">
                          {goal.milestones.map((milestone, i) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <CheckCircle2 
                                className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                                  milestone.completed ? 'text-green-500' : 'text-gray-300'
                                }`}
                              />
                              <span className={milestone.completed ? 'text-gray-500 line-through' : 'text-gray-700'}>
                                {milestone.text}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Target Date */}
                    {goal.target_date && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>
                          Target: {new Date(goal.target_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ParentGoals;
