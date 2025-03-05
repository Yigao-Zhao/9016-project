import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase configuration
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "Your Firebase API Key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "Your Firebase Auth Domain",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "Your Firebase Project ID",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "Your Firebase Storage Bucket",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "Your Firebase Messaging Sender ID",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "Your Firebase App ID"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
export default app;