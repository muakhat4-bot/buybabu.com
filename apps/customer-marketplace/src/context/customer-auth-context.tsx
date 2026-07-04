'use client';

import * as React from 'react';
import { supabaseClient } from '@villex/supabase';
import { User, Session } from '@supabase/supabase-js';

export interface CustomerProfile {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone: string | null;
  created_at: string;
}

interface CustomerAuthContextType {
  user: User | null;
  session: Session | null;
  profile: CustomerProfile | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  signUpWithEmail: (email: string, password: string, firstName: string, lastName: string, phone?: string) => Promise<{ error: any }>;
  signInWithEmail: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithPhoneOtp: (phone: string) => Promise<{ error: any }>;
  verifyPhoneOtp: (phone: string, token: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const CustomerAuthContext = React.createContext<CustomerAuthContextType | undefined>(undefined);

const isUnconfigured = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder-project-id');

export function CustomerAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = React.useState<User | null>(null);
  const [session, setSession] = React.useState<Session | null>(null);
  const [profile, setProfile] = React.useState<CustomerProfile | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  // Sync profile to database using server API route
  const syncProfile = React.useCallback(async (currentUser: User, token: string) => {
    try {
      const response = await fetch('/api/auth/sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          id: currentUser.id,
          email: currentUser.email,
          firstName: currentUser.user_metadata?.firstName || currentUser.user_metadata?.first_name || currentUser.email?.split('@')[0] || 'Customer',
          lastName: currentUser.user_metadata?.lastName || currentUser.user_metadata?.last_name || 'Buyer',
          phone: currentUser.phone || currentUser.user_metadata?.phone || null
        })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.profile) {
          setProfile(data.profile);
        }
      }
    } catch (err) {
      console.error('Failed to sync profile with database:', err);
    }
  }, []);

  const refreshProfile = React.useCallback(async () => {
    if (!user || !session) return;
    await syncProfile(user, session.access_token);
  }, [user, session, syncProfile]);

  // Initial session load
  React.useEffect(() => {
    async function loadSession() {
      if (isUnconfigured) {
        // Mock fallback load
        const savedUser = localStorage.getItem('villex_customer_user');
        if (savedUser) {
          const parsed = JSON.parse(savedUser);
          setUser(parsed.user);
          setProfile(parsed.profile);
          setSession({ access_token: 'mock-token', user: parsed.user } as any);
        }
        setIsLoading(false);
        return;
      }

      try {
        const { data: { session: currentSession } } = await supabaseClient.auth.getSession();
        if (currentSession) {
          setSession(currentSession);
          setUser(currentSession.user);
          await syncProfile(currentSession.user, currentSession.access_token);
        }
      } catch (err) {
        console.error('Error loading Supabase session:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();

    if (isUnconfigured) return;

    // Listen for auth state changes
    const { data: { subscription } } = supabaseClient.auth.onAuthStateChange(async (event, currentSession) => {
      if (currentSession) {
        setSession(currentSession);
        setUser(currentSession.user);
        await syncProfile(currentSession.user, currentSession.access_token);
      } else if (event === 'SIGNED_OUT') {
        setSession(null);
        setUser(null);
        setProfile(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [syncProfile]);

  const signUpWithEmail = async (email: string, password: string, firstName: string, lastName: string, phone?: string) => {
    if (isUnconfigured) {
      // Mock signup success
      const mockUser = {
        id: `mock-cust-${Math.random().toString(36).substr(2, 9)}`,
        email,
        phone: phone || null,
        user_metadata: { firstName, lastName }
      } as any;
      const mockProfile: CustomerProfile = {
        id: mockUser.id,
        email,
        first_name: firstName,
        last_name: lastName,
        phone: phone || null,
        created_at: new Date().toISOString()
      };
      localStorage.setItem('villex_customer_user', JSON.stringify({ user: mockUser, profile: mockProfile }));
      setUser(mockUser);
      setProfile(mockProfile);
      setSession({ access_token: 'mock-token', user: mockUser } as any);
      return { error: null };
    }

    try {
      const { data, error } = await supabaseClient.auth.signUp({
        email,
        password,
        options: {
          data: {
            firstName,
            lastName,
            phone: phone || null,
            role: 'CUSTOMER'
          }
        }
      });
      if (error) return { error };

      if (data.user) {
        setUser(data.user);
        if (data.session) {
          setSession(data.session);
          await syncProfile(data.user, data.session.access_token);
        }
      }
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  };

  const signInWithEmail = async (email: string, password: string) => {
    if (isUnconfigured) {
      // Mock signin fallback
      const saved = localStorage.getItem('villex_customer_user');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.user.email.toLowerCase() === email.toLowerCase()) {
          setUser(parsed.user);
          setProfile(parsed.profile);
          setSession({ access_token: 'mock-token', user: parsed.user } as any);
          return { error: null };
        }
      }
      return { error: new Error('Invalid credentials') };
    }

    try {
      const { data, error } = await supabaseClient.auth.signInWithPassword({ email, password });
      if (error) return { error };

      if (data.user && data.session) {
        setSession(data.session);
        setUser(data.user);
        await syncProfile(data.user, data.session.access_token);
      }
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  };

  const signInWithGoogle = async () => {
    if (isUnconfigured) {
      // Mock OAuth
      const mockUser = {
        id: `mock-google-${Math.random().toString(36).substr(2, 9)}`,
        email: 'google.user@example.com',
        user_metadata: { firstName: 'Google', lastName: 'User' }
      } as any;
      const mockProfile: CustomerProfile = {
        id: mockUser.id,
        email: mockUser.email,
        first_name: 'Google',
        last_name: 'User',
        phone: null,
        created_at: new Date().toISOString()
      };
      localStorage.setItem('villex_customer_user', JSON.stringify({ user: mockUser, profile: mockProfile }));
      setUser(mockUser);
      setProfile(mockProfile);
      setSession({ access_token: 'mock-token', user: mockUser } as any);
      return { error: null };
    }

    try {
      const { error } = await supabaseClient.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/login` : undefined
        }
      });
      return { error };
    } catch (err) {
      return { error: err };
    }
  };

  const signInWithPhoneOtp = async (phone: string) => {
    if (isUnconfigured) {
      // Mock phone request
      console.log(`Mock OTP requested for phone: ${phone}`);
      return { error: null };
    }

    try {
      const { error } = await supabaseClient.auth.signInWithOtp({ phone });
      return { error };
    } catch (err) {
      return { error: err };
    }
  };

  const verifyPhoneOtp = async (phone: string, token: string) => {
    if (isUnconfigured) {
      // Mock OTP verify
      if (token === '123456') {
        const mockUser = {
          id: `mock-phone-${Math.random().toString(36).substr(2, 9)}`,
          phone,
          email: `${phone.replace(/[^0-9]/g, '')}@phone.villex.com`,
          user_metadata: { firstName: 'Phone', lastName: 'User' }
        } as any;
        const mockProfile: CustomerProfile = {
          id: mockUser.id,
          email: mockUser.email,
          first_name: 'Phone',
          last_name: 'User',
          phone,
          created_at: new Date().toISOString()
        };
        localStorage.setItem('villex_customer_user', JSON.stringify({ user: mockUser, profile: mockProfile }));
        setUser(mockUser);
        setProfile(mockProfile);
        setSession({ access_token: 'mock-token', user: mockUser } as any);
        return { error: null };
      }
      return { error: new Error('Invalid OTP code') };
    }

    try {
      const { data, error } = await supabaseClient.auth.verifyOtp({
        phone,
        token,
        type: 'sms'
      });
      if (error) return { error };

      if (data.user && data.session) {
        setSession(data.session);
        setUser(data.user);
        await syncProfile(data.user, data.session.access_token);
      }
      return { error: null };
    } catch (err) {
      return { error: err };
    }
  };

  const signOut = async () => {
    if (isUnconfigured) {
      localStorage.removeItem('villex_customer_user');
      setUser(null);
      setProfile(null);
      setSession(null);
    } else {
      try {
        await supabaseClient.auth.signOut();
      } catch (err) {
        console.error('Error signing out:', err);
      }
    }
    if (typeof window !== 'undefined') {
      window.location.href = '/';
    }
  };

  const isLoggedIn = !!user;

  return (
    <CustomerAuthContext.Provider value={{
      user,
      session,
      profile,
      isLoggedIn,
      isLoading,
      signUpWithEmail,
      signInWithEmail,
      signInWithGoogle,
      signInWithPhoneOtp,
      verifyPhoneOtp,
      signOut,
      refreshProfile
    }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = React.useContext(CustomerAuthContext);
  if (context === undefined) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
