import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button } from './ui/button';
import { Card, CardContent } from './ui/card';
import { Input } from './ui/input';
import { Users, Plus, Trash2, UserPlus, X } from 'lucide-react';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const GuardianManager = () => {
  const [children, setChildren] = useState([]);
  const [allGuardians, setAllGuardians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNewGuardian, setShowNewGuardian] = useState(false);
  const [showAddExisting, setShowAddExisting] = useState(null);
  
  // New guardian form
  const [newGuardianData, setNewGuardianData] = useState({
    name: '',
    email: '',
    phone: '',
    password: ''
  });

  const getAuthHeaders = () => ({
    headers: { Authorization: `Bearer ${localStorage.getItem('admin_token')}` }
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [childrenRes, guardiansRes] = await Promise.all([
        axios.get(`${BACKEND_URL}/api/admin/children`, getAuthHeaders()),
        axios.get(`${BACKEND_URL}/api/admin/guardians`, getAuthHeaders())
      ]);
      
      setChildren(childrenRes.data.children);
      setAllGuardians(guardiansRes.data.guardians);
    } catch (error) {
      console.error('Error loading data:', error);
      alert('Failed to load guardian data');
    } finally {
      setLoading(false);
    }
  };

  const createGuardian = async () => {
    if (!newGuardianData.name || !newGuardianData.email || !newGuardianData.password) {
      alert('Please fill in all required fields');
      return;
    }

    try {
      await axios.post(
        `${BACKEND_URL}/api/admin/guardian`,
        null,
        {
          ...getAuthHeaders(),
          params: newGuardianData
        }
      );

      alert('Guardian created successfully!');
      setShowNewGuardian(false);
      setNewGuardianData({ name: '', email: '', phone: '', password: '' });
      loadData();
    } catch (error) {
      console.error('Error creating guardian:', error);
      alert(error.response?.data?.detail || 'Failed to create guardian');
    }
  };

  const addGuardianToChild = async (childId, guardianId) => {
    try {
      await axios.post(
        `${BACKEND_URL}/api/admin/child/${childId}/guardian`,
        null,
        {
          ...getAuthHeaders(),
          params: { guardian_id: guardianId }
        }
      );

      alert('Guardian added to child successfully!');
      setShowAddExisting(null);
      loadData();
    } catch (error) {
      console.error('Error adding guardian:', error);
      alert(error.response?.data?.detail || 'Failed to add guardian');
    }
  };

  const removeGuardian = async (childId, guardianId, guardianName) => {
    if (!confirm(`Remove ${guardianName} as guardian for this child?`)) return;

    try {
      await axios.delete(
        `${BACKEND_URL}/api/admin/child/${childId}/guardian/${guardianId}`,
        getAuthHeaders()
      );

      alert('Guardian removed successfully!');
      loadData();
    } catch (error) {
      console.error('Error removing guardian:', error);
      alert(error.response?.data?.detail || 'Failed to remove guardian');
    }
  };

  if (loading) {
    return <div className="text-center py-8">Loading guardian management...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-6 h-6" />
          <h2 className="text-2xl font-bold">Guardian Management</h2>
        </div>
        <Button onClick={() => setShowNewGuardian(true)} className="bg-blue-500">
          <Plus className="w-4 h-4 mr-2" />
          Create New Guardian
        </Button>
      </div>

      {/* New Guardian Modal */}
      {showNewGuardian && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowNewGuardian(false)}>
          <Card className="max-w-md w-full" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Create New Guardian Account</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Name *</label>
                  <Input
                    value={newGuardianData.name}
                    onChange={(e) => setNewGuardianData({...newGuardianData, name: e.target.value})}
                    placeholder="Full name"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Email *</label>
                  <Input
                    type="email"
                    value={newGuardianData.email}
                    onChange={(e) => setNewGuardianData({...newGuardianData, email: e.target.value})}
                    placeholder="email@example.com"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Phone</label>
                  <Input
                    value={newGuardianData.phone}
                    onChange={(e) => setNewGuardianData({...newGuardianData, phone: e.target.value})}
                    placeholder="Phone number"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-1">Password *</label>
                  <Input
                    type="password"
                    value={newGuardianData.password}
                    onChange={(e) => setNewGuardianData({...newGuardianData, password: e.target.value})}
                    placeholder="Password"
                  />
                </div>

                <div className="flex gap-2">
                  <Button onClick={createGuardian} className="flex-1 bg-blue-500">
                    Create Guardian
                  </Button>
                  <Button onClick={() => setShowNewGuardian(false)} variant="outline" className="flex-1">
                    Cancel
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Add Existing Guardian Modal */}
      {showAddExisting && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={() => setShowAddExisting(null)}>
          <Card className="max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <CardContent className="p-6">
              <h3 className="text-xl font-bold mb-4">Add Existing Guardian to {showAddExisting.childName}</h3>
              
              <div className="space-y-2">
                {allGuardians
                  .filter(g => !showAddExisting.currentGuardianIds.includes(g.id))
                  .map((guardian) => (
                    <Card key={guardian.id} className="hover:shadow-md cursor-pointer" onClick={() => addGuardianToChild(showAddExisting.childId, guardian.id)}>
                      <CardContent className="p-4">
                        <p className="font-semibold">{guardian.name}</p>
                        <p className="text-sm text-gray-600">{guardian.email}</p>
                        <p className="text-xs text-gray-500">{guardian.phone}</p>
                      </CardContent>
                    </Card>
                  ))}
                
                {allGuardians.filter(g => !showAddExisting.currentGuardianIds.includes(g.id)).length === 0 && (
                  <p className="text-gray-500 text-center py-4">No other guardians available</p>
                )}
              </div>

              <Button onClick={() => setShowAddExisting(null)} variant="outline" className="w-full mt-4">
                Close
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Children with Guardians */}
      <div className="space-y-4">
        {children.map((child) => (
          <Card key={child.id}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-bold">{child.name}</h3>
                  <p className="text-sm text-gray-600">Age {child.age} • {child.grade}</p>
                  <p className="text-xs text-gray-500">{child.school}</p>
                </div>
                <Button
                  onClick={() => setShowAddExisting({
                    childId: child.id,
                    childName: child.name,
                    currentGuardianIds: child.parent_ids || []
                  })}
                  variant="outline"
                  size="sm"
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Guardian
                </Button>
              </div>

              <div className="border-t pt-4">
                <p className="text-sm font-semibold text-gray-700 mb-3">
                  Guardians ({child.guardians?.length || 0})
                </p>
                
                {child.guardians && child.guardians.length > 0 ? (
                  <div className="grid md:grid-cols-2 gap-3">
                    {child.guardians.map((guardian) => (
                      <Card key={guardian.id} className="bg-gray-50">
                        <CardContent className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="font-semibold">{guardian.name}</p>
                              <p className="text-sm text-gray-600">{guardian.email}</p>
                              <p className="text-xs text-gray-500">{guardian.phone}</p>
                            </div>
                            <Button
                              onClick={() => removeGuardian(child.id, guardian.id, guardian.name)}
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">No guardians assigned</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        
        {children.length === 0 && (
          <Card>
            <CardContent className="p-12 text-center">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No children found</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GuardianManager;
