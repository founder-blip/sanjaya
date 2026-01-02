import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { 
  Brain, Send, Smile, Target, Sun, Moon, RefreshCw,
  CheckCircle, Calendar
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import ObserverNav from '../components/ObserverNav';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ObserverSelfReflection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [reflections, setReflections] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    reflection_date: new Date().toISOString().split('T')[0],
    session_count: 0,
    what_went_well: '',
    what_could_improve: '',
    challenges_faced: '',
    learning_moments: '',
    emotional_state: 'neutral',
    support_needed: '',
    goals_for_tomorrow: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('observer_token');
    if (!token) {
      navigate('/observer/login');
      return;
    }
    fetchReflections();
  }, [navigate]);

  const fetchReflections = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('observer_token');
      const response = await axios.get(`${BACKEND_URL}/api/observer/self-reflections?token=${token}`);
      setReflections(response.data.reflections || []);
    } catch (error) {
      console.error('Error fetching reflections:', error);
    } finally {
      setLoading(false);
    }
  };

  const submitReflection = async () => {
    if (!formData.what_went_well || !formData.what_could_improve) {
      toast({ title: "Required", description: "Please fill what went well and what could improve", variant: "destructive" });
      return;
    }
    
    setSubmitting(true);
    try {
      const token = localStorage.getItem('observer_token');
      const params = new URLSearchParams({
        token,
        ...formData
      });
      
      await axios.post(`${BACKEND_URL}/api/observer/self-reflection?${params}`);
      toast({ title: "Submitted!", description: "Your self-reflection has been saved" });
      setShowForm(false);
      setFormData({
        reflection_date: new Date().toISOString().split('T')[0],
        session_count: 0,
        what_went_well: '',
        what_could_improve: '',
        challenges_faced: '',
        learning_moments: '',
        emotional_state: 'neutral',
        support_needed: '',
        goals_for_tomorrow: ''
      });
      fetchReflections();
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit reflection", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const getStateEmoji = (state) => {
    switch (state) {
      case 'energized': return '⚡';
      case 'neutral': return '😐';
      case 'tired': return '😴';
      case 'stressed': return '😰';
      default: return '😐';
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
      <ObserverNav />
      
      <div className="max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Self-Reflection Log</h1>
            <p className="text-gray-600">Reflect on your sessions and growth</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={fetchReflections}>
              <RefreshCw className="w-4 h-4 mr-2" /> Refresh
            </Button>
            <Button onClick={() => setShowForm(true)} className="bg-purple-500 hover:bg-purple-600">
              <Brain className="w-4 h-4 mr-2" /> New Reflection
            </Button>
          </div>
        </div>

        {/* Reflections List */}
        {reflections.length === 0 ? (
          <Card className="border-0 shadow-sm">
            <CardContent className="py-12 text-center">
              <Brain className="w-16 h-16 mx-auto text-gray-300 mb-4" />
              <p className="text-gray-500 text-lg">No reflections yet</p>
              <p className="text-gray-400 mb-4">Start by adding your first self-reflection</p>
              <Button onClick={() => setShowForm(true)} className="bg-purple-500 hover:bg-purple-600">
                Add First Reflection
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {reflections.map(reflection => (
              <Card key={reflection.id} className="border-0 shadow-sm">
                <CardContent className="p-5">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-2xl">
                        {getStateEmoji(reflection.emotional_state)}
                      </div>
                      <div>
                        <p className="font-semibold">{new Date(reflection.reflection_date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}</p>
                        <p className="text-sm text-gray-500">{reflection.session_count} sessions</p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      reflection.emotional_state === 'energized' ? 'bg-green-100 text-green-700' :
                      reflection.emotional_state === 'tired' ? 'bg-amber-100 text-amber-700' :
                      reflection.emotional_state === 'stressed' ? 'bg-red-100 text-red-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {reflection.emotional_state}
                    </span>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm font-medium text-green-700 mb-1">What went well</p>
                      <p className="text-sm text-green-600">{reflection.what_went_well}</p>
                    </div>
                    <div className="p-3 bg-amber-50 rounded-lg">
                      <p className="text-sm font-medium text-amber-700 mb-1">What could improve</p>
                      <p className="text-sm text-amber-600">{reflection.what_could_improve}</p>
                    </div>
                  </div>
                  
                  {reflection.challenges_faced && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm font-medium text-gray-700 mb-1">Challenges</p>
                      <p className="text-sm text-gray-600">{reflection.challenges_faced}</p>
                    </div>
                  )}
                  
                  {reflection.goals_for_tomorrow && (
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-sm font-medium text-blue-700 mb-1">Goals for tomorrow</p>
                      <p className="text-sm text-blue-600">{reflection.goals_for_tomorrow}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* New Reflection Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-purple-500" />
                Daily Self-Reflection
              </CardTitle>
              <CardDescription>Take a moment to reflect on your day</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Date</label>
                  <input 
                    type="date" 
                    className="w-full border rounded-md p-2 mt-1"
                    value={formData.reflection_date}
                    onChange={(e) => setFormData({...formData, reflection_date: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Sessions Today</label>
                  <input 
                    type="number" 
                    className="w-full border rounded-md p-2 mt-1"
                    value={formData.session_count}
                    onChange={(e) => setFormData({...formData, session_count: parseInt(e.target.value) || 0})}
                    min="0"
                  />
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium">How are you feeling?</label>
                <div className="grid grid-cols-4 gap-2 mt-1">
                  {['energized', 'neutral', 'tired', 'stressed'].map(state => (
                    <button
                      key={state}
                      onClick={() => setFormData({...formData, emotional_state: state})}
                      className={`p-3 rounded-lg border-2 text-center transition-all ${
                        formData.emotional_state === state 
                          ? 'border-purple-500 bg-purple-50' 
                          : 'border-gray-200'
                      }`}
                    >
                      <span className="text-2xl">{getStateEmoji(state)}</span>
                      <p className="text-xs mt-1 capitalize">{state}</p>
                    </button>
                  ))}
                </div>
              </div>
              
              <div>
                <label className="text-sm font-medium text-green-600">What went well today? *</label>
                <textarea 
                  className="w-full border border-green-200 rounded-md p-2 mt-1 bg-green-50"
                  rows={2}
                  placeholder="Celebrate your wins..."
                  value={formData.what_went_well}
                  onChange={(e) => setFormData({...formData, what_went_well: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-amber-600">What could improve? *</label>
                <textarea 
                  className="w-full border border-amber-200 rounded-md p-2 mt-1 bg-amber-50"
                  rows={2}
                  placeholder="Areas for growth..."
                  value={formData.what_could_improve}
                  onChange={(e) => setFormData({...formData, what_could_improve: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Challenges faced</label>
                <textarea 
                  className="w-full border rounded-md p-2 mt-1"
                  rows={2}
                  placeholder="What was difficult?"
                  value={formData.challenges_faced}
                  onChange={(e) => setFormData({...formData, challenges_faced: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Learning moments</label>
                <textarea 
                  className="w-full border rounded-md p-2 mt-1"
                  rows={2}
                  placeholder="What did you learn?"
                  value={formData.learning_moments}
                  onChange={(e) => setFormData({...formData, learning_moments: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Support needed</label>
                <textarea 
                  className="w-full border rounded-md p-2 mt-1"
                  rows={2}
                  placeholder="Do you need any help?"
                  value={formData.support_needed}
                  onChange={(e) => setFormData({...formData, support_needed: e.target.value})}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium text-blue-600">Goals for tomorrow</label>
                <textarea 
                  className="w-full border border-blue-200 rounded-md p-2 mt-1 bg-blue-50"
                  rows={2}
                  placeholder="What do you want to focus on?"
                  value={formData.goals_for_tomorrow}
                  onChange={(e) => setFormData({...formData, goals_for_tomorrow: e.target.value})}
                />
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button 
                  className="flex-1 bg-purple-500 hover:bg-purple-600"
                  onClick={submitReflection}
                  disabled={submitting}
                >
                  {submitting ? 'Submitting...' : (
                    <>
                      <Send className="w-4 h-4 mr-2" /> Submit Reflection
                    </>
                  )}
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setShowForm(false)}
                >
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

export default ObserverSelfReflection;
