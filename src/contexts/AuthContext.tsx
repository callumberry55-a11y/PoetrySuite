// @refresh reset
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User, AuthResponse } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';
import {
  logLoginAttempt,
  logRegistration,
  logLogout,
  checkUserSecurityStatus,
} from '@/utils/securityMonitor';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<AuthResponse>;
  signUp: (email: string, password: string) => Promise<AuthResponse>;
  signInWithPhone: (phone: string) => Promise<{ data: any; error: any }>;
  verifyOtp: (phone: string, token: string) => Promise<AuthResponse>;
}

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  loading: true,
  signOut: async () => {},
  signIn: async () => ({ data: { user: null, session: null }, error: null }),
  signUp: async () => ({ data: { user: null, session: null }, error: null }),
  signInWithPhone: async () => ({ data: null, error: null }),
  verifyOtp: async () => ({ data: { user: null, session: null }, error: null }),
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (session?.user) {
        const securityStatus = await checkUserSecurityStatus(session.user.id);
        if (securityStatus.isBlocked) {
          console.warn('User is blocked:', securityStatus.reason);
          await supabase.auth.signOut();
          return;
        }

        await logLoginAttempt(session.user.id, true);
      }

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const securityStatus = await checkUserSecurityStatus(session.user.id);
        if (securityStatus.isBlocked) {
          console.warn('User is blocked:', securityStatus.reason);
          await supabase.auth.signOut();
          alert(`Account temporarily blocked: ${securityStatus.reason}`);
          return;
        }

        await logLoginAttempt(session.user.id, true);
      } else if (event === 'SIGNED_OUT' && user) {
        await logLogout(user.id);
      }

      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    if (user) {
      await logLogout(user.id);
    }
    await supabase.auth.signOut();
  }, [user]);

  const signIn = useCallback(async (email: string, password: string) => {
    const response = await supabase.auth.signInWithPassword({ email, password });

    if (response.error) {
      await logLoginAttempt(undefined, false);
      return response;
    }

    if (response.data.user) {
      const securityCheck = await logLoginAttempt(response.data.user.id, true);

      if (securityCheck.blocked) {
        await supabase.auth.signOut();
        return {
          data: { user: null, session: null },
          error: {
            name: 'SecurityBlock',
            message: securityCheck.reason || 'Account temporarily blocked for security reasons',
            status: 403,
          } as any,
        };
      }
    }

    return response;
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    const response = await supabase.auth.signUp({ email, password });

    if (response.data.user) {
      const securityCheck = await logRegistration(response.data.user.id);

      if (securityCheck.blocked) {
        return {
          data: { user: null, session: null },
          error: {
            name: 'SecurityBlock',
            message: securityCheck.reason || 'Registration blocked for security reasons',
            status: 403,
          } as any,
        };
      }
    }

    return response;
  }, []);

  const signInWithPhone = useCallback(async (phone: string) => {
    return await supabase.auth.signInWithOtp({ phone });
  }, []);

  const verifyOtp = useCallback(async (phone: string, token: string) => {
    const response = await supabase.auth.verifyOtp({ phone, token, type: 'sms' });

    if (response.data.user) {
      const securityCheck = await logLoginAttempt(response.data.user.id, true);

      if (securityCheck.blocked) {
        await supabase.auth.signOut();
        return {
          data: { user: null, session: null },
          error: {
            name: 'SecurityBlock',
            message: securityCheck.reason || 'Account temporarily blocked for security reasons',
            status: 403,
          } as any,
        };
      }
    }

    return response;
  }, []);

  const value = {
    session,
    user,
    loading,
    signOut,
    signIn,
    signUp,
    signInWithPhone,
    verifyOtp,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
