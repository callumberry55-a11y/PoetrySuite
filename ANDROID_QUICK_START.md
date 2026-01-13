# Android APK Quick Start

## 5-Minute Setup

### Prerequisites ✓ (Already installed)
- Node.js & npm
- Java 11+
- Android SDK

### Step 1: Build the Web App (1 min)
```bash
cd /workspaces/PoetrySuite
npm run build
```

### Step 2: Initialize Android (First time only - 2 min)
```bash
npm run cap:add:android
```

### Step 3: Sync to Android (1 min)
```bash
npm run cap:sync
```

### Step 4: Build Debug APK (1 min)
```bash
npm run build:apk-debug
```

**Done!** 🎉

The APK is at: `android/app/build/outputs/apk/debug/app-debug.apk`

---

## Install & Test on Device

### Option A: USB Cable (Recommended)
```bash
# Connect Android device via USB, enable Developer Mode
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### Option B: Android Studio
```bash
npm run cap:open:android
# Click Run ▶️ button
# Select your device
```

### Option C: Emulator
```bash
# Start Android emulator, then:
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

---

## Build for Production

### Release APK (Unsigned)
```bash
npm run build:apk
```

Output: `android/app/build/outputs/apk/release/app-release-unsigned.apk`

### Sign for Google Play

1. **Create keystore** (one time):
```bash
keytool -genkey -v -keystore poetry-suite.keystore \
  -keyalg RSA -keysize 2048 -validity 10000 \
  -alias poetry-suite-key
```

2. **Configure signing** in `android/app/build.gradle`

3. **Build signed APK**:
```bash
cd android && ./gradlew assembleRelease
```

Signed APK: `android/app/build/outputs/apk/release/app-release.apk`

---

## Key Commands Reference

| Command | Purpose |
|---------|---------|
| `npm run build` | Build web app |
| `npm run build:apk-debug` | Build debug APK |
| `npm run build:apk` | Build release APK |
| `npm run cap:sync` | Sync web app to Android |
| `npm run cap:open:android` | Open in Android Studio |
| `adb logcat` | View device logs |
| `adb install app.apk` | Install APK on device |

---

## Troubleshooting

### "Android SDK not found"
```bash
export ANDROID_HOME=$HOME/Android/Sdk
export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
```

### "Cannot find gradlew"
```bash
chmod +x android/gradlew
```

### APK won't install
```bash
# Uninstall old version first
adb uninstall com.poetrysuite.app
adb install android/app/build/outputs/apk/debug/app-debug.apk
```

### App crashes on startup
```bash
# Check logs
adb logcat | grep poetry-suite
```

---

## Native Features

Access Android hardware from React:

```typescript
import nativeFeatures from '@/utils/nativeFeatures';

// Vibration
await nativeFeatures.haptics.lightVibrate();

// Share sheet
await nativeFeatures.share.shareContent('Title', 'Content');

// Storage
await nativeFeatures.storage.saveData('key', value);

// Camera
const photo = await nativeFeatures.camera.takePhoto();
```

See [NATIVE_FEATURES.md](NATIVE_FEATURES.md) for full reference.

---

## Project Structure

```
/workspaces/PoetrySuite/
├── src/                          # React web app
├── android/                       # Native Android project
│   ├── app/
│   │   ├── src/main/
│   │   │   ├── AndroidManifest.xml
│   │   │   ├── java/...MainActivity.java
│   │   │   └── res/values/colors.xml, styles.xml
│   │   └── build.gradle
│   ├── build.gradle
│   └── settings.gradle
├── capacitor.config.ts           # Capacitor config
├── ANDROID_BUILD_GUIDE.md        # Detailed build guide
└── NATIVE_FEATURES.md            # Features reference
```

---

## Version Info

- **App Version**: 75.0.1
- **Capacitor**: 8.0.1+
- **Min Android**: API 21+
- **Target Android**: API 34

---

## Next Steps

1. ✅ Build APK: `npm run build:apk-debug`
2. ✅ Install on device: `adb install app-debug.apk`
3. ✅ Test the app
4. 📖 Read [ANDROID_BUILD_GUIDE.md](ANDROID_BUILD_GUIDE.md) for advanced topics
5. 🎮 Use [NATIVE_FEATURES.md](NATIVE_FEATURES.md) to add native functionality

---

## Support

- [Capacitor Docs](https://capacitorjs.com/docs)
- [Android Docs](https://developer.android.com/docs)
- Android Studio built-in help: `Help → Android Studio Help`

---

**Happy building! 🚀**
