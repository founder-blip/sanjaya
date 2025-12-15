import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from '../components/ui/button';
import { Card, CardContent } from '../components/ui/card';
import { Input } from '../components/ui/input';
import Navigation from '../components/Navigation';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const PrincipalLogin = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${BACKEND_URL}/api/principal/login?email=${email}&password=${password}`
      );

      localStorage.setItem('principal_token', response.data.access_token);
      localStorage.setItem('principal_user', JSON.stringify(response.data.principal));
      navigate('/principal/dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      <Navigation />
      
      <div className="pt-24 pb-12 px-4">
        <div className="max-w-md mx-auto">
          <Card className="shadow-xl">
            <CardContent className="p-8">
              <div className="text-center mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Principal Login</h1>
                <p className="text-gray-600">School Administration Portal</p>
              </div>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="principal@school.edu"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Password
                  </label>
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>

                {error && (
                  <div className="bg-red-50 text-red-600 p-3 rounded-md text-sm">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? 'Logging in...' : 'Login'}
                </Button>
              </form>

              <div className="mt-6 p-4 bg-blue-50 rounded-md">
                <p className="text-xs text-gray-600 font-semibold mb-1">Demo Account:</p>
                <p className="text-xs text-gray-600">Email: principal@greenwood.edu</p>
                <p className="text-xs text-gray-600">Password: principal123</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default PrincipalLogin;