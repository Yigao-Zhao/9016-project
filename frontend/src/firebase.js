import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase配置
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "你的Firebase API Key",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "你的Firebase Auth Domain",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "你的Firebase Project ID",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "你的Firebase Storage Bucket",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "你的Firebase Messaging Sender ID",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "你的Firebase App ID"
};

// 初始化Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
export default app;