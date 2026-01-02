import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../components/ui/card';
import { Input } from '../components/ui/input';
import { 
  ArrowLeft, Users, UserPlus, UserMinus, Search, 
  CheckCircle, AlertCircle, RefreshCw, Filter
} from 'lucide-react';
import { useToast } from '../hooks/use-toast';
import PrincipalNav from '../components/PrincipalNav';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PrincipalStudentAssignment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [students, setStudents] = useState([]);
  const [unassignedStudents, setUnassignedStudents] = useState([]);
  const [observers, setObservers] = useState([]);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedObserver, setSelectedObserver] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

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
      const [studentsRes, unassignedRes, observersRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/principal/students?token=${token}`),
        axios.get(`${BACKEND_URL}/api/principal/students/unassigned?token=${token}`),
        axios.get(`${BACKEND_URL}/api/principal/available-observers?token=${token}`)
      ]);
      
      setStudents(studentsRes.data.students || []);
      setUnassignedStudents(unassignedRes.data.unassigned_students || []);
      setObservers(observersRes.data.observers || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({ title: "Error", description: "Failed to load data", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const assignStudent = async (studentId, observerId) => {
    try {
      const token = localStorage.getItem('principal_token');
      await axios.post(
        `${BACKEND_URL}/api/principal/students/${studentId}/assign-observer?observer_id=${observerId}&token=${token}`
      );
      toast({ title: "Success", description: "Student assigned successfully" });
      setSelectedStudent(null);
      setSelectedObserver(null);
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: error.response?.data?.detail || "Failed to assign", variant: "destructive" });
    }
  };

  const unassignStudent = async (studentId) => {
    try {
      const token = localStorage.getItem('principal_token');
      await axios.post(
        `${BACKEND_URL}/api/principal/students/${studentId}/unassign-observer?token=${token}`
      );
      toast({ title: "Success", description: "Student unassigned" });
      fetchData();
    } catch (error) {
      toast({ title: "Error", description: "Failed to unassign", variant: "destructive" });
    }
  };

  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || 
      (filterStatus === 'assigned' && s.observer_id) ||
      (filterStatus === 'unassigned' && !s.observer_id);
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <PrincipalNav />
      
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-6">
          <Button variant="outline" onClick={() => navigate('/principal/dashboard')}>
            <ArrowLeft className="w-4 h-4 mr-2" /> Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Student-Observer Assignment</h1>
            <p className="text-gray-600">Assign students to observers for daily sessions</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <Card className="border-0 shadow-sm bg-blue-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold text-blue-700">{students.length}</p>
                  <p className="text-sm text-blue-600">Total Students</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-green-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-8 h-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold text-green-700">
                    {students.filter(s => s.observer_id).length}
                  </p>
                  <p className="text-sm text-green-600">Assigned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-amber-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="w-8 h-8 text-amber-600" />
                <div>
                  <p className="text-2xl font-bold text-amber-700">{unassignedStudents.length}</p>
                  <p className="text-sm text-amber-600">Unassigned</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm bg-purple-50">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Users className="w-8 h-8 text-purple-600" />
                <div>
                  <p className="text-2xl font-bold text-purple-700">{observers.length}</p>
                  <p className="text-sm text-purple-600">Observers</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Students List */}
          <div className="lg:col-span-2">
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Students</CardTitle>
                  <Button variant="outline" size="sm" onClick={fetchData}>
                    <RefreshCw className="w-4 h-4 mr-2" /> Refresh
                  </Button>
                </div>
                <div className="flex gap-3 mt-3">
                  <div className="relative flex-1">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <Input 
                      placeholder="Search students..." 
                      className="pl-9"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                  <select 
                    className="border rounded-md px-3 py-2"
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <option value="all">All Students</option>
                    <option value="assigned">Assigned</option>
                    <option value="unassigned">Unassigned</option>
                  </select>
                </div>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                {filteredStudents.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No students found</p>
                ) : (
                  <div className="space-y-3">
                    {filteredStudents.map(student => {
                      const observer = observers.find(o => o.id === student.observer_id);
                      return (
                        <div 
                          key={student.id} 
                          className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                            selectedStudent?.id === student.id 
                              ? 'border-blue-500 bg-blue-50' 
                              : 'border-gray-100 bg-gray-50 hover:border-gray-200'
                          }`}
                          onClick={() => setSelectedStudent(student)}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-semibold text-gray-900">{student.name}</p>
                              <p className="text-sm text-gray-600">
                                {student.grade} • Age {student.age || 'N/A'}
                              </p>
                            </div>
                            <div className="text-right">
                              {student.observer_id ? (
                                <div>
                                  <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full">
                                    Assigned
                                  </span>
                                  <p className="text-xs text-gray-500 mt-1">
                                    {observer?.name || 'Unknown Observer'}
                                  </p>
                                </div>
                              ) : (
                                <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs rounded-full">
                                  Unassigned
                                </span>
                              )}
                            </div>
                          </div>
                          
                          {selectedStudent?.id === student.id && (
                            <div className="mt-3 pt-3 border-t flex gap-2">
                              {student.observer_id ? (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  className="text-red-600 hover:bg-red-50"
                                  onClick={(e) => { e.stopPropagation(); unassignStudent(student.id); }}
                                >
                                  <UserMinus className="w-4 h-4 mr-1" /> Unassign
                                </Button>
                              ) : (
                                <p className="text-sm text-blue-600">Select an observer from the right panel →</p>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Observers Panel */}
          <div>
            <Card className="border-0 shadow-sm">
              <CardHeader>
                <CardTitle>Available Observers</CardTitle>
                <CardDescription>
                  {selectedStudent 
                    ? `Assign ${selectedStudent.name} to an observer`
                    : 'Select a student first'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="max-h-[600px] overflow-y-auto">
                {observers.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No observers available</p>
                ) : (
                  <div className="space-y-3">
                    {observers.map(observer => (
                      <div 
                        key={observer.id}
                        className={`p-4 rounded-lg border-2 transition-all ${
                          selectedStudent && !selectedStudent.observer_id
                            ? 'cursor-pointer hover:border-blue-300'
                            : ''
                        } ${
                          selectedObserver?.id === observer.id
                            ? 'border-blue-500 bg-blue-50'
                            : 'border-gray-100 bg-gray-50'
                        }`}
                        onClick={() => {
                          if (selectedStudent && !selectedStudent.observer_id) {
                            setSelectedObserver(observer);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-semibold text-gray-900">{observer.name}</p>
                            <p className="text-sm text-gray-600">{observer.specialization || 'Observer'}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {observer.current_students || 0}/{observer.capacity || 10}
                            </p>
                            <p className="text-xs text-gray-500">students</p>
                          </div>
                        </div>
                        
                        {/* Capacity bar */}
                        <div className="mt-2 bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              (observer.current_students || 0) >= (observer.capacity || 10)
                                ? 'bg-red-500'
                                : (observer.current_students || 0) >= (observer.capacity || 10) * 0.8
                                  ? 'bg-amber-500'
                                  : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(100, ((observer.current_students || 0) / (observer.capacity || 10)) * 100)}%` }}
                          />
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          {observer.available_slots || 0} slots available
                        </p>
                        
                        {selectedObserver?.id === observer.id && selectedStudent && !selectedStudent.observer_id && (
                          <div className="mt-3 pt-3 border-t">
                            <Button 
                              size="sm" 
                              className="w-full bg-blue-500 hover:bg-blue-600"
                              onClick={(e) => { 
                                e.stopPropagation(); 
                                assignStudent(selectedStudent.id, observer.id); 
                              }}
                            >
                              <UserPlus className="w-4 h-4 mr-1" /> 
                              Assign {selectedStudent.name}
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
        </div>
      </div>
    </div>
  );
};

export default PrincipalStudentAssignment;
