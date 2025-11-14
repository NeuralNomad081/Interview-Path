import React from 'react';
import { User, LogOut, Home, FileText, PlusCircle } from 'lucide-react';
import { User as UserType } from '../../types';

interface NavigationProps {
  user: UserType | null;
  currentPage: string;
  onPageChange: (page: string) => void;
  onLogout: () => void;
}

const Navigation: React.FC<NavigationProps> = ({ user, currentPage, onPageChange, onLogout }) => {
  return (
    <nav className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center">
                <div className="bg-blue-600 p-2 rounded-lg">
                  <span className="text-white font-bold text-xl">AI</span>
                </div>
                <span className="ml-2 text-white font-semibold text-lg">MockInterview</span>
              </div>
            </div>
            
            {user && (
              <div className="ml-10 flex items-baseline space-x-4">
                <button
                  onClick={() => onPageChange('dashboard')}
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
                  onClick={() => onPageChange('create')}
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
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{user.avatar}</span>
                <div className="text-sm">
                  <div className="text-white font-medium">{user.name}</div>
                  <div className="text-gray-400">{user.email}</div>
                </div>
              </div>
              <button
                onClick={onLogout}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-md transition-colors"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navigation;