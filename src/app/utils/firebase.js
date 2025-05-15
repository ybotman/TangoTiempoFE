// utils/firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth, FacebookAuthProvider, GoogleAuthProvider, EmailAuthProvider } from 'firebase/auth';

// Decode the Base64 encoded JSON string from the environment variable
const decodedFirebaseConfig = JSON.parse(
  Buffer.from(process.env.NEXT_PUBLIC_FIREBASE_JSON, 'base64').toString('utf-8')
);

console.log('Firebase Config:', decodedFirebaseConfig); // Debugging line

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

export { auth, facebookProvider, googleProvider, emailProvider };
