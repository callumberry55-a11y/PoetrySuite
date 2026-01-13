# Native Android Features - Quick Reference

## Overview

Poetry Suite now includes native Android features accessible through the `nativeFeatures` module. This enables your React app to access hardware and OS capabilities for a truly native feel.

## Installation

The native features module is already integrated. Simply import it in your components:

```typescript
import nativeFeatures from '@/utils/nativeFeatures';
// or
import { cameraFeatures, hapticFeatures, shareFeatures } from '@/utils/nativeFeatures';
```

## Camera Features

### Take a Photo

```typescript
const result = await nativeFeatures.camera.takePhoto();
if (result.success) {
  const imageData = result.image;
  // Use imageData.webPath or imageData.path
}
```

### Pick from Gallery

```typescript
const result = await nativeFeatures.camera.pickPhoto();
if (result.success) {
  const imageData = result.image;
}
```

## Location Features

### Get Current Position

```typescript
const result = await nativeFeatures.location.getCurrentLocation();
if (result.success) {
  const { latitude, longitude, accuracy } = result.coordinates.coords;
}
```

### Watch Real-Time Location

```typescript
const result = await nativeFeatures.location.watchLocation((position) => {
  console.log('Current position:', position.coords);
});

const watchId = result.watchId;

// Later, stop watching
await nativeFeatures.location.clearLocationWatch(watchId);
```

## Share Features

### Share Content

```typescript
await nativeFeatures.share.shareContent(
  'Check out my poem!', // title
  'Here is my amazing poem...', // text to share
  'https://poetrysuite.com/poem/123' // optional URL
);
```

Opens native share sheet on Android.

## Haptics (Vibration)

### Light Vibration

```typescript
await nativeFeatures.haptics.lightVibrate();
// 50ms vibration - good for confirmations
```

### Medium Vibration

```typescript
await nativeFeatures.haptics.mediumVibrate();
// 100ms vibration - good for alerts
```

### Heavy Vibration

```typescript
await nativeFeatures.haptics.heavyVibrate();
// 200ms vibration - good for important notifications
```

### Pattern Vibration

```typescript
// Custom vibration pattern (durations in ms)
await nativeFeatures.haptics.patternVibrate([50, 100, 50, 100]);
// Vibrates: 50ms, pause, 100ms, pause, 50ms, pause, 100ms
```

## Storage Features

### Save Data

```typescript
// Save any JSON-serializable data
await nativeFeatures.storage.saveData('user_preference', {
  theme: 'dark',
  fontSize: 16,
  notifications: true,
});
```

### Retrieve Data

```typescript
const result = await nativeFeatures.storage.getData('user_preference');
if (result.success) {
  console.log(result.value); // { theme: 'dark', fontSize: 16, ... }
}
```

### Remove Data

```typescript
await nativeFeatures.storage.removeData('user_preference');
```

### Clear All Data

```typescript
await nativeFeatures.storage.clearAll();
```

## Keyboard Features

### Show Keyboard

```typescript
await nativeFeatures.keyboard.show();
```

### Hide Keyboard

```typescript
await nativeFeatures.keyboard.hide();
```

## Clipboard Features

### Copy to Clipboard

```typescript
await nativeFeatures.clipboard.copyToClipboard('Your poem text here...');
// User can now paste elsewhere
```

### Read from Clipboard

```typescript
const result = await nativeFeatures.clipboard.readFromClipboard();
if (result.success) {
  console.log(result.text); // Pasted content
}
```

## App Features

### Exit App

```typescript
await nativeFeatures.app.exitApp();
```

### Setup Back Button Handler

```typescript
// This is useful for custom back button behavior
nativeFeatures.app.setupBackButton(() => {
  console.log('Back button pressed and app will close');
  // App will close since canGoBack is false
});
```

## Real-World Examples

### Example 1: Share a Poem

