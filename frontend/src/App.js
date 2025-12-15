import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import About from './pages/About';
import HowItWorks from './pages/HowItWorks';
import FAQ from './pages/FAQ';
import GetStarted from './pages/GetStarted';
import ObserverLanding from './pages/ObserverLanding';
import PrincipalLanding from './pages/PrincipalLanding';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import ParentLogin from './pages/ParentLogin';
import ParentDashboard from './pages/ParentDashboard';
import ParentMessages from './pages/ParentMessages';
import ParentResources from './pages/ParentResources';
import ParentRewards from './pages/ParentRewards';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/observer" element={<ObserverLanding />} />
          <Route path="/principal" element={<PrincipalLanding />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/parent/login" element={<ParentLogin />} />
          <Route path="/parent/dashboard" element={<ParentDashboard />} />
          <Route path="/parent/messages" element={<ParentMessages />} />
          <Route path="/parent/resources" element={<ParentResources />} />
          <Route path="/parent/rewards/:childId" element={<ParentRewards />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;