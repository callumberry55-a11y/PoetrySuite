# Android APK - Quick Reference Card

## 🚀 Build Commands (Pick One!)

### Easiest Way (Do This First!)
```bash
npm run build:apk-debug
# Builds web → syncs → creates debug APK (all in one!)
```

### Step-by-Step
```bash
npm run build              # Step 1: Build web app
npm run cap:sync          # Step 2: Sync to Android
npm run build:apk-debug   # Step 3: Build APK
```

### Open in Android Studio
```bash
npm run cap:open:android
# Then click Run ▶️ button to build and test
```

## 📱 Install on Device

### Via USB (Recommended)
```bash
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Via Android Studio
- Open the project: `npm run cap:open:android`
- Connect device via USB
- Click **Run** ▶️ button

## 💻 Using Native Features

### Import in Your Component
```typescript
import nativeFeatures from '@/utils/nativeFeatures';
```

### Available Features

| Feature | Code |
|---------|------|
| 📷 Take Photo | `nativeFeatures.camera.takePhoto()` |
| 🖼️ Pick Photo | `nativeFeatures.camera.pickPhoto()` |
| 📍 Get Location | `nativeFeatures.location.getCurrentLocation()` |
| 📤 Share | `nativeFeatures.share.shareContent(title, text)` |
| 📳 Vibrate | `nativeFeatures.haptics.lightVibrate()` |
| 💾 Save Data | `nativeFeatures.storage.saveData(key, value)` |
| 📋 Copy Text | `nativeFeatures.clipboard.copyToClipboard(text)` |
| ⌨️ Show Keyboard | `nativeFeatures.keyboard.show()` |

## 🔍 Troubleshooting

| Problem | Solution |
|---------|----------|
| APK won't install | `adb uninstall com.poetrysuite.app` (then install again) |
| App crashes | `adb logcat \| grep poetry-suite` (check logs) |
| Changes not showing | `npm run build && npm run cap:sync` (rebuild) |
| Android SDK not found | `export ANDROID_HOME=$HOME/Android/Sdk` |
| Permissions not working | Run on physical device, not emulator |

## 📚 Documentation

| Need | File |
|------|------|
| Quick start (5 min) | [ANDROID_QUICK_START.md](ANDROID_QUICK_START.md) |
| Full guide | [ANDROID_BUILD_GUIDE.md](ANDROID_BUILD_GUIDE.md) |
| Feature examples | [NATIVE_FEATURES.md](NATIVE_FEATURES.md) |
| Overview | [ANDROID_IMPLEMENTATION.md](ANDROID_IMPLEMENTATION.md) |
| Navigation | [ANDROID_INDEX.md](ANDROID_INDEX.md) |

## ⚙️ Important Files

```
capacitor.config.ts                    ← App configuration
android/app/src/main/
  ├── AndroidManifest.xml              ← Permissions
  ├── java/.../MainActivity.java       ← Main activity
  └── res/
      ├── values/colors.xml            ← Colors
      └── values/styles.xml            ← Styles
src/utils/nativeFeatures.ts            ← Native API
```

## 🎯 First Time Setup

```bash
# 1. Build web app
npm run build

# 2. Add Android (first time only)
npm run cap:add:android

# 3. Sync
npm run cap:sync

# 4. Build APK
npm run build:apk-debug

# 5. Install
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## 🔄 Quick Rebuild

```bash
# When you change code and want to test
npm run build:apk-debug
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

## 📊 Version Info

| Property | Value |
|----------|-------|
| App Version | 75.0.1 |
| Min Android | API 21 |
| Target Android | API 34 |
| Capacitor | 8.0.1+ |
| React | 18.3.1 |

## 💡 Tips

- **Test frequently**: Use debug builds often
- **Check logs**: Use `adb logcat` when debugging
- **Use vibration wisely**: Don't overuse haptics
- **Test on device**: Emulator doesn't have all features
- **Keep it simple**: Start with one feature at a time

## 🆘 Quick Help

```bash
# View device logs
adb logcat | grep poetry-suite

# List connected devices
adb devices

# Uninstall app
adb uninstall com.poetrysuite.app

# Clear app data
adb shell pm clear com.poetrysuite.app

# View APK size
ls -lh android/app/build/outputs/apk/debug/app-debug.apk

# Verify TypeScript
npm run typecheck
```

## 📞 Common Commands

```bash
npm run build              # Build web
npm run build:apk-debug    # Build debug APK
npm run build:apk          # Build release APK
npm run cap:sync           # Sync web to Android
npm run cap:open:android   # Open in Android Studio
npm run cap:add:android    # Add Android platform
npm run typecheck          # Check TypeScript
```

## 🎓 Learning Path

1. **Day 1**: Build & test debug APK
2. **Day 2**: Add a native feature (camera, haptics)
3. **Day 3**: Test thoroughly
4. **Day 4**: Build release APK & sign
5. **Day 5**: Submit to Google Play

## 🚀 Go Live

```bash
# 1. Create keystore
keytool -genkey -v -keystore poetry-suite.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias poetry-suite-key

# 2. Configure in android/app/build.gradle
# (Add keystore path and passwords)

# 3. Build release
npm run build:apk

# 4. Sign (happens automatically)

# 5. Upload to Google Play
# → Go to play.google.com/console
# → Upload APK
# → Fill in store listing
# → Submit for review
```

---

**Version**: 75.0.1 | **Updated**: January 13, 2026

*For detailed info, see [ANDROID_INDEX.md](ANDROID_INDEX.md)*
