# Quick Setup - Missing Secrets

You need to configure two secrets in Supabase for your edge functions to work.

## Step 1: Generate Admin Key

```bash
openssl rand -base64 32
```

This will output something like:
```
kJ8mN2pQ4rS6tU8vW0xY2zA4bC6dE8fG0hI2jK4lM6n=
```

Copy this value - you'll need it in the next step.

## Step 2: Get Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Click "Create API Key" or "Get API Key"
3. Copy the API key (starts with `AIzaSy...`)

## Step 3: Set Secrets in Supabase

```bash
# Set the admin key (paste the value from Step 1)
supabase secrets set PAAS_ADMIN_KEY=your-generated-key-here

# Set the Gemini API key (paste the value from Step 2)
supabase secrets set GEMINI_API_KEY=your-gemini-key-here
```

## Step 4: Verify

```bash
supabase secrets list
```

You should see:
```
NAME              CREATED_AT
PAAS_ADMIN_KEY   2026-02-05 12:34:56
GEMINI_API_KEY   2026-02-05 12:35:12
```

## Done!

Your edge functions will now work correctly. For more details, see [SUPABASE_SECRETS_SETUP.md](SUPABASE_SECRETS_SETUP.md).

## Using the Dashboard Instead

If you prefer using the Supabase Dashboard:

1. Go to your project at https://supabase.com/dashboard
2. Click **Project Settings** (gear icon)
3. Go to **Edge Functions** → **Secrets**
4. Click **Add Secret** for each:
   - Name: `PAAS_ADMIN_KEY`, Value: your generated key
   - Name: `GEMINI_API_KEY`, Value: your Gemini key
5. Click **Save** for each

## What These Secrets Do

### PAAS_ADMIN_KEY
Authenticates admin operations for:
- Creating/managing developer accounts
- Minting/transferring points
- Processing billing
- Managing reserve funds
- AI banking operations

### GEMINI_API_KEY
Enables AI features:
- Natural language banking queries
- AI-powered insights
- Smart recommendations

## Troubleshooting

### "supabase: command not found"

Install the Supabase CLI:
```bash
npm install -g supabase
```

### "Project not linked"

Link your local project to Supabase:
```bash
supabase link --project-ref your-project-ref
```

Your project ref is in your Supabase URL:
`https://[PROJECT-REF].supabase.co`

### Secrets not working after setting

Wait 1-2 minutes for changes to propagate, then test your edge functions.
