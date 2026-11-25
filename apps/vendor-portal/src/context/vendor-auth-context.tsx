'use client';

import * as React from 'react';
import { supabase } from '../lib/supabase';
import {
  MockVendorProfile,
  MockStoreInfo,
} from '../features/dashboard/api/vendor-api';

interface AuthContextType {
  token: string | null;
  user: MockVendorProfile | null;
  store: MockStoreInfo | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  getValidToken: () => Promise<string | null>;
}

const supabaseUrlConfig = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
const isUnconfigured = !supabaseUrlConfig || supabaseUrlConfig.includes('placeholder-project-id');

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

// Shared promise to serialize concurrent refresh requests and avoid GoTrue 400 Bad Request
let activeRefreshPromise: Promise<string | null> | null = null;

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

  /**
   * Resolves the vendor store and profile directly from Supabase by user ID.
   * Avoids heavy cross-vendor queries to /api/vendors.
   */
  const resolveVendorData = React.useCallback(async (authUser: any) => {
    if (!authUser?.id) return;

    const meta = authUser.user_metadata || {};
    const defaultProfile: MockVendorProfile = {
      id: authUser.id,
      email: authUser.email || '',
      firstName: meta.firstName || 'Owner',
      lastName: meta.lastName || 'Owner',
      role: meta.role || 'VENDOR_ADMIN'
    };

    let defaultStore: MockStoreInfo = {
      id: meta.storeId || '#VLX-MER-089',
      ownerId: authUser.id,
      storeName: meta.storeName || 'ElectroPulse Store',
      storeSlug: (meta.storeName || 'ElectroPulse Store').toLowerCase().replace(/\s+/g, '-'),
      supportEmail: authUser.email || '',
      supportPhone: '',
      status: 'ACTIVE'
    };

    try {
      const { data: vendorRecord, error: vendorErr } = await supabase
        .from('vendors')
        .select('*')
        .eq('owner_id', authUser.id)
        .maybeSingle();

      if (!vendorErr && vendorRecord) {
        defaultStore = {
          id: vendorRecord.id,
          ownerId: vendorRecord.owner_id,
          storeName: vendorRecord.store_name,
          storeSlug: vendorRecord.store_slug,
          description: vendorRecord.description || undefined,
          logoUrl: vendorRecord.logo_url || undefined,
          bannerUrl: vendorRecord.banner_url || undefined,
          supportEmail: vendorRecord.support_email || authUser.email || '',
          supportPhone: vendorRecord.support_phone || '',
          status: vendorRecord.status || 'ACTIVE'
        };
      }
    } catch (e) {
      console.warn('Failed to resolve vendor store record:', e);
    }

    setUser(defaultProfile);
    setStore(defaultStore);
  }, []);

  // Initial load effect
  React.useEffect(() => {
    let isMounted = true;

    async function loadSession() {
      if (isUnconfigured) {
        setIsLoading(false);
        return;
      }

      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession().catch(err => {
          console.warn('Supabase getSession network error:', err);
          return { data: { session: null }, error: err };
        });

        if (isMounted && session && !sessionError) {
          const jwtToken = session.access_token;
          setToken(jwtToken);
          if (typeof window !== 'undefined') {
            localStorage.setItem('villex_vendor_token', jwtToken);
          }

          await resolveVendorData(session.user);
        }
      } catch (err) {
        console.error('Auth loading error:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    loadSession();

    if (isUnconfigured) {
      return;
    }

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isMounted) return;

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        if (session) {
          const jwtToken = session.access_token;
          setToken(jwtToken);
          if (typeof window !== 'undefined') {
            localStorage.setItem('villex_vendor_token', jwtToken);
          }
          await resolveVendorData(session.user);
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
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [resolveVendorData]);

  /**
   * Retrieves the current verified access token.
   * Uses a mutex lock to guarantee that concurrent callers share a single
   * refresh request, preventing GoTrue "Invalid Refresh Token: Already Used" 400 errors.
   */
  const getValidToken = React.useCallback(async (): Promise<string | null> => {
    if (isUnconfigured) {
      return token || (typeof window !== 'undefined' ? localStorage.getItem('villex_vendor_token') : null);
    }

    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (!sessionError && session?.access_token) {
        const expiresAt = session.expires_at || 0;
        const now = Math.floor(Date.now() / 1000);

        // If token has more than 45 seconds remaining, return it immediately
        if (expiresAt - now > 45) {
          const activeToken = session.access_token;
          setToken(activeToken);
          if (typeof window !== 'undefined') {
            localStorage.setItem('villex_vendor_token', activeToken);
          }
          return activeToken;
        }

        // Token is close to expiring or expired (< 45s).
        // Serialize refresh requests through activeRefreshPromise
        if (!activeRefreshPromise) {
          activeRefreshPromise = (async () => {
            try {
              const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
              if (!refreshError && refreshData?.session?.access_token) {
                const freshToken = refreshData.session.access_token;
                setToken(freshToken);
                if (typeof window !== 'undefined') {
                  localStorage.setItem('villex_vendor_token', freshToken);
                }
                return freshToken;
              }
              console.warn('Supabase refreshSession failed:', refreshError?.message);
              // If token hasn't fully expired yet, use current session token as fallback
              if (expiresAt > now) {
                return session.access_token;
              }
              return null;
            } catch (err) {
              console.error('Token refresh exception:', err);
              return null;
            } finally {
              activeRefreshPromise = null;
            }
          })();
        }

        const refreshedToken = await activeRefreshPromise;
        if (refreshedToken) return refreshedToken;
      }
    } catch (err) {
      console.warn('Failed to retrieve Supabase session in getValidToken:', err);
    }

    // Fallback to active state or localStorage only if non-empty and non-mock
    const fallbackCandidate = token || (typeof window !== 'undefined' ? localStorage.getItem('villex_vendor_token') : null);
    if (fallbackCandidate && !fallbackCandidate.includes('mocksignature')) {
      return fallbackCandidate;
    }

    return null;
  }, [token]);

  /**
   * Pure Supabase authentication: Authenticates strictly via Supabase Auth.
   * Never issues mock tokens or bypasses server-side verification.
   */
  const login = async (emailInput: string, passwordInput: string): Promise<boolean> => {
    setIsLoading(true);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailInput.trim(),
        password: passwordInput
      });

      if (error || !data?.session) {
        console.warn('Supabase authentication failed:', error?.message);
        setIsLoading(false);
        return false;
      }

      const jwtToken = data.session.access_token;
      setToken(jwtToken);
      if (typeof window !== 'undefined') {
        localStorage.setItem('villex_vendor_token', jwtToken);
      }

      await resolveVendorData(data.user);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Supabase login exception:', err);
      setIsLoading(false);
      return false;
    }
  };

  const isLoggedIn = !!token && !!user && !!store;

  return (
    <AuthContext.Provider value={{ token, user, store, isLoggedIn, isLoading, login, logout, getValidToken }}>
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
