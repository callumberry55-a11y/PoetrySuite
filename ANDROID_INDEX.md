# Poetry Suite - Android Development Index

## 📱 Android Native App Support

Welcome to Poetry Suite's Android native development! This document guides you through the Android implementation.

## Quick Links

### 🚀 Getting Started (Pick One)
1. **[5-Minute Quick Start](ANDROID_QUICK_START.md)** - Fast setup and build
2. **[Detailed Build Guide](ANDROID_BUILD_GUIDE.md)** - Complete step-by-step guide
3. **[Implementation Summary](ANDROID_IMPLEMENTATION.md)** - Full feature overview

### 📖 Reference Documentation
- **[Native Features API](NATIVE_FEATURES.md)** - Use camera, location, haptics, etc.
- **[Build Configuration](capacitor.config.ts)** - App settings and plugins
- **[Android Manifest](android/app/src/main/AndroidManifest.xml)** - Permissions & app config

---

## TL;DR - Just Build It! 🎯

```bash
# One command to build and test on device
npm run build:apk-debug

# Then install on your Android device
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## What's Available

### ✨ Native Features

Access device hardware from React:

```typescript
import nativeFeatures from '@/utils/nativeFeatures';

// 📷 Camera
await nativeFeatures.camera.takePhoto();
await nativeFeatures.camera.pickPhoto();

// 📍 Location  
await nativeFeatures.location.getCurrentLocation();
await nativeFeatures.location.watchLocation((pos) => {...});

// 📤 Share
await nativeFeatures.share.shareContent('Title', 'Content');

// 📳 Haptics
await nativeFeatures.haptics.lightVibrate();

// 💾 Storage
await nativeFeatures.storage.saveData('key', value);

// 📋 Clipboard
await nativeFeatures.clipboard.copyToClipboard('text');

// ⌨️ Keyboard
await nativeFeatures.keyboard.show();

// 🖥️ App Control
await nativeFeatures.app.exitApp();
```

### 🏗️ Build Commands

| Command | Purpose |
|---------|---------|
| `npm run build` | Build web app (required first) |
| `npm run cap:sync` | Sync web app to Android project |
| `npm run cap:add:android` | Add Android platform (first time only) |
| `npm run cap:open:android` | Open in Android Studio |
| `npm run build:apk-debug` | Build debug APK (easiest!) |
| `npm run build:apk` | Build release APK |

### 📁 Project Structure

```
android/                          Native Android project
├── app/
│   ├── src/main/
│   │   ├── AndroidManifest.xml   App permissions & config
│   │   ├── java/.../MainActivity  Main activity
│   │   └── res/                   Resources (colors, styles, icons)
│   ├── build.gradle              Build configuration
│   └── proguard-rules.pro         Code obfuscation rules
├── build.gradle                  Root gradle config
└── settings.gradle               Gradle settings

capacitor.config.ts              Capacitor framework config
src/utils/nativeFeatures.ts      Native features API (NEW!)
```

---

## Step-by-Step: Build & Test

### Step 1: Prerequisites
- ✅ Node.js & npm (already installed)
- ✅ Java 11+ (`java -version`)
- ✅ Android SDK (`$ANDROID_HOME` set)

### Step 2: Build Web App
```bash
npm run build
# Creates: dist/ folder with built app
```

### Step 3: Add Android Platform (first time only)
```bash
npm run cap:add:android
# Creates: android/ folder with native project
```

### Step 4: Sync & Build APK
```bash
npm run cap:sync
npm run build:apk-debug
# Creates: android/app/build/outputs/apk/debug/app-debug.apk
```

### Step 5: Install on Device
```bash
# Connect Android device via USB with Developer Mode enabled
adb install android/app/build/outputs/apk/debug/app-debug.apk

# Or open in Android Studio and click Run ▶️
npm run cap:open:android
```

### Step 6: Test
- Open Poetry Suite app on device
- Try native features
- Test comments, likes, poems
- Everything should work!

---

## Using Native Features in Your App

### Example: Share a Poem

```typescript
// In your React component
import nativeFeatures from '@/utils/nativeFeatures';

function ShareButton({ poem }) {
  const handleShare = async () => {
    await nativeFeatures.share.shareContent(
      `"${poem.title}" by ${poem.author}`,
      poem.content,
      `https://poetrysuite.com/poem/${poem.id}`
    );
  };

  return <button onClick={handleShare}>Share</button>;
}
```

### Example: Enhance UI with Haptics

```typescript
// Provide tactile feedback
async function onLikePoem() {
  await nativeFeatures.haptics.lightVibrate(); // User feels tap
  
  const success = await likePoem(poemId);
  
  if (success) {
    await nativeFeatures.haptics.mediumVibrate(); // Success feedback
  }
}
```

### Example: Persistent Preferences

```typescript
// Save user settings to device
async function changeFontSize(size) {
  await nativeFeatures.storage.saveData('font_size', size);
  setFontSize(size);
}

