// @refresh reset
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { Session, User, AuthResponse } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

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
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  const signIn = useCallback(async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  }, []);

  const signUp = useCallback(async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password });
  }, []);

  const signInWithPhone = useCallback(async (phone: string) => {
    return await supabase.auth.signInWithOtp({ phone });
  }, []);

  const verifyOtp = useCallback(async (phone: string, token: string) => {
    return await supabase.auth.verifyOtp({ phone, token, type: 'sms' });
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
