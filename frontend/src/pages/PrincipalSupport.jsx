import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  HelpCircle, Plus, ArrowLeft, MessageSquare, Clock,
  CheckCircle, AlertCircle, Loader2, Send, ChevronRight,
  Ticket, Building
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { useToast } from '../hooks/use-toast';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function PrincipalSupport() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [showNewTicket, setShowNewTicket] = useState(false);
  const [newTicket, setNewTicket] = useState({ category: '', subject: '', description: '', priority: 'medium' });
  const [submitting, setSubmitting] = useState(false);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const token = localStorage.getItem('principal_token');
    if (!token) {
      navigate('/principal/login');
      return;
    }
    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      const token = localStorage.getItem('principal_token');
      const [ticketsRes, categoriesRes] = await Promise.all([
        axios.get(`${API_URL}/api/support/tickets?token=${token}`),
        axios.get(`${API_URL}/api/support/categories?token=${token}`)
      ]);
      setTickets(ticketsRes.data.tickets || []);
      setStatusCounts(ticketsRes.data.status_counts || {});
      setCategories(categoriesRes.data.categories || []);
    } catch (error) {
      console.error('Error fetching support data:', error);
      toast({
        title: "Error",
        description: "Failed to load support data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTicket = async () => {
    if (!newTicket.category || !newTicket.subject || !newTicket.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    setSubmitting(true);
    try {
      const token = localStorage.getItem('principal_token');
      const response = await axios.post(
        `${API_URL}/api/support/ticket?token=${token}&category=${newTicket.category}&subject=${encodeURIComponent(newTicket.subject)}&description=${encodeURIComponent(newTicket.description)}&priority=${newTicket.priority}`
      );
      
      toast({
        title: "Ticket Created! 🎫",
        description: `Ticket #${response.data.ticket.ticket_number} created successfully`
      });
      
      setShowNewTicket(false);
      setNewTicket({ category: '', subject: '', description: '', priority: 'medium' });
      fetchData();
    } catch (error) {
      console.error('Error creating ticket:', error);
      toast({
        title: "Error",
        description: "Failed to create ticket",
        variant: "destructive"
      });
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'open': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'in_progress': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-green-500" />;
      default: return <MessageSquare className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'open': return 'bg-blue-100 text-blue-700';
      case 'in_progress': return 'bg-amber-100 text-amber-700';
      case 'resolved': return 'bg-green-100 text-green-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const filteredTickets = filter === 'all' 
    ? tickets 
    : tickets.filter(t => t.status === filter);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading support center...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-purple-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/principal/dashboard')}
                className="hover:bg-purple-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <HelpCircle className="w-7 h-7 text-purple-500" />
                  Support Center
                </h1>
                <p className="text-sm text-gray-500">Get help with program management and technical issues</p>
              </div>
            </div>
            <Button
              onClick={() => setShowNewTicket(true)}
              className="bg-purple-500 hover:bg-purple-600"
            >
              <Plus className="w-4 h-4 mr-2" /> New Ticket
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Status Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <Card className={`border-0 shadow-md cursor-pointer transition-all ${filter === 'all' ? 'ring-2 ring-purple-500' : ''}`} onClick={() => setFilter('all')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Ticket className="w-8 h-8 text-purple-500" />
                <div>
                  <p className="text-2xl font-bold">{tickets.length}</p>
                  <p className="text-sm text-gray-500">All Tickets</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={`border-0 shadow-md cursor-pointer transition-all ${filter === 'open' ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setFilter('open')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="text-2xl font-bold">{statusCounts.open || 0}</p>
                  <p className="text-sm text-gray-500">Open</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={`border-0 shadow-md cursor-pointer transition-all ${filter === 'in_progress' ? 'ring-2 ring-amber-500' : ''}`} onClick={() => setFilter('in_progress')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-8 h-8 text-amber-500" />
                <div>
                  <p className="text-2xl font-bold">{statusCounts.in_progress || 0}</p>
                  <p className="text-sm text-gray-500">In Progress</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card className={`border-0 shadow-md cursor-pointer transition-all ${filter === 'resolved' ? 'ring-2 ring-green-500' : ''}`} onClick={() => setFilter('resolved')}>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-500" />
                <div>
                  <p className="text-2xl font-bold">{statusCounts.resolved || 0}</p>
                  <p className="text-sm text-gray-500">Resolved</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tickets List */}
        <Card className="border-0 shadow-lg">
          <CardHeader>
            <CardTitle>Your Tickets</CardTitle>
            <CardDescription>
              {filter === 'all' ? 'All support tickets' : `${filter.replace('_', ' ')} tickets`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {filteredTickets.length === 0 ? (
              <div className="text-center py-12">
                <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">No tickets found</p>
                <p className="text-gray-400 text-sm">Create a new ticket to get help</p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTickets.map((ticket) => (
                  <div key={ticket.id} className="p-4 bg-gray-50 rounded-xl hover:bg-gray-100 transition-all cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {getStatusIcon(ticket.status)}
                        <div>
                          <h4 className="font-semibold text-gray-900">{ticket.subject}</h4>
                          <p className="text-sm text-gray-500">{ticket.ticket_number}</p>
                          <p className="text-xs text-gray-400 mt-1">
                            {new Date(ticket.created_at).toLocaleDateString()} • {ticket.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(ticket.status)}`}>
                          {ticket.status.replace('_', ' ')}
                        </span>
                        <ChevronRight className="w-5 h-5 text-gray-400" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* New Ticket Modal */}
        {showNewTicket && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-purple-500" /> Create Support Ticket
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
                  <div className="grid grid-cols-2 gap-2">
                    {categories.map((cat) => (
                      <button
                        key={cat.id}
                        onClick={() => setNewTicket({...newTicket, category: cat.id})}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          newTicket.category === cat.id
                            ? 'border-purple-500 bg-purple-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <span className="text-lg mr-2">{cat.icon}</span>
                        <span className="text-sm font-medium">{cat.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                  <Input
                    value={newTicket.subject}
                    onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                    placeholder="Brief description of your issue"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <Textarea
                    value={newTicket.description}
                    onChange={(e) => setNewTicket({...newTicket, description: e.target.value})}
                    rows={4}
                    placeholder="Provide details about your issue..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Priority</label>
                  <div className="flex gap-2">
                    {['low', 'medium', 'high', 'urgent'].map((p) => (
                      <button
                        key={p}
                        onClick={() => setNewTicket({...newTicket, priority: p})}
                        className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all ${
                          newTicket.priority === p
                            ? p === 'urgent' ? 'bg-red-500 text-white'
                              : p === 'high' ? 'bg-orange-500 text-white'
                              : p === 'medium' ? 'bg-blue-500 text-white'
                              : 'bg-gray-500 text-white'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    setShowNewTicket(false);
                    setNewTicket({ category: '', subject: '', description: '', priority: 'medium' });
                  }}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1 bg-purple-500 hover:bg-purple-600"
                  onClick={handleCreateTicket}
                  disabled={submitting}
                >
                  {submitting ? (
                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Creating...</>
                  ) : (
                    <><Send className="w-4 h-4 mr-2" /> Submit Ticket</>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
