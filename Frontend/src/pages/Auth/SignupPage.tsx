import React from 'react';
import { SignUp } from '@clerk/clerk-react';

const SignupPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <SignUp routing="path" path="/signup" signInUrl="/login" />
    </div>
  );
};

export default SignupPage;