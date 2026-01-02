import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { 
  ArrowLeft, Calendar, Clock, Users, Video, Phone, MessageSquare,
  Plus, CheckCircle, XCircle, AlertCircle, ChevronRight, RefreshCw,
  FileText, User, Baby
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PrincipalConsultations = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [consultations, setConsultations] = useState([]);
  const [requests, setRequests] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [students, setStudents] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedConsultation, setSelectedConsultation] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [showApproveModal, setShowApproveModal] = useState(null);
  const [formData, setFormData] = useState({
    parent_id: '',
    child_id: '',
    scheduled_date: '',
    scheduled_time: '',
    consultation_type: 'progress_review',
    notes: ''
  });
  const [approveData, setApproveData] = useState({
    scheduled_date: '',
    scheduled_time: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('principal_token');
    if (!token) {
      navigate('/principal/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('principal_token');
      const [consultationsRes, requestsRes, studentsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/principal/consultations?token=${token}`),
        axios.get(`${BACKEND_URL}/api/principal/consultation-requests?token=${token}`),
        axios.get(`${BACKEND_URL}/api/principal/students?token=${token}`)
      ]);
      
      setConsultations(consultationsRes.data.consultations || []);
      setStatusCounts(consultationsRes.data.status_counts || {});
      setRequests(requestsRes.data.requests || []);
      setStudents(studentsRes.data.students || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const createConsultation = async () => {
    if (!formData.parent_id || !formData.child_id || !formData.scheduled_date || !formData.scheduled_time) {
      toast({ title: "Error", description: "Please fill all required fields", variant: "destructive" });
      return;
    }
    
    try {
      const token = localStorage.getItem('principal_token');
      const params = new URLSearchParams({
        ...formData,
        token
      });
      
      await axios.post(`${BACKEND_URL}/api/principal/consultations?${params}`);
      toast({ title: "Success", description: "Consultation scheduled" });
      setShowForm(false);
      setFormData({
        parent_id: '', child_id: '', scheduled_date: '', scheduled_time: '',
        consultation_type: 'progress_review', notes: ''
      });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.detail || "Failed to create", variant: "destructive" });
    }
  };

  const updateConsultation = async (consultationId, status) => {
    try {
      const token = localStorage.getItem('principal_token');
      await axios.put(
        `${BACKEND_URL}/api/principal/consultations/${consultationId}?token=${token}&status=${status}`
      );
      toast({ title: "Updated", description: `Consultation marked as ${status}` });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const approveRequest = async (requestId) => {
    if (!approveData.scheduled_date || !approveData.scheduled_time) {
      toast({ title: "Error", description: "Please select date and time", variant: "destructive" });
      return;
    }
    
    try {
      const token = localStorage.getItem('principal_token');
      const params = new URLSearchParams({
        token,
        scheduled_date: approveData.scheduled_date,
        scheduled_time: approveData.scheduled_time
      });
      
      await axios.post(`${BACKEND_URL}/api/principal/consultation-requests/${requestId}/approve?${params}`);
      toast({ title: "Approved", description: "Consultation scheduled" });
      setShowApproveModal(null);
      setApproveData({ scheduled_date: '', scheduled_time: '' });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to approve", variant: "destructive" });
    }
  };

  const cancelConsultation = async (consultationId) => {
    try {
      const token = localStorage.getItem('principal_token');
      await axios.delete(`${BACKEND_URL}/api/principal/consultations/${consultationId}?token=${token}`);
      toast({ title: "Cancelled", description: "Consultation cancelled" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to cancel", variant: "destructive" });
    }
  };

  const filteredConsultations = consultations.filter(c => 
    filterStatus === 'all' || c.status === filterStatus
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-700';
      case 'completed': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      case 'pending_approval': return 'bg-amber-100 text-amber-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getConsultationTypeLabel = (type) => {
    switch (type) {
      case 'progress_review': return 'Progress Review';
      case 'concern_discussion': return 'Concern Discussion';
      case 'general': return 'General';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // Get unique parents from students
  const parents = students.reduce((acc, student) => {
    if (student.parent_ids) {
      student.parent_ids.forEach(parentId => {
        if (!acc.find(p => p.id === parentId)) {
          acc.push({ 
            id: parentId, 
            name: student.parents?.[0]?.name || 'Parent',
            child_id: student.id,
            child_name: student.name
          });
        }
      });
    }
    return acc;
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/principal/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Parent Consultations</h1>
            <p className="text-gray-600">Schedule and manage parent meetings</p>
          </div>
          <Button onClick={() => setShowForm(true)} className="bg-blue-500 hover:bg-blue-600" data-testid="schedule-consultation-btn">
            <Plus className="w-4 h-4 mr-2" /> Schedule Consultation
          </Button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-sm bg-blue-50 cursor-pointer hover:shadow-md" onClick={() => setFilterStatus('scheduled')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-700">{statusCounts.scheduled || 0}</p>
                  <p className="text-sm text-blue-600">Scheduled</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-green-50 cursor-pointer hover:shadow-md" onClick={() => setFilterStatus('completed')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-700">{statusCounts.completed || 0}</p>
                  <p className="text-sm text-green-600">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-amber-50 cursor-pointer hover:shadow-md" onClick={() => setFilterStatus('pending_approval')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold text-amber-700">{statusCounts.pending_approval || 0}</p>
                  <p className="text-sm text-amber-600">Pending</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-red-50 cursor-pointer hover:shadow-md" onClick={() => setFilterStatus('cancelled')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <XCircle className="w-8 h-8 text-red-600" />
                <div>
                  <p className="text-2xl font-bold text-red-700">{statusCounts.cancelled || 0}</p>
                  <p className="text-sm text-red-600">Cancelled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* New Consultation Form */}
        {showForm && (
          <Card className="border-2 border-blue-200 bg-blue-50 mb-6">
            <CardHeader>
              <CardTitle>Schedule New Consultation</CardTitle>
              <CardDescription>Set up a meeting with a parent</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Select Student *</label>
                  <select 
                    className="w-full border rounded-md p-2 mt-1"
                    value={formData.child_id}
                    onChange={(e) => {
                      const student = students.find(s => s.id === e.target.value);
                      setFormData({
                        ...formData, 
                        child_id: e.target.value,
                        parent_id: student?.parent_ids?.[0] || ''
                      });
                    }}
                  >
                    <option value="">Select a student...</option>
                    {students.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - {s.grade}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Consultation Type *</label>
                  <select 
                    className="w-full border rounded-md p-2 mt-1"
                    value={formData.consultation_type}
                    onChange={(e) => setFormData({...formData, consultation_type: e.target.value})}
                  >
                    <option value="progress_review">Progress Review</option>
                    <option value="concern_discussion">Concern Discussion</option>
                    <option value="general">General Meeting</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-sm font-medium">Date *</label>
                  <Input 
                    type="date" 
                    value={formData.scheduled_date}
                    onChange={(e) => setFormData({...formData, scheduled_date: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium">Time *</label>
                  <Input 
                    type="time" 
                    value={formData.scheduled_time}
                    onChange={(e) => setFormData({...formData, scheduled_time: e.target.value})}
                    className="mt-1"
                  />
                </div>
                
                <div className="md:col-span-2">
                  <label className="text-sm font-medium">Notes</label>
                  <textarea 
                    className="w-full border rounded-md p-2 mt-1"
                    rows={2}
                    placeholder="Add any notes for the consultation..."
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex gap-3 mt-4">
                <Button onClick={createConsultation} className="bg-green-500 hover:bg-green-600">
                  Schedule Consultation
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Consultations List */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>All Consultations</CardTitle>
                  <div className="flex gap-2">
                    <select 
                      className="border rounded-md px-3 py-1 text-sm"
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                    >
                      <option value="all">All Status</option>
                      <option value="scheduled">Scheduled</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                    <Button variant="outline" size="sm" onClick={fetchData}>
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                {filteredConsultations.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No consultations found</p>
                ) : (
                  <div className="space-y-3">
                    {filteredConsultations.map(consultation => (
                      <div 
                        key={consultation.id}
                        className={`p-4 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                          selectedConsultation?.id === consultation.id 
                            ? 'border-blue-500 bg-blue-50' 
                            : 'border-gray-100 bg-white'
                        }`}
                        onClick={() => setSelectedConsultation(consultation)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-full flex items-center justify-center">
                              <Users className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900">
                                {consultation.parent_name || 'Parent'}
                              </p>
                              <p className="text-sm text-gray-600 flex items-center gap-1">
                                <Baby className="w-3 h-3" />
                                {consultation.child_name || 'Student'}
                              </p>
                            </div>
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(consultation.status)}`}>
                            {consultation.status}
                          </span>
                        </div>
                        
                        <div className="mt-3 flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {consultation.scheduled_date}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {consultation.scheduled_time}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 rounded text-xs">
                            {getConsultationTypeLabel(consultation.consultation_type)}
                          </span>
                        </div>
                        
                        {selectedConsultation?.id === consultation.id && consultation.status === 'scheduled' && (
                          <div className="mt-3 pt-3 border-t flex gap-2">
                            <Button size="sm" onClick={() => updateConsultation(consultation.id, 'completed')} className="bg-green-500 hover:bg-green-600">
                              <CheckCircle className="w-4 h-4 mr-1" /> Complete
                            </Button>
                            <Button size="sm" variant="outline" className="text-red-600" onClick={() => cancelConsultation(consultation.id)}>
                              <XCircle className="w-4 h-4 mr-1" /> Cancel
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Panel - Requests */}
          <div>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-500" />
                  Consultation Requests
                </CardTitle>
                <CardDescription>Pending requests from parents</CardDescription>
              </CardHeader>
              <CardContent className="max-h-[400px] overflow-y-auto">
                {requests.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No pending requests</p>
                ) : (
                  <div className="space-y-3">
                    {requests.map(request => (
                      <div key={request.id} className="p-3 bg-amber-50 rounded-lg border border-amber-100">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium">{request.parent?.name || 'Parent'}</p>
                            <p className="text-sm text-gray-600">
                              For: {request.child?.name || 'Student'}
                            </p>
                          </div>
                          <span className="px-2 py-0.5 bg-amber-200 text-amber-800 rounded text-xs">
                            Pending
                          </span>
                        </div>
                        {request.notes && (
                          <p className="text-sm text-gray-500 mt-2 p-2 bg-white rounded">
                            "{request.notes}"
                          </p>
                        )}
                        <div className="mt-3">
                          <Button 
                            size="sm" 
                            className="w-full bg-amber-500 hover:bg-amber-600"
                            onClick={() => setShowApproveModal(request)}
                          >
                            Schedule Meeting
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Consultation Details */}
            {selectedConsultation && (
              <Card className="border-0 shadow-sm mt-4">
                <CardHeader>
                  <CardTitle>Consultation Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Parent</p>
                    <p className="font-medium">{selectedConsultation.parent_name}</p>
                    <p className="text-sm text-gray-600">{selectedConsultation.parent_email}</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Student</p>
                    <p className="font-medium">{selectedConsultation.child_name}</p>
                  </div>
                  
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-500">Type</p>
                    <p className="font-medium">{getConsultationTypeLabel(selectedConsultation.consultation_type)}</p>
                  </div>
                  
                  {selectedConsultation.notes && (
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm text-gray-500">Notes</p>
                      <p className="text-sm">{selectedConsultation.notes}</p>
                    </div>
                  )}
                  
                  {selectedConsultation.summary && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <p className="text-sm text-gray-500">Summary</p>
                      <p className="text-sm">{selectedConsultation.summary}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Approve Request Modal */}
      {showApproveModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle>Schedule Consultation</CardTitle>
              <CardDescription>
                Approve request from {showApproveModal.parent?.name || 'Parent'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Date *</label>
                <Input 
                  type="date" 
                  value={approveData.scheduled_date}
                  onChange={(e) => setApproveData({...approveData, scheduled_date: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Time *</label>
                <Input 
                  type="time" 
                  value={approveData.scheduled_time}
                  onChange={(e) => setApproveData({...approveData, scheduled_time: e.target.value})}
                  className="mt-1"
                />
              </div>
              <div className="flex gap-3 pt-4">
                <Button 
                  onClick={() => approveRequest(showApproveModal.id)} 
                  className="flex-1 bg-green-500 hover:bg-green-600"
                >
                  Approve & Schedule
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setShowApproveModal(null);
                    setApproveData({ scheduled_date: '', scheduled_time: '' });
                  }}
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

export default PrincipalConsultations;
