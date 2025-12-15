import React, { useState } from 'react';
import { Card, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { RefreshCw, Search, Download, Trash2, ChevronDown, ChevronUp, Mail, Phone, User, Calendar } from 'lucide-react';
import axios from 'axios';
import { useToast } from '../hooks/use-toast';

const API = process.env.REACT_APP_BACKEND_URL;

const InquiriesManager = ({ inquiries, loadInquiries }) => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);
  const [editingNotes, setEditingNotes] = useState({});

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
  });

  // Filter inquiries based on search and status
  const filteredInquiries = inquiries.filter(inquiry => {
    const matchesSearch = 
      inquiry.parent_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inquiry.child_name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || inquiry.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const updateStatus = async (inquiryId, newStatus) => {
    try {
      const inquiry = inquiries.find(i => i.id === inquiryId);
      const notes = editingNotes[inquiryId] || inquiry.notes || '';
      
      await axios.put(
        `${API}/api/admin/inquiries/${inquiryId}`,
        null,
        {
          ...getAuthHeaders(),
          params: { status: newStatus, notes }
        }
      );
      
      toast({ title: 'Success', description: `Status updated to ${newStatus}` });
      loadInquiries();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    }
  };

  const saveNotes = async (inquiryId) => {
    try {
      const inquiry = inquiries.find(i => i.id === inquiryId);
      const notes = editingNotes[inquiryId] || '';
      
      await axios.put(
        `${API}/api/admin/inquiries/${inquiryId}`,
        null,
        {
          ...getAuthHeaders(),
          params: { status: inquiry.status, notes }
        }
      );
      
      toast({ title: 'Success', description: 'Notes saved successfully' });
      loadInquiries();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to save notes', variant: 'destructive' });
    }
  };

  const exportToCSV = () => {
    const headers = ['Date', 'Parent Name', 'Email', 'Phone', 'Child Name', 'Child Age', 'School', 'Message', 'Status'];
    const rows = filteredInquiries.map(inquiry => [
      new Date(inquiry.created_at).toLocaleDateString(),
      inquiry.parent_name,
      inquiry.email,
      inquiry.phone,
      inquiry.child_name,
      inquiry.child_age,
      inquiry.school_name || '',
      inquiry.message || '',
      inquiry.status
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inquiries_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    
    toast({ title: 'Success', description: 'Inquiries exported to CSV' });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-green-100 text-green-700 border-green-300';
      case 'contacted': return 'bg-blue-100 text-blue-700 border-blue-300';
      case 'enrolled': return 'bg-purple-100 text-purple-700 border-purple-300';
      case 'closed': return 'bg-gray-100 text-gray-700 border-gray-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        {/* Header */}
        <div className="mb-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Form Inquiries</h2>
              <p className="text-gray-600">
                {filteredInquiries.length} of {inquiries.length} inquiries
              </p>
            </div>
            <div className="flex gap-2">
              <Button onClick={exportToCSV} variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                Export CSV
              </Button>
              <Button onClick={loadInquiries} className="gap-2">
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search by parent name, email, or child name..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-orange-500"
              >
                <option value="all">All Status</option>
                <option value="new">New</option>
                <option value="contacted">Contacted</option>
                <option value="enrolled">Enrolled</option>
                <option value="closed">Closed</option>
              </select>
            </div>
          </div>
        </div>

        {/* Inquiries List */}
        {filteredInquiries.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500 text-lg">
              {searchTerm || statusFilter !== 'all' 
                ? 'No inquiries match your filters' 
                : 'No inquiries yet. Check back later!'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredInquiries.map((inquiry) => {
              const isExpanded = expandedId === inquiry.id;
              
              return (
                <Card key={inquiry.id} className="border-2 hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    {/* Inquiry Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-lg font-bold text-gray-900">{inquiry.parent_name}</h3>
                          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(inquiry.status)}`}>
                            {inquiry.status.charAt(0).toUpperCase() + inquiry.status.slice(1)}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Mail className="w-4 h-4" />
                            {inquiry.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-4 h-4" />
                            {inquiry.phone}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(inquiry.created_at).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                      <Button
                        onClick={() => setExpandedId(isExpanded ? null : inquiry.id)}
                        variant="ghost"
                        size="sm"
                      >
                        {isExpanded ? <ChevronUp /> : <ChevronDown />}
                      </Button>
                    </div>

                    {/* Quick Info */}
                    <div className="bg-blue-50 rounded-lg p-3 mb-4">
                      <p className="text-sm text-gray-700">
                        <strong>Child:</strong> {inquiry.child_name}, Age {inquiry.child_age}
                        {inquiry.school_name && <> • <strong>School:</strong> {inquiry.school_name}</>}
                      </p>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="space-y-4 pt-4 border-t">
                        {/* Message */}
                        {inquiry.message && (
                          <div>
                            <Label className="font-bold">Parent's Message:</Label>
                            <p className="text-gray-700 bg-gray-50 p-3 rounded-lg mt-2">{inquiry.message}</p>
                          </div>
                        )}

                        {/* Status Actions */}
                        <div>
                          <Label className="font-bold mb-2 block">Update Status:</Label>
                          <div className="flex flex-wrap gap-2">
                            <Button
                              size="sm"
                              variant={inquiry.status === 'new' ? 'default' : 'outline'}
                              onClick={() => updateStatus(inquiry.id, 'new')}
                              className="bg-green-600 hover:bg-green-700 text-white"
                            >
                              New
                            </Button>
                            <Button
                              size="sm"
                              variant={inquiry.status === 'contacted' ? 'default' : 'outline'}
                              onClick={() => updateStatus(inquiry.id, 'contacted')}
                              className="bg-blue-600 hover:bg-blue-700 text-white"
                            >
                              Contacted
                            </Button>
                            <Button
                              size="sm"
                              variant={inquiry.status === 'enrolled' ? 'default' : 'outline'}
                              onClick={() => updateStatus(inquiry.id, 'enrolled')}
                              className="bg-purple-600 hover:bg-purple-700 text-white"
                            >
                              Enrolled
                            </Button>
                            <Button
                              size="sm"
                              variant={inquiry.status === 'closed' ? 'default' : 'outline'}
                              onClick={() => updateStatus(inquiry.id, 'closed')}
                              className="bg-gray-600 hover:bg-gray-700 text-white"
                            >
                              Closed
                            </Button>
                          </div>
                        </div>

                        {/* Notes */}
                        <div>
                          <Label className="font-bold mb-2 block">Internal Notes:</Label>
                          <Textarea
                            placeholder="Add notes about this inquiry..."
                            value={editingNotes[inquiry.id] !== undefined ? editingNotes[inquiry.id] : inquiry.notes || ''}
                            onChange={(e) => setEditingNotes({ ...editingNotes, [inquiry.id]: e.target.value })}
                            className="mb-2"
                          />
                          <Button
                            size="sm"
                            onClick={() => saveNotes(inquiry.id)}
                            className="bg-orange-600 hover:bg-orange-700"
                          >
                            Save Notes
                          </Button>
                        </div>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default InquiriesManager;
