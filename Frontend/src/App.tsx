import React, { useState, useContext, createContext } from 'react';
import { Toaster } from 'sonner';
import { AuthContext, useAuthProvider } from './hooks/useAuth';
import Navigation from './components/Layout/Navigation';
import LoginPage from './pages/Auth/LoginPage';
import SignupPage from './pages/Auth/SignupPage';
import DashboardPage from './pages/Dashboard/DashboardPage';
import CreateInterviewPage from './pages/Interview/CreateInterviewPage';
import InterviewSessionPage from './pages/Interview/InterviewSessionPage';
import FeedbackPage from './pages/Interview/FeedbackPage';
import { Interview, InterviewConfig } from './types';

type Page = 'login' | 'signup' | 'dashboard' | 'create' | 'interview' | 'feedback';

function App() {
  const auth = useAuthProvider();
  const [currentPage, setCurrentPage] = useState<Page>('login');
  const [currentInterview, setCurrentInterview] = useState<InterviewConfig | null>(null);

  const handlePageChange = (page: Page) => {
    setCurrentPage(page);
  };

  const handleStartInterview = (config: InterviewConfig) => {
    setCurrentInterview(config);
    setCurrentPage('interview');
  };

  const handleInterviewComplete = () => {
    setCurrentPage('feedback');
  };

  const handleViewInterview = (interview: Interview) => {
    setCurrentPage('feedback');
  };

  // Show loading screen while checking authentication
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
        {/* Background Pattern */}
        <div className="fixed inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>

        {auth.user && (
          <Navigation
            user={auth.user}
            currentPage={currentPage}
            onPageChange={handlePageChange}
            onLogout={() => {
              auth.logout();
              setCurrentPage('login');
            }}
          />
        )}

        <div className="relative z-10">
          {!auth.user ? (
            currentPage === 'signup' ? (
              <SignupPage
                onSignup={auth.signup}
                onSwitchToLogin={() => setCurrentPage('login')}
                loading={auth.loading}
              />
            ) : (
              <LoginPage
                onLogin={auth.login}
                onSwitchToSignup={() => setCurrentPage('signup')}
                loading={auth.loading}
              />
            )
          ) : (
            <>
              {currentPage === 'dashboard' && (
                <DashboardPage
                  onCreateInterview={() => setCurrentPage('create')}
                  onViewInterview={handleViewInterview}
                />
              )}
              
              {currentPage === 'create' && (
                <CreateInterviewPage
                  onBack={() => setCurrentPage('dashboard')}
                  onStartInterview={handleStartInterview}
                />
              )}
              
              {currentPage === 'interview' && currentInterview && (
                <InterviewSessionPage
                  config={currentInterview}
                  onComplete={handleInterviewComplete}
                />
              )}
              
              {currentPage === 'feedback' && (
                <FeedbackPage
                  onBack={() => setCurrentPage('dashboard')}
                />
              )}
            </>
          )}
        </div>

        <Toaster
          theme="dark"
          position="top-right"
          toastOptions={{
            style: {
              background: '#1F2937',
              border: '1px solid #374151',
              color: '#F9FAFB',
            },
          }}
        />
      </div>
    </AuthContext.Provider>
  );
}

export default App;