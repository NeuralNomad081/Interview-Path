import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';
import Navigation from './components/Layout/Navigation';
import LandingPage from './pages/Landing/LandingPage';
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
    <div className="min-h-screen bg-surface-950 font-sans">
      {/* Noise texture overlay */}
      <div className="noise-overlay" />

      <Navigation />

      <div className="relative z-10">
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login/*" element={<LoginPage />} />
          <Route path="/signup/*" element={<SignupPage />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage onCreateInterview={() => navigate('/create')} onViewInterview={(interview) => navigate(`/feedback/${interview.id}`)} /></ProtectedRoute>} />
          <Route path="/create" element={<ProtectedRoute><CreateInterviewPage onBack={() => navigate('/dashboard')} onStartInterview={(config) => navigate(`/interview/new`, { state: { config } })} /></ProtectedRoute>} />
          <Route path="/interview/new" element={<ProtectedRoute><InterviewSessionPage onComplete={() => navigate('/feedback/new')} /></ProtectedRoute>} />
          <Route path="/feedback/:id" element={<ProtectedRoute><FeedbackPage onBack={() => navigate('/dashboard')} /></ProtectedRoute>} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255,255,255,0.1)',
            color: '#f8fafc',
            borderRadius: '12px',
          },
        }}
      />
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