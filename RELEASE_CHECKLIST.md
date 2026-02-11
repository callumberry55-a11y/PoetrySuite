# Poetry Suite - Release Checklist

Use this checklist before releasing a new version of Poetry Suite.

## Pre-Release Checklist

### 1. Version Management

- [ ] Update version in `package.json`
- [ ] Update `versionCode` in `android/app/build.gradle`
- [ ] Update `versionName` in `android/app/build.gradle`
- [ ] Create release notes in `RELEASE_NOTES_[VERSION].md`
- [ ] Update `CHANGELOG.md`

### 2. Code Quality

- [ ] Run tests: `npm test` (if tests exist)
- [ ] Run linter: `npm run lint`
- [ ] Type check: `npm run typecheck`
- [ ] Fix all warnings and errors
- [ ] Review and remove console.log statements
- [ ] Remove debug code and test data

### 3. Environment Configuration

- [ ] Verify `.env` file has production values
- [ ] Ensure Supabase URLs point to production
- [ ] Verify Firebase configuration
- [ ] Check all API endpoints
- [ ] Verify external API keys (if applicable)

### 4. Features & Content

- [ ] Test all major features
- [ ] Verify all navigation works
- [ ] Check form validations
- [ ] Test authentication flow
- [ ] Verify database operations
- [ ] Check offline functionality (if applicable)
- [ ] Test push notifications (if implemented)

### 5. UI/UX

- [ ] Test on multiple devices (phones, tablets)
- [ ] Check different screen sizes
- [ ] Verify dark mode works correctly
- [ ] Test all interactive elements
- [ ] Check loading states
- [ ] Verify error messages are user-friendly
- [ ] Test accessibility features

### 6. Performance

- [ ] Check app load time
- [ ] Verify image optimization
- [ ] Check bundle size
- [ ] Test on slow networks
- [ ] Monitor memory usage
- [ ] Profile critical paths

### 7. Security

- [ ] Ensure no sensitive data in code
- [ ] Verify API keys are not exposed
- [ ] Check authentication security
- [ ] Review RLS policies in Supabase
- [ ] Ensure HTTPS for all requests
- [ ] Review app permissions

### 8. Legal & Compliance

- [ ] Update privacy policy (if changed)
- [ ] Update terms of service (if changed)
- [ ] Verify copyright notices
- [ ] Check licenses of dependencies
- [ ] Ensure GDPR compliance (if applicable)

## Build Process

### Web Build

```bash
# 1. Clean previous build
rm -rf dist

# 2. Build production version
npm run build

# 3. Test production build locally
npm run preview

# 4. Deploy to hosting (if applicable)
# Example: npm run deploy
```

### Android Build

```bash
# 1. Ensure web build is complete
npm run build

# 2. Sync with Capacitor
npx cap sync android

# 3. For Debug (testing)
cd android
./gradlew assembleDebug
cd ..

# 4. For Release (production)
cd android
./gradlew assembleRelease
cd ..

# Or use npm scripts
npm run build:apk-debug   # For debug APK
npm run build:apk         # For release APK
```

### Generate App Bundle (for Play Store)

```bash
cd android
./gradlew bundleRelease
cd ..
```

**Output:** `android/app/build/outputs/bundle/release/app-release.aab`

## Testing

### Manual Testing

- [ ] Install APK on physical device
- [ ] Test all core features
- [ ] Check app on different Android versions
- [ ] Test offline capabilities
- [ ] Verify deep links work
- [ ] Test sharing functionality
- [ ] Check notifications

### Device Testing Matrix

Test on at least:
- [ ] Android 8.0 (Oreo) or minimum supported version
- [ ] Android 11
- [ ] Android 14 (latest)
- [ ] Small screen device (< 5 inches)
- [ ] Large screen device (> 6 inches)
- [ ] Tablet (if supported)

### Performance Testing

- [ ] Check app startup time (< 3 seconds)
- [ ] Monitor memory usage (< 200MB typical)
- [ ] Test on low-end device
- [ ] Check battery consumption
- [ ] Verify smooth scrolling (60 FPS)

## Distribution Preparation

### Google Play Store

#### Store Listing

- [ ] App title (max 50 characters)
- [ ] Short description (max 80 characters)
- [ ] Full description (max 4000 characters)
- [ ] App icon (512x512 PNG)
- [ ] Feature graphic (1024x500 PNG)
- [ ] Screenshots (at least 2, up to 8)
  - [ ] Phone screenshots
  - [ ] Tablet screenshots (if applicable)
- [ ] Promotional video (optional)

#### Content Rating

- [ ] Complete content rating questionnaire
- [ ] Submit for rating
- [ ] Apply rating to app

#### Privacy & Legal

- [ ] Privacy policy URL
- [ ] App content (ads, in-app purchases, etc.)
- [ ] Target audience and content
- [ ] Data safety section
  - [ ] List all collected data
  - [ ] Specify data sharing practices
  - [ ] Detail security practices

#### Release Track

- [ ] Internal testing (for team)
- [ ] Closed testing (for beta testers)
- [ ] Open testing (public beta)
- [ ] Production (full release)

#### App Bundle Upload

- [ ] Upload AAB file
- [ ] Set rollout percentage (start with 10-20%)
- [ ] Add release notes
- [ ] Review and confirm

### Direct Distribution (APK)

If distributing outside Play Store:

- [ ] Sign APK with release key
- [ ] Test signed APK
- [ ] Create download page
- [ ] Provide installation instructions
- [ ] Include SHA-256 fingerprint for verification

## Post-Release

### Monitoring

- [ ] Monitor crash reports (Play Console or Firebase)
- [ ] Check user reviews
- [ ] Monitor app performance metrics
- [ ] Track user engagement
- [ ] Monitor server load/costs
- [ ] Check error rates

### Communication

- [ ] Announce release on social media
- [ ] Send newsletter to users (if applicable)
- [ ] Update website
- [ ] Update documentation
- [ ] Respond to user feedback

### Maintenance

- [ ] Create bug fix plan for critical issues
- [ ] Schedule next release
- [ ] Archive release artifacts
- [ ] Document lessons learned
- [ ] Update development roadmap

## Rollback Plan

In case of critical issues:

1. **Immediate Actions**
   - [ ] Stop rollout in Play Console
   - [ ] Assess issue severity
   - [ ] Communicate with team

2. **Rollback Process**
   - [ ] Create hotfix branch
   - [ ] Fix critical issue
   - [ ] Fast-track testing
   - [ ] Build and release patch

3. **Alternative**
   - [ ] Revert to previous version in Play Console
   - [ ] Notify users
   - [ ] Plan proper fix

## Version History

### QPR 1 Beta 2 (Current)
- Version Code: 75002
- Release Date: TBD
- Major Features:
  - Enhanced community features
  - Poetry networking
  - Discussion forums
  - Study groups
  - Book clubs

## Useful Commands

```bash
# Check app version
npx cap --version

# Doctor check (diagnose issues)
npx cap doctor

# Open Android Studio
npx cap open android

# Check bundle size
npm run build && ls -lh dist/assets/*.js

# Generate icons
npm run generate:icons

# Verify signing
jarsigner -verify -verbose -certs app-release.apk
```

## Support Contacts

- **Technical Issues:** [Your support email]
- **Play Store:** [Google Play Console]
- **Backend:** [Supabase Dashboard]
- **Analytics:** [Firebase Console]

---

**Remember:** Always test thoroughly before releasing to production!
