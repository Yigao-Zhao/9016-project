import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Firebase配置
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || "AIzaSyCMnuKglbr1O6fSjXHbg3Icwi8nEnv_xA4",
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || "socailmedia9016.firebaseapp.com",
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || "socailmedia9016",
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || "socailmedia9016.firebasestorage.app",
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || "403464388676",
  appId: process.env.REACT_APP_FIREBASE_APP_ID || "1:403464388676:web:e5ac36de8bb547a8bdbc11"
};

// 初始化Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

export { auth };
export default app;