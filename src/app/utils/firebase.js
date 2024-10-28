// utils/firebase.js

import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

let decodedFirebaseConfig;

if (typeof window === 'undefined') {
  // Server-side decoding of Base64 string
  decodedFirebaseConfig = JSON.parse(
    Buffer.from(process.env.NEXT_PUBLIC_FIREBASE_JSON, 'base64').toString(
      'utf-8'
    )
  );
} else {
  // Client-side error handling (optional)
  console.error('Firebase config can only be decoded on the server side.');
}

// Initialize Firebase app only if decodedFirebaseConfig is available
const app = decodedFirebaseConfig ? initializeApp(decodedFirebaseConfig) : null;

// Export auth for use in other components (null if on client without config)
export const auth = app ? getAuth(app) : null;
