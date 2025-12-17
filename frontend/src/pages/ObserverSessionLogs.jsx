import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Plus, Calendar, Clock, Brain, Tag, TrendingUp, FileText, Loader2, CheckCircle, AlertCircle, ChevronDown, ChevronUp, Sparkles } from 'lucide-react';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ObserverSessionLogs = () => {
  const navigate = useNavigate();
  const { childId } = useParams();
  const [child, setChild] = useState(null);
  const [sessionLogs, setSessionLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [expandedLog, setExpandedLog] = useState(null);
  const [trends, setTrends] = useState(null);
  
  const [formData, setFormData] = useState({
    session_date: new Date().toISOString().split('T')[0],
    duration_minutes: 5,
    mood_observed: 'neutral',
    energy_level: 'medium',
    engagement_level: 'moderate',
    session_notes: '',
    topics_discussed: '',
    positive_observations: '',
    concerns_noted: ''
  });

  const moods = [
    { value: 'very_happy', label: 'Very Happy', emoji: '😄' },
    { value: 'happy', label: 'Happy', emoji: '😊' },
    { value: 'neutral', label: 'Neutral', emoji: '😐' },
    { value: 'sad', label: 'Sad', emoji: '😢' },
    { value: 'anxious', label: 'Anxious', emoji: '😰' },
    { value: 'angry', label: 'Frustrated', emoji: '😤' }
  ];

  const energyLevels = ['low', 'medium', 'high'];
  const engagementLevels = ['minimal', 'moderate', 'high', 'very_high'];

  useEffect(() => {
    const token = localStorage.getItem('observer_token');
    if (!token) {
      navigate('/observer/login');
      return;
    }
    loadData();
  }, [navigate, childId]);

  const loadData = async () => {
    try {
      const token = localStorage.getItem('observer_token');
      
      const [logsRes, trendsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/observer/session-logs/${childId}?token=${token}`),
        axios.get(`${BACKEND_URL}/api/observer/trends/${childId}?token=${token}&days=30`).catch(() => ({ data: null }))
      ]);
      
      setSessionLogs(logsRes.data.session_logs || []);
      setChild(logsRes.data.child);
      if (trendsRes.data) setTrends(trendsRes.data);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      const token = localStorage.getItem('observer_token');
      const params = new URLSearchParams({
        child_id: childId,
        token: token,
        ...formData
      });
      
      await axios.post(`${BACKEND_URL}/api/observer/session-log?${params.toString()}`);
      
      setShowForm(false);
      setFormData({
        session_date: new Date().toISOString().split('T')[0],
        duration_minutes: 5,
        mood_observed: 'neutral',
        energy_level: 'medium',
        engagement_level: 'moderate',
        session_notes: '',
        topics_discussed: '',
        positive_observations: '',
        concerns_noted: ''
      });
      loadData();
    } catch (error) {
      console.error('Error creating session log:', error);
      alert('Failed to save session log');
    } finally {
      setSubmitting(false);
    }
  };

  const getMoodEmoji = (mood) => {
    const found = moods.find(m => m.value === mood);
    return found ? found.emoji : '😐';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white pt-24 pb-8">
        <div className="max-w-6xl mx-auto px-4">
          <Button
            variant="ghost"
            onClick={() => navigate('/observer/dashboard')}
            className="mb-4 text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Brain className="w-8 h-8" />
                AI Session Intelligence
              </h1>
              {child && (
                <p className="text-purple-100 mt-1">
                  {child.name} • Age {child.age} • {child.grade}
                </p>
              )}
            </div>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="bg-white text-purple-600 hover:bg-purple-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Log New Session
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Quick Stats */}
        {trends && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-purple-600">{trends.total_sessions}</p>
                <p className="text-sm text-gray-600">Sessions (30 days)</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-green-600">
                  {trends.top_behavioral_tags?.length || 0}
                </p>
                <p className="text-sm text-gray-600">Behavioral Tags</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <p className="text-3xl font-bold text-blue-600">
                  {Object.keys(trends.mood_distribution || {}).length}
                </p>
                <p className="text-sm text-gray-600">Mood Types</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4 text-center">
                <Button
                  onClick={() => navigate(`/observer/ai-report/${childId}`)}
                  variant="outline"
                  className="w-full"
                >
                  <Sparkles className="w-4 h-4 mr-2" />
                  Generate Report
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Top Behavioral Tags */}
        {trends?.top_behavioral_tags?.length > 0 && (
          <Card className="mb-8">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Tag className="w-5 h-5 text-purple-600" />
                Top Behavioral Tags (Last 30 Days)
              </h3>
              <div className="flex flex-wrap gap-2">
                {trends.top_behavioral_tags.map((item, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm"
                  >
                    {item.tag.replace(/_/g, ' ')}
                    <span className="bg-purple-200 px-1.5 py-0.5 rounded-full text-xs">{item.count}</span>
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* New Session Form */}
        {showForm && (
          <Card className="mb-8 border-2 border-purple-200">
            <CardContent className="p-6">
              <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-600" />
                Log New Session
              </h3>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Session Date</label>
                    <input
                      type="date"
                      value={formData.session_date}
                      onChange={(e) => setFormData({...formData, session_date: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Duration (minutes)</label>
                    <input
                      type="number"
                      value={formData.duration_minutes}
                      onChange={(e) => setFormData({...formData, duration_minutes: parseInt(e.target.value)})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                      min="1"
                      max="60"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mood Observed</label>
                    <select
                      value={formData.mood_observed}
                      onChange={(e) => setFormData({...formData, mood_observed: e.target.value})}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500"
                    >
                      {moods.map(m => (
                        <option key={m.value} value={m.value}>{m.emoji} {m.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Energy Level</label>
                    <div className="flex gap-2">
                      {energyLevels.map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setFormData({...formData, energy_level: level})}
                          className={`flex-1 py-2 px-3 rounded-lg border transition-all capitalize ${
                            formData.energy_level === level
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300'
                          }`}
                        >
                          {level}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Engagement Level</label>
                    <div className="flex gap-2">
                      {engagementLevels.map(level => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setFormData({...formData, engagement_level: level})}
                          className={`flex-1 py-2 px-3 rounded-lg border transition-all capitalize text-sm ${
                            formData.engagement_level === level
                              ? 'bg-purple-600 text-white border-purple-600'
                              : 'bg-white text-gray-700 border-gray-300 hover:border-purple-300'
                          }`}
                        >
                          {level.replace('_', ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Session Notes *</label>
                  <textarea
                    value={formData.session_notes}
                    onChange={(e) => setFormData({...formData, session_notes: e.target.value})}
                    placeholder="Describe what happened during the session..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 h-24"
                    required
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Topics Discussed</label>
                    <textarea
                      value={formData.topics_discussed}
                      onChange={(e) => setFormData({...formData, topics_discussed: e.target.value})}
                      placeholder="School, friends, hobbies, family..."
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 h-20"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Positive Observations</label>
                    <textarea
                      value={formData.positive_observations}
                      onChange={(e) => setFormData({...formData, positive_observations: e.target.value})}
                      placeholder="Good moments, progress, strengths..."
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 h-20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Concerns Noted (if any)</label>
                  <textarea
                    value={formData.concerns_noted}
                    onChange={(e) => setFormData({...formData, concerns_noted: e.target.value})}
                    placeholder="Any worries or areas needing attention..."
                    className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 h-20"
                  />
                </div>

                <div className="flex gap-3">
                  <Button type="submit" disabled={submitting} className="bg-purple-600 hover:bg-purple-700">
                    {submitting ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                    Save & Analyze
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Session Logs List */}
        <div className="space-y-4">
          <h3 className="font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-purple-600" />
            Session Logs ({sessionLogs.length})
          </h3>

          {sessionLogs.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-gray-500">
                <Brain className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No session logs yet. Start by logging your first session!</p>
              </CardContent>
            </Card>
          ) : (
            sessionLogs.map((log) => (
              <Card key={log.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">{getMoodEmoji(log.mood_observed)}</div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-gray-900">{log.session_date}</span>
                          <span className="text-sm text-gray-500">• {log.duration_minutes} min</span>
                          {log.ai_processed && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                              <Brain className="w-3 h-3" /> AI Analyzed
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 line-clamp-1">{log.session_notes}</p>
                      </div>
                    </div>
                    {expandedLog === log.id ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>

                  {expandedLog === log.id && (
                    <div className="mt-4 pt-4 border-t space-y-4">
                      <div className="grid md:grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="text-gray-500">Energy:</span>
                          <span className="ml-2 capitalize font-medium">{log.energy_level}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Engagement:</span>
                          <span className="ml-2 capitalize font-medium">{log.engagement_level?.replace('_', ' ')}</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Mood:</span>
                          <span className="ml-2 capitalize font-medium">{log.mood_observed?.replace('_', ' ')}</span>
                        </div>
                      </div>

                      {log.session_notes && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-1">Session Notes</p>
                          <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">{log.session_notes}</p>
                        </div>
                      )}

                      {log.behavioral_tags?.length > 0 && (
                        <div>
                          <p className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                            <Tag className="w-4 h-4" /> Behavioral Tags (AI)
                          </p>
                          <div className="flex flex-wrap gap-2">
                            {log.behavioral_tags.map((tag, idx) => (
                              <span key={idx} className="bg-purple-100 text-purple-700 px-2 py-1 rounded text-xs">
                                {tag.replace(/_/g, ' ')}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {log.ai_analysis && (
                        <div className="bg-purple-50 p-4 rounded-lg">
                          <p className="text-sm font-medium text-purple-800 mb-2">AI Insights</p>
                          <p className="text-sm text-purple-700">{log.ai_analysis.emotional_summary}</p>
                          {log.ai_analysis.patterns?.length > 0 && (
                            <ul className="mt-2 space-y-1">
                              {log.ai_analysis.patterns.map((p, idx) => (
                                <li key={idx} className="text-sm text-purple-600 flex items-start gap-2">
                                  <TrendingUp className="w-4 h-4 flex-shrink-0 mt-0.5" />
                                  {p}
                                </li>
                              ))}
                            </ul>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default ObserverSessionLogs;
