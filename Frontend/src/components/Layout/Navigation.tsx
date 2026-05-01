import React, { useEffect, useState } from 'react';
import { Home, PlusCircle, Sparkles, Menu, X } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserButton, SignedIn, SignedOut } from '@clerk/clerk-react';
import { motion, AnimatePresence } from 'framer-motion';

const Navigation: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isLanding = location.pathname === '/';
  const currentPage = location.pathname.substring(1) || '';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = user
    ? [
        { label: 'Dashboard', path: '/dashboard', icon: Home },
        { label: 'New Interview', path: '/create', icon: PlusCircle },
      ]
    : [];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-surface-950/80 backdrop-blur-xl border-b border-white/5 shadow-lg shadow-black/10'
          : isLanding
            ? 'bg-transparent'
            : 'bg-surface-950/80 backdrop-blur-xl border-b border-white/5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 lg:h-20">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => navigate(user ? '/dashboard' : '/')}
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-brand-500/25 transition-shadow duration-300">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-bold text-white tracking-tight">
              Interview<span className="text-brand-400">Path</span>
            </span>
          </div>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-1">
            {isLanding && !user && (
              <>
                <a
                  href="#features"
                  className="px-4 py-2 text-sm font-medium text-surface-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  Features
                </a>
                <a
                  href="#how-it-works"
                  className="px-4 py-2 text-sm font-medium text-surface-400 hover:text-white transition-colors rounded-lg hover:bg-white/5"
                >
                  How It Works
                </a>
              </>
            )}

            {navLinks.map(({ label, path, icon: Icon }) => {
              const active = currentPage === path.substring(1);
              return (
                <button
                  key={path}
                  onClick={() => navigate(path)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    active
                      ? 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
                      : 'text-surface-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              );
            })}
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            <SignedOut>
              <button
                onClick={() => navigate('/login')}
                className="hidden sm:inline-flex text-sm font-medium text-surface-300 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-white/5"
              >
                Sign In
              </button>
              <button
                onClick={() => navigate('/signup')}
                className="btn-primary text-sm px-5 py-2.5"
              >
                Get Started
              </button>
            </SignedOut>

            <SignedIn>
              <UserButton
                afterSignOutUrl="/"
                appearance={{
                  elements: {
                    avatarBox: 'w-9 h-9 ring-2 ring-brand-500/30 ring-offset-2 ring-offset-surface-950',
                  },
                }}
              />
            </SignedIn>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 text-surface-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-surface-950/95 backdrop-blur-xl border-b border-white/5 overflow-hidden"
          >
            <div className="px-4 py-4 space-y-1">
              {isLanding && !user && (
                <>
                  <a
                    href="#features"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-surface-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                  >
                    Features
                  </a>
                  <a
                    href="#how-it-works"
                    onClick={() => setMobileMenuOpen(false)}
                    className="block px-4 py-3 text-surface-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                  >
                    How It Works
                  </a>
                </>
              )}
              {navLinks.map(({ label, path, icon: Icon }) => (
                <button
                  key={path}
                  onClick={() => { navigate(path); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 w-full px-4 py-3 text-surface-400 hover:text-white rounded-lg hover:bg-white/5 transition-colors"
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navigation;