import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

interface UserProfile {
  is_developer?: boolean;
}

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  betaModeEnabled: boolean;
  toggleBetaMode: () => void;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string, phone?: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  promoteToDeveloper: (targetUserId: string) => Promise<{ error: any }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [betaModeEnabled, setBetaModeEnabled] = useState(false);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_developer')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error fetching user profile:', error);
        setUserProfile(null); // Clear profile on error
        return;
      }

      setUserProfile(data); // data will be null if no profile is found
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setUserProfile(null); // Clear profile on error
    }
  };

  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await fetchUserProfile(session.user.id);
      } else {
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { error };
  };

  const signIn = async (email: string, password: string, phone?: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
    });

    if (error) {
        return { error };
    }

    if (phone && data.user) {
        const { data: profile, error: profileError } = await supabase
            .from('user_profiles')
            .select('is_developer, phone')
            .eq('user_id', data.user.id)
            .single();

        if (profileError) {
            await supabase.auth.signOut();
            return { error: profileError };
        }

        if (!profile || !profile.is_developer || profile.phone !== `+44${phone}`) {
            await supabase.auth.signOut();
            return { error: { message: 'Invalid developer credentials' } };
        }
    } else if (phone) {
        await supabase.auth.signOut();
        return { error: { message: 'Invalid developer credentials' } };
    }

    return { error: null };
  };

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: 'https://www.poetrysuite.net',
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  const promoteToDeveloper = async (targetUserId: string) => {
    const { error } = await supabase.rpc('promote_to_developer', {
      target_user_id: targetUserId,
    });
    return { error };
  };

  const toggleBetaMode = () => {
    setBetaModeEnabled(prev => !prev);
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, betaModeEnabled, toggleBetaMode, signUp, signIn, signInWithGoogle, signOut, promoteToDeveloper }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
