import React from 'react';
import { SignIn } from '@clerk/clerk-react';

const LoginPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SignIn routing="path" path="/login" signUpUrl="/signup" />
    </div>
  );
};

export default LoginPage;