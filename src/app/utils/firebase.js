import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Decode the Base64 encoded JSON string from the environment variable
const decodedFirebaseConfig = JSON.parse(
  Buffer.from(process.env.NEXT_PUBLIC_FIREBASE_JSON, 'base64').toString('utf-8')
);


const app = initializeApp(decodedFirebaseConfig);
export const auth = getAuth(app);
