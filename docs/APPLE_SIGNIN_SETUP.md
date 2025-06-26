# Apple Sign-In Setup for Firebase

## Overview
Apple Sign-In has been implemented in the TangoTiempo application but requires additional configuration in Firebase Console to work properly.

## Current Status
- **Frontend Implementation**: ✅ Complete
- **Firebase Provider**: ✅ Enabled
- **Apple Developer Configuration**: ❌ Required

## Error Resolution
If you're seeing the error: `Firebase: Error (auth/operation-not-allowed)`, this means Apple Sign-In needs additional configuration.

## Required Setup Steps

### 1. Apple Developer Account Setup
1. Log in to [Apple Developer Portal](https://developer.apple.com)
2. Create an App ID with "Sign in with Apple" capability
3. Create a Service ID for web authentication
4. Configure the Service ID with your domain and redirect URL

### 2. Firebase Console Configuration
1. Go to Firebase Console → Authentication → Sign-in method → Apple
2. Click on Apple provider settings
3. Add the following:
   - **Service ID**: From Apple Developer Portal
   - **OAuth code flow configuration**:
     - Team ID
     - Key ID  
     - Private Key (p8 file content)

### 3. Domain Verification
1. Add your domain to Apple Developer Portal
2. Verify domain ownership
3. Add Firebase Auth domain as redirect URL:
   - `https://[YOUR-PROJECT-ID].firebaseapp.com/__/auth/handler`

### 4. Web Configuration
For web implementations, you need to:
1. Host the `apple-developer-domain-association` file at:
   - `https://[YOUR-DOMAIN]/.well-known/apple-developer-domain-association`

## Testing
- Apple Sign-In requires HTTPS in production
- Can be tested locally with Firebase Auth emulator
- Requires real Apple ID for testing

## Troubleshooting
- Ensure all Apple certificates are valid and not expired
- Check that the Service ID matches exactly in both Apple and Firebase
- Verify domain association file is accessible
- Check Firebase project settings for correct OAuth redirect URI

## References
- [Firebase Apple Sign-In Documentation](https://firebase.google.com/docs/auth/web/apple)
- [Apple Sign-In JS Documentation](https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js)
- [Configuring Your Environment](https://developer.apple.com/documentation/sign_in_with_apple/configuring_your_environment_for_sign_in_with_apple)