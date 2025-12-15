import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { ArrowLeft, Users, Mail, Phone, User } from 'lucide-react';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const ParentCoGuardians = () => {
  const navigate = useNavigate();
  const { childId } = useParams();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('parent_token')}` }
  });

  useEffect(() => {
    const token = localStorage.getItem('parent_token');
    if (!token) {
      navigate('/parent/login');
      return;
    }
    if (childId) {
      loadCoGuardians();
    }
  }, [navigate, childId]);

  const loadCoGuardians = async () => {
    try {
      const response = await axios.get(
        `${BACKEND_URL}/api/parent/child/${childId}/co-guardians`,
        getAuthHeaders()
      );
      setData(response.data);
    } catch (error) {
      console.error('Error loading co-guardians:', error);
      if (error.response?.status === 404) {
        alert('Child not found or access denied');
        navigate('/parent/dashboard');
      }
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

  if (!data) return null;

  const { child, co_guardians, total_guardians } = data;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6 flex items-center gap-4">
            <Button onClick={() => navigate('/parent/dashboard')} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-gray-900">
              Co-Guardians - {child.name}
            </h1>
          </div>

          {/* Summary Card */}
          <Card className="mb-6 bg-blue-50 border-blue-200">
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <Users className="w-6 h-6 text-blue-600" />
                <div>
                  <h2 className="font-bold text-lg">Guardian Access for {child.name}</h2>
                  <p className="text-sm text-gray-700">
                    This child has {total_guardians} guardian{total_guardians !== 1 ? 's' : ''} with full access to their information.
                    All guardians have equal access to view progress, schedule appointments, and communicate with observers.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Co-Guardians List */}
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <User className="w-5 h-5" />
              Other Guardians ({co_guardians.length})
            </h2>

            {co_guardians.length === 0 ? (
              <Card>
                <CardContent className="p-12 text-center">
                  <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">You are the only guardian for {child.name}</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Additional guardians can be added by an administrator
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {co_guardians.map((guardian) => (
                  <Card key={guardian.id} className="hover:shadow-lg transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4">
                        <div className="bg-blue-100 rounded-full p-3">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        
                        <div className="flex-1">
                          <h3 className="font-bold text-lg mb-1">{guardian.name}</h3>
                          
                          <div className="space-y-2 text-sm">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Mail className="w-4 h-4" />
                              <a href={`mailto:${guardian.email}`} className="hover:text-blue-600">
                                {guardian.email}
                              </a>
                            </div>
                            
                            {guardian.phone && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <Phone className="w-4 h-4" />
                                <a href={`tel:${guardian.phone}`} className="hover:text-blue-600">
                                  {guardian.phone}
                                </a>
                              </div>
                            )}
                          </div>

                          <div className="mt-3 pt-3 border-t">
                            <p className="text-xs text-gray-500">
                              Member since {new Date(guardian.created_at).toLocaleDateString('en-US', {
                                month: 'short',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          {/* Info Card */}
          <Card className="mt-6 border-gray-300">
            <CardContent className="p-6">
              <h3 className="font-bold mb-2">About Guardian Access</h3>
              <ul className="text-sm text-gray-700 space-y-1">
                <li>• All guardians have equal access to view child's progress and reports</li>
                <li>• Guardians can communicate with observers and view session notes</li>
                <li>• All guardians receive notifications about appointments and updates</li>
                <li>• To add or remove guardians, please contact an administrator</li>
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ParentCoGuardians;
