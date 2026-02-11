import { useState } from 'react';


import { useAuth } from '@/contexts/AuthContext';
import { BookHeart, Mail, Smartphone } from 'lucide-react';

type AuthMethod = 'email' | 'phone';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [authMethod, setAuthMethod] = useState<AuthMethod>('email');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp, signInWithPhone, verifyOtp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (authMethod === 'phone') {
        const { error: authError } = await signInWithPhone(phone);
        if (authError) {
          setError(authError.message);
        } else {
          setOtpSent(true);
        }
      } else {
        const { error: authError } = isLogin
          ? await signIn(email, password)
          : await signUp(email, password);

        if (authError) {
          setError(authError.message);
        }
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: authError } = await verifyOtp(phone, otp);
      if (authError) {
        setError(authError.message);
      }
    } catch {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="max-w-md w-full relative z-10 fade-in">
        <div className="text-center mb-8 slide-up">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-on-primary mb-4 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 hover:rotate-12 cursor-pointer" aria-hidden="true">
            <BookHeart size={32} />
          </div>
          <h1 className="text-3xl font-bold text-on-background mb-2">
            Poetry Suite
          </h1>
          <p className="text-on-surface-variant">
            Your personal sanctuary for writing, curating, and sharing poetry
          </p>
        </div>

        <div className="bg-surface rounded-2xl shadow-2xl p-8 scale-in hover:shadow-3xl transition-shadow duration-300 border border-outline/10">
          {!otpSent && (
            <>
              <div className="flex gap-2 mb-4 p-1 bg-surface-variant/30 rounded-xl" role="group" aria-label="Authentication method">
                <button
                  onClick={() => setAuthMethod('email')}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 transform ${
                    authMethod === 'email'
                      ? 'bg-primary text-on-primary shadow-md scale-105'
                      : 'bg-transparent text-on-surface-variant hover:bg-surface-variant/50 hover:scale-102'
                  }`}
                  aria-pressed={authMethod === 'email'}
                >
                  <Mail className={`w-4 h-4 transition-transform duration-300 ${authMethod === 'email' ? 'scale-110' : ''}`} />
                  Email
                </button>
                <button
                  onClick={() => setAuthMethod('phone')}
                  className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-300 flex items-center justify-center gap-2 transform ${
                    authMethod === 'phone'
                      ? 'bg-primary text-on-primary shadow-md scale-105'
                      : 'bg-transparent text-on-surface-variant hover:bg-surface-variant/50 hover:scale-102'
                  }`}
                  aria-pressed={authMethod === 'phone'}
                >
                  <Smartphone className={`w-4 h-4 transition-transform duration-300 ${authMethod === 'phone' ? 'scale-110' : ''}`} />
                  Phone
                </button>
              </div>

              {authMethod === 'email' && (
                <div className="flex gap-2 mb-6 p-1 bg-surface-variant/30 rounded-xl slide-up" role="group" aria-label="Authentication mode">
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-300 transform ${
                      isLogin
                        ? 'bg-primary text-on-primary shadow-md scale-105'
                        : 'bg-transparent text-on-surface-variant hover:bg-surface-variant/50 hover:scale-102'
                    }`}
                    aria-pressed={isLogin}
                    aria-label="Switch to login mode"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all duration-300 transform ${
                      !isLogin
                        ? 'bg-primary text-on-primary shadow-md scale-105'
                        : 'bg-transparent text-on-surface-variant hover:bg-surface-variant/50 hover:scale-102'
                    }`}
                    aria-pressed={!isLogin}
                    aria-label="Switch to sign up mode"
                  >
                    Sign Up
                  </button>
                </div>
              )}
            </>
          )}

          {otpSent ? (
            <form onSubmit={handleVerifyOtp} className="space-y-4" aria-label="OTP verification form">
              <div className="text-center mb-4">
                <h2 className="text-xl font-semibold text-on-surface mb-2">Enter Verification Code</h2>
                <p className="text-sm text-on-surface-variant">
                  We sent a code to {phone}
                </p>
              </div>

              <div className="space-y-2">
                <label htmlFor="otp" className="block text-sm font-medium text-on-surface">
                  Verification Code
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  className="w-full px-4 py-4 rounded-lg border-2 border-outline bg-surface text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 hover:border-primary/50 hover:shadow-md text-center text-2xl tracking-widest"
                  placeholder="000000"
                  aria-required="true"
                />
              </div>

              {error && (
                <div
                  id="auth-error"
                  className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm shadow-md border border-error/20 scale-in"
                  role="alert"
                  aria-live="assertive"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-on-primary font-semibold py-3.5 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
              >
                <span className={`relative z-10 ${loading ? 'opacity-0' : ''}`}>Verify Code</span>
                {loading && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp('');
                  setError('');
                }}
                className="w-full text-on-surface-variant text-sm hover:text-on-surface transition-all duration-300 py-2 hover:scale-105"
              >
                Use a different number
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" aria-label={authMethod === 'phone' ? 'Phone authentication form' : isLogin ? 'Login form' : 'Sign up form'}>
              {authMethod === 'email' ? (
                <>
                  <div className="space-y-2">
                    <label htmlFor="email" className="block text-sm font-medium text-on-surface">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-3 rounded-lg border-2 border-outline bg-surface text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 hover:border-primary/50 hover:shadow-md"
                      placeholder="you@example.com"
                      aria-required="true"
                      aria-describedby={error ? 'auth-error' : undefined}
                    />
                  </div>

                  <div className="space-y-2">
                    <label htmlFor="password" className="block text-sm font-medium text-on-surface">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-3 rounded-lg border-2 border-outline bg-surface text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 hover:border-primary/50 hover:shadow-md"
                      placeholder="••••••••"
                      aria-required="true"
                      aria-describedby={error ? 'auth-error' : 'password-requirements'}
                    />
                    <p id="password-requirements" className="sr-only">
                      Password must be at least 6 characters long
                    </p>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <label htmlFor="phone" className="block text-sm font-medium text-on-surface">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-4 py-3 rounded-lg border-2 border-outline bg-surface text-on-surface focus:border-primary focus:ring-4 focus:ring-primary/20 transition-all duration-300 hover:border-primary/50 hover:shadow-md"
                    placeholder="+1234567890"
                    aria-required="true"
                    aria-describedby={error ? 'auth-error' : 'phone-requirements'}
                  />
                  <p id="phone-requirements" className="text-xs text-on-surface-variant">
                    Include country code (e.g., +1 for US)
                  </p>
                </div>
              )}

              {error && (
                <div
                  id="auth-error"
                  className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm shadow-md border border-error/20 scale-in"
                  role="alert"
                  aria-live="assertive"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:bg-primary/90 disabled:bg-primary/50 text-on-primary font-semibold py-3.5 px-4 rounded-lg transition-all duration-300 shadow-md hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:transform-none relative overflow-hidden group"
                aria-label={loading ? 'Processing...' : authMethod === 'phone' ? 'Send verification code' : isLogin ? 'Login to your account' : 'Create your account'}
              >
                <span className={`relative z-10 ${loading ? 'opacity-0' : ''}`}>
                  {authMethod === 'phone' ? 'Send Code' : isLogin ? 'Login' : 'Create Account'}
                </span>
                {loading && (
                  <span className="absolute inset-0 flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 text-on-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
