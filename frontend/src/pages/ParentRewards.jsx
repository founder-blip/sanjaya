import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Award, Flame, Trophy } from 'lucide-react';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ParentRewards = () => {
  const navigate = useNavigate();
  const { childId } = useParams();
  const [rewards, setRewards] = useState(null);
  const [loading, setLoading] = useState(true);

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
      loadRewards();
    }
  }, [navigate, childId]);

  const loadRewards = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/parent/child/${childId}/rewards`,
        getAuthHeaders()
      );
      setRewards(response.data);
    } catch (error) {
      console.error('Error loading rewards:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRarityColor = (rarity) => {
    const colors = {
      common: 'border-gray-300 bg-gray-50',
      rare: 'border-blue-300 bg-blue-50',
      epic: 'border-purple-300 bg-purple-50',
      legendary: 'border-yellow-300 bg-yellow-50'
    };
    return colors[rarity] || colors.common;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!rewards) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>No rewards data available</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Rewards & Achievements</h1>
          </div>

          {/* Streak Section */}
          <Card className="mb-6 bg-gradient-to-r from-orange-500 to-red-500 text-white">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <Flame className="w-8 h-8" />
                    <h2 className="text-3xl font-bold">Current Streak</h2>
                  </div>
                  <p className="text-white/90">Keep the momentum going!</p>
                </div>
                <div className="text-right">
                  <p className="text-6xl font-bold">{rewards.streak.current_streak}</p>
                  <p className="text-white/90">days in a row</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-white/80 text-sm">Longest Streak</p>
                  <p className="text-2xl font-bold">{rewards.streak.longest_streak} days</p>
                </div>
                <div className="bg-white/10 rounded-lg p-4">
                  <p className="text-white/80 text-sm">Total Sessions</p>
                  <p className="text-2xl font-bold">{rewards.streak.total_sessions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Badges Section */}
          <Card>
            <CardContent className="p-8">
              <div className="flex items-center gap-3 mb-6">
                <Award className="w-6 h-6 text-yellow-600" />
                <h2 className="text-2xl font-bold">Badges Earned ({rewards.total_badges})</h2>
              </div>

              {rewards.badges.length === 0 ? (
                <div className="text-center py-12">
                  <Trophy className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No badges earned yet. Keep participating to earn your first badge!</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rewards.badges.map((badge) => (
                    <Card key={badge.name} className={`border-2 ${getRarityColor(badge.rarity)}`}>
                      <CardContent className="p-6">
                        <div className="text-center">
                          <div className="text-5xl mb-3">{badge.icon}</div>
                          <h3 className="font-bold text-lg mb-2">{badge.name}</h3>
                          <p className="text-sm text-gray-600 mb-3">{badge.description}</p>
                          <div className="flex items-center justify-center gap-2 mb-2">
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              badge.rarity === 'common' ? 'bg-gray-200 text-gray-700' :
                              badge.rarity === 'rare' ? 'bg-blue-200 text-blue-700' :
                              badge.rarity === 'epic' ? 'bg-purple-200 text-purple-700' :
                              'bg-yellow-200 text-yellow-700'
                            }`}>
                              {badge.rarity.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">
                            Earned {new Date(badge.earned_at).toLocaleDateString()}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Upcoming Badges */}
          <Card className="mt-6">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">Badges to Earn</h2>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="p-4 bg-gray-50 rounded-lg text-center opacity-60">
                  <div className="text-4xl mb-2">🌟</div>
                  <p className="font-bold">Month Master</p>
                  <p className="text-sm text-gray-600">Complete 30 consecutive sessions</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center opacity-60">
                  <div className="text-4xl mb-2">🎯</div>
                  <p className="font-bold">Goal Getter</p>
                  <p className="text-sm text-gray-600">Achieve all progress goals</p>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg text-center opacity-60">
                  <div className="text-4xl mb-2">👑</div>
                  <p className="font-bold">Champion</p>
                  <p className="text-sm text-gray-600">Maintain 60-day streak</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ParentRewards;
