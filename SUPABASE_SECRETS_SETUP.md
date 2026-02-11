# Supabase Secrets Setup Guide

This guide explains how to configure secrets for your Supabase Edge Functions.

## Required Secrets

Your Poetry Suite edge functions require these secrets:

| Secret Name | Purpose | Used By |
|-------------|---------|---------|
| `PAAS_ADMIN_KEY` | Admin authentication for PaaS operations | paas-ai-banker, paas-economy-mint, paas-billing-processor, paas-reserve-manager, paas-guard-override |
| `GEMINI_API_KEY` | Google Gemini AI API access | paas-ai-banker |

## Quick Setup

### Option 1: Using Supabase CLI

```bash
# Set PAAS_ADMIN_KEY (create a secure random key)
supabase secrets set PAAS_ADMIN_KEY=your-secure-admin-key-here

# Set GEMINI_API_KEY (get from Google AI Studio)
supabase secrets set GEMINI_API_KEY=your-gemini-api-key-here
```

### Option 2: Using Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to **Project Settings** → **Edge Functions** → **Secrets**
3. Click **Add Secret**
4. Add each secret:
   - Name: `PAAS_ADMIN_KEY`
   - Value: Your secure admin key
   - Click **Save**

   - Name: `GEMINI_API_KEY`
   - Value: Your Gemini API key
   - Click **Save**

## Generating Secrets

### PAAS_ADMIN_KEY

Create a secure random key:

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Example output (use your own!):
# kJ8mN2pQ4rS6tU8vW0xY2zA4bC6dE8fG0hI2jK4lM6n=
```

### GEMINI_API_KEY

1. Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Click **Get API Key** or **Create API Key**
3. Select your Google Cloud project or create a new one
4. Copy the generated API key
5. The key will look like: `AIzaSyB...` (alphanumeric string)

## Verify Secrets Are Set

After setting secrets, verify they're configured:

```bash
# List all secrets (won't show values)
supabase secrets list

# Expected output:
# NAME              CREATED_AT
# PAAS_ADMIN_KEY   2026-02-05 12:34:56
# GEMINI_API_KEY   2026-02-05 12:35:12
```

## Update Secrets

To update a secret value:

```bash
# Using CLI
supabase secrets set PAAS_ADMIN_KEY=new-value-here

# Or use the dashboard (same steps as setup)
```

## Delete Secrets

To remove a secret:

```bash
# Using CLI
supabase secrets unset PAAS_ADMIN_KEY

# Or use the dashboard
```

## Which Edge Functions Need Which Secrets?

### PAAS_ADMIN_KEY Required
These functions validate admin access:
- `paas-ai-banker` - AI banking operations
- `paas-economy-mint` - Mint new points (admin only)
- `paas-billing-processor` - Process billing charges
- `paas-reserve-manager` - Manage reserve funds
- `paas-guard-override` - Override security guards

### GEMINI_API_KEY Required
These functions use AI features:
- `paas-ai-banker` - Natural language banking queries

### No Secrets Required
These functions work without additional secrets:
- `paas-economy-balance` - Check balances
- `paas-economy-transfer` - Transfer points
- `paas-guard-status` - Check guard status
- `paas-neural-*` - Neural network operations
- `paas-social-*` - Social features
- `external-api-*` - External API endpoints

## Testing After Setup

### Test PAAS_ADMIN_KEY

```bash
# Make a request to a protected endpoint
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/paas-economy-mint \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "adminKey": "your-paas-admin-key",
    "userId": "user-uuid",
    "amount": 100,
    "reason": "test"
  }'

# Should return success if key is correct
```

### Test GEMINI_API_KEY

```bash
# Make a request to AI banker
curl -X POST https://YOUR_PROJECT_REF.supabase.co/functions/v1/paas-ai-banker \
  -H "Authorization: Bearer YOUR_SUPABASE_ANON_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "adminKey": "your-paas-admin-key",
    "query": "What is my balance?"
  }'

