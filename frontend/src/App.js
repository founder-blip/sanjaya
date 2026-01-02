import React from 'react';
import './App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Process from './pages/Process';
import FAQ from './pages/FAQ';
import GetStarted from './pages/GetStarted';
import ObserverLanding from './pages/ObserverLanding';
import PrincipalLanding from './pages/PrincipalLanding';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';
import AdminPanel from './pages/AdminPanel';
import AdminCommunications from './pages/AdminCommunications';
import ParentLogin from './pages/ParentLogin';
import ParentDashboard from './pages/ParentDashboard';
import ParentMessages from './pages/ParentMessages';
import ParentResources from './pages/ParentResources';
import ParentRewards from './pages/ParentRewards';
import ParentMoodJournal from './pages/ParentMoodJournal';
import ParentGoals from './pages/ParentGoals';
import ParentCommunity from './pages/ParentCommunity';
import ParentGroupSessions from './pages/ParentGroupSessions';
import ParentCoGuardians from './pages/ParentCoGuardians';
import ObserverLogin from './pages/ObserverLogin';
import ObserverDashboard from './pages/ObserverDashboard';
import ObserverMoodEntry from './pages/ObserverMoodEntry';
import ObserverGoalCreate from './pages/ObserverGoalCreate';
import ObserverAIReport from './pages/ObserverAIReport';
import ObserverSessionLogs from './pages/ObserverSessionLogs';
import ObserverEvents from './pages/ObserverEvents';
import ObserverEarnings from './pages/ObserverEarnings';
import ObserverSupport from './pages/ObserverSupport';
import PrincipalLogin from './pages/PrincipalLogin';
import PrincipalDashboard from './pages/PrincipalDashboard';
import PrincipalStudents from './pages/PrincipalStudents';
import PrincipalAnalytics from './pages/PrincipalAnalytics';
import PrincipalEvents from './pages/PrincipalEvents';
import PrincipalEarnings from './pages/PrincipalEarnings';
import PrincipalSupport from './pages/PrincipalSupport';
import PrincipalStudentAssignment from './pages/PrincipalStudentAssignment';
import PrincipalObserverPerformance from './pages/PrincipalObserverPerformance';
import PrincipalConsultations from './pages/PrincipalConsultations';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import { Toaster } from './components/ui/toaster';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/process" element={<Process />} />
          <Route path="/about" element={<Process />} />
          <Route path="/how-it-works" element={<Process />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/get-started" element={<GetStarted />} />
          <Route path="/observer" element={<ObserverLanding />} />
          <Route path="/principal" element={<PrincipalLanding />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/panel" element={<AdminPanel />} />
          <Route path="/admin/communications" element={<AdminCommunications />} />
          <Route path="/parent/login" element={<ParentLogin />} />
          <Route path="/parent/dashboard" element={<ParentDashboard />} />
          <Route path="/parent/messages" element={<ParentMessages />} />
          <Route path="/parent/resources" element={<ParentResources />} />
          <Route path="/parent/rewards/:childId" element={<ParentRewards />} />
          <Route path="/parent/mood-journal/:childId" element={<ParentMoodJournal />} />
          <Route path="/parent/goals/:childId" element={<ParentGoals />} />
          <Route path="/parent/community" element={<ParentCommunity />} />
          <Route path="/parent/group-sessions" element={<ParentGroupSessions />} />
          <Route path="/parent/co-guardians/:childId" element={<ParentCoGuardians />} />
          
          {/* Observer Routes */}
          <Route path="/observer/login" element={<ObserverLogin />} />
          <Route path="/observer/dashboard" element={<ObserverDashboard />} />
          <Route path="/observer/mood-entry/:childId" element={<ObserverMoodEntry />} />
          <Route path="/observer/goal-create/:childId" element={<ObserverGoalCreate />} />
          <Route path="/observer/ai-report/:childId" element={<ObserverAIReport />} />
          <Route path="/observer/sessions/:childId" element={<ObserverSessionLogs />} />
          <Route path="/observer/events" element={<ObserverEvents />} />
          <Route path="/observer/earnings" element={<ObserverEarnings />} />
          <Route path="/observer/support" element={<ObserverSupport />} />
          
          {/* Principal Routes */}
          <Route path="/principal/login" element={<PrincipalLogin />} />
          <Route path="/principal/dashboard" element={<PrincipalDashboard />} />
          <Route path="/principal/students" element={<PrincipalStudents />} />
          <Route path="/principal/analytics" element={<PrincipalAnalytics />} />
          <Route path="/principal/events" element={<PrincipalEvents />} />
          <Route path="/principal/earnings" element={<PrincipalEarnings />} />
          <Route path="/principal/support" element={<PrincipalSupport />} />
          
          {/* Footer Pages */}
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </div>
  );
}

export default App;