import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { 
  ArrowLeft, Play, Pause, CheckCircle, AlertTriangle, Clock,
  User, Baby, Calendar, Star, Filter, RefreshCw, Flag, Eye
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PrincipalRecordings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [recordings, setRecordings] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [reviewData, setReviewData] = useState({ status: '', notes: '', rating: 5 });

  useEffect(() => {
    const token = localStorage.getItem('principal_token');
    if (!token) {
      navigate('/principal/login');
      return;
    }
    fetchRecordings();
  }, [navigate, filterStatus]);

  const fetchRecordings = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('principal_token');
      let url = `${BACKEND_URL}/api/principal/session-recordings?token=${token}`;
      if (filterStatus !== 'all') {
        url += `&status=${filterStatus}`;
      }
      const response = await axios.get(url);
      setRecordings(response.data.recordings || []);
      setStatusCounts(response.data.status_counts || {});
    } catch (error) {
      console.error('Error fetching recordings:', error);
      toast({ title: "Error", description: "Failed to load recordings", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const submitReview = async (recordingId) => {
    try {
      const token = localStorage.getItem('principal_token');
      const params = new URLSearchParams({
        token,
        review_status: reviewData.status,
        review_notes: reviewData.notes,
        rating: reviewData.rating
      });
      
      await axios.put(`${BACKEND_URL}/api/principal/session-recordings/${recordingId}/review?${params}`);
      toast({ title: "Success", description: "Recording reviewed successfully" });
      setSelectedRecording(null);
      setReviewData({ status: '', notes: '', rating: 5 });
      fetchRecordings();
    } catch (error) {
      toast({ title: "Error", description: "Failed to submit review", variant: "destructive" });
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case 'pending_review': return 'bg-amber-100 text-amber-700';
      case 'reviewed': return 'bg-blue-100 text-blue-700';
      case 'approved': return 'bg-green-100 text-green-700';
      case 'flagged': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
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
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/principal/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Session Recordings</h1>
            <p className="text-gray-600">Review observer-child session recordings</p>
          </div>
          <Button variant="outline" onClick={fetchRecordings}>
            <RefreshCw className="w-4 h-4 mr-2" /> Refresh
          </Button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card 
            className={`border-0 shadow-sm cursor-pointer transition-all ${filterStatus === 'pending_review' ? 'ring-2 ring-amber-500' : ''} bg-amber-50`}
            onClick={() => setFilterStatus('pending_review')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold text-amber-700">{statusCounts.pending_review || 0}</p>
                  <p className="text-sm text-amber-600">Pending Review</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`border-0 shadow-sm cursor-pointer transition-all ${filterStatus === 'approved' ? 'ring-2 ring-green-500' : ''} bg-green-50`}
            onClick={() => setFilterStatus('approved')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-700">{statusCounts.approved || 0}</p>
                  <p className="text-sm text-green-600">Approved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`border-0 shadow-sm cursor-pointer transition-all ${filterStatus === 'flagged' ? 'ring-2 ring-red-500' : ''} bg-red-50`}
            onClick={() => setFilterStatus('flagged')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-700">{statusCounts.flagged || 0}</p>
                  <p className="text-sm text-red-600">Flagged</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card 
            className={`border-0 shadow-sm cursor-pointer transition-all ${filterStatus === 'all' ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => setFilterStatus('all')}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Eye className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-700">{recordings.length}</p>
                  <p className="text-sm text-blue-600">All Recordings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Recordings List */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Recordings</CardTitle>
                <CardDescription>Click to review a session recording</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                {recordings.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Play className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>No recordings found</p>
                    <p className="text-sm mt-1">Recordings will appear here when observers conduct sessions</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recordings.map(recording => (
                      <div 
                        key={recording.id}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                          selectedRecording?.id === recording.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-100 bg-white'
                        }`}
                        onClick={() => setSelectedRecording(recording)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-full flex items-center justify-center">
                              <Play className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {recording.child?.name || 'Unknown Child'}
                              </p>
                              <p className="text-sm text-gray-600 flex items-center gap-2">
                                <User className="w-3 h-3" />
                                {recording.observer?.name || 'Unknown Observer'}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(recording.review_status || 'pending_review')}`}>
                            {(recording.review_status || 'pending_review').replace('_', ' ')}
                          </span>
                        </div>
                        
                        <div className="mt-3 flex items-center gap-4 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(recording.created_at).toLocaleDateString()}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {recording.duration || '0'} min
                          </span>
                          {recording.rating && (
                            <span className="flex items-center gap-1">
                              <Star className="w-4 h-4 text-amber-500" />
                              {recording.rating}/5
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Review Panel */}
          <div>
            <Card className="border-0 shadow-sm sticky top-4">
              <CardHeader>
                <CardTitle>Review Recording</CardTitle>
                <CardDescription>
                  {selectedRecording ? `Session with ${selectedRecording.child?.name}` : 'Select a recording to review'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {selectedRecording ? (
                  <div className="space-y-4">
                    {/* Recording Info */}
                    <div className="p-4 bg-gray-50 rounded-lg space-y-2">
                      <div className="flex items-center gap-2">
                        <Baby className="w-4 h-4 text-gray-500" />
                        <span className="font-medium">{selectedRecording.child?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-gray-500" />
                        <span>{selectedRecording.observer?.name}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-gray-500" />
                        <span>{new Date(selectedRecording.created_at).toLocaleString()}</span>
                      </div>
                    </div>

                    {/* Audio Player Placeholder */}
                    <div className="p-6 bg-gradient-to-r from-purple-100 to-indigo-100 rounded-lg text-center">
                      <Play className="w-12 h-12 mx-auto text-purple-600 mb-2" />
                      <p className="text-sm text-purple-700">Audio Player</p>
                      <p className="text-xs text-purple-500 mt-1">
                        {selectedRecording.audio_url ? 'Click to play' : 'No audio available'}
                      </p>
                    </div>

                    {/* Session Notes */}
                    {selectedRecording.session_notes && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <p className="text-sm font-medium text-blue-700 mb-1">Observer Notes</p>
                        <p className="text-sm text-blue-600">{selectedRecording.session_notes}</p>
                      </div>
                    )}

                    {/* Review Form */}
                    <div className="space-y-3 pt-4 border-t">
                      <div>
                        <label className="text-sm font-medium">Review Status *</label>
                        <select 
                          className="w-full border rounded-md p-2 mt-1"
                          value={reviewData.status}
                          onChange={(e) => setReviewData({...reviewData, status: e.target.value})}
                        >
                          <option value="">Select status...</option>
                          <option value="approved">Approved</option>
                          <option value="reviewed">Reviewed (Needs Follow-up)</option>
                          <option value="flagged">Flagged (Concern)</option>
                        </select>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Rating</label>
                        <div className="flex gap-1 mt-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onClick={() => setReviewData({...reviewData, rating: star})}
                              className={`p-1 ${reviewData.rating >= star ? 'text-amber-500' : 'text-gray-300'}`}
                            >
                              <Star className="w-6 h-6 fill-current" />
                            </button>
                          ))}
                        </div>
                      </div>
                      
                      <div>
                        <label className="text-sm font-medium">Notes</label>
                        <textarea 
                          className="w-full border rounded-md p-2 mt-1"
                          rows={3}
                          placeholder="Add review notes..."
                          value={reviewData.notes}
                          onChange={(e) => setReviewData({...reviewData, notes: e.target.value})}
                        />
                      </div>
                      
                      <Button 
                        className="w-full"
                        disabled={!reviewData.status}
                        onClick={() => submitReview(selectedRecording.id)}
                      >
                        Submit Review
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 text-gray-500">
                    <Play className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>Select a recording to review</p>
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

export default PrincipalRecordings;
