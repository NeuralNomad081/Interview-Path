import React from 'react';
import { Home, PlusCircle } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserButton } from '@clerk/clerk-react';

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPage = location.pathname.substring(1) || 'dashboard';
  const { user } = useAuth();

  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0 cursor-pointer" onClick={() => navigate('/dashboard')}>
              <div className="flex items-center">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <span className="text-white font-bold text-xl">AI</span>
                </div>
                <span className="ml-2 text-white font-semibold text-lg">InterviewPath</span>
              </div>
            </div>
            
            {user && (
              <div className="ml-10 flex items-baseline space-x-4">
                <button
                  onClick={() => navigate('/dashboard')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'dashboard'
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <Home className="w-4 h-4 mr-2" />
                  Dashboard
                </button>
                <button
                  onClick={() => navigate('/create')}
                  className={`flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 'create'
                      ? 'bg-gray-800 text-white'
                      : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 mr-2" />
                  Create Interview
                </button>
              </div>
            )}
          </div>

          {user && (
            <div className="flex items-center space-x-4">
              <UserButton afterSignOutUrl="/" />
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;