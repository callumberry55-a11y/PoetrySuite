# Phone Number OTP Authentication Setup

This application now supports phone number authentication with OTP (One-Time Password) verification via SMS.

## Features

- **Dual Authentication Methods**: Users can choose between email/password or phone number authentication
- **OTP Verification**: Secure 6-digit verification codes sent via SMS
- **Clean UI**: Modern interface with method switching and clear verification flow
- **Automatic Session Management**: Seamless login after OTP verification

## How It Works

### User Flow

1. **Choose Authentication Method**
   - Users can toggle between Email and Phone authentication on the login page
   - Each method has its own dedicated interface

2. **Phone Authentication**
   - Enter phone number with country code (e.g., +1234567890)
   - Click "Send Code" to receive SMS with OTP
   - Enter the 6-digit verification code
   - Click "Verify Code" to complete authentication

3. **Session Creation**
   - Upon successful verification, Supabase creates an authenticated session
   - User is automatically logged in and redirected to the app

## Supabase Configuration Required

To enable phone authentication, you need to configure an SMS provider in your Supabase project:

### Step 1: Enable Phone Authentication

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Enable **Phone** authentication
4. Save changes

### Step 2: Configure SMS Provider

Supabase supports multiple SMS providers. Choose one:

#### Option A: Twilio (Recommended)
1. Create a Twilio account at https://www.twilio.com
2. Get your Account SID and Auth Token
3. Purchase a phone number in Twilio
4. In Supabase Dashboard:
   - Go to **Authentication** → **Providers** → **Phone**
   - Select "Twilio" as provider
   - Enter your Twilio credentials:
     - Account SID
     - Auth Token
     - Phone Number (sender)
   - Save configuration

#### Option B: Messagebird
1. Create a Messagebird account
2. Get your API key
3. Configure in Supabase similar to Twilio

#### Option C: Vonage (Nexmo)
1. Create a Vonage account
2. Get your API credentials
3. Configure in Supabase

### Step 3: Test Configuration

1. Try sending an OTP from your application
2. Check Supabase Dashboard → **Authentication** → **Logs** for any errors
3. Verify SMS delivery

## Phone Number Format

Phone numbers must include the country code:

- ✅ Correct: `+1234567890` (US)
- ✅ Correct: `+442071234567` (UK)
- ✅ Correct: `+353861234567` (Ireland)
- ❌ Incorrect: `2345678901` (missing country code)
- ❌ Incorrect: `1-234-567-8901` (dashes not needed)

## Security Considerations

1. **Rate Limiting**: Supabase automatically rate limits OTP requests to prevent abuse
2. **OTP Expiration**: Codes expire after 60 seconds by default
3. **One-Time Use**: Each OTP can only be used once
4. **Secure Storage**: Phone numbers are securely stored in Supabase auth system

## Development vs Production

### Development
- For testing, you can use Supabase's test mode (if available)
- Some SMS providers offer test credentials
- Consider using your own phone number for testing

### Production
- Ensure SMS provider account has sufficient credits
- Monitor usage in your SMS provider dashboard
- Set up billing alerts
- Consider implementing additional verification steps for sensitive operations

## Troubleshooting

### OTP Not Received
1. Check Supabase logs for errors
2. Verify SMS provider credentials are correct
3. Ensure phone number format includes country code
4. Check SMS provider dashboard for delivery status
5. Verify SMS provider account has credits

### Invalid OTP Error
1. OTP codes expire after 60 seconds - request a new one
2. Each code can only be used once
3. Ensure no typos in the verification code

### Phone Number Already Exists
- Each phone number can only be associated with one account
- Use email authentication or password reset if account exists

## Cost Considerations

- SMS messages typically cost $0.01-0.05 per message depending on provider
- Budget accordingly based on expected user signups
- Consider implementing email verification as a free alternative
- Monitor usage to prevent unexpected costs

## Implementation Details

### Code Structure

- **AuthContext**: Contains `signInWithPhone()` and `verifyOtp()` methods
- **AuthPage**: UI for phone authentication with OTP verification
- **Supabase Integration**: Uses native Supabase phone auth methods

### API Methods Used

```typescript
// Send OTP
await supabase.auth.signInWithOtp({ phone: '+1234567890' })

// Verify OTP
await supabase.auth.verifyOtp({
  phone: '+1234567890',
  token: '123456',
  type: 'sms'
})
```

## Future Enhancements

Potential improvements to consider:

- Resend OTP functionality with countdown timer
- Phone number verification for account recovery
- Multi-factor authentication (MFA) using phone
- Support for WhatsApp OTP delivery
- Phone number change workflow
- International number validation
