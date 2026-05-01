import { useUser, useAuth as useClerkAuth } from '@clerk/clerk-react';
import { User } from '../types';

export const useAuth = () => {
  const { user: clerkUser, isLoaded } = useUser();
  const { getToken, signOut } = useClerkAuth();

  const user: User | null = clerkUser ? {
    id: clerkUser.id,
    name: clerkUser.fullName || clerkUser.username || '',
    email: clerkUser.primaryEmailAddress?.emailAddress || '',
    avatar: clerkUser.imageUrl || '👤',
  } : null;

  return {
    user,
    loading: !isLoaded,
    getToken,
    logout: signOut,
  };
};