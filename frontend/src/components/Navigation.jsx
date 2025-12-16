import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';
import { Menu, X } from 'lucide-react';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 w-full bg-white/90 backdrop-blur-md shadow-md z-50">
      <div className="max-w-7xl mx-auto px-4 py-3 md:py-4">
        <div className="flex justify-between items-center">
          <Link to="/" className="flex items-center gap-2 md:gap-3">
            <img 
              src="/images/sanjaya-logo.png" 
              alt="Sanjaya Logo" 
              className="h-10 md:h-16 w-auto"
            />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link to="/" className="text-gray-700 hover:text-indigo-600 transition-colors font-medium">
              Home
            </Link>
            <Link to="/process" className="text-gray-700 hover:text-indigo-600 transition-colors font-medium">
              Process
            </Link>
            <Link to="/faq" className="text-gray-700 hover:text-indigo-600 transition-colors font-medium">
              FAQ
            </Link>
            
            {/* Portals Dropdown */}
            <div className="relative group">
              <button className="text-gray-700 hover:text-indigo-600 transition-colors font-medium flex items-center gap-1">
                Portals
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-lg shadow-xl border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                <Link to="/parent/login" className="block px-4 py-3 hover:bg-indigo-50 text-gray-700 hover:text-indigo-600 transition-colors border-b">
                  👨‍👩‍👧 Parent Portal
                </Link>
                <Link to="/observer/login" className="block px-4 py-3 hover:bg-purple-50 text-gray-700 hover:text-purple-600 transition-colors border-b">
                  🔍 Observer Portal
                </Link>
                <Link to="/principal/login" className="block px-4 py-3 hover:bg-blue-50 text-gray-700 hover:text-blue-600 transition-colors border-b">
                  🏫 Principal Portal
                </Link>
                <Link to="/admin/login" className="block px-4 py-3 hover:bg-gray-50 text-gray-700 hover:text-gray-600 transition-colors rounded-b-lg">
                  ⚙️ Admin Portal
                </Link>
              </div>
            </div>
            
            <Link to="/contact" className="text-gray-700 hover:text-indigo-600 transition-colors font-medium">
              Contact
            </Link>
            
            <Link to="/get-started">
              <Button className="bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-full">
                Get Started
              </Button>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden text-gray-700"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-4">
            <Link
              to="/"
              className="block text-gray-700 hover:text-indigo-600 transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              to="/process"
              className="block text-gray-700 hover:text-indigo-600 transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Process
            </Link>
            <Link
              to="/faq"
              className="block text-gray-700 hover:text-indigo-600 transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              FAQ
            </Link>
            <Link
              to="/observer"
              className="block text-gray-700 hover:text-purple-600 transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              For Observers
            </Link>
            <Link
              to="/principal"
              className="block text-gray-700 hover:text-blue-600 transition-colors font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              For Principals
            </Link>
            <Link to="/get-started" onClick={() => setIsMenuOpen(false)}>
              <Button className="w-full bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white rounded-full">
                Get Started
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;