```typescript
import nativeFeatures from '@/utils/nativeFeatures';

async function sharePoem(poem: { id: string; title: string; content: string }) {
  // Provide haptic feedback
  await nativeFeatures.haptics.lightVibrate();

  // Share the poem
  await nativeFeatures.share.shareContent(
    `Check out: "${poem.title}"`,
    poem.content,
    `https://poetrysuite.com/poem/${poem.id}`
  );
}
```

### Example 2: Rich User Experience with Haptics

```typescript
async function handleLikePoem() {
  // Light haptic feedback when clicking
  await nativeFeatures.haptics.lightVibrate();

  // Make API call to like poem
  const result = await likePoem(poemId);

  if (result.success) {
    // Strong haptic feedback on success
    await nativeFeatures.haptics.mediumVibrate();
  } else {
    // Different pattern for error
    await nativeFeatures.haptics.patternVibrate([100, 50, 100]);
  }
}
```

### Example 3: Save User Preferences

```typescript
async function toggleDarkMode() {
  const isDark = !theme.isDark;
  
  // Update local state
  setTheme({ ...theme, isDark });

  // Persist to device
  await nativeFeatures.storage.saveData('theme_settings', {
    isDark,
    fontSize: theme.fontSize,
    colorScheme: theme.colorScheme,
  });

  // Haptic feedback
  await nativeFeatures.haptics.lightVibrate();
}
```

### Example 4: Location-Based Features

```typescript
async function getNearbyPoets() {
  const location = await nativeFeatures.location.getCurrentLocation();

  if (location.success) {
    const { latitude, longitude } = location.coordinates.coords;

    // Fetch poets near this location
    const poets = await fetchNearbyPoets({ latitude, longitude });
    return poets;
  }

  return null;
}
```

### Example 5: Copy Poem to Clipboard

```typescript
async function copyPoemToClipboard(poemContent: string) {
  await nativeFeatures.clipboard.copyToClipboard(poemContent);
  
  // Confirm action with haptics
  await nativeFeatures.haptics.lightVibrate();
  
  // Show toast notification
  showNotification('Poem copied to clipboard!');
}
```

## Error Handling

All native features return a `{ success: boolean, error?: string }` object:

```typescript
async function safeNativeOperation() {
  const result = await nativeFeatures.haptics.lightVibrate();

  if (!result.success) {
    console.error('Haptics failed:', result.error);
    // Fallback behavior or show error to user
  }
}
```

## Permission Requirements

Some features require Android permissions:

| Feature | Permissions | User Approval |
|---------|-----------|---------------|
| Camera | CAMERA | Required |
| Location | LOCATION | Required |
| Storage | READ/WRITE_EXTERNAL_STORAGE | Required (Android 6+) |
| Clipboard | None | Not required |
| Haptics | None | Not required |
| Share | None | Not required |
| Keyboard | None | Not required |

**Note**: Capacitor automatically handles permission requests when you first use a feature.

## Performance Tips

1. **Use haptics sparingly** - Too much vibration drains battery
2. **Cache location data** - Don't constantly request location
3. **Batch storage operations** - Save multiple values at once when possible
4. **Check before using** - Test if feature is available before using it

## Browser Compatibility

These features work in:
- ✅ Native Android app (APK)
- ✅ Native iOS app
- ⚠️ Web browser (some features degrade gracefully)

For web fallbacks:

```typescript
async function sharePoem(poem: any) {
  try {
    await nativeFeatures.share.shareContent(poem.title, poem.content);
  } catch (error) {
    // Fallback for web - use Web Share API or custom UI
    if (navigator.share) {
      navigator.share({ title: poem.title, text: poem.content });
    }
  }
}
```

## Troubleshooting

### Feature returns error even though it should work

1. Check permissions in `android/app/src/main/AndroidManifest.xml`
2. Ensure app is running on actual device or emulator with that feature
3. Check Android Studio logs: `adb logcat | grep poetry-suite`
4. Verify Capacitor is properly synced: `npm run cap:sync`

### Permissions not requested

1. Run app on device for first time
2. Go to app's permission settings
3. Manually enable permissions
4. Restart app

### Feature works in debug but not release build

1. Check ProGuard rules in `android/app/proguard-rules.pro`
2. Ensure native code isn't being stripped
3. Test release APK on device

## Additional Resources

- [Capacitor Plugins](https://capacitorjs.com/docs/plugins)
- [Android Permissions](https://developer.android.com/guide/topics/permissions/overview)
- [Android Developer Docs](https://developer.android.com/docs)

## Version Compatibility

| Feature | Min Android | Min Capacitor |
|---------|------------|---------------|
| All features | API 21 | v3.0 |
| Storage | API 21 | v3.0 |
| Haptics | API 24 | v3.0 |
| Keyboard | API 21 | v3.0 |
| Clipboard | API 19 | v4.0 |

---

**Last Updated**: January 13, 2026  
**Version**: 75.0.1