# Should return AI-generated response if both keys are correct
```

## Security Best Practices

### PAAS_ADMIN_KEY

1. **Never expose in client code** - Only use server-side or in secure admin tools
2. **Use strong random generation** - Minimum 32 bytes of entropy
3. **Rotate regularly** - Change every 3-6 months
4. **Limit distribution** - Only share with trusted admins
5. **Monitor usage** - Check edge function logs for unauthorized access

### GEMINI_API_KEY

1. **Set usage limits** in Google Cloud Console
2. **Monitor API usage** to detect anomalies
3. **Use API key restrictions** if possible (though edge functions may need unrestricted)
4. **Rotate if compromised** immediately

### General Secrets

1. **Never commit to git** - Keep out of code repositories
2. **Use environment-specific keys** - Different keys for dev/staging/prod
3. **Enable audit logging** - Track when secrets are accessed
4. **Backup securely** - Store in password manager or secure vault

## Troubleshooting

### Error: "PAAS_ADMIN_KEY environment variable is not configured"

**Problem**: The secret is not set in Supabase.

**Solution**:
```bash
supabase secrets set PAAS_ADMIN_KEY=your-key-here
```

### Error: "GEMINI_API_KEY not configured"

**Problem**: The secret is not set in Supabase.

**Solution**:
```bash
supabase secrets set GEMINI_API_KEY=your-gemini-key-here
```

### Error: "Invalid admin key"

**Problem**: The provided admin key doesn't match the configured secret.

**Solutions**:
1. Check you're using the correct key
2. Verify the secret is set: `supabase secrets list`
3. Update the secret if needed: `supabase secrets set PAAS_ADMIN_KEY=correct-key`

### Error: "Gemini API request failed"

**Problem**: Invalid or expired Gemini API key.

**Solutions**:
1. Verify key is valid at [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Check API quota hasn't been exceeded
3. Update the key: `supabase secrets set GEMINI_API_KEY=new-key`

### Secrets not taking effect

**Problem**: Functions still can't access secrets after setting.

**Solutions**:
1. Wait 1-2 minutes for changes to propagate
2. Redeploy affected functions:
   ```bash
   supabase functions deploy paas-ai-banker
   supabase functions deploy paas-economy-mint
   # ... etc
   ```
3. Check function logs for errors:
   ```bash
   supabase functions logs paas-ai-banker
   ```

## Local Development

For local testing, create a `.env` file in your project root:

```bash
# .env (for local development only)
PAAS_ADMIN_KEY=your-local-admin-key
GEMINI_API_KEY=your-gemini-api-key
```

When running functions locally:
```bash
supabase functions serve --env-file .env
```

**Important**: Never commit `.env` to git! It's already in `.gitignore`.

## Multiple Environments

If you have multiple Supabase projects (dev, staging, prod):

```bash
# Development
supabase secrets set PAAS_ADMIN_KEY=dev-key --project-ref dev-project-ref

# Staging
supabase secrets set PAAS_ADMIN_KEY=staging-key --project-ref staging-project-ref

# Production
supabase secrets set PAAS_ADMIN_KEY=prod-key --project-ref prod-project-ref
```

Use different admin keys for each environment for better security isolation.

## Cost

Supabase Edge Function secrets are **free** and included with your Supabase project.

## Additional Resources

- [Supabase Edge Functions Secrets Documentation](https://supabase.com/docs/guides/functions/secrets)
- [Google AI Studio](https://aistudio.google.com/app/apikey)
- [Supabase CLI Documentation](https://supabase.com/docs/reference/cli/introduction)

## Quick Reference Card

```bash
# Set a secret
supabase secrets set SECRET_NAME=value

# List secrets (names only)
supabase secrets list

# Remove a secret
supabase secrets unset SECRET_NAME

# Deploy function after secret change
supabase functions deploy function-name

# View function logs
supabase functions logs function-name

# Test locally with secrets
supabase functions serve --env-file .env
```

## Next Steps

After setting up secrets:

1. ✅ Set `PAAS_ADMIN_KEY`
2. ✅ Set `GEMINI_API_KEY`
3. ✅ Verify with `supabase secrets list`
4. ✅ Test edge functions
5. ✅ Store admin key securely (password manager)
6. ✅ Set calendar reminder to rotate keys in 3 months
