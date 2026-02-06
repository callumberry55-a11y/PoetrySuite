# AI Features Troubleshooting Guide

## Issue: "Failed to Fetch" Error

If you're getting a "failed to fetch" error when using the AI features, follow these steps:

### Step 1: Check Browser Console

1. Open your browser's Developer Tools (F12 or Right-click → Inspect)
2. Go to the **Console** tab
3. Try using an AI feature (e.g., Generate Poem)
4. Look for error messages in the console

The enhanced error handling will now show:
- `Calling Gemini API...` - Request is starting
- `Response status: XXX` - HTTP status code received
- Detailed error messages if the request fails

### Step 2: Verify API Key

Check that your API key is properly configured:

**In `.env` file:**
```
VITE_GEMINI_API_KEY=AIzaSyB91Zqo-lxElnfYKaX0i7FMknj2hUR727g
```

**To test the API key manually:**
1. Open a new terminal
2. Run this command:

```bash
curl "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyB91Zqo-lxElnfYKaX0i7FMknj2hUR727g" \
  -H 'Content-Type: application/json' \
  -d '{
    "contents": [{
      "parts": [{"text": "Write a one-line poem about the moon"}]
    }]
  }'
```

If this command returns a poem, your API key is working!

### Step 3: Common Error Messages

**"Network error: Unable to reach AI service"**
- Check your internet connection
- Check if your firewall/antivirus is blocking the request
- Try accessing https://generativelanguage.googleapis.com in your browser

**"API request failed with status 400"**
- The request format is invalid (this shouldn't happen with our code)
- Check console logs for details

**"API request failed with status 403"**
- Your API key is invalid or has expired
- Generate a new API key at https://makersuite.google.com/app/apikey

**"API request failed with status 429"**
- You've exceeded the free tier rate limits (15 requests/minute, 1500/day)
- Wait a few minutes and try again
- Consider upgrading to a paid plan

**"Gemini API key not configured"**
- The `.env` file is not being loaded
- Make sure your `.env` file is in the project root
- Restart your dev server after editing `.env`

### Step 4: Test with a Simple Request

Try the simplest AI feature first:
1. Go to the Poetry Editor
2. Write "test"
3. Click "Analyze Poem"
4. Watch the browser console for detailed logs

### Step 5: Verify Environment Variables

In your browser console, type:
```javascript
console.log(import.meta.env.VITE_GEMINI_API_KEY)
```

You should see: `AIzaSyB91Zqo-lxElnfYKaX0i7FMknj2hUR727g`

If it shows `undefined`, your environment variables aren't loading correctly.

### Step 6: CORS Issues

If you see a CORS error in the console:
- This is expected in some development environments
- The Gemini API should allow cross-origin requests
- Try accessing from the production build instead

### Step 7: Check API Key Validity

To verify your API key is still valid:
1. Visit: https://console.cloud.google.com/apis/credentials
2. Check if the key is enabled and has no restrictions that block generativelanguage.googleapis.com

### Step 8: Alternative Solution - Use Edge Function

If direct API calls continue to fail, you can proxy through a Supabase Edge Function:

1. The API call would go through your backend
2. This avoids CORS and exposes the API key less
3. Requires setting up a new edge function

Would you like me to implement this alternative solution?

## Recent Changes

✅ Added comprehensive error handling
✅ Added detailed console logging
✅ Added network error detection
✅ Added better error messages
✅ Improved response validation

## Next Steps

After trying these steps, check the browser console and let me know:
1. What error message you see
2. What the response status is
3. Whether the curl test command works

This will help me identify the exact issue and fix it!
