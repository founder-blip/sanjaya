import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Users, Search } from 'lucide-react';
import { Input } from '../components/ui/input';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PrincipalStudents = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [school, setSchool] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('principal_token');
    if (!token) {
      navigate('/principal/login');
      return;
    }
    loadStudents();
  }, [navigate]);

  const loadStudents = async () => {
    try {
      const token = localStorage.getItem('principal_token');
      const response = await axios.get(
        `${BACKEND_URL}/api/principal/students?token=${token}`
      );
      setStudents(response.data.students);
      setSchool(response.data.school);
    } catch (error) {
      console.error('Error loading students:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('principal_token');
        navigate('/principal/login');
      }
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student =>
    student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.grade.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button onClick={() => navigate('/principal/dashboard')} variant="outline">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back
              </Button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">All Students</h1>
                <p className="text-gray-600">{school}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-blue-600">{students.length}</p>
              <p className="text-sm text-gray-600">Total Students</p>
            </div>
          </div>

          {/* Search */}
          <Card className="mb-6">
            <CardContent className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <Input
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Search by name or grade..."
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Students Grid */}
          {filteredStudents.length === 0 ? (
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg">
                  {searchTerm ? 'No students found' : 'No students enrolled yet'}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredStudents.map((student) => (
                <Card key={student.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="font-bold text-lg">{student.name}</h3>
                        <p className="text-sm text-gray-600">Age {student.age} • {student.grade}</p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        student.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {student.status}
                      </span>
                    </div>

                    <div className="space-y-2 text-sm">
                      {student.observer_id && (
                        <div className="flex items-center text-gray-600">
                          <span className="font-medium mr-2">Observer:</span>
                          <span>Assigned</span>
                        </div>
                      )}
                      {student.parent_ids && student.parent_ids.length > 0 && (
                        <div className="flex items-center text-gray-600">
                          <span className="font-medium mr-2">Guardians:</span>
                          <span>{student.parent_ids.length}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PrincipalStudents;