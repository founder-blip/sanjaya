import React from 'react';
import { Link } from 'react-router-dom';
import { Mail, Phone, MapPin } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <img 
              src="/images/sanjaya-logo.png" 
              alt="Sanjaya Logo" 
              className="h-12 w-auto mb-4 brightness-0 invert"
            />
            <p className="text-gray-400">
              Daily emotional support for children through caring conversations.
            </p>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/observer" className="text-gray-400 hover:text-blue-400 transition-colors">
                  For Observers
                </Link>
              </li>
              <li>
                <Link to="/principal" className="text-gray-400 hover:text-blue-400 transition-colors">
                  For Principals
                </Link>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li>
                <a href="#privacy" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Privacy Policy
                </a>
              </li>
              <li>
                <a href="#terms" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Terms of Service
                </a>
              </li>
              <li>
                <a href="#data" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Data Protection
                </a>
              </li>
              <li>
                <a href="#cookies" className="text-gray-400 hover:text-blue-400 transition-colors">
                  Cookie Policy
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-bold mb-4">Contact</h4>
            <ul className="space-y-3">
              <li className="flex items-center gap-2 text-gray-400">
                <Mail className="w-5 h-5" />
                <span>support@sanjaya.com</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <Phone className="w-5 h-5" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2 text-gray-400">
                <MapPin className="w-5 h-5" />
                <span>India</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 pt-8 text-center text-gray-400">
          <p>© 2025 Sanjaya – The Observer. Crafted with care for every child.</p>
          <div className="mt-4 flex justify-center gap-4 text-sm">
            <a href="#privacy" className="hover:text-blue-400 transition-colors">Privacy</a>
            <span>•</span>
            <a href="#terms" className="hover:text-blue-400 transition-colors">Terms</a>
            <span>•</span>
            <a href="#data" className="hover:text-blue-400 transition-colors">Data Protection</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;