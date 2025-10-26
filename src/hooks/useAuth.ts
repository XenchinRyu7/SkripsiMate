// Custom hook for Firebase Authentication
'use client';

import { useState, useEffect } from 'react';
import { User as FirebaseUser } from 'firebase/auth';
import {
  onAuthChange,
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  signOut as firebaseSignOut,
  getCurrentUser,
} from '@/lib/firebase';

export interface UseAuthReturn {
  user: FirebaseUser | null;
  loading: boolean;
  error: string | null;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

export const useAuth = (): UseAuthReturn => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Check if single-user mode is enabled
  const isSingleUserMode = 
    process.env.NEXT_PUBLIC_DEPLOYMENT_MODE === 'self-hosted' &&
    process.env.NEXT_PUBLIC_AUTH_MODE === 'single-user';

  useEffect(() => {
    // Single-user mode: Create fake user and bypass auth
    if (isSingleUserMode) {
      const fakeUser = {
        uid: 'single-user-local',
        email: 'local@skripsimate.local',
        displayName: 'Local User',
        emailVerified: true,
        isAnonymous: false,
        metadata: {
          creationTime: new Date().toISOString(),
          lastSignInTime: new Date().toISOString(),
        },
        providerData: [],
        refreshToken: '',
        tenantId: null,
        delete: async () => {},
        getIdToken: async () => 'fake-token',
        getIdTokenResult: async () => ({} as any),
        reload: async () => {},
        toJSON: () => ({}),
        phoneNumber: null,
        photoURL: null,
        providerId: 'fake',
      } as FirebaseUser;

      setUser(fakeUser);
      setLoading(false);
      
      // Set cookie for middleware
      document.cookie = `firebase-auth=true; path=/; max-age=${60 * 60 * 24 * 365}; SameSite=Lax`;
      return;
    }

    // Multi-user mode: Use Firebase auth
    const unsubscribe = onAuthChange((user) => {
      setUser(user);
      setLoading(false);
      
      // Set/remove cookie for middleware auth check
      if (user) {
        // Set cookie when user is authenticated
        document.cookie = `firebase-auth=true; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
      } else {
        // Remove cookie when user logs out
        document.cookie = 'firebase-auth=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
      }
    });

    // Cleanup subscription
    return () => unsubscribe();
  }, [isSingleUserMode]);

  const handleSignIn = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { user, error } = await signInWithEmail(email, password);
      if (error) throw new Error(error);
      setUser(user);
    } catch (err: any) {
      setError(err.message || 'Failed to sign in');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const { user, error } = await signUpWithEmail(email, password);
      if (error) throw new Error(error);
      setUser(user);
    } catch (err: any) {
      setError(err.message || 'Failed to sign up');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      setError(null);
      const { user, error } = await signInWithGoogle();
      if (error) {
        if (error === 'Sign in cancelled') {
          // User closed popup, don't throw error
          setLoading(false);
          return;
        }
        throw new Error(error);
      }
      if (user) {
        setUser(user);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to sign in with Google');
      setLoading(false);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setLoading(true);
      setError(null);
      await firebaseSignOut();
      setUser(null);
    } catch (err: any) {
      setError(err.message || 'Failed to sign out');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => {
    setError(null);
  };

  return {
    user,
    loading,
    error,
    signIn: handleSignIn,
    signUp: handleSignUp,
    signInWithGoogle: handleGoogleSignIn,
    signOut: handleSignOut,
    clearError,
  };
};

