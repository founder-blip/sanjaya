import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  DollarSign, TrendingUp, Users, Clock, ArrowLeft,
  CreditCard, CheckCircle, Loader2, IndianRupee,
  Wallet, Receipt, Building, Award
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { useToast } from '../hooks/use-toast';

const API_URL = process.env.REACT_APP_BACKEND_URL;

export default function PrincipalEarnings() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('principal_token');
    if (!token) {
      navigate('/principal/login');
      return;
    }
    fetchEarnings();
  }, [navigate]);

  const fetchEarnings = async () => {
    try {
      const token = localStorage.getItem('principal_token');
      const response = await axios.get(`${API_URL}/api/earnings/summary?token=${token}`);
      setData(response.data);
    } catch (error) {
      console.error('Error fetching earnings:', error);
      toast({
        title: "Error",
        description: "Failed to load earnings data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-teal-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading earnings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-teal-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => navigate('/principal/dashboard')}
                className="hover:bg-teal-100"
              >
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                  <Wallet className="w-7 h-7 text-teal-500" />
                  School Earnings
                </h1>
                <p className="text-sm text-gray-500">Program management compensation</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">School</p>
              <p className="font-semibold text-gray-900">{data?.school || 'N/A'}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Earnings Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-teal-500 to-emerald-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-teal-100 text-sm">This Month</p>
                  <p className="text-3xl font-bold mt-1">
                    {formatCurrency(data?.earnings?.total_this_month || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <IndianRupee className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Active Students</p>
                  <p className="text-3xl font-bold mt-1">
                    {data?.statistics?.active_students || 0}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-500 to-pink-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Management Fee</p>
                  <p className="text-3xl font-bold mt-1">
                    {formatCurrency(data?.earnings?.management_fee || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Building className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-amber-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-amber-100 text-sm">Pending</p>
                  <p className="text-3xl font-bold mt-1">
                    {formatCurrency(data?.earnings?.pending_amount || 0)}
                  </p>
                </div>
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center">
                  <Clock className="w-6 h-6" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Payment Rates */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-teal-500" /> Compensation Structure
              </CardTitle>
              <CardDescription>How your earnings are calculated</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 bg-teal-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">Per Student Enrolled</h4>
                    <p className="text-sm text-gray-500">Monthly compensation per active student</p>
                  </div>
                  <span className="text-xl font-bold text-teal-600">
                    {formatCurrency(data?.rates?.per_student_enrolled || 50)}
                  </span>
                </div>
              </div>
              <div className="p-4 bg-purple-50 rounded-xl">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">Program Management</h4>
                    <p className="text-sm text-gray-500">Monthly fixed management fee</p>
                  </div>
                  <span className="text-xl font-bold text-purple-600">
                    {formatCurrency(data?.rates?.program_management || 2000)}
                  </span>
                </div>
              </div>
              <div className="p-4 bg-blue-50 rounded-xl border-2 border-dashed border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold text-gray-900">Student Earnings</h4>
                    <p className="text-sm text-gray-500">{data?.statistics?.active_students || 0} students × {formatCurrency(data?.rates?.per_student_enrolled || 50)}</p>
                  </div>
                  <span className="text-xl font-bold text-blue-600">
                    {formatCurrency(data?.earnings?.student_earnings || 0)}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment History */}
          <Card className="border-0 shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-500" /> Payment History
              </CardTitle>
              <CardDescription>Your recent payments</CardDescription>
            </CardHeader>
            <CardContent>
              {(!data?.payment_history || data.payment_history.length === 0) ? (
                <div className="text-center py-8">
                  <Wallet className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">No payment history yet</p>
                  <p className="text-sm text-gray-400">Payments are processed monthly</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {data.payment_history.map((payment) => (
                    <div key={payment.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        {payment.status === 'paid' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-amber-500" />
                        )}
                        <div>
                          <p className="font-medium">{payment.month || 'Payment'}</p>
                          <p className="text-xs text-gray-500">
                            {new Date(payment.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(payment.amount)}</p>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          payment.status === 'paid' 
                            ? 'bg-green-100 text-green-700'
                            : 'bg-amber-100 text-amber-700'
                        }`}>
                          {payment.status}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
