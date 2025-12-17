import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Button } from './ui/button';
import { Menu, X, ChevronDown } from 'lucide-react';

const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isActive = (path) => location.pathname === path;

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${
      scrolled ? 'bg-white/95 backdrop-blur-lg shadow-lg' : 'bg-white/80 backdrop-blur-md'
    }`}>
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img 
              src="/images/sanjaya-logo.png" 
              alt="Sanjaya" 
              className="h-10 md:h-14 w-auto"
            />
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-1">
            <NavLink to="/" active={isActive('/')}>Home</NavLink>
            <NavLink to="/process" active={isActive('/process')}>Process</NavLink>
            <NavLink to="/faq" active={isActive('/faq')}>FAQ</NavLink>
            
            {/* Portals Dropdown */}
            <div className="relative group px-3 py-2">
              <button className="flex items-center gap-1 text-gray-600 hover:text-orange-600 transition-colors font-medium text-sm">
                Portals
                <ChevronDown className="w-4 h-4 group-hover:rotate-180 transition-transform" />
              </button>
              <div className="absolute top-full left-0 mt-1 w-52 bg-white rounded-2xl shadow-xl border border-gray-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all transform group-hover:translate-y-0 translate-y-2">
                <div className="p-2">
                  <DropdownLink to="/parent/login" emoji="👨‍👩‍👧" color="orange">Parent Portal</DropdownLink>
                  <DropdownLink to="/observer/login" emoji="👁️" color="violet">Observer Portal</DropdownLink>
                  <DropdownLink to="/principal/login" emoji="🏫" color="blue">Principal Portal</DropdownLink>
                  <DropdownLink to="/admin/login" emoji="⚙️" color="gray">Admin Portal</DropdownLink>
                </div>
              </div>
            </div>
            
            <NavLink to="/contact" active={isActive('/contact')}>Contact</NavLink>
            
            <Link to="/get-started" className="ml-2">
              <Button className="bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white px-6 py-2 rounded-full font-semibold shadow-md hover:shadow-lg transition-all">
                Get Started
              </Button>
            </Link>
          </div>
          
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-gray-700"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        
        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden mt-4 pb-4 space-y-1 border-t border-gray-100 pt-4">
            <MobileNavLink to="/" onClick={() => setIsMenuOpen(false)}>Home</MobileNavLink>
            <MobileNavLink to="/process" onClick={() => setIsMenuOpen(false)}>Process</MobileNavLink>
            <MobileNavLink to="/faq" onClick={() => setIsMenuOpen(false)}>FAQ</MobileNavLink>
            <MobileNavLink to="/contact" onClick={() => setIsMenuOpen(false)}>Contact</MobileNavLink>
            
            <div className="border-t border-gray-100 my-3 pt-3">
              <p className="text-xs text-gray-400 uppercase tracking-wide mb-2 px-3">Portals</p>
              <MobileNavLink to="/parent/login" onClick={() => setIsMenuOpen(false)}>👨‍👩‍👧 Parent Portal</MobileNavLink>
              <MobileNavLink to="/observer/login" onClick={() => setIsMenuOpen(false)}>👁️ Observer Portal</MobileNavLink>
              <MobileNavLink to="/principal/login" onClick={() => setIsMenuOpen(false)}>🏫 Principal Portal</MobileNavLink>
              <MobileNavLink to="/admin/login" onClick={() => setIsMenuOpen(false)}>⚙️ Admin Portal</MobileNavLink>
            </div>
            
            <Link to="/get-started" onClick={() => setIsMenuOpen(false)} className="block pt-2">
              <Button className="w-full bg-gradient-to-r from-orange-500 to-rose-500 hover:from-orange-600 hover:to-rose-600 text-white rounded-xl font-semibold py-3">
                Get Started Free
              </Button>
            </Link>
          </div>
        )}
      </div>
    </nav>
  );
};

const NavLink = ({ to, active, children }) => (
  <Link
    to={to}
    className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
      active 
        ? 'text-orange-600 bg-orange-50' 
        : 'text-gray-600 hover:text-orange-600 hover:bg-orange-50'
    }`}
  >
    {children}
  </Link>
);

const MobileNavLink = ({ to, onClick, children }) => (
  <Link
    to={to}
    onClick={onClick}
    className="block px-3 py-2.5 rounded-xl text-gray-700 hover:bg-gray-100 transition-colors font-medium"
  >
    {children}
  </Link>
);

const DropdownLink = ({ to, emoji, color, children }) => (
  <Link
    to={to}
    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-${color}-50 text-gray-700 hover:text-${color}-600 transition-colors`}
  >
    <span className="text-lg">{emoji}</span>
    <span className="font-medium text-sm">{children}</span>
  </Link>
);

export default Navigation;
