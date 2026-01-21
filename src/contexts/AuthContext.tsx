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
  sessionExpired: boolean;
  toggleBetaMode: () => void;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string, phone?: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  promoteToDeveloper: (targetUserId: string) => Promise<{ error: any }>;
  clearSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [betaModeEnabled, setBetaModeEnabled] = useState(() => {
    // Restore beta mode preference from localStorage
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('betaMode');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  const [sessionExpired, setSessionExpired] = useState(false);

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('is_developer')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        // Don't expose detailed error information
        console.debug('Failed to fetch user profile');
        setUserProfile(null); // Clear profile on error
        return;
      }

      setUserProfile(data); // data will be null if no profile is found
    } catch (error) {
      // Don't expose detailed error information
      console.debug('Failed to fetch user profile');
      setUserProfile(null); // Clear profile on error
    }
  };

  useEffect(() => {
    setLoading(true);
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      // Handle token refresh and session events
      if (event === 'TOKEN_REFRESHED') {
        setSessionExpired(false);
      } else if (event === 'SIGNED_OUT' && user) {
        setSessionExpired(true);
      }

      setUser(session?.user ?? null);
      if (session?.user) {
        (async () => {
          await fetchUserProfile(session.user.id);
          setSessionExpired(false);
        })();
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
    // Validate input before sending to server
    if (!email || !password) {
      return { error: { message: 'Email and password are required' } };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: { message: 'Invalid email format' } };
    }

    // Validate password strength (minimum 8 characters, at least 1 uppercase, 1 number, 1 special char)
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      return { error: { message: 'Password must be at least 8 characters with uppercase, number, and special character' } };
    }

    try {
      const { error } = await supabase.auth.signUp({
        email: email.toLowerCase().trim(),
        password,
      });
      return { error };
    } catch (error) {
      return { error: { message: 'Sign up failed. Please try again.' } };
    }
  };

  const signIn = async (email: string, password: string, phone?: string) => {
    // Validate input before sending to server
    if (!email || !password) {
      return { error: { message: 'Email and password are required' } };
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: { message: 'Invalid email format' } };
    }

    // Trim and normalize inputs
    const normalizedEmail = email.toLowerCase().trim();

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
          email: normalizedEmail,
          password,
      });

      if (error) {
          return { error };
      }

      if (phone && data.user) {
          // Validate phone format before querying
          const phoneRegex = /^\d{10}$/;
          if (!phoneRegex.test(phone)) {
            await supabase.auth.signOut();
            return { error: { message: 'Invalid phone format' } };
          }

          const { data: profile, error: profileError } = await supabase
              .from('user_profiles')
              .select('is_developer, phone')
              .eq('user_id', data.user.id)
              .single();

          if (profileError) {
              await supabase.auth.signOut();
              return { error: { message: 'Authentication failed' } };
          }

          if (!profile || !profile.is_developer || profile.phone !== `+44${phone}`) {
              await supabase.auth.signOut();
              return { error: { message: 'Invalid credentials' } };
          }
      } else if (phone) {
          await supabase.auth.signOut();
          return { error: { message: 'Invalid credentials' } };
      }

      return { error: null };
    } catch (error) {
      return { error: { message: 'Login failed. Please try again.' } };
    }
  };

  const signInWithGoogle = async () => {
    try {
      // Get the origin from window to avoid hardcoded URLs
      const redirectTo = `${window.location.origin}/auth/callback`;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
        },
      });
      return { error };
    } catch (error) {
      return { error: { message: 'Google sign in failed. Please try again.' } };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      setSessionExpired(false);
    } catch (error) {
      console.debug('Error signing out');
    }
  };

  const clearSessionExpired = () => {
    setSessionExpired(false);
  };

  const promoteToDeveloper = async (targetUserId: string) => {
    try {
      const { error } = await supabase.rpc('promote_to_developer', {
        target_user_id: targetUserId,
      });
      return { error };
    } catch (error) {
      return { error: { message: 'Failed to promote user' } };
    }
  };

  const toggleBetaMode = () => {
    setBetaModeEnabled((prev: boolean) => !prev);
    // Persist beta mode preference
    if (typeof window !== 'undefined') {
      const newState = !betaModeEnabled;
      localStorage.setItem('betaMode', JSON.stringify(newState));
    }
  };

  return (
    <AuthContext.Provider value={{ user, userProfile, loading, betaModeEnabled, sessionExpired, toggleBetaMode, signUp, signIn, signInWithGoogle, signOut, promoteToDeveloper, clearSessionExpired }}>
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
