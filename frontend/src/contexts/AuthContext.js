import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile 
} from 'firebase/auth';
import { auth } from '../firebase';
import axios from 'axios';

const AuthContext = createContext();

export function useAuth() {
  return useContext(AuthContext);
}

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState(null);

  async function register(email, password, username, fullName) {
    try {
      // 创建Firebase用户
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await updateProfile(userCredential.user, { displayName: username });
      
      // 调用后端API创建用户资料
      const token = await userCredential.user.getIdToken();
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/auth/register`, {
        uid: userCredential.user.uid,
        username,
        email,
        fullName
      }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUserProfile(response.data);
      return userCredential.user;
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  function login(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
  }

  function logout() {
    setUserProfile(null);
    return signOut(auth);
  }

  // 加载用户资料
  async function loadUserProfile(user) {
    try {
      if (!user) return;
      
      const token = await user.getIdToken();
      const response = await axios.get(`${process.env.REACT_APP_API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      setUserProfile(response.data);
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      setCurrentUser(user);
      if (user) {
        loadUserProfile(user);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userProfile,
    register,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}