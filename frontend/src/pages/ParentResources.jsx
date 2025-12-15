import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Book, Clock, Target } from 'lucide-react';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ParentResources = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('activities');
  const [activities, setActivities] = useState([]);
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedActivity, setSelectedActivity] = useState(null);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('parent_token')}` }
  });

  useEffect(() => {
    const token = localStorage.getItem('parent_token');
    if (!token) {
      navigate('/parent/login');
      return;
    }
    loadResources();
  }, [navigate]);

  const loadResources = async () => {
    try {
      const [activitiesRes, articlesRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/resources/activities`, getAuthHeaders()),
        axios.get(`${BACKEND_URL}/api/resources/articles`, getAuthHeaders())
      ]);
      
      setActivities(activitiesRes.data.activities || []);
      setArticles(articlesRes.data.articles || []);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCategoryColor = (category) => {
    const colors = {
      emotional_regulation: 'bg-blue-100 text-blue-700',
      communication: 'bg-green-100 text-green-700',
      confidence: 'bg-purple-100 text-purple-700',
      social_skills: 'bg-orange-100 text-orange-700'
    };
    return colors[category] || 'bg-gray-100 text-gray-700';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      easy: 'text-green-600',
      medium: 'text-yellow-600',
      hard: 'text-red-600'
    };
    return colors[difficulty] || 'text-gray-600';
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
            <h1 className="text-3xl font-bold text-gray-900">Resources & Activities</h1>
          </div>

          {/* Tabs */}
          <div className="flex gap-2 mb-6">
            <Button
              onClick={() => setActiveTab('activities')}
              variant={activeTab === 'activities' ? 'default' : 'outline'}
              className={activeTab === 'activities' ? 'bg-blue-500' : ''}
            >
              <Target className="w-4 h-4 mr-2" />
              Activities
            </Button>
            <Button
              onClick={() => setActiveTab('articles')}
              variant={activeTab === 'articles' ? 'default' : 'outline'}
              className={activeTab === 'articles' ? 'bg-blue-500' : ''}
            >
              <Book className="w-4 h-4 mr-2" />
              Articles
            </Button>
          </div>

          {/* Activities Tab */}
          {activeTab === 'activities' && (
            <>
              {activities.length === 0 ? (
                <div className="text-center py-12">
                  <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No activities available yet</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {activities.map((activity) => (
                <Card
                  key={activity.id}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setSelectedActivity(activity)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="font-bold text-lg">{activity.title}</h3>
                      <span className={`text-xs font-semibold ${getDifficultyColor(activity.difficulty)}`}>
                        {activity.difficulty.toUpperCase()}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-4">{activity.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mb-3">
                      <span className={`text-xs px-2 py-1 rounded-full ${getCategoryColor(activity.category)}`}>
                        {activity.category.replace('_', ' ')}
                      </span>
                      <span className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-full">
                        Ages {activity.age_range}
                      </span>
                    </div>
                    
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="w-4 h-4 mr-1" />
                      {activity.duration_minutes} minutes
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Articles Tab */}
          {activeTab === 'articles' && (
            <>
              {articles.length === 0 ? (
                <div className="text-center py-12">
                  <Book className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">No articles available yet</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {articles.map((article) => (
                <Card key={article.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="font-bold text-xl mb-2">{article.title}</h3>
                        <p className="text-gray-600 mb-3">{article.excerpt}</p>
                        <div className="flex gap-4 text-sm text-gray-500">
                          <span className="flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {article.read_time_minutes} min read
                          </span>
                          <span>By {article.author}</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Activity Detail Modal */}
      {selectedActivity && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setSelectedActivity(null)}>
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold mb-4">{selectedActivity.title}</h2>
              
              <div className="flex gap-2 mb-4">
                <span className={`text-xs px-3 py-1 rounded-full ${getCategoryColor(selectedActivity.category)}`}>
                  {selectedActivity.category.replace('_', ' ')}
                </span>
                <span className="text-xs bg-gray-100 px-3 py-1 rounded-full">
                  Ages {selectedActivity.age_range}
                </span>
                <span className={`text-xs px-3 py-1 rounded-full font-semibold ${getDifficultyColor(selectedActivity.difficulty)}`}>
                  {selectedActivity.difficulty}
                </span>
              </div>

              <p className="text-gray-700 mb-6">{selectedActivity.description}</p>

              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">Materials Needed:</h3>
                <ul className="list-disc list-inside space-y-1">
                  {selectedActivity.materials_needed.map((material, i) => (
                    <li key={i} className="text-gray-700">{material}</li>
                  ))}
                </ul>
              </div>

              <div className="mb-6">
                <h3 className="font-bold text-lg mb-2">Instructions:</h3>
                <ol className="list-decimal list-inside space-y-2">
                  {selectedActivity.instructions.map((instruction, i) => (
                    <li key={i} className="text-gray-700">{instruction}</li>
                  ))}
                </ol>
              </div>

              <div className="mb-6 p-4 bg-green-50 rounded-lg">
                <h3 className="font-bold text-lg mb-2 text-green-800">Tips:</h3>
                <ul className="space-y-1">
                  {selectedActivity.tips.map((tip, i) => (
                    <li key={i} className="text-green-700">• {tip}</li>
                  ))}
                </ul>
              </div>

              <Button onClick={() => setSelectedActivity(null)} className="w-full">
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ParentResources;
