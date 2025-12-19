# Push Notifications Setup

Push notifications have been implemented in Poetry Suite to keep users engaged with updates about comments, reactions, and submission statuses.

## Features

- Toggle notifications on/off from Settings
- Receive notifications for:
  - New comments on your poems
  - New reactions to your poems
  - Submission status updates
- Notifications work even when the app is closed (if service worker is active)
- Click notifications to navigate to relevant pages

## Setup Instructions

### 1. Generate VAPID Keys

VAPID keys are required for web push notifications. Generate them using one of these methods:

**Option A: Using NPM (Recommended)**
```bash
npx web-push generate-vapid-keys
```

**Option B: Using Online Generator**
Visit [https://vapidkeys.com/](https://vapidkeys.com/) to generate keys instantly.

### 2. Add Keys to Environment

Copy your VAPID keys to the `.env` file:

```env
VITE_VAPID_PUBLIC_KEY=your-generated-public-key
VAPID_PRIVATE_KEY=your-generated-private-key
```

**Important:**
- The public key (VITE_VAPID_PUBLIC_KEY) is exposed to the browser
- The private key (VAPID_PRIVATE_KEY) stays on the server and is used by the edge function

### 3. Enable Notifications

Users can enable notifications from the Settings page:
1. Navigate to Settings
2. Find the "Push Notifications" section
3. Toggle the switch to enable
4. Grant notification permission when prompted

## How It Works

### Architecture

1. **Service Worker** (`public/sw.js`)
   - Handles incoming push events
   - Displays notifications to users
   - Manages notification clicks and navigation

2. **Database** (`push_subscriptions` table)
   - Stores user push subscription data
   - Includes endpoint, encryption keys, and user ID
   - Protected by Row Level Security (RLS)

3. **Edge Function** (`send-push-notification`)
   - Receives notification requests
   - Looks up user subscriptions
   - Sends push messages to browser push services
   - Cleans up invalid subscriptions automatically

4. **Helper Utilities** (`src/utils/notifications.ts`)
   - Provides easy-to-use functions for sending notifications
   - Pre-configured notification templates for common events

### Sending Notifications

Use the helper functions in your code:

```typescript
import { notifyPoemComment, notifyPoemReaction } from '../utils/notifications';

// Notify when someone comments
await notifyPoemComment(poemAuthorId, commenterName, poemTitle);

// Notify when someone reacts
await notifyPoemReaction(poemAuthorId, reactorName, poemTitle);
```

Or send custom notifications:

```typescript
import { sendPushNotification } from '../utils/notifications';

await sendPushNotification({
  userId: 'user-id', // Optional: send to specific user
  title: 'Custom Notification',
  body: 'Your custom message here',
  data: {
    url: '/target-page',
    customField: 'value',
  },
  tag: 'custom',
  requireInteraction: false,
});
```

## Testing

### Local Testing

1. Ensure your `.env` file has valid VAPID keys
2. Start the development server
3. Open the app in a browser (notifications require HTTPS or localhost)
4. Enable notifications in Settings
5. Use the edge function to send test notifications

### Browser Support

Push notifications are supported in:
- Chrome 42+
- Firefox 44+
- Safari 16+ (macOS 13+)
- Edge 17+
- Opera 29+

**Note:** Notifications require either HTTPS or localhost for security reasons.

## Troubleshooting

### "Push notification configuration is missing"
- Check that `VITE_VAPID_PUBLIC_KEY` is set in your `.env` file
- Restart the development server after adding environment variables

### "Notifications are blocked"
- The user has denied notification permissions in their browser
- Guide them to browser settings to re-enable notifications

### "Failed to subscribe to notifications"
- Check browser console for detailed errors
- Verify VAPID keys are valid and correctly formatted
- Ensure service worker is properly registered

### Notifications not arriving
- Verify the edge function is deployed: `send-push-notification`
- Check that subscriptions are being saved to the database
- Ensure `VAPID_PRIVATE_KEY` is set in Supabase edge function secrets

## Security

- All push subscriptions are protected by RLS policies
- Users can only manage their own subscriptions
- The edge function requires authentication
- Invalid/expired subscriptions are automatically cleaned up
- VAPID private key never leaves the server

## Privacy

Push notification data includes:
- Push service endpoint URL
- Public key for encryption (p256dh)
- Authentication secret

This data is:
- Stored securely in the database
- Encrypted in transit
- Deleted when users unsubscribe or delete their account
- Used only for sending notifications to that specific user
