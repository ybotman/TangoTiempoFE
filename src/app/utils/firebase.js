// utils/firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth, FacebookAuthProvider, GoogleAuthProvider, EmailAuthProvider, OAuthProvider } from 'firebase/auth';

// Decode the Base64 encoded JSON string from the environment variable
const decodedFirebaseConfig = JSON.parse(
  Buffer.from(process.env.NEXT_PUBLIC_FIREBASE_JSON, 'base64').toString('utf-8')
);

console.log('=== Firebase Configuration ===');
console.log('Project ID:', decodedFirebaseConfig.projectId);
console.log('Auth Domain:', decodedFirebaseConfig.authDomain);
console.log('Current Domain:', typeof window !== 'undefined' ? window.location.hostname : 'SSR');
console.log('Full Firebase Config:', decodedFirebaseConfig);

// Initialize Firebase app
const app = initializeApp(decodedFirebaseConfig);

// Initialize Firebase Auth
const auth = getAuth(app);

// Initialize Auth Providers
const googleProvider = new GoogleAuthProvider();
googleProvider.addScope('email');
googleProvider.addScope('profile');

const facebookProvider = new FacebookAuthProvider();
facebookProvider.addScope('email');
facebookProvider.addScope('public_profile');

const emailProvider = new EmailAuthProvider();

const appleProvider = new OAuthProvider('apple.com');
appleProvider.addScope('email');
appleProvider.addScope('name');

// Log Apple provider setup
console.log('=== Apple Provider Setup ===');
console.log('Provider ID:', appleProvider.providerId);
console.log('Scopes:', appleProvider.scopes);

// Set custom parameters if needed (optional)
// appleProvider.setCustomParameters({
//   locale: 'en'
// });

export { auth, facebookProvider, googleProvider, emailProvider, appleProvider };
