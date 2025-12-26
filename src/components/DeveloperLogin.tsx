import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Code } from 'lucide-react';

export default function DeveloperLogin() {
  const [devFormEmail, setDevFormEmail] = useState('');
  const [devFormPassword, setDevFormPassword] = useState('');
  const [devFormPhone, setDevFormPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signUp } = useAuth();

  const handleDevLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { error: authError } = await signIn(devFormEmail, devFormPassword, devFormPhone);

      if (authError) {
        if (authError.message.includes('Invalid login credentials')) {
          const { error: signUpError } = await signUp(devFormEmail, devFormPassword, devFormPhone, true);
          if (signUpError) {
            setError(signUpError.message);
          } else {
            // After signing up, try signing in again to verify developer credentials
            const { error: signInAfterSignUpError } = await signIn(devFormEmail, devFormPassword, devFormPhone);
            if (signInAfterSignUpError) {
              setError(signInAfterSignUpError.message);
            }
          }
        } else {
          setError(authError.message);
        }
      }
    } catch (err) {
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-lg">
      <div className="flex items-center gap-2 mb-3">
        <Code className="text-amber-600 dark:text-amber-400" size={20} />
        <span className="font-semibold text-amber-900 dark:text-amber-100">Developer Login</span>
      </div>
      <form onSubmit={handleDevLogin} className="space-y-3">
        <div>
          <label htmlFor="dev-email" className="block text-xs font-medium text-amber-900 dark:text-amber-100 mb-1">
            Email
          </label>
          <input
            id="dev-email"
            type="email"
            value={devFormEmail}
            onChange={(e) => setDevFormEmail(e.target.value)}
            required
            className="w-full px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
            placeholder="dev@example.com"
          />
        </div>
        <div>
          <label htmlFor="dev-password" className="block text-xs font-medium text-amber-900 dark:text-amber-100 mb-1">
            Password
          </label>
          <input
            id="dev-password"
            type="password"
            value={devFormPassword}
            onChange={(e) => setDevFormPassword(e.target.value)}
            required
            minLength={6}
            className="w-full px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
            placeholder="••••••••"
          />
        </div>
        <div>
          <label htmlFor="dev-phone" className="block text-xs font-medium text-amber-900 dark:text-amber-100 mb-1">
            Phone Number (UK)
          </label>
          <div className="flex gap-2">
            <input
              type="text"
              value="+44"
              disabled
              className="w-16 px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-slate-100 dark:bg-slate-600 text-slate-900 dark:text-white text-sm text-center"
              aria-label="Country code"
            />
            <input
              id="dev-phone"
              type="tel"
              value={devFormPhone}
              onChange={(e) => setDevFormPhone(e.target.value.replace(/\D/g, ''))}
              required
              pattern="[0-9]{10}"
              className="flex-1 px-3 py-2 rounded-lg border border-amber-300 dark:border-amber-700 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-amber-500 focus:border-transparent text-sm"
              placeholder="7700900000"
              maxLength={10}
            />
          </div>
          <p className="text-xs text-amber-700 dark:text-amber-300 mt-1">Enter 10 digits after +44</p>
        </div>
        {error && (
            <div
                id="auth-error"
                className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm"
                role="alert"
                aria-live="assertive"
              >
                {error}
              </div>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
        >
          <Code size={18} />
          {loading ? 'Logging in...' : 'Dev Login'}
        </button>
      </form>
    </div>
  );
}
