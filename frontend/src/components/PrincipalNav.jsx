import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { 
  ArrowLeft, Home, Play, FileText, Activity, MessageSquare, 
  IndianRupee, UserPlus, LogOut, Users, BarChart3
} from 'lucide-react';

const PrincipalNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const handleLogout = () => {
    localStorage.removeItem('principal_token');
    localStorage.removeItem('principal_user');
    navigate('/principal/login');
  };

  const navItems = [
    { path: '/principal/dashboard', label: 'Dashboard', icon: Home },
    { path: '/principal/recordings', label: 'Recordings', icon: Play },
    { path: '/principal/daily-reports', label: 'Reports', icon: FileText },
    { path: '/principal/observer-performance', label: 'Performance', icon: Activity },
    { path: '/principal/consultations', label: 'Consultations', icon: MessageSquare },
    { path: '/principal/business', label: 'Business', icon: IndianRupee },
    { path: '/principal/student-assignment', label: 'Assign', icon: UserPlus },
  ];

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo and Back */}
          <div className="flex items-center gap-3">
            {currentPath !== '/principal/dashboard' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/principal/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-semibold text-gray-800 hidden sm:block">Sanjaya Principal</span>
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={isActive ? 'bg-blue-500 text-white' : 'text-gray-600'}
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {item.label}
                </Button>
              );
            })}
          </div>

          {/* Quick Links + Logout */}
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/principal/students')}
              className="hidden sm:flex text-gray-600"
            >
              <Users className="w-4 h-4 mr-1" />
              Students
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/principal/analytics')}
              className="hidden sm:flex text-gray-600"
            >
              <BarChart3 className="w-4 h-4 mr-1" />
              Analytics
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4 mr-1" />
              <span className="hidden sm:inline">Logout</span>
            </Button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="lg:hidden overflow-x-auto pb-2 -mx-4 px-4">
          <div className="flex gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <Button
                  key={item.path}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={`whitespace-nowrap ${isActive ? 'bg-blue-500 text-white' : ''}`}
                >
                  <Icon className="w-4 h-4 mr-1" />
                  {item.label}
                </Button>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default PrincipalNav;
