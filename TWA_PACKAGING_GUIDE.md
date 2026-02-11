# TWA Packaging Guide for Poetry Suite

This guide will walk you through packaging the Poetry Suite as an Android app (TWA) for Google Play Store distribution.

## Prerequisites Checklist

- [x] Node.js and npm installed
- [x] Bubblewrap CLI installed (`@bubblewrap/cli`)
- [x] PNG icons generated (72, 96, 128, 144, 152, 192, 384, 512 sizes)
- [x] Maskable icons created
- [x] PWA manifest configured
- [ ] Production domain with HTTPS
- [ ] Digital Asset Links file deployed
- [ ] Android keystore for signing

## Current Status

**Icons:** ✓ All PNG icons generated and manifest updated
**TWA Manifest:** ✓ Template created at `.bubblewrap/twa-manifest.json`
**Domain:** ⚠ Needs configuration (currently set to "your-domain.com")

---

## Step 1: Deploy Your PWA to Production

Before building the Android app, your PWA must be live on a production domain with HTTPS.

### Required:
1. **Production Domain:** Deploy the app to your domain (e.g., `poetrysuite.app`)
2. **HTTPS:** Must have valid SSL certificate
3. **Manifest Accessible:** `https://your-domain.com/manifest.json` must be publicly accessible
4. **Asset Links:** `https://your-domain.com/.well-known/assetlinks.json` must be accessible

### Deploy Build:
```bash
npm run build
```

Upload the `dist/` folder contents to your web host. Verify:
- `https://your-domain.com/` loads the app
- `https://your-domain.com/manifest.json` returns the manifest
- `https://your-domain.com/.well-known/assetlinks.json` is accessible

---

## Step 2: Generate Android Keystore

You need a keystore to sign your Android app for Google Play Store.

### Create Keystore:
```bash
keytool -genkey -v -keystore android.keystore \
  -alias poetrysuite \
  -keyalg RSA \
  -keysize 2048 \
  -validity 10000
```

**IMPORTANT:**
- Save the keystore password securely
- Store the keystore file safely (you'll need it for all future updates)
- Never commit the keystore to git (it's already in `.gitignore`)

### Get SHA-256 Fingerprint:
```bash
keytool -list -v -keystore android.keystore -alias poetrysuite
```

Copy the SHA-256 fingerprint (looks like: `AA:BB:CC:DD:...`)

---

## Step 3: Update Digital Asset Links

Edit `public/.well-known/assetlinks.json` and replace the placeholder SHA-256:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.poetrysuite.app",
    "sha256_cert_fingerprints": [
      "YOUR_ACTUAL_SHA256_FINGERPRINT_HERE"
    ]
  }
}]
```

**Then redeploy** your PWA with the updated assetlinks.json file.

---

## Step 4: Update TWA Manifest with Your Domain

Edit `.bubblewrap/twa-manifest.json` and update:

```json
{
  "host": "poetrysuite.app",  // ← Change this to your actual domain
  "iconUrl": "https://poetrysuite.app/icon-512.png",  // ← Full URL
  "maskableIconUrl": "https://poetrysuite.app/icon-512-maskable.png"  // ← Full URL
}
```

Also update the `webManifestUrl` if needed:
```json
{
  "webManifestUrl": "https://poetrysuite.app/manifest.json"
}
```

---

## Step 5: Initialize Bubblewrap (First Time Only)

If this is your first time building the TWA, initialize Bubblewrap:

```bash
cd .bubblewrap
npx @bubblewrap/cli init --manifest https://your-domain.com/manifest.json
```

Follow the prompts:
- **Package Name:** `com.poetrysuite.app`
- **App Name:** `Poetry Suite`
- **Display Mode:** `standalone`
- **Status Bar Color:** Use the theme color from manifest
- **Enable Notifications:** `Yes`
- **Signing Key Path:** `../android.keystore`
- **Signing Key Alias:** `poetrysuite`

---

## Step 6: Build the TWA

### For Debug Build (Testing):
```bash
npm run twa:build
```

When prompted:
- **Install JDK?** Yes (if you don't have JDK 17)
- **Enter keystore password:** [Your keystore password]

This will create:
- `app-release-signed.apk` (for sideloading/testing)
- `app-release-bundle.aab` (for Google Play Store)

### Build Location:
The built files will be in:
```
.bubblewrap/build/
└── outputs/
    ├── apk/
    │   └── release/
    │       └── app-release-signed.apk
    └── bundle/
        └── release/
            └── app-release.aab
