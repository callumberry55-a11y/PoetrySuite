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
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary text-on-primary mb-4" aria-hidden="true">
            <BookHeart size={32} />
          </div>
          <h1 className="text-3xl font-bold text-on-background mb-2">
            Poetry Suite
          </h1>
          <p className="text-on-surface-variant">
            Your personal sanctuary for writing, curating, and sharing poetry
          </p>
        </div>

        <div className="bg-surface rounded-2xl shadow-xl p-8">
          {!otpSent && (
            <>
              <div className="flex gap-2 mb-4" role="group" aria-label="Authentication method">
                <button
                  onClick={() => setAuthMethod('email')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    authMethod === 'email'
                      ? 'bg-primary text-on-primary'
                      : 'bg-secondary-container text-on-secondary-container'
                  }`}
                  aria-pressed={authMethod === 'email'}
                >
                  <Mail className="w-4 h-4" />
                  Email
                </button>
                <button
                  onClick={() => setAuthMethod('phone')}
                  className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
                    authMethod === 'phone'
                      ? 'bg-primary text-on-primary'
                      : 'bg-secondary-container text-on-secondary-container'
                  }`}
                  aria-pressed={authMethod === 'phone'}
                >
                  <Smartphone className="w-4 h-4" />
                  Phone
                </button>
              </div>

              {authMethod === 'email' && (
                <div className="flex gap-2 mb-6" role="group" aria-label="Authentication mode">
                  <button
                    onClick={() => setIsLogin(true)}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      isLogin
                        ? 'bg-primary text-on-primary'
                        : 'bg-secondary-container text-on-secondary-container'
                    }`}
                    aria-pressed={isLogin}
                    aria-label="Switch to login mode"
                  >
                    Login
                  </button>
                  <button
                    onClick={() => setIsLogin(false)}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      !isLogin
                        ? 'bg-primary text-on-primary'
                        : 'bg-secondary-container text-on-secondary-container'
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

              <div>
                <label htmlFor="otp" className="block text-sm font-medium text-on-surface mb-2">
                  Verification Code
                </label>
                <input
                  id="otp"
                  type="text"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  required
                  maxLength={6}
                  className="w-full px-4 py-2 rounded-lg border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent text-center text-2xl tracking-widest"
                  placeholder="000000"
                  aria-required="true"
                />
              </div>

              {error && (
                <div
                  id="auth-error"
                  className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm"
                  role="alert"
                  aria-live="assertive"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:opacity-90 disabled:bg-primary/50 text-on-primary font-medium py-3 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Verifying...' : 'Verify Code'}
              </button>

              <button
                type="button"
                onClick={() => {
                  setOtpSent(false);
                  setOtp('');
                  setError('');
                }}
                className="w-full text-on-surface-variant text-sm hover:text-on-surface transition-colors"
              >
                Use a different number
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4" aria-label={authMethod === 'phone' ? 'Phone authentication form' : isLogin ? 'Login form' : 'Sign up form'}>
              {authMethod === 'email' ? (
                <>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-on-surface mb-2">
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      className="w-full px-4 py-2 rounded-lg border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="you@example.com"
                      aria-required="true"
                      aria-describedby={error ? 'auth-error' : undefined}
                    />
                  </div>

                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-on-surface mb-2">
                      Password
                    </label>
                    <input
                      id="password"
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      minLength={6}
                      className="w-full px-4 py-2 rounded-lg border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent"
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
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-on-surface mb-2">
                    Phone Number
                  </label>
                  <input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    className="w-full px-4 py-2 rounded-lg border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="+1234567890"
                    aria-required="true"
                    aria-describedby={error ? 'auth-error' : 'phone-requirements'}
                  />
                  <p id="phone-requirements" className="text-xs text-on-surface-variant mt-1">
                    Include country code (e.g., +1 for US)
                  </p>
                </div>
              )}

              {error && (
                <div
                  id="auth-error"
                  className="bg-error-container text-on-error-container px-4 py-3 rounded-lg text-sm"
                  role="alert"
                  aria-live="assertive"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary hover:opacity-90 disabled:bg-primary/50 text-on-primary font-medium py-3 px-4 rounded-lg transition-colors"
                aria-label={loading ? 'Processing...' : authMethod === 'phone' ? 'Send verification code' : isLogin ? 'Login to your account' : 'Create your account'}
              >
                {loading ? 'Please wait...' : authMethod === 'phone' ? 'Send Code' : isLogin ? 'Login' : 'Create Account'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
