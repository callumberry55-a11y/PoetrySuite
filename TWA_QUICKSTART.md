# TWA Quick Start Guide

## What You'll Build

A native Android app that wraps your Poetry Suite PWA using Trusted Web Activities (TWA). The app will:
- Run in full-screen without browser UI
- Share storage and cookies with Chrome
- Update automatically when you update your website
- Be distributed through Google Play Store

## Prerequisites Checklist

- [ ] Java JDK 17 or higher installed
- [ ] Your PWA deployed to a production domain (HTTPS required)
- [ ] Node.js and npm installed

## Quick Setup (5 Steps)

### 1. Install Dependencies

```bash
npm install
```

### 2. Run Setup Helper

```bash
./scripts/setup-twa.sh
```

This interactive script will:
- Check your environment
- Generate PNG icons from SVG
- Help configure your TWA
- Generate signing key

### 3. Deploy Your PWA

Make sure your PWA is live at your production domain:
- `https://your-domain.com`
- `https://your-domain.com/manifest.json` must be accessible
- All icons must be accessible

### 4. Initialize Bubblewrap

Update the manifest URL in package.json scripts, then:

```bash
npm run twa:init
```

Follow the prompts to configure your TWA.

### 5. Build and Test

```bash
# Build the APK
npm run twa:build

# Install on connected Android device
npm run twa:install
```

## Digital Asset Links Setup

This is CRITICAL for your TWA to work without the URL bar.

### 1. Get Your SHA-256 Fingerprint

```bash
keytool -list -v -keystore android.keystore -alias poetrysuite
```

Copy the `SHA256:` fingerprint (including colons).

### 2. Update assetlinks.json

Edit `public/.well-known/assetlinks.json`:

```json
[{
  "relation": ["delegate_permission/common.handle_all_urls"],
  "target": {
    "namespace": "android_app",
    "package_name": "com.poetrysuite.app",
    "sha256_cert_fingerprints": [
      "AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99:AA:BB:CC:DD:EE:FF:00:11:22:33:44:55:66:77:88:99"
    ]
  }
}]
```

Replace:
- `package_name` with your actual package ID
- `sha256_cert_fingerprints` with your actual fingerprint

### 3. Deploy assetlinks.json

The file must be accessible at:
```
https://your-domain.com/.well-known/assetlinks.json
```

### 4. Verify

Test your configuration:
```bash
curl https://your-domain.com/.well-known/assetlinks.json
```

Or use: https://developers.google.com/digital-asset-links/tools/generator

## Common Commands

```bash
# Build production PWA
npm run build

# Generate PNG icons
./scripts/generate-pwa-icons.sh

# Initialize TWA
npm run twa:init

# Build APK
npm run twa:build

# Install on device
npm run twa:install

# Validate configuration
npm run twa:validate

# Update TWA config
npm run twa:update
```

## Testing Checklist

Before publishing, verify:

- [ ] App installs on Android device
- [ ] App opens without URL bar (Digital Asset Links working)
- [ ] App icon appears correctly
- [ ] Splash screen shows properly
- [ ] Navigation works correctly
- [ ] Offline functionality works
- [ ] Notifications work (if enabled)
- [ ] Back button behaves correctly
- [ ] Deep links work (if configured)

## Publishing to Play Store

### 1. Prepare Materials

- [ ] App screenshots (at least 2, phone)
- [ ] Feature graphic (1024x500px)
- [ ] App description (short: 80 chars, long: 4000 chars)
- [ ] Privacy policy URL
- [ ] Content rating

### 2. Build Release Bundle

```bash
npx @bubblewrap/cli build --appBundleId=com.yourcompany.yourapp
```

This creates an AAB file for Play Store.

### 3. Create Play Store Listing

1. Go to [Google Play Console](https://play.google.com/console)
2. Create new app
3. Fill out all required information
4. Upload AAB file
5. Submit for review

## Troubleshooting

### URL Bar Still Shows

**Problem**: Digital Asset Links not working

**Solutions**:
1. Verify assetlinks.json is accessible at `https://your-domain.com/.well-known/assetlinks.json`
2. Check SHA-256 fingerprint matches your keystore
3. Ensure domain uses HTTPS
4. Clear Chrome app data and reinstall TWA
5. Wait up to 24 hours for Google to verify

### App Won't Install

**Problem**: Installation failed

**Solutions**:
1. Check if device allows installation from unknown sources
2. Uninstall previous version if exists
3. Check if APK is properly signed
4. Enable USB debugging on device

### PWA Validation Failed

**Problem**: Bubblewrap says PWA is invalid

**Solutions**:
1. Test PWA at https://www.pwabuilder.com/
2. Ensure service worker is registered
3. Check manifest.json is valid
4. Verify all icons are accessible
5. Ensure HTTPS is properly configured

### Build Fails

**Problem**: Gradle build errors

**Solutions**:
1. Update Java to JDK 17+
2. Let Bubblewrap install Android SDK
3. Clear build cache: `rm -rf .bubblewrap/android-sdk`
4. Try again: `npm run twa:build`

## Important Notes

1. **Keystore Security**: Never commit `android.keystore` to git. Back it up securely.

2. **Version Updates**: Increment `appVersionCode` in `.bubblewrap/twa-manifest.json` for each Play Store update.

3. **Automatic Updates**: Content updates are automatic. Users see new content immediately without app updates.

4. **HTTPS Required**: Your production domain MUST use HTTPS.

5. **Domain Ownership**: You must own both the domain and the Android package ID.

## Next Steps

After successful setup:

1. Test thoroughly on multiple devices
2. Get feedback from beta testers
3. Optimize performance with Lighthouse
4. Set up Play Store listing
5. Plan your marketing strategy

## Resources

- Full Setup Guide: `BUBBLEWRAP_SETUP.md`
- Bubblewrap Docs: https://github.com/GoogleChromeLabs/bubblewrap
- TWA Guide: https://developer.chrome.com/docs/android/trusted-web-activity/
- Play Console: https://play.google.com/console

## Get Help

- Check `BUBBLEWRAP_SETUP.md` for detailed troubleshooting
- GitHub Issues: https://github.com/GoogleChromeLabs/bubblewrap/issues
- Stack Overflow: https://stackoverflow.com/questions/tagged/trusted-web-activity
