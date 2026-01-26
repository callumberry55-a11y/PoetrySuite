import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, signOut as firebaseSignOut } from 'firebase/auth';
import { auth } from '@/lib/firebase';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  betaModeEnabled: boolean;
  sessionExpired: boolean;
  toggleBetaMode: () => void;
  signUp: (email: string, password: string) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  clearSessionExpired: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [betaModeEnabled, setBetaModeEnabled] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('betaMode');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });
  const [sessionExpired, setSessionExpired] = useState(false);

  useEffect(() => {
    setLoading(true);
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
      if (user) {
        setSessionExpired(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string) => {
    if (!email || !password) {
      return { error: { message: 'Email and password are required' } };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: { message: 'Invalid email format' } };
    }

    const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(password)) {
      return { error: { message: 'Password must be at least 8 characters with uppercase, number, and special character' } };
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  };

  const signIn = async (email: string, password: string) => {
    if (!email || !password) {
      return { error: { message: 'Email and password are required' } };
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return { error: { message: 'Invalid email format' } };
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  };

  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      return { error: null };
    } catch (error: any) {
      return { error: { message: error.message } };
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
      setSessionExpired(false);
    } catch (error) {
      console.debug('Error signing out');
    }
  };

  const clearSessionExpired = () => {
    setSessionExpired(false);
  };

  const toggleBetaMode = () => {
    setBetaModeEnabled((prev: boolean) => !prev);
    if (typeof window !== 'undefined') {
      const newState = !betaModeEnabled;
      localStorage.setItem('betaMode', JSON.stringify(newState));
    }
  };

  return (
    <AuthContext.Provider value={{ user, loading, betaModeEnabled, sessionExpired, toggleBetaMode, signUp, signIn, signInWithGoogle, signOut, clearSessionExpired }}>
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
