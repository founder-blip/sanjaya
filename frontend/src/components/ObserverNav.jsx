import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { 
  ArrowLeft, Home, Play, FileText, Brain, AlertTriangle,
  Smile, Calendar, LogOut, Wallet, HelpCircle, ClipboardCheck
} from 'lucide-react';

const ObserverNav = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  
  const handleLogout = () => {
    localStorage.removeItem('observer_token');
    localStorage.removeItem('observer_user');
    navigate('/observer/login');
  };

  const navItems = [
    { path: '/observer/dashboard', label: 'Dashboard', icon: Home },
    { path: '/observer/today', label: 'Today', icon: Calendar },
    { path: '/observer/sessions', label: 'Sessions', icon: Play },
    { path: '/observer/reports', label: 'Reports', icon: FileText },
    { path: '/observer/reflections', label: 'Reflections', icon: Brain },
    { path: '/observer/escalations', label: 'Escalations', icon: AlertTriangle },
  ];

  return (
    <nav className="bg-white border-b shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo and Back */}
          <div className="flex items-center gap-3">
            {currentPath !== '/observer/dashboard' && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => navigate('/observer/dashboard')}
                className="text-gray-600 hover:text-gray-900"
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Back
              </Button>
            )}
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-sm">S</span>
              </div>
              <span className="font-semibold text-gray-800 hidden sm:block">Sanjaya Observer</span>
            </div>
          </div>

          {/* Navigation Links - Desktop */}
          <div className="hidden lg:flex items-center gap-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
              return (
                <Button
                  key={item.path}
                  variant={isActive ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={isActive ? 'bg-purple-500 text-white' : 'text-gray-600'}
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
              onClick={() => navigate('/observer/earnings')}
              className="hidden sm:flex text-gray-600"
            >
              <Wallet className="w-4 h-4 mr-1" />
              Earnings
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/observer/support')}
              className="hidden sm:flex text-gray-600"
            >
              <HelpCircle className="w-4 h-4 mr-1" />
              Support
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
              const isActive = currentPath === item.path || currentPath.startsWith(item.path + '/');
              return (
                <Button
                  key={item.path}
                  variant={isActive ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => navigate(item.path)}
                  className={`whitespace-nowrap ${isActive ? 'bg-purple-500 text-white' : ''}`}
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

export default ObserverNav;
