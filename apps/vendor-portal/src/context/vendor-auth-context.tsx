'use client';

import * as React from 'react';
import { supabase } from '../lib/supabase';
import {
  vendorApi,
  MockVendorProfile,
  MockStoreInfo,
  generateMockJwt,
  RegisteredVendor,
  MockJwtPayload
} from '../features/dashboard/api/vendor-api';

interface AuthContextType {
  token: string | null;
  user: MockVendorProfile | null;
  store: MockStoreInfo | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const isUnconfigured = !process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL.includes('placeholder-project-id');

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = React.useState<string | null>(null);
  const [user, setUser] = React.useState<MockVendorProfile | null>(null);
  const [store, setStore] = React.useState<MockStoreInfo | null>(null);
  const [isLoading, setIsLoading] = React.useState<boolean>(true);

  const logout = React.useCallback(async () => {
    if (!isUnconfigured) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        console.error('Supabase signOut error:', e);
      }
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('villex_vendor_token');
    }
    setToken(null);
    setUser(null);
    setStore(null);
  }, []);

  const fetchProfileAndStore = React.useCallback(async (authToken: string) => {
    try {
      const profile = await vendorApi.getMe(authToken);
      const storeData = await vendorApi.getStore(authToken);
      
      setUser(profile);
      setStore(storeData);
    } catch {
      logout();
    }
  }, [logout]);

  // Initial load effect
  React.useEffect(() => {
    async function loadSession() {
      if (isUnconfigured) {
        // Fallback to local token check if Supabase session is not active
        const savedToken = localStorage.getItem('villex_vendor_token');
        if (savedToken) {
          setToken(savedToken);
          await fetchProfileAndStore(savedToken);
        }
        setIsLoading(false);
        return;
      }

      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          const jwtToken = session.access_token;
          setToken(jwtToken);
          
          // Map user profile from session metadata
          const meta = session.user.user_metadata;
          const storeName = meta.storeName || 'ElectroPulse Store';
          
          setUser({
            id: session.user.id,
            email: session.user.email || '',
            firstName: meta.firstName || 'Owner',
            lastName: meta.lastName || 'Owner',
            role: meta.role || 'VENDOR_ADMIN',
            isActive: true
          });

          setStore({
            id: meta.storeId || '#VLX-MER-089',
            storeName,
            joinedDate: new Date(session.user.created_at).toLocaleDateString()
          });

          if (typeof window !== 'undefined') {
            localStorage.setItem('villex_vendor_token', jwtToken);
          }
        } else {
          // Fallback to local token check if Supabase session is not active
          const savedToken = localStorage.getItem('villex_vendor_token');
          if (savedToken) {
            setToken(savedToken);
            await fetchProfileAndStore(savedToken);
          }
        }
      } catch (err) {
        console.error('Auth loading error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadSession();

    if (isUnconfigured) {
      return;
    }

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setToken(session.access_token);
        const meta = session.user.user_metadata;
        const storeName = meta.storeName || 'ElectroPulse Store';

        setUser({
          id: session.user.id,
          email: session.user.email || '',
          firstName: meta.firstName || 'Owner',
          lastName: meta.lastName || 'Owner',
          role: meta.role || 'VENDOR_ADMIN',
          isActive: true
        });

        setStore({
          id: meta.storeId || '#VLX-MER-089',
          storeName,
          joinedDate: new Date(session.user.created_at).toLocaleDateString()
        });

        if (typeof window !== 'undefined') {
          localStorage.setItem('villex_vendor_token', session.access_token);
        }
      } else if (event === 'SIGNED_OUT') {
        setToken(null);
        setUser(null);
        setStore(null);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('villex_vendor_token');
        }
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [fetchProfileAndStore]);

  const login = async (emailInput: string, passwordInput: string): Promise<boolean> => {
    setIsLoading(true);
    
    // 1. Attempt login via Supabase Authentication
    if (!isUnconfigured) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: emailInput,
          password: passwordInput
        });

        if (!error && data.session) {
          setToken(data.session.access_token);
          const meta = data.user.user_metadata;
          const storeName = meta.storeName || 'ElectroPulse Store';

          setUser({
            id: data.user.id,
            email: data.user.email || '',
            firstName: meta.firstName || 'Owner',
            lastName: meta.lastName || 'Owner',
            role: meta.role || 'VENDOR_ADMIN',
            isActive: true
          });

          setStore({
            id: meta.storeId || '#VLX-MER-089',
            storeName,
            joinedDate: new Date(data.user.created_at).toLocaleDateString()
          });

          if (typeof window !== 'undefined') {
            localStorage.setItem('villex_vendor_token', data.session.access_token);
          }
          setIsLoading(false);
          return true;
        }
      } catch (err) {
        console.warn('Supabase login error, attempting fallback:', err);
      }
    }

    // 2. Local Database/Mock Fallback
    let registeredVendors: RegisteredVendor[] = [];
    try {
      const response = await fetch('/api/vendors');
      registeredVendors = await response.json();
    } catch (err) {
      console.error('Failed to fetch vendors from API, trying localStorage fallback:', err);
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('villex_registered_vendors');
        if (stored) {
          try {
            registeredVendors = JSON.parse(stored);
          } catch {
            registeredVendors = [];
          }
        }
      }
    }

    const matched = registeredVendors.find(
      (v) => v.email.toLowerCase() === emailInput.toLowerCase() && v.password === passwordInput
    );

    let authPayload: MockJwtPayload | null = null;

    if (matched) {
      authPayload = {
        userId: matched.storeId || matched.email,
        email: matched.email,
        role: 'VENDOR_ADMIN',
      };
    } else if (
      emailInput.toLowerCase() === 'contact@electropulse.pk' &&
      passwordInput === 'SecurePassword123!'
    ) {
      authPayload = {
        userId: 'demo-user-id-12345',
        email: 'contact@electropulse.pk',
        role: 'VENDOR_ADMIN',
      };
    }

    if (authPayload) {
      const generatedToken = generateMockJwt(authPayload);
      if (typeof window !== 'undefined') {
        localStorage.setItem('villex_vendor_token', generatedToken);
      }
      setToken(generatedToken);
      await fetchProfileAndStore(generatedToken);
      setIsLoading(false);
      return true;
    }

    setIsLoading(false);
    return false;
  };

  const isLoggedIn = !!token && !!user && !!store;

  return (
    <AuthContext.Provider value={{ token, user, store, isLoggedIn, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
