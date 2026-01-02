import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { 
  ArrowLeft, DollarSign, TrendingUp, Users, Baby, Calendar,
  CreditCard, CheckCircle, Clock, AlertCircle, RefreshCw, IndianRupee
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import PrincipalNav from '../components/PrincipalNav';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PrincipalBusiness = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [businessData, setBusinessData] = useState(null);
  const [paymentsData, setPaymentsData] = useState(null);
  const [earningsData, setEarningsData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

  useEffect(() => {
    const token = localStorage.getItem('principal_token');
    if (!token) {
      navigate('/principal/login');
      return;
    }
    fetchData();
  }, [navigate, selectedMonth]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('principal_token');
      const [businessRes, paymentsRes, earningsRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/principal/business-summary?token=${token}`),
        axios.get(`${BACKEND_URL}/api/principal/observer-payments?token=${token}&month=${selectedMonth}`),
        axios.get(`${BACKEND_URL}/api/principal/my-earnings?token=${token}`)
      ]);
      
      setBusinessData(businessRes.data);
      setPaymentsData(paymentsRes.data);
      setEarningsData(earningsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: "Error", description: "Failed to load business data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const metrics = businessData?.business_metrics || {};
  const paymentSummary = paymentsData?.summary || {};
  const earnings = earningsData?.earnings || {};

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/principal/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">Business & Payments</h1>
            <p className="text-gray-600">Track revenue, observer payments, and your earnings</p>
          </div>
          <div className="flex items-center gap-2">
            <input 
              type="month" 
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="border rounded-md px-3 py-2"
            />
            <Button variant="outline" onClick={fetchData}>
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-sm bg-gradient-to-br from-green-500 to-emerald-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <IndianRupee className="w-8 h-8" />
                <div>
                  <p className="text-2xl font-bold">₹{metrics.total_monthly_revenue?.toLocaleString() || 0}</p>
                  <p className="text-sm text-green-100">Monthly Revenue</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Baby className="w-8 h-8" />
                <div>
                  <p className="text-2xl font-bold">{metrics.total_children || 0}</p>
                  <p className="text-sm text-blue-100">Total Children ({metrics.premium_children || 0} Premium)</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <TrendingUp className="w-8 h-8" />
                <div>
                  <p className="text-2xl font-bold">{metrics.sessions_this_month || 0}</p>
                  <p className="text-sm text-purple-100">Sessions This Month</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <IndianRupee className="w-8 h-8" />
                <div>
                  <p className="text-2xl font-bold">₹{earnings.total_earnings?.toLocaleString() || 0}</p>
                  <p className="text-sm text-amber-100">Your Earnings</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-2 mb-6">
          <Button 
            variant={activeTab === 'overview' ? 'default' : 'outline'}
            onClick={() => setActiveTab('overview')}
          >
            <TrendingUp className="w-4 h-4 mr-2" /> Business Overview
          </Button>
          <Button 
            variant={activeTab === 'observer-payments' ? 'default' : 'outline'}
            onClick={() => setActiveTab('observer-payments')}
          >
            <Users className="w-4 h-4 mr-2" /> Observer Payments
          </Button>
          <Button 
            variant={activeTab === 'my-earnings' ? 'default' : 'outline'}
            onClick={() => setActiveTab('my-earnings')}
          >
            <IndianRupee className="w-4 h-4 mr-2" /> My Earnings
          </Button>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Business Metrics */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Business Metrics</CardTitle>
                <CardDescription>Revenue and enrollment overview</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">Premium Children</p>
                    <p className="text-2xl font-bold text-blue-700">{metrics.premium_children || 0}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-sm text-gray-600">Standard Children</p>
                    <p className="text-2xl font-bold text-gray-700">{metrics.standard_children || 0}</p>
                  </div>
                </div>
                
                <div className="p-4 bg-green-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-green-600">Monthly Revenue</p>
                      <p className="text-3xl font-bold text-green-700">₹{metrics.total_monthly_revenue?.toLocaleString() || 0}</p>
                    </div>
                    <TrendingUp className="w-12 h-12 text-green-400" />
                  </div>
                </div>
                
                <div className="p-4 bg-purple-50 rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-purple-600">Sessions This Month</p>
                      <p className="text-3xl font-bold text-purple-700">{metrics.sessions_this_month || 0}</p>
                    </div>
                    <Calendar className="w-12 h-12 text-purple-400" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Team Overview */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Your Team</CardTitle>
                <CardDescription>Observers under your supervision</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="mb-4 p-4 bg-indigo-50 rounded-lg">
                  <p className="text-sm text-indigo-600">Total Observers</p>
                  <p className="text-3xl font-bold text-indigo-700">{businessData?.team?.total_observers || 0}</p>
                </div>
                
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {businessData?.team?.observers?.map(observer => (
                    <div key={observer.id} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                      <div>
                        <p className="font-medium">{observer.name}</p>
                        <p className="text-sm text-gray-500">{observer.email}</p>
                      </div>
                      <span className="text-sm text-gray-600">₹{observer.session_rate || 100}/session</span>
                    </div>
                  )) || (
                    <p className="text-gray-500 text-center py-4">No observers found</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'observer-payments' && (
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle>Observer Payments - {selectedMonth}</CardTitle>
              <CardDescription>Track payment status for all observers</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Summary */}
              <div className="grid grid-cols-4 gap-4 mb-6">
                <div className="p-4 bg-blue-50 rounded-lg text-center">
                  <p className="text-sm text-blue-600">Total Sessions</p>
                  <p className="text-2xl font-bold text-blue-700">{paymentSummary.total_sessions || 0}</p>
                </div>
                <div className="p-4 bg-green-50 rounded-lg text-center">
                  <p className="text-sm text-green-600">Total Earned</p>
                  <p className="text-2xl font-bold text-green-700">₹{paymentSummary.total_earnings?.toLocaleString() || 0}</p>
                </div>
                <div className="p-4 bg-emerald-50 rounded-lg text-center">
                  <p className="text-sm text-emerald-600">Total Paid</p>
                  <p className="text-2xl font-bold text-emerald-700">₹{paymentSummary.total_paid?.toLocaleString() || 0}</p>
                </div>
                <div className="p-4 bg-amber-50 rounded-lg text-center">
                  <p className="text-sm text-amber-600">Pending</p>
                  <p className="text-2xl font-bold text-amber-700">₹{paymentSummary.total_pending?.toLocaleString() || 0}</p>
                </div>
              </div>

              {/* Observer Payment Details */}
              <div className="space-y-3">
                {paymentsData?.observer_payments?.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No payment data for this month</p>
                ) : (
                  paymentsData?.observer_payments?.map(item => (
                    <div key={item.observer.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="font-semibold">{item.observer.name}</p>
                          <p className="text-sm text-gray-500">{item.observer.email}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                          item.payment_status === 'paid' 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.payment_status === 'paid' ? 'Fully Paid' : 'Pending'}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Sessions</p>
                          <p className="font-medium">{item.sessions.total} ({item.sessions.completed} completed)</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Rate</p>
                          <p className="font-medium">₹{item.observer.session_rate}/session</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Total Earned</p>
                          <p className="font-medium text-green-600">₹{item.earnings.total_earned.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-gray-500">Pending</p>
                          <p className={`font-medium ${item.earnings.pending > 0 ? 'text-amber-600' : 'text-green-600'}`}>
                            ₹{item.earnings.pending.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'my-earnings' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Earnings Summary */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Your Earnings</CardTitle>
                <CardDescription>From parent consultations</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-lg">
                  <p className="text-sm text-amber-600">Consultation Rate</p>
                  <p className="text-3xl font-bold text-amber-700">
                    ₹{earningsData?.principal?.consultation_rate?.toLocaleString() || 500}/session
                  </p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-600">Consultations Completed</p>
                    <p className="text-2xl font-bold text-blue-700">{earnings.total_consultations || 0}</p>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <p className="text-sm text-green-600">Total Earnings</p>
                    <p className="text-2xl font-bold text-green-700">₹{earnings.total_earnings?.toLocaleString() || 0}</p>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-emerald-50 rounded-lg">
                    <p className="text-sm text-emerald-600">Paid</p>
                    <p className="text-2xl font-bold text-emerald-700">₹{earnings.total_paid?.toLocaleString() || 0}</p>
                  </div>
                  <div className="p-4 bg-amber-50 rounded-lg">
                    <p className="text-sm text-amber-600">Pending</p>
                    <p className="text-2xl font-bold text-amber-700">₹{earnings.pending?.toLocaleString() || 0}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Monthly Breakdown */}
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Monthly Breakdown</CardTitle>
                <CardDescription>Earnings by month</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {Object.entries(earningsData?.monthly_breakdown || {}).length === 0 ? (
                    <p className="text-center text-gray-500 py-8">No earnings data yet</p>
                  ) : (
                    Object.entries(earningsData?.monthly_breakdown || {})
                      .sort((a, b) => b[0].localeCompare(a[0]))
                      .map(([month, data]) => (
                        <div key={month} className="p-3 bg-gray-50 rounded-lg flex justify-between items-center">
                          <div>
                            <p className="font-medium">{month}</p>
                            <p className="text-sm text-gray-500">{data.consultations} consultations</p>
                          </div>
                          <p className="text-lg font-bold text-green-600">₹{data.earnings.toLocaleString()}</p>
                        </div>
                      ))
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
};

export default PrincipalBusiness;
