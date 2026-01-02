import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { 
  LayoutDashboard, Users, GraduationCap, UserCog, BarChart3,
  Ticket, Settings, CreditCard, Brain, Mail, FileText,
  LogOut, Menu, X, ChevronRight, Bell, Search,
  TrendingUp, AlertCircle, CheckCircle, Clock, Plus,
  Shield, Activity, Building, Flag, FileWarning, HelpCircle,
  Database, Lock, Eye, Trash2, RefreshCw
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { useToast } from '../hooks/use-toast';

const API_URL = process.env.REACT_APP_BACKEND_URL;

// Sidebar Navigation Items
const navItems = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'schools', label: 'Schools & Programs', icon: Building },
  { id: 'students', label: 'Student Enrollment', icon: GraduationCap },
  { id: 'users', label: 'User Management', icon: Users },
  { id: 'safety', label: 'Safety & Escalation', icon: Shield },
  { id: 'incidents', label: 'Incidents', icon: FileWarning },
  { id: 'support', label: 'Support Tickets', icon: Ticket },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'ai-settings', label: 'AI System', icon: Brain },
  { id: 'ai-guardrails', label: 'AI Guardrails', icon: Lock },
  { id: 'privacy', label: 'Data Privacy', icon: Database },
  { id: 'audit', label: 'Audit Logs', icon: Eye },
  { id: 'system', label: 'System Health', icon: Activity },
  { id: 'billing', label: 'Billing', icon: CreditCard },
  { id: 'help', label: 'Help & FAQs', icon: HelpCircle },
  { id: 'communications', label: 'Communications', icon: Mail },
];

export default function AdminPanel() {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }
    fetchDashboardData();
  }, [navigate]);

  const getAuthHeaders = () => ({
    headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
  });

  const fetchDashboardData = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/admin/dashboard/stats`, getAuthHeaders());
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    localStorage.removeItem('admin_username');
    navigate('/admin/login');
  };

  const renderContent = () => {
    switch (activeSection) {
      case 'dashboard':
        return <DashboardOverview stats={stats} onNavigate={setActiveSection} />;
      case 'schools':
        return <SchoolsManagement />;
      case 'students':
        return <StudentEnrollment />;
      case 'users':
        return <UserManagement />;
      case 'safety':
        return <SafetyEscalation />;
      case 'incidents':
        return <IncidentManagement />;
      case 'support':
        return <SupportManagement />;
      case 'analytics':
        return <AnalyticsDashboard />;
      case 'ai-settings':
        return <AISystemSettings />;
      case 'ai-guardrails':
        return <AIGuardrails />;
      case 'privacy':
        return <DataPrivacy />;
      case 'audit':
        return <AuditLogs />;
      case 'system':
        return <SystemHealth />;
      case 'billing':
        return <BillingManagement />;
      case 'help':
        return <HelpFAQs />;
      case 'communications':
        navigate('/admin/communications');
        return null;
      default:
        return <DashboardOverview stats={stats} onNavigate={setActiveSection} />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-gray-900 text-white transition-all duration-300 flex flex-col`}>
        <div className="p-4 border-b border-gray-800">
          <div className="flex items-center justify-between">
            {sidebarOpen && <h1 className="text-xl font-bold text-orange-400">Sanjaya Admin</h1>}
            <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)} className="text-gray-400 hover:text-white">
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </Button>
          </div>
        </div>
        
        <nav className="flex-1 p-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                activeSection === item.id
                  ? 'bg-orange-500 text-white'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="text-sm font-medium">{item.label}</span>}
            </button>
          ))}
        </nav>
        
        <div className="p-4 border-t border-gray-800">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-white transition-all"
          >
            <LogOut className="w-5 h-5" />
            {sidebarOpen && <span className="text-sm font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Header */}
        <header className="bg-white border-b px-6 py-4 sticky top-0 z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-semibold text-gray-900 capitalize">
                {navItems.find(n => n.id === activeSection)?.label || 'Dashboard'}
              </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <Input placeholder="Search..." className="pl-9 w-64" />
              </div>
              <Button variant="outline" size="icon" className="relative">
                <Bell className="w-5 h-5" />
                {stats?.support?.open_tickets > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                    {stats.support.open_tickets}
                  </span>
                )}
              </Button>
              <div className="flex items-center gap-2 pl-4 border-l">
                <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                  <span className="text-orange-600 font-semibold text-sm">A</span>
                </div>
                <span className="text-sm font-medium">{localStorage.getItem('admin_username') || 'Admin'}</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-6">
          {renderContent()}
        </div>
      </main>
    </div>
  );
}

