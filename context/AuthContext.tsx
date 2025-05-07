import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { router } from 'expo-router';
import { createClient } from '@supabase/supabase-js';
import { User, Clan } from '@/types';

// Initialize Supabase client
const supabase = createClient(
  process.env.EXPO_PUBLIC_SUPABASE_URL!,
  process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!
);

interface AuthContextProps {
  user: User | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setCurrentOnboardingData: (data: Partial<User>) => void;
}

const defaultContext: AuthContextProps = {
  user: null,
  isLoading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  setCurrentOnboardingData: () => {},
};

const AuthContext = createContext<AuthContextProps>(defaultContext);

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [pendingProfile, setPendingProfile] = useState<{ name: string } | null>(null);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        fetchUserProfile(session.user.id);
      } else {
        setIsLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        // If we have a pending profile and this is a new session, create the profile
        if (pendingProfile && event === 'SIGNED_IN') {
          try {
            const { error: profileError } = await supabase
              .from('profiles')
              .insert({
                id: session.user.id,
                name: pendingProfile.name,
                clan: 'onotka',
                total_days_completed: 0,
              });

            if (profileError) throw profileError;

            // Clear pending profile
            setPendingProfile(null);
            
            // Wait for profile to be created before fetching
            await fetchUserProfileWithRetry(session.user.id);
          } catch (error) {
            console.error('Error creating profile:', error);
            setIsLoading(false);
          }
        } else {
          await fetchUserProfileWithRetry(session.user.id);
        }
      } else {
        setUser(null);
        setIsLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [pendingProfile]);

  const fetchUserProfileWithRetry = async (userId: string, retries = 5): Promise<boolean> => {
    for (let i = 0; i < retries; i++) {
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', userId)
          .limit(1)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setUser({
            id: data.id,
            name: data.name,
            email: '', // Email is stored in auth.users
            clan: data.clan as Clan,
            totalDaysCompleted: data.total_days_completed,
          });
          setIsLoading(false);
          return true;
        }

        // If no data found, wait before retrying
        await delay(500);
      } catch (error) {
        console.error('Error fetching user profile (attempt ${i + 1}):', error);
        await delay(500);
      }
    }
    setIsLoading(false);
    return false;
  };

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setUser({
          id: data.id,
          name: data.name,
          email: '', // Email is stored in auth.users
          clan: data.clan as Clan,
          totalDaysCompleted: data.total_days_completed,
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      router.replace('/(app)/(tabs)/totem');
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true);
      
      // Store the name for profile creation after auth
      setPendingProfile({ name });
      
      // Create auth user
      const { data: { user: authUser }, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        // Check if the error is due to an existing user
        if (signUpError.message === 'User already registered') {
          throw new Error('User already registered');
        }
        throw signUpError;
      }
      
      if (!authUser) throw new Error('No user returned after signup');

      // Profile will be created by the auth state change listener
      // Don't navigate here - wait for profile to be created first
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setUser(null);
      router.replace('/(auth)/login');
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const setCurrentOnboardingData = async (data: Partial<User>) => {
    if (!user?.id || !data.clan) return;

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ clan: data.clan })
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error('Error updating user data:', error);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        signIn,
        signUp,
        signOut,
        setCurrentOnboardingData,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}