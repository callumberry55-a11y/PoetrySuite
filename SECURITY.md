# Security Policy

## Vulnerability Disclosure

If you discover a security vulnerability, please email security@poetrysuite.net instead of using the issue tracker.

## Security Features

This application implements the following security measures:

### 1. **Authentication & Authorization**
- Uses Supabase Auth with Row-Level Security (RLS)
- Email and password validation before submission
- Strong password requirements enforced (minimum 8 characters, uppercase, number, special character)
- Phone verification for developer accounts
- Session-based authentication with automatic logout

### 2. **Data Protection**
- All sensitive data is transmitted over HTTPS only
- Supabase anon key is public and safe (row-level security enforces permissions)
- No sensitive credentials stored in frontend code
- Environment variables properly isolated

### 3. **Input Validation**
- Email validation on signup/login
- Password strength validation
- Phone number format validation (10 digits for UK numbers)
- Content sanitization on database operations
- XSS protection via React's built-in escaping

### 4. **Content Security Policy**
- Strict CSP headers prevent inline scripts
- Only allows connections to trusted domains
- Prevents clickjacking with frame-ancestors policy
- Base URI restricted to same-origin

### 5. **Error Handling**
- Generic error messages to prevent information leakage
- Sensitive error details only in console during development
- No exposure of environment variable names in error messages
- Proper error logging without exposing user data

### 6. **OAuth Security**
- Dynamic redirect URLs prevent hardcoding issues
- Google OAuth properly configured
- Tokens handled securely by Supabase

### 7. **Session Management**
- Secure session handling via Supabase
- Automatic auth state synchronization
- Logout clears all user data

## Best Practices for Deployment

1. **Environment Variables**
   - Use `.env.local` for local development (never commit)
   - Set environment variables in your hosting provider for production
   - Never expose `VITE_SUPABASE_ANON_KEY` in version control

2. **Database Security**
   - Enable Row-Level Security (RLS) on all tables
   - Create policies that restrict access to user's own data
   - Validate all user input before database operations

3. **API Security**
   - Use Supabase functions with proper authentication
   - Implement rate limiting on sensitive endpoints
   - Log security events for monitoring

4. **Frontend Security**
   - Keep dependencies updated regularly
   - Monitor for security advisories
   - Use `npm audit` to check for vulnerabilities

5. **CORS Configuration**
   - Only allow requests from your own domain
   - Configure Supabase CORS properly

## Recent Security Fixes

### Fixed Issues:
- ✅ Removed exposed environment variable names in error messages
- ✅ Added password strength validation
- ✅ Added input validation before API calls
- ✅ Dynamic Google OAuth redirect URL
- ✅ Added Content Security Policy headers
- ✅ Sanitized error messages (no sensitive information leaked)
- ✅ Increased minimum password length from 6 to 8 characters
- ✅ Added email normalization (lowercase, trimmed)

## Security Checklist

- [ ] Enable Row-Level Security on all database tables
- [ ] Configure Supabase Auth providers securely
- [ ] Set up CORS headers properly
- [ ] Implement rate limiting
- [ ] Enable audit logging
- [ ] Regular security audits
- [ ] Keep dependencies updated
- [ ] Monitor for security vulnerabilities
- [ ] Test authentication flows thoroughly
- [ ] Validate all user inputs server-side

## Dependencies Security

Run `npm audit` regularly to check for vulnerabilities in dependencies:

```bash
npm audit
npm audit fix  # to automatically fix vulnerabilities
```

Key secure dependencies:
- `@supabase/supabase-js` - Official Supabase client
- `react`, `react-router-dom` - Security-focused frameworks
- All other dependencies pinned to secure versions

## Contact

For security concerns, please contact: security@poetrysuite.net
