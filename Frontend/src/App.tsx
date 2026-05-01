import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navigation from './components/Layout/Navigation';
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import CreateInterviewPage from './pages/Interview/CreateInterviewPage';
import InterviewSessionPage from './pages/Interview/InterviewSessionPage';
import FeedbackPage from './pages/Interview/FeedbackPage';
import { SignedIn, SignedOut, RedirectToSignIn } from '@clerk/clerk-react';

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SignedIn>{children}</SignedIn>
      <SignedOut><RedirectToSignIn /></SignedOut>
    </>
  );
}

function AppRoutes() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-900 font-['Mona_Sans',_system-ui,_sans-serif]">
      <div className="fixed inset-0 opacity-5 pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      <Navigation />

      <div className="relative z-10">
        <Routes>
          <Route path="/login/*" element={<LoginPage />} />
          <Route path="/signup/*" element={<SignupPage />} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage onCreateInterview={() => navigate('/create')} onViewInterview={(interview) => navigate(`/feedback/${interview.id}`)} /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><CreateInterviewPage onBack={() => navigate('/dashboard')} onStartInterview={(config) => navigate(`/interview/new`, { state: { config } })} /></ProtectedRoute>} />
          <Route path="/interview/new" element={<ProtectedRoute><InterviewSessionPage onComplete={() => navigate('/feedback/new')} /></ProtectedRoute>} />
          <Route path="/feedback/:id" element={<ProtectedRoute><FeedbackPage onBack={() => navigate('/dashboard')} /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </div>

      <Toaster theme="dark" position="top-right" toastOptions={{ style: { background: '#1F2937', border: '1px solid #374151', color: '#F9FAFB' } }} />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;