```

---

## Step 7: Test on Device

Install the APK on an Android device for testing:

```bash
npm run twa:install
```

Or manually:
```bash
adb install .bubblewrap/build/outputs/apk/release/app-release-signed.apk
```

### Test Checklist:
- [ ] App launches without errors
- [ ] App loads your PWA correctly
- [ ] All features work (authentication, database, etc.)
- [ ] Deep links work (if applicable)
- [ ] Notifications work (if enabled)
- [ ] App behaves like a native app (no browser UI)

---

## Step 8: Prepare for Google Play Store

### Upload the AAB file:
Use `app-release.aab` from `.bubblewrap/build/outputs/bundle/release/`

### Google Play Console Requirements:
1. **Developer Account** ($25 one-time fee)
2. **Privacy Policy** URL
3. **App Description** and marketing materials
4. **Screenshots** (phone, tablet, optional TV)
5. **Feature Graphic** (1024x500 banner)
6. **App Icon** (512x512 PNG - we have `icon-512.png`)
7. **Content Rating** questionnaire
8. **Target Audience** information

### Create App Listing:
1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app → "Poetry Suite"
3. Upload the AAB file to Internal Testing or Production
4. Fill in all required store listing details
5. Submit for review

### Digital Asset Links Verification:
Google Play will verify your assetlinks.json file. Make sure:
- It's accessible at `https://your-domain.com/.well-known/assetlinks.json`
- The SHA-256 fingerprint matches your keystore
- The package name matches (`com.poetrysuite.app`)

---

## Step 9: Update the App (Future Releases)

When you update the app:

1. **Update app version** in `.bubblewrap/twa-manifest.json`:
   ```json
   {
     "appVersionName": "1.0.1",
     "appVersionCode": 2
   }
   ```

2. **Rebuild PWA and deploy:**
   ```bash
   npm run build
   # Deploy dist/ to production
   ```

3. **Update TWA:**
   ```bash
   npm run twa:update
   npm run twa:build
   ```

4. **Upload new AAB** to Google Play Console

**IMPORTANT:**
- `appVersionCode` must increase with each release
- Use the same keystore for all updates
- Never lose your keystore!

---

## Troubleshooting

### "Failed to verify Digital Asset Links"
- Check that assetlinks.json is accessible via HTTPS
- Verify SHA-256 fingerprint matches your keystore
- Ensure package name matches in all places
- Wait up to 24 hours for Google to cache the file

### "App doesn't open / Shows browser UI"
- Check that your PWA is accessible via HTTPS
- Verify manifest.json has `"display": "standalone"`
- Check that start_url in manifest is correct
- Test in Chrome's Application tab (DevTools)

### "Build fails with Gradle error"
- Ensure you have JDK 17 installed
- Clear Gradle cache: `rm -rf ~/.gradle/caches`
- Update Android SDK tools via Bubblewrap

### "Icons don't look right"
- Use maskable icons with safe zone (20% padding)
- Test icons at https://maskable.app
- Regenerate icons with proper padding

---

## Quick Reference

### File Locations
- **TWA Manifest:** `.bubblewrap/twa-manifest.json`
- **PWA Manifest:** `public/manifest.json`
- **Asset Links:** `public/.well-known/assetlinks.json`
- **Keystore:** `android.keystore` (not in repo)
- **Built APK:** `.bubblewrap/build/outputs/apk/release/`
- **Built AAB:** `.bubblewrap/build/outputs/bundle/release/`

### Commands
```bash
# Build PWA
npm run build

# Generate icons (if needed)
./scripts/generate-pwa-icons.sh

# Initialize TWA (first time)
npm run twa:init

# Build TWA
npm run twa:build

# Install on device
npm run twa:install

# Update TWA config
npm run twa:update

# Validate TWA
npm run twa:validate
```

---

## Next Steps

1. **Set up your production domain** with HTTPS
2. **Deploy the PWA** to production
3. **Generate your Android keystore**
4. **Update the SHA-256** in assetlinks.json
5. **Update the domain** in twa-manifest.json
6. **Build the TWA** using `npm run twa:build`
7. **Test on device** using `npm run twa:install`
8. **Submit to Google Play Store**

---

## Support

For issues with:
- **Bubblewrap:** https://github.com/GoogleChromeLabs/bubblewrap/issues
- **TWA:** https://developer.chrome.com/docs/android/trusted-web-activity/
- **Google Play:** https://support.google.com/googleplay/android-developer

Good luck with your launch!
