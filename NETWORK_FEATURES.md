# Network Features Documentation

## Overview

The Poetry Suite application now includes comprehensive network monitoring and offline support features. These features enhance the user experience by providing real-time network status updates and intelligent caching strategies.

## Features Implemented

### 1. Network Status Context

A React context (`NetworkContext`) that monitors:
- **Online/Offline Status**: Detects when the device goes online or offline
- **Connection Speed**: Monitors the network connection speed (2G, 3G, 4G, etc.)
- **Slow Connection Detection**: Alerts users when on a slow connection

**Usage Example:**
```typescript
import { useNetwork } from '@/contexts/NetworkContext';

function MyComponent() {
  const { isOnline, isSlowConnection } = useNetwork();

  if (!isOnline) {
    return <div>You are offline</div>;
  }

  if (isSlowConnection) {
    return <div>Slow connection detected</div>;
  }

  return <div>Your content here</div>;
}
```

### 2. Network Indicator UI

A visual indicator that automatically shows users their connection status:
- **Offline Banner**: Displays when the device loses internet connection
- **Reconnected Banner**: Shows briefly when connection is restored
- **Slow Connection Warning**: Alerts users when on 2G or slow-2G networks

The indicator appears at the top of the screen and automatically dismisses after 3 seconds for reconnection messages.

### 3. Enhanced Service Worker

The PWA service worker now includes intelligent caching strategies:

#### Cache Strategies:

1. **Supabase API Calls** (NetworkFirst)
   - Tries network first, falls back to cache if offline
   - 24-hour cache expiration
   - 10-second network timeout
   - Max 50 cached entries

2. **Google Fonts** (CacheFirst)
   - Cached for 1 year
   - Loaded from cache immediately
   - Max 10 cached font files

3. **Pexels Images** (CacheFirst)
   - Cached for 30 days
   - Max 50 cached images
   - Instant loading from cache

### 4. Network Utilities

Helper functions for handling network operations:

**Available Functions:**

- `checkOnlineStatus()`: Returns current online status
- `getConnectionSpeed()`: Returns effective connection type
- `isSlowConnection()`: Checks if connection is slow (2G/slow-2G)
- `getDownlinkSpeed()`: Returns download speed in Mbps
- `waitForOnline()`: Promise that resolves when device comes online
- `retryWithBackoff()`: Automatically retries failed requests with exponential backoff

**Example:**
```typescript
import { retryWithBackoff, waitForOnline } from '@/utils/network';

// Retry a failed API call
const data = await retryWithBackoff(async () => {
  return await fetchData();
}, 3, 1000); // 3 retries, 1 second base delay

// Wait for connection before proceeding
await waitForOnline();
console.log('Device is now online!');
```

### 5. Enhanced Supabase Configuration

The Supabase client now includes:
- **Session Persistence**: Auth sessions are saved locally
- **Auto Token Refresh**: Authentication tokens refresh automatically
- **Better Error Handling**: Network-aware error messages
- **Optimized Realtime**: Rate-limited to 10 events per second

**Error Handling:**
```typescript
import { handleSupabaseError } from '@/lib/supabase';

try {
  await supabase.from('poems').select('*');
} catch (error) {
  const message = handleSupabaseError(error);
  console.error(message); // "You are offline. Please check your internet connection."
}
```

## Benefits

1. **Better User Experience**: Users are always informed about their connection status
2. **Offline Resilience**: App continues to work with cached data when offline
3. **Faster Loading**: Cached assets load instantly
4. **Automatic Recovery**: Failed requests retry automatically when connection returns
5. **Bandwidth Awareness**: App can adapt behavior based on connection speed

## Testing

To test offline functionality:

1. Open the app in your browser
2. Open DevTools (F12)
3. Go to the Network tab
4. Select "Offline" from the throttling dropdown
5. Observe the offline indicator appear
6. Switch back to "Online" to see the reconnection message

## Technical Details

- Built with React Context API
- Uses Navigator Online API
- Implements Network Information API (when available)
- Workbox for service worker caching
- PWA-ready with offline support
- Automatic cache invalidation
- Progressive enhancement (works without JavaScript)
