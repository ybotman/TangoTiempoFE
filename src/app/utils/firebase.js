// utils/firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Decode the Base64 encoded JSON string from the environment variable
const decodedFirebaseConfig = JSON.parse(
  Buffer.from(process.env.NEXT_PUBLIC_FIREBASE_JSON, 'base64').toString('utf-8')
);

console.log('Firebase Config:', decodedFirebaseConfig); // Debugging line

// Initialize Firebase app
const app = initializeApp(decodedFirebaseConfig);

// Export auth for use in other components
export const auth = getAuth(app);