// Dashboard Overview Component
function DashboardOverview({ stats, onNavigate }) {
  if (!stats) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('students')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Students</p>
                <p className="text-3xl font-bold text-gray-900">{stats.students?.total || 0}</p>
                <p className="text-xs text-green-600 mt-1">{stats.students?.active || 0} active</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('users')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Total Users</p>
                <p className="text-3xl font-bold text-gray-900">{stats.users?.total || 0}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {stats.users?.principals || 0}P / {stats.users?.observers || 0}O / {stats.users?.parents || 0}Pa
                </p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                <Users className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Sessions Today</p>
                <p className="text-3xl font-bold text-gray-900">{stats.sessions?.today || 0}</p>
                <p className="text-xs text-gray-500 mt-1">{stats.sessions?.total || 0} total</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm cursor-pointer hover:shadow-md transition-shadow" onClick={() => onNavigate('support')}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">Open Tickets</p>
                <p className="text-3xl font-bold text-gray-900">{stats.support?.open_tickets || 0}</p>
                <p className="text-xs text-amber-600 mt-1">{stats.support?.pending_tickets || 0} in progress</p>
              </div>
              <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                <Ticket className="w-6 h-6 text-amber-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button onClick={() => onNavigate('students')} className="h-20 flex-col gap-2 bg-blue-500 hover:bg-blue-600">
              <Plus className="w-5 h-5" />
              <span>Enroll Student</span>
            </Button>
            <Button onClick={() => onNavigate('users')} variant="outline" className="h-20 flex-col gap-2">
              <UserCog className="w-5 h-5" />
              <span>Add User</span>
            </Button>
            <Button onClick={() => onNavigate('support')} variant="outline" className="h-20 flex-col gap-2">
              <Ticket className="w-5 h-5" />
              <span>View Tickets</span>
            </Button>
            <Button onClick={() => onNavigate('analytics')} variant="outline" className="h-20 flex-col gap-2">
              <BarChart3 className="w-5 h-5" />
              <span>View Reports</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>New Inquiries</CardTitle>
            <CardDescription>{stats.inquiries?.new || 0} pending review</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-gray-500 text-sm">View all inquiries from the website contact forms</p>
            <Button variant="link" className="px-0 mt-2" onClick={() => onNavigate('content')}>
              View Inquiries <ChevronRight className="w-4 h-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader>
            <CardTitle>System Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm">AI System</span>
              <span className="flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" /> Active
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Email Service</span>
              <span className="flex items-center gap-1 text-amber-600 text-sm">
                <AlertCircle className="w-4 h-4" /> Configure
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">Database</span>
              <span className="flex items-center gap-1 text-green-600 text-sm">
                <CheckCircle className="w-4 h-4" /> Connected
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Student Enrollment Component
function StudentEnrollment() {
  const { toast } = useToast();
  const [students, setStudents] = useState([]);
  const [principals, setPrincipals] = useState([]);
  const [observers, setObservers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEnrollForm, setShowEnrollForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '', date_of_birth: '', grade: '', school: '',
    parent_email: '', parent_name: '', parent_phone: '',
    principal_id: '', observer_id: '', notes: ''
  });

  const getAuthHeaders = () => ({
    headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [studentsRes, principalsRes, observersRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/students`, getAuthHeaders()),
        axios.get(`${API_URL}/api/admin/users/principals`, getAuthHeaders()),
        axios.get(`${API_URL}/api/admin/users/observers`, getAuthHeaders())
      ]);
      setStudents(studentsRes.data.students || []);
      setPrincipals(principalsRes.data.principals || []);
      setObservers(observersRes.data.observers || []);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      const params = new URLSearchParams(formData);
      await axios.post(`${API_URL}/api/admin/students/enroll?${params}`, null, getAuthHeaders());
      toast({ title: "Success!", description: "Student enrolled successfully" });
      setShowEnrollForm(false);
      setFormData({ name: '', date_of_birth: '', grade: '', school: '', parent_email: '', parent_name: '', parent_phone: '', principal_id: '', observer_id: '', notes: '' });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.detail || "Failed to enroll", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">All Students</h3>
          <p className="text-sm text-gray-500">{students.length} total enrolled</p>
        </div>
        <Button onClick={() => setShowEnrollForm(true)} className="bg-blue-500 hover:bg-blue-600">
          <Plus className="w-4 h-4 mr-2" /> Enroll New Student
        </Button>
      </div>

      {/* Enrollment Form Modal */}
      {showEnrollForm && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle>Enroll New Student</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Student Name *</label>
                <Input value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Full name" />
              </div>
              <div>
                <label className="text-sm font-medium">Date of Birth *</label>
                <Input type="date" value={formData.date_of_birth} onChange={e => setFormData({...formData, date_of_birth: e.target.value})} />
              </div>
              <div>
                <label className="text-sm font-medium">Grade *</label>
                <Input value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})} placeholder="e.g., Grade 3" />
              </div>
              <div>
                <label className="text-sm font-medium">School *</label>
                <Input value={formData.school} onChange={e => setFormData({...formData, school: e.target.value})} placeholder="School name" />
              </div>
            </div>
            
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Parent/Guardian Details</h4>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Parent Name *</label>
                  <Input value={formData.parent_name} onChange={e => setFormData({...formData, parent_name: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium">Parent Email *</label>
                  <Input type="email" value={formData.parent_email} onChange={e => setFormData({...formData, parent_email: e.target.value})} />
                </div>
                <div>
                  <label className="text-sm font-medium">Parent Phone *</label>
                  <Input value={formData.parent_phone} onChange={e => setFormData({...formData, parent_phone: e.target.value})} />
                </div>
              </div>
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium mb-3">Assignments (Optional)</h4>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Assign to Principal</label>
                  <select className="w-full border rounded-md p-2" value={formData.principal_id} onChange={e => setFormData({...formData, principal_id: e.target.value})}>
                    <option value="">Select Principal...</option>
                    {principals.map(p => <option key={p.id} value={p.id}>{p.name} - {p.school}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Assign to Observer</label>
                  <select className="w-full border rounded-md p-2" value={formData.observer_id} onChange={e => setFormData({...formData, observer_id: e.target.value})}>
                    <option value="">Select Observer...</option>
                    {observers.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
                  </select>
                </div>
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button onClick={handleEnroll} className="bg-green-500 hover:bg-green-600">Enroll Student</Button>
              <Button variant="outline" onClick={() => setShowEnrollForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Students Table */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left p-4 font-medium text-gray-600">Student</th>
                <th className="text-left p-4 font-medium text-gray-600">School / Grade</th>
                <th className="text-left p-4 font-medium text-gray-600">Parent</th>
                <th className="text-left p-4 font-medium text-gray-600">Principal</th>
                <th className="text-left p-4 font-medium text-gray-600">Observer</th>
                <th className="text-left p-4 font-medium text-gray-600">Status</th>
              </tr>
            </thead>
            <tbody>
              {students.map(student => (
                <tr key={student.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium">{student.name}</p>
                    <p className="text-xs text-gray-500">{student.date_of_birth}</p>
                  </td>
                  <td className="p-4">
                    <p>{student.school || '-'}</p>
                    <p className="text-xs text-gray-500">{student.grade || '-'}</p>
                  </td>
                  <td className="p-4">
                    {student.parents?.[0] ? (
                      <>
                        <p className="text-sm">{student.parents[0].name}</p>
                        <p className="text-xs text-gray-500">{student.parents[0].email}</p>
                      </>
                    ) : '-'}
                  </td>
                  <td className="p-4">
                    {student.principal ? student.principal.name : <span className="text-gray-400">Not assigned</span>}
                  </td>
                  <td className="p-4">
                    {student.observer ? student.observer.name : <span className="text-gray-400">Not assigned</span>}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs ${student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                      {student.status || 'active'}
                    </span>
                  </td>
                </tr>
              ))}
              {students.length === 0 && (
                <tr><td colSpan={6} className="p-8 text-center text-gray-500">No students enrolled yet</td></tr>
              )}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
}

// User Management Component  
function UserManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('principals');
  const [principals, setPrincipals] = useState([]);
  const [observers, setObservers] = useState([]);
  const [parents, setParents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(null);
  const [formData, setFormData] = useState({});

  const getAuthHeaders = () => ({
    headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
  });

  useEffect(() => { fetchUsers(); }, []);

  const fetchUsers = async () => {
    try {
      const [p, o, pa] = await Promise.all([
        axios.get(`${API_URL}/api/admin/users/principals`, getAuthHeaders()),
        axios.get(`${API_URL}/api/admin/users/observers`, getAuthHeaders()),
        axios.get(`${API_URL}/api/admin/users/parents`, getAuthHeaders())
      ]);
      setPrincipals(p.data.principals || []);
      setObservers(o.data.observers || []);
      setParents(pa.data.parents || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const createUser = async (type) => {
    try {
      const params = new URLSearchParams(formData);
      await axios.post(`${API_URL}/api/admin/users/${type}?${params}`, null, getAuthHeaders());
      toast({ title: "Success!", description: `${type} created successfully` });
      setShowForm(null);
      setFormData({});
      fetchUsers();
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.detail || "Failed to create user", variant: "destructive" });
    }
  };

  const renderUserList = (users, type) => (
    <div className="space-y-3">
      {users.map(user => (
        <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-gray-500">{user.email}</p>
            {type === 'principal' && <p className="text-xs text-gray-400">{user.school} • {user.student_count || 0} students</p>}
            {type === 'observer' && <p className="text-xs text-gray-400">{user.specialization} • {user.assigned_children || 0} children</p>}
            {type === 'parent' && <p className="text-xs text-gray-400">{user.children_count || 0} children</p>}
          </div>
          <span className={`px-2 py-1 rounded-full text-xs ${user.is_active !== false ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {user.is_active !== false ? 'Active' : 'Inactive'}
          </span>
        </div>
      ))}
      {users.length === 0 && <p className="text-center text-gray-500 py-8">No {type}s found</p>}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Tabs */}
      <div className="flex gap-2 border-b">
        {['principals', 'observers', 'parents'].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 font-medium capitalize ${activeTab === tab ? 'border-b-2 border-blue-500 text-blue-600' : 'text-gray-500'}`}
          >
            {tab} ({tab === 'principals' ? principals.length : tab === 'observers' ? observers.length : parents.length})
          </button>
        ))}
      </div>

      {/* Add User Button */}
      {activeTab !== 'parents' && (
        <Button onClick={() => setShowForm(activeTab.slice(0, -1))} className="bg-blue-500 hover:bg-blue-600">
          <Plus className="w-4 h-4 mr-2" /> Add {activeTab.slice(0, -1)}
        </Button>
      )}

      {/* Add Form */}
      {showForm && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader><CardTitle>Add New {showForm}</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="Name" value={formData.name || ''} onChange={e => setFormData({...formData, name: e.target.value})} />
              <Input placeholder="Email" type="email" value={formData.email || ''} onChange={e => setFormData({...formData, email: e.target.value})} />
              <Input placeholder="Phone" value={formData.phone || ''} onChange={e => setFormData({...formData, phone: e.target.value})} />
              {showForm === 'principal' && <Input placeholder="School Name" value={formData.school || ''} onChange={e => setFormData({...formData, school: e.target.value})} />}
              {showForm === 'observer' && <Input placeholder="Specialization" value={formData.specialization || ''} onChange={e => setFormData({...formData, specialization: e.target.value})} />}
              <Input placeholder="Password" type="password" value={formData.password || ''} onChange={e => setFormData({...formData, password: e.target.value})} />
            </div>
            <div className="flex gap-3">
              <Button onClick={() => createUser(showForm)} className="bg-green-500 hover:bg-green-600">Create</Button>
              <Button variant="outline" onClick={() => { setShowForm(null); setFormData({}); }}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* User Lists */}
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          {activeTab === 'principals' && renderUserList(principals, 'principal')}
          {activeTab === 'observers' && renderUserList(observers, 'observer')}
          {activeTab === 'parents' && renderUserList(parents, 'parent')}
        </CardContent>
      </Card>
    </div>
  );
}

// Analytics Dashboard Component
function AnalyticsDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => ({
    headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
  });

  useEffect(() => {
    axios.get(`${API_URL}/api/admin/analytics/overview?days=30`, getAuthHeaders())
      .then(res => setAnalytics(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-8">Loading analytics...</div>;

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>Platform Analytics (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="text-center p-6 bg-blue-50 rounded-xl">
              <p className="text-4xl font-bold text-blue-600">{analytics?.sessions?.total || 0}</p>
              <p className="text-gray-600">Total Sessions</p>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-xl">
              <p className="text-4xl font-bold text-green-600">{analytics?.enrollments?.total || 0}</p>
              <p className="text-gray-600">Total Enrollments</p>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-xl">
              <p className="text-4xl font-bold text-purple-600">{analytics?.schools?.length || 0}</p>
              <p className="text-gray-600">Active Schools</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle>Schools Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {analytics?.schools?.map((school, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <span className="font-medium">{school.school}</span>
                <span className="text-gray-600">{school.students} students</span>
              </div>
            ))}
            {(!analytics?.schools || analytics.schools.length === 0) && (
              <p className="text-center text-gray-500 py-4">No school data available</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Support Management Component
function SupportManagement() {
  const { toast } = useToast();
  const [tickets, setTickets] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [replyText, setReplyText] = useState('');

  const getAuthHeaders = () => ({
    headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
  });

  useEffect(() => { fetchTickets(); }, []);

  const fetchTickets = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/support/tickets`, getAuthHeaders());
      setTickets(res.data.tickets || []);
      setStatusCounts(res.data.status_counts || {});
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateTicketStatus = async (ticketId, status) => {
    try {
      await axios.put(`${API_URL}/api/admin/support/tickets/${ticketId}?status=${status}`, null, getAuthHeaders());
      toast({ title: "Updated", description: "Ticket status updated" });
      fetchTickets();
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const sendReply = async (ticketId) => {
    if (!replyText.trim()) return;
    try {
      await axios.post(`${API_URL}/api/admin/support/tickets/${ticketId}/reply?message=${encodeURIComponent(replyText)}`, null, getAuthHeaders());
      toast({ title: "Sent", description: "Reply sent successfully" });
      setReplyText('');
      fetchTickets();
    } catch (error) {
      toast({ title: "Error", description: "Failed to send reply", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-6">
      {/* Status Cards */}
      <div className="grid grid-cols-4 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status} className="border-0 shadow-sm">
            <CardContent className="p-4">
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-sm text-gray-500 capitalize">{status.replace('_', ' ')}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets List */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle>All Tickets</CardTitle></CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto">
            {tickets.map(ticket => (
              <div
                key={ticket.id}
                onClick={() => setSelectedTicket(ticket)}
                className={`p-4 border-b cursor-pointer hover:bg-gray-50 ${selectedTicket?.id === ticket.id ? 'bg-blue-50' : ''}`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-medium">{ticket.subject}</p>
                    <p className="text-sm text-gray-500">{ticket.user_email} • {ticket.user_role}</p>
                    <p className="text-xs text-gray-400">{ticket.ticket_number}</p>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    ticket.status === 'open' ? 'bg-blue-100 text-blue-700' :
                    ticket.status === 'in_progress' ? 'bg-amber-100 text-amber-700' :
                    'bg-green-100 text-green-700'
                  }`}>
                    {ticket.status}
                  </span>
                </div>
              </div>
            ))}
            {tickets.length === 0 && <p className="text-center text-gray-500 py-8">No tickets</p>}
          </CardContent>
        </Card>

        {/* Ticket Detail */}
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle>Ticket Details</CardTitle></CardHeader>
          <CardContent>
            {selectedTicket ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-gray-500">Subject</p>
                  <p className="font-medium">{selectedTicket.subject}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Description</p>
                  <p className="text-sm bg-gray-50 p-3 rounded">{selectedTicket.description}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Category: {selectedTicket.category} • Priority: {selectedTicket.priority}</p>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Update Status</p>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => updateTicketStatus(selectedTicket.id, 'in_progress')}>In Progress</Button>
                    <Button size="sm" variant="outline" onClick={() => updateTicketStatus(selectedTicket.id, 'resolved')} className="text-green-600">Resolve</Button>
                    <Button size="sm" variant="outline" onClick={() => updateTicketStatus(selectedTicket.id, 'closed')}>Close</Button>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Reply to User</p>
                  <textarea
                    className="w-full border rounded p-2 text-sm"
                    rows={3}
                    placeholder="Type your reply..."
                    value={replyText}
                    onChange={e => setReplyText(e.target.value)}
                  />
                  <Button size="sm" onClick={() => sendReply(selectedTicket.id)} className="mt-2">Send Reply</Button>
                </div>

                {selectedTicket.responses?.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-medium mb-2">Conversation</p>
                    {selectedTicket.responses.map((r, i) => (
                      <div key={i} className={`p-2 rounded mb-2 text-sm ${r.user_role === 'admin' ? 'bg-blue-50 ml-4' : 'bg-gray-50 mr-4'}`}>
                        <p className="font-medium text-xs">{r.user_name || r.user_role}</p>
                        <p>{r.message}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Select a ticket to view details</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// AI System Settings Component
function AISystemSettings() {
  const { toast } = useToast();
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => ({
    headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
  });

  useEffect(() => {
    axios.get(`${API_URL}/api/admin/ai/settings`, getAuthHeaders())
      .then(res => setSettings(res.data.settings))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateSetting = async (key, value) => {
    try {
      await axios.put(`${API_URL}/api/admin/ai/settings?${key}=${value}`, null, getAuthHeaders());
      setSettings({...settings, [key]: value});
      toast({ title: "Updated", description: "Setting saved" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle>AI System Configuration</CardTitle>
          <CardDescription>Configure how the AI processes session data and generates reports</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {[
            { key: 'behavioral_tags_enabled', label: 'Behavioral Tags Extraction', desc: 'Automatically extract behavioral tags from session logs' },
            { key: 'auto_report_generation', label: 'Auto Report Generation', desc: 'Generate reports automatically when enough sessions are logged' },
            { key: 'trend_analysis_enabled', label: 'Trend Analysis', desc: 'Analyze trends and patterns across sessions' },
            { key: 'sentiment_analysis_enabled', label: 'Sentiment Analysis', desc: 'Analyze emotional sentiment in session notes' },
            { key: 'notification_on_concerns', label: 'Concern Notifications', desc: 'Send alerts when concerning patterns are detected' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <button
                onClick={() => updateSetting(item.key, !settings?.[item.key])}
                className={`w-12 h-6 rounded-full transition-colors ${settings?.[item.key] ? 'bg-green-500' : 'bg-gray-300'}`}
              >
                <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${settings?.[item.key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
          
          <div className="p-4 bg-gray-50 rounded-lg">
            <label className="font-medium">Minimum Sessions for Report</label>
            <p className="text-sm text-gray-500 mb-2">Number of sessions required before generating a report</p>
            <Input
              type="number"
              value={settings?.min_sessions_for_report || 3}
              onChange={e => updateSetting('min_sessions_for_report', parseInt(e.target.value))}
              className="w-24"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Billing Management Component
function BillingManagement() {
  const [subscriptions, setSubscriptions] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => ({
    headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` }
  });

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/admin/billing/subscriptions`, getAuthHeaders()),
      axios.get(`${API_URL}/api/admin/billing/payments`, getAuthHeaders())
    ]).then(([subs, pays]) => {
      setSubscriptions(subs.data.subscriptions || []);
      setPayments(pays.data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        <Card className="border-0 shadow-sm bg-green-50">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Total Collected</p>
            <p className="text-3xl font-bold text-green-600">₹{payments.total_collected || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-amber-50">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Pending Amount</p>
            <p className="text-3xl font-bold text-amber-600">₹{payments.pending_amount || 0}</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm bg-blue-50">
          <CardContent className="p-6">
            <p className="text-sm text-gray-600">Active Subscriptions</p>
            <p className="text-3xl font-bold text-blue-600">{subscriptions.filter(s => s.status === 'active').length}</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle>Subscriptions</CardTitle></CardHeader>
        <CardContent>
          {subscriptions.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No subscriptions yet. Subscriptions will appear here when parents enroll their children.</p>
          ) : (
            <div className="space-y-3">
              {subscriptions.map(sub => (
                <div key={sub.id} className="p-4 bg-gray-50 rounded-lg flex justify-between">
                  <div>
                    <p className="font-medium">{sub.plan}</p>
                    <p className="text-sm text-gray-500">{sub.start_date} - {sub.end_date}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">₹{sub.amount}</p>
                    <span className={`text-xs px-2 py-1 rounded ${sub.payment_status === 'paid' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {sub.payment_status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );


// Schools Management Component
function SchoolsManagement() {
  const { toast } = useToast();
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', address: '', city: '', contact_email: '', contact_phone: '' });

  const getAuthHeaders = () => ({ headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` } });

  useEffect(() => {
    axios.get(`${API_URL}/api/admin/schools`, getAuthHeaders())
      .then(res => setSchools(res.data.schools || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const createSchool = async () => {
    try {
      const params = new URLSearchParams(formData);
      await axios.post(`${API_URL}/api/admin/schools?${params}`, null, getAuthHeaders());
      toast({ title: "Success!", description: "School created" });
      setShowForm(false);
      setFormData({ name: '', address: '', city: '', contact_email: '', contact_phone: '' });
      const res = await axios.get(`${API_URL}/api/admin/schools`, getAuthHeaders());
      setSchools(res.data.schools || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to create school", variant: "destructive" });
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">Schools & Programs</h3>
          <p className="text-sm text-gray-500">{schools.length} registered</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-500 hover:bg-blue-600">
          <Plus className="w-4 h-4 mr-2" /> Add School
        </Button>
      </div>

      {showForm && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardHeader><CardTitle>Add New School</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <Input placeholder="School Name" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              <Input placeholder="City" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})} />
              <Input placeholder="Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
              <Input placeholder="Contact Email" value={formData.contact_email} onChange={e => setFormData({...formData, contact_email: e.target.value})} />
              <Input placeholder="Contact Phone" value={formData.contact_phone} onChange={e => setFormData({...formData, contact_phone: e.target.value})} />
            </div>
            <div className="flex gap-3">
              <Button onClick={createSchool} className="bg-green-500 hover:bg-green-600">Create</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schools.map(school => (
          <Card key={school.id} className="border-0 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div>
                  <h4 className="font-semibold text-lg">{school.name}</h4>
                  <p className="text-sm text-gray-500">{school.city}</p>
                  <p className="text-xs text-gray-400">{school.contact_email}</p>
                </div>
                <span className={`px-2 py-1 rounded text-xs ${school.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100'}`}>
                  {school.status || 'active'}
                </span>
              </div>
              <div className="mt-4 grid grid-cols-3 gap-2 text-center">
                <div className="bg-gray-50 p-2 rounded"><p className="text-lg font-bold">{school.student_count || 0}</p><p className="text-xs text-gray-500">Students</p></div>
                <div className="bg-gray-50 p-2 rounded"><p className="text-lg font-bold">{school.principal_count || 0}</p><p className="text-xs text-gray-500">Principals</p></div>
                <div className="bg-gray-50 p-2 rounded"><p className="text-lg font-bold">{school.observer_count || 0}</p><p className="text-xs text-gray-500">Observers</p></div>
              </div>
            </CardContent>
          </Card>
        ))}
        {schools.length === 0 && <p className="text-center text-gray-500 py-8 col-span-2">No schools registered yet</p>}
      </div>
    </div>
  );
}

// Safety & Escalation Component
function SafetyEscalation() {
  const { toast } = useToast();
  const [flags, setFlags] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [selectedFlag, setSelectedFlag] = useState(null);

  const getAuthHeaders = () => ({ headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` } });

  useEffect(() => {
    axios.get(`${API_URL}/api/admin/safety/red-flags`, getAuthHeaders())
      .then(res => { setFlags(res.data.flags || []); setStatusCounts(res.data.status_counts || {}); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateFlag = async (flagId, status, escalate = false) => {
    try {
      await axios.put(`${API_URL}/api/admin/safety/red-flag/${flagId}?status=${status}&escalate=${escalate}`, null, getAuthHeaders());
      toast({ title: "Updated", description: "Flag status updated" });
      const res = await axios.get(`${API_URL}/api/admin/safety/red-flags`, getAuthHeaders());
      setFlags(res.data.flags || []);
      setStatusCounts(res.data.status_counts || {});
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  const getSeverityColor = (severity) => {
    switch(severity) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-300';
      case 'medium': return 'bg-amber-100 text-amber-700 border-amber-300';
      default: return 'bg-blue-100 text-blue-700 border-blue-300';
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-5 gap-4">
        {Object.entries(statusCounts).map(([status, count]) => (
          <Card key={status} className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{count}</p>
              <p className="text-sm text-gray-500 capitalize">{status}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle className="flex items-center gap-2"><Flag className="w-5 h-5 text-red-500" /> Red Flags</CardTitle></CardHeader>
          <CardContent className="max-h-[500px] overflow-y-auto">
            {flags.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No red flags reported</p>
            ) : (
              <div className="space-y-3">
                {flags.map(flag => (
                  <div key={flag.id} onClick={() => setSelectedFlag(flag)} className={`p-4 rounded-lg border-2 cursor-pointer hover:shadow-md transition-all ${getSeverityColor(flag.severity)} ${selectedFlag?.id === flag.id ? 'ring-2 ring-blue-500' : ''}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{flag.child_name || 'Unknown Child'}</p>
                        <p className="text-sm">{flag.category}</p>
                        <p className="text-xs mt-1">Observer: {flag.observer_name || 'Unknown'}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-medium uppercase">{flag.severity}</span>
                        <p className="text-xs mt-1">Level {flag.escalation_level || 0}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardHeader><CardTitle>Flag Details</CardTitle></CardHeader>
          <CardContent>
            {selectedFlag ? (
              <div className="space-y-4">
                <div><p className="text-sm text-gray-500">Child</p><p className="font-medium">{selectedFlag.child_name}</p></div>
                <div><p className="text-sm text-gray-500">Category</p><p className="font-medium">{selectedFlag.category}</p></div>
                <div><p className="text-sm text-gray-500">Description</p><p className="text-sm bg-gray-50 p-3 rounded">{selectedFlag.description}</p></div>
                <div><p className="text-sm text-gray-500">Severity: {selectedFlag.severity} | Escalation Level: {selectedFlag.escalation_level}</p></div>
                <div className="border-t pt-4">
                  <p className="text-sm font-medium mb-2">Actions</p>
                  <div className="flex flex-wrap gap-2">
                    <Button size="sm" variant="outline" onClick={() => updateFlag(selectedFlag.id, 'reviewing')}>Start Review</Button>
                    <Button size="sm" variant="outline" onClick={() => updateFlag(selectedFlag.id, 'resolved')} className="text-green-600">Resolve</Button>
                    <Button size="sm" onClick={() => updateFlag(selectedFlag.id, 'escalated', true)} className="bg-red-500 hover:bg-red-600">Escalate</Button>
                    <Button size="sm" variant="outline" onClick={() => updateFlag(selectedFlag.id, 'referred')}>External Referral</Button>
                  </div>
                </div>
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">Select a flag to view details</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Incident Management Component
function IncidentManagement() {
  const { toast } = useToast();
  const [incidents, setIncidents] = useState([]);
  const [statusCounts, setStatusCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', incident_type: 'safety', severity: 'medium' });

  const getAuthHeaders = () => ({ headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` } });

  useEffect(() => { fetchIncidents(); }, []);

  const fetchIncidents = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/admin/incidents`, getAuthHeaders());
      setIncidents(res.data.incidents || []);
      setStatusCounts(res.data.status_counts || {});
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const createIncident = async () => {
    try {
      const params = new URLSearchParams(formData);
      await axios.post(`${API_URL}/api/admin/incidents?${params}`, null, getAuthHeaders());
      toast({ title: "Created", description: "Incident logged" });
      setShowForm(false);
      setFormData({ title: '', description: '', incident_type: 'safety', severity: 'medium' });
      fetchIncidents();
    } catch (error) {
      toast({ title: "Error", description: "Failed to create", variant: "destructive" });
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div className="grid grid-cols-4 gap-4 flex-1 mr-4">
          {Object.entries(statusCounts).map(([status, count]) => (
            <Card key={status} className="border-0 shadow-sm">
              <CardContent className="p-3 text-center"><p className="text-xl font-bold">{count}</p><p className="text-xs text-gray-500 capitalize">{status}</p></CardContent>
            </Card>
          ))}
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-red-500 hover:bg-red-600"><Plus className="w-4 h-4 mr-2" /> Log Incident</Button>
      </div>

      {showForm && (
        <Card className="border-2 border-red-200 bg-red-50">
          <CardHeader><CardTitle>Log New Incident</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="Incident Title" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
            <textarea className="w-full border rounded p-2" rows={3} placeholder="Description..." value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
            <div className="grid grid-cols-2 gap-4">
              <select className="border rounded p-2" value={formData.incident_type} onChange={e => setFormData({...formData, incident_type: e.target.value})}>
                <option value="safety">Safety</option><option value="technical">Technical</option><option value="compliance">Compliance</option><option value="behavioral">Behavioral</option>
              </select>
              <select className="border rounded p-2" value={formData.severity} onChange={e => setFormData({...formData, severity: e.target.value})}>
                <option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="critical">Critical</option>
              </select>
            </div>
            <div className="flex gap-3">
              <Button onClick={createIncident} className="bg-red-500 hover:bg-red-600">Log Incident</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle>All Incidents</CardTitle></CardHeader>
        <CardContent>
          {incidents.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No incidents logged</p>
          ) : (
            <div className="space-y-3">
              {incidents.map(incident => (
                <div key={incident.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium">{incident.title}</p>
                      <p className="text-sm text-gray-500">{incident.incident_number}</p>
                      <p className="text-xs text-gray-400">{incident.incident_type} • {incident.severity}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs ${incident.status === 'open' ? 'bg-red-100 text-red-700' : incident.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
                      {incident.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// AI Guardrails Component
function AIGuardrails() {
  const { toast } = useToast();
  const [guardrails, setGuardrails] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => ({ headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` } });

  useEffect(() => {
    axios.get(`${API_URL}/api/admin/ai/guardrails`, getAuthHeaders())
      .then(res => setGuardrails(res.data.guardrails))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateGuardrail = async (key, value) => {
    try {
      await axios.put(`${API_URL}/api/admin/ai/guardrails?${key}=${value}`, null, getAuthHeaders());
      setGuardrails({...guardrails, [key]: value});
      toast({ title: "Updated", description: "Guardrail setting saved" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm border-l-4 border-l-red-500">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Lock className="w-5 h-5 text-red-500" /> AI Safety Guardrails</CardTitle>
          <CardDescription>These settings ensure AI outputs comply with Sanjaya's ethical guidelines</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'no_diagnosis', label: 'No Diagnosis', desc: 'AI will never provide medical/psychological diagnoses' },
            { key: 'no_medical_advice', label: 'No Medical Advice', desc: 'AI will never suggest treatments or medications' },
            { key: 'no_therapy_language', label: 'No Therapy Language', desc: 'AI avoids therapeutic terminology' },
            { key: 'no_comparative_assessment', label: 'No Comparisons', desc: 'AI will not compare children against each other' },
            { key: 'no_labeling', label: 'No Labeling', desc: 'AI will not label children (e.g., "problem child")' },
            { key: 'neutral_language_only', label: 'Neutral Language', desc: 'AI uses only observational, neutral language' },
            { key: 'observation_based_only', label: 'Observation-Based', desc: 'AI insights are based only on observations, not interpretations' },
          ].map(item => (
            <div key={item.key} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div>
                <p className="font-medium">{item.label}</p>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <button
                onClick={() => updateGuardrail(item.key, !guardrails?.[item.key])}
                className={`w-12 h-6 rounded-full transition-colors ${guardrails?.[item.key] ? 'bg-green-500' : 'bg-red-400'}`}
              >
                <span className={`block w-5 h-5 bg-white rounded-full shadow transform transition-transform ${guardrails?.[item.key] ? 'translate-x-6' : 'translate-x-0.5'}`} />
              </button>
            </div>
          ))}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle>Blocked Terms</CardTitle></CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            {guardrails?.blocked_terms?.map((term, i) => (
              <span key={i} className="px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">{term}</span>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle>Required Disclaimers</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {guardrails?.required_disclaimers?.map((d, i) => (
              <p key={i} className="p-3 bg-blue-50 rounded text-sm text-blue-800">"{d}"</p>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Data Privacy Component
function DataPrivacy() {
  const { toast } = useToast();
  const [settings, setSettings] = useState(null);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => ({ headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` } });

  useEffect(() => {
    Promise.all([
      axios.get(`${API_URL}/api/admin/privacy/settings`, getAuthHeaders()),
      axios.get(`${API_URL}/api/admin/privacy/data-requests`, getAuthHeaders())
    ]).then(([settingsRes, requestsRes]) => {
      setSettings(settingsRes.data.settings);
      setRequests(requestsRes.data.requests || []);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const updateSetting = async (key, value) => {
    try {
      await axios.put(`${API_URL}/api/admin/privacy/settings?${key}=${value}`, null, getAuthHeaders());
      setSettings({...settings, [key]: value});
      toast({ title: "Updated", description: "Privacy setting saved" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to update", variant: "destructive" });
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2"><Database className="w-5 h-5 text-purple-500" /> Data Retention Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="text-sm font-medium">General Data Retention</label>
              <div className="flex items-center gap-2 mt-2">
                <Input type="number" value={settings?.data_retention_days || 365} onChange={e => updateSetting('data_retention_days', e.target.value)} className="w-24" />
                <span className="text-sm text-gray-500">days</span>
              </div>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <label className="text-sm font-medium">Session Log Retention</label>
              <div className="flex items-center gap-2 mt-2">
                <Input type="number" value={settings?.session_log_retention_days || 180} onChange={e => updateSetting('session_log_retention_days', e.target.value)} className="w-24" />
                <span className="text-sm text-gray-500">days</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">Anonymize on Delete</p>
              <p className="text-sm text-gray-500">Anonymize user data instead of hard deletion</p>
            </div>
            <button onClick={() => updateSetting('anonymize_on_delete', !settings?.anonymize_on_delete)} className={`w-12 h-6 rounded-full ${settings?.anonymize_on_delete ? 'bg-green-500' : 'bg-gray-300'}`}>
              <span className={`block w-5 h-5 bg-white rounded-full shadow transform ${settings?.anonymize_on_delete ? 'translate-x-6' : 'translate-x-0.5'}`} />
            </button>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium">GDPR Compliant</p>
              <p className="text-sm text-gray-500">Follow GDPR data handling guidelines</p>
            </div>
            <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">✓ Enabled</span>
          </div>
        </CardContent>
      </Card>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle>Data Requests</CardTitle></CardHeader>
        <CardContent>
          {requests.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No data requests</p>
          ) : (
            <div className="space-y-3">
              {requests.map(req => (
                <div key={req.id} className="p-4 bg-gray-50 rounded-lg flex justify-between">
                  <div><p className="font-medium">{req.type}</p><p className="text-sm text-gray-500">{req.user_email}</p></div>
                  <span className={`px-2 py-1 rounded text-xs ${req.status === 'completed' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{req.status}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Audit Logs Component
function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [actionTypes, setActionTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('');

  const getAuthHeaders = () => ({ headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` } });

  useEffect(() => {
    axios.get(`${API_URL}/api/admin/audit/logs?days=30&limit=100`, getAuthHeaders())
      .then(res => { setLogs(res.data.logs || []); setActionTypes(res.data.action_types || []); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filteredLogs = filter ? logs.filter(l => l.action_type === filter) : logs;

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <select className="border rounded p-2" value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="">All Actions</option>
          {actionTypes.map(t => <option key={t} value={t}>{t}</option>)}
        </select>
        <span className="text-sm text-gray-500">{filteredLogs.length} logs</span>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle className="flex items-center gap-2"><Eye className="w-5 h-5 text-indigo-500" /> Audit Trail</CardTitle></CardHeader>
        <CardContent className="max-h-[600px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No audit logs found</p>
          ) : (
            <div className="space-y-2">
              {filteredLogs.map(log => (
                <div key={log.id} className="p-3 bg-gray-50 rounded flex justify-between items-start">
                  <div>
                    <p className="font-medium text-sm">{log.action}</p>
                    <p className="text-xs text-gray-500">{log.action_type} • {log.user_id}</p>
                    {log.details && <p className="text-xs text-gray-400 mt-1">{log.details}</p>}
                  </div>
                  <span className="text-xs text-gray-400">{new Date(log.timestamp).toLocaleString()}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// System Health Component
function SystemHealth() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => ({ headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` } });

  const fetchHealth = () => {
    setLoading(true);
    axios.get(`${API_URL}/api/admin/system/health`, getAuthHeaders())
      .then(res => setHealth(res.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchHealth(); }, []);

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">System Health</h3>
        <Button onClick={fetchHealth} variant="outline" size="sm"><RefreshCw className="w-4 h-4 mr-2" /> Refresh</Button>
      </div>

      <div className="grid grid-cols-4 gap-4">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <Activity className={`w-8 h-8 mx-auto mb-2 ${(health?.system?.cpu_percent || 0) < 80 ? 'text-green-500' : 'text-red-500'}`} />
            <p className="text-2xl font-bold">{health?.system?.cpu_percent || 0}%</p>
            <p className="text-sm text-gray-500">CPU Usage</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <Database className={`w-8 h-8 mx-auto mb-2 ${(health?.system?.memory_percent || 0) < 80 ? 'text-green-500' : 'text-amber-500'}`} />
            <p className="text-2xl font-bold">{health?.system?.memory_percent || 0}%</p>
            <p className="text-sm text-gray-500">Memory</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <Database className={`w-8 h-8 mx-auto mb-2 ${(health?.system?.disk_percent || 0) < 80 ? 'text-green-500' : 'text-amber-500'}`} />
            <p className="text-2xl font-bold">{health?.system?.disk_percent || 0}%</p>
            <p className="text-sm text-gray-500">Disk</p>
          </CardContent>
        </Card>
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6 text-center">
            <Activity className={`w-8 h-8 mx-auto mb-2 ${health?.database?.healthy ? 'text-green-500' : 'text-red-500'}`} />
            <p className="text-2xl font-bold">{health?.database?.latency_ms || 0}ms</p>
            <p className="text-sm text-gray-500">DB Latency</p>
          </CardContent>
        </Card>
      </div>

      <Card className="border-0 shadow-sm">
        <CardHeader><CardTitle>Service Status</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            {Object.entries(health?.services || {}).map(([name, service]) => (
              <div key={name} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <span className="font-medium capitalize">{name}</span>
                <span className={`flex items-center gap-1 ${service.status === 'healthy' ? 'text-green-600' : 'text-red-600'}`}>
                  {service.status === 'healthy' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {service.status}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Help & FAQs Component
function HelpFAQs() {
  const { toast } = useToast();
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ question: '', answer: '', category: 'general' });

  const getAuthHeaders = () => ({ headers: { 'Authorization': `Bearer ${localStorage.getItem('admin_token')}` } });

  useEffect(() => {
    axios.get(`${API_URL}/api/admin/help/faqs`, getAuthHeaders())
      .then(res => setFaqs(res.data.faqs || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const createFAQ = async () => {
    try {
      const params = new URLSearchParams(formData);
      await axios.post(`${API_URL}/api/admin/help/faq?${params}`, null, getAuthHeaders());
      toast({ title: "Created", description: "FAQ added" });
      setShowForm(false);
      setFormData({ question: '', answer: '', category: 'general' });
      const res = await axios.get(`${API_URL}/api/admin/help/faqs`, getAuthHeaders());
      setFaqs(res.data.faqs || []);
    } catch (error) {
      toast({ title: "Error", description: "Failed to create FAQ", variant: "destructive" });
    }
  };

  const deleteFAQ = async (id) => {
    try {
      await axios.delete(`${API_URL}/api/admin/help/faq/${id}`, getAuthHeaders());
      setFaqs(faqs.filter(f => f.id !== id));
      toast({ title: "Deleted", description: "FAQ removed" });
    } catch (error) {
      toast({ title: "Error", description: "Failed to delete", variant: "destructive" });
    }
  };

  if (loading) return <div className="text-center py-8">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div><h3 className="text-lg font-semibold">Help & FAQs</h3><p className="text-sm text-gray-500">Manage help documentation</p></div>
        <Button onClick={() => setShowForm(true)} className="bg-blue-500 hover:bg-blue-600"><Plus className="w-4 h-4 mr-2" /> Add FAQ</Button>
      </div>

      {showForm && (
        <Card className="border-2 border-blue-200 bg-blue-50">
          <CardContent className="p-6 space-y-4">
            <Input placeholder="Question" value={formData.question} onChange={e => setFormData({...formData, question: e.target.value})} />
            <textarea className="w-full border rounded p-2" rows={3} placeholder="Answer" value={formData.answer} onChange={e => setFormData({...formData, answer: e.target.value})} />
            <select className="border rounded p-2" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
              <option value="general">General</option><option value="observer">Observer</option><option value="parent">Parent</option><option value="principal">Principal</option><option value="billing">Billing</option>
            </select>
            <div className="flex gap-3">
              <Button onClick={createFAQ} className="bg-green-500 hover:bg-green-600">Save FAQ</Button>
              <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          {faqs.length === 0 ? (
            <p className="text-center text-gray-500 py-8">No FAQs yet</p>
          ) : (
            <div className="space-y-4">
              {faqs.map(faq => (
                <div key={faq.id} className="p-4 bg-gray-50 rounded-lg">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium">{faq.question}</p>
                      <p className="text-sm text-gray-600 mt-1">{faq.answer}</p>
                      <span className="text-xs text-gray-400 mt-2 inline-block">{faq.category}</span>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => deleteFAQ(faq.id)} className="text-red-500"><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