// Restore on app startup
useEffect(() => {
  const result = await nativeFeatures.storage.getData('font_size');
  if (result.success) {
    setFontSize(result.value || 14);
  }
}, []);
```

---

## For Different Skill Levels

### 👤 Non-Technical (Just Want to Run It)
1. Read: [Android Quick Start](ANDROID_QUICK_START.md) (5 min)
2. Run: `npm run build:apk-debug`
3. Install on device
4. Done! ✅

### 👨‍💻 Developer (Want to Understand)
1. Read: [Build Guide](ANDROID_BUILD_GUIDE.md) (20 min)
2. Skim: [Native Features](NATIVE_FEATURES.md)
3. Try: Add a feature to your app
4. Build: `npm run build:apk-debug`
5. Test on device

### 🏗️ Advanced (Going to Production)
1. Study: [Detailed Build Guide](ANDROID_BUILD_GUIDE.md)
2. Reference: [Capacitor Docs](https://capacitorjs.com/docs)
3. Setup: Keystore and signing
4. Build: `npm run build:apk` (release)
5. Submit: To Google Play Store

---

## Common Questions

### Q: Why Capacitor?
A: Capacitor lets you run your existing React web app as a native Android app with access to device hardware. No rewrite needed!

### Q: Can I use iOS too?
A: Yes! Same Capacitor project supports iOS. Just run `npm run cap:add:ios`.

### Q: What about the web version?
A: Still works exactly the same! Web app and native app share the same React codebase.

### Q: How big is the APK?
A: ~15-20MB for typical Poetry Suite app (includes React + dependencies).

### Q: Can I update the app without Google Play?
A: Yes! Use direct APK distribution, TestFlight, Firebase TestLab, or any distribution method.

### Q: What if a feature isn't available on some devices?
A: All features return `{ success: false, error: 'reason' }`. Check before using:
```typescript
const result = await nativeFeatures.haptics.lightVibrate();
if (!result.success) {
  // Feature not available, use fallback
}
```

---

## Troubleshooting

### Problem: "Android SDK not found"
```bash
# Set environment variable
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### Problem: APK won't install
```bash
# Uninstall old version first
adb uninstall com.poetrysuite.app
adb install app-debug.apk
```

### Problem: App crashes immediately
```bash
# Check logs
adb logcat | grep poetry-suite
```

### Problem: Changes not showing in app
```bash
# Rebuild and sync
npm run build
npm run cap:sync
npm run build:apk-debug
```

---

## Documentation Files

| File | Purpose | Read Time |
|------|---------|-----------|
| **ANDROID_QUICK_START.md** | 5-minute setup | 5 min |
| **ANDROID_BUILD_GUIDE.md** | Complete build instructions | 20 min |
| **ANDROID_IMPLEMENTATION.md** | Feature overview | 15 min |
| **NATIVE_FEATURES.md** | API reference & examples | 10 min |

---

## Technology Stack

- **Framework**: Capacitor 8.0.1
- **Language**: TypeScript 5.5.3 + React 18.3.1
- **Build Tool**: Gradle (Android) + Vite (Web)
- **Target**: Android 5.0+ (API 21+)
- **Min SDK**: 21 | **Target SDK**: 34

---

## Next Steps

Choose your path:

### 🚀 Just Get Started
→ [Android Quick Start](ANDROID_QUICK_START.md)

### 📚 Learn the Details
→ [Build Guide](ANDROID_BUILD_GUIDE.md)

### 💻 Code Examples
→ [Native Features Reference](NATIVE_FEATURES.md)

### 📖 Full Overview
→ [Implementation Summary](ANDROID_IMPLEMENTATION.md)

---

## Version Information

| Item | Value |
|------|-------|
| App Version | 75.0.1 |
| Release Date | January 13, 2026 |
| Capacitor | 8.0.1+ |
| Min Android | API 21 (Android 5.0) |
| Target Android | API 34 (Android 14) |

---

## Support

- **Capacitor Docs**: https://capacitorjs.com/docs
- **Android Docs**: https://developer.android.com/docs
- **Google Play**: https://support.google.com/googleplay/android-developer
- **GitHub Issues**: Check Capacitor repo

---

## Quick Command Reference

```bash
# Build everything
npm run build && npm run cap:sync && npm run build:apk-debug

# Just debug APK
npm run build:apk-debug

# Release APK
npm run build:apk

# Open in Android Studio
npm run cap:open:android

# Install on device
adb install android/app/build/outputs/apk/debug/app-debug.apk

# View logs
adb logcat | grep poetry-suite

# Uninstall app
adb uninstall com.poetrysuite.app
```

---

**Happy Android development! 🎉**

*For detailed instructions, see [ANDROID_QUICK_START.md](ANDROID_QUICK_START.md)*
