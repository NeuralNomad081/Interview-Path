import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-24 relative">
      {/* Background effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="hero-blob w-[500px] h-[500px] bg-brand-600 -top-60 -left-60 animate-float" />
        <div className="hero-blob w-[400px] h-[400px] bg-accent-600 -bottom-60 -right-60 animate-float-delayed" />
      </div>
      <div className="relative z-10">
        <SignIn routing="path" path="/login" signUpUrl="/signup" />
      </div>
    </div>
  );
};

export default LoginPage;