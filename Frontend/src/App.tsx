import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { Toaster } from 'sonner';
import { AuthContext, useAuthProvider } from './hooks/useAuth';
import Navigation from './components/Layout/Navigation';
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import CreateInterviewPage from './pages/Interview/CreateInterviewPage';
import InterviewSessionPage from './pages/Interview/InterviewSessionPage';
import FeedbackPage from './pages/Interview/FeedbackPage';

function AppRoutes() {
  const auth = useAuthProvider();
  const navigate = useNavigate();
  const location = useLocation();

  if (auth.loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-blue-600 p-4 rounded-xl mb-4">
            <span className="text-white font-bold text-2xl">AI</span>
          </div>
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <AuthContext.Provider value={auth}>
      <div className="min-h-screen bg-gray-900 font-['Mona_Sans',_system-ui,_sans-serif]">
        <div className="fixed inset-0 opacity-5 pointer-events-none">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {auth.user && <Navigation user={auth.user} onLogout={auth.logout} />}

        <div className="relative z-10">
          <Routes>
            {!auth.user ? (
              <>
                <Route path="/login" element={<LoginPage onLogin={auth.login} onSwitchToSignup={() => navigate('/signup')} loading={auth.loading} />} />
                <Route path="/signup" element={<SignupPage onSignup={auth.signup} onSwitchToLogin={() => navigate('/login')} loading={auth.loading} />} />
                <Route path="*" element={<Navigate to="/login" replace />} />
              </>
            ) : (
              <>
                <Route path="/dashboard" element={<DashboardPage onCreateInterview={() => navigate('/create')} onViewInterview={(interview) => navigate(`/feedback/${interview.id}`)} />} />
                <Route path="/create" element={<CreateInterviewPage onBack={() => navigate('/dashboard')} onStartInterview={(config) => navigate(`/interview/new`, { state: { config } })} />} />
                <Route path="/interview/:id" element={<InterviewSessionPage onComplete={() => navigate('/feedback/new')} />} />
                <Route path="/feedback/:id" element={<FeedbackPage onBack={() => navigate('/dashboard')} />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </>
            )}
          </Routes>
        </div>

        <Toaster theme="dark" position="top-right" toastOptions={{ style: { background: '#1F2937', border: '1px solid #374151', color: '#F9FAFB' } }} />
      </div>
    </AuthContext.Provider>
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