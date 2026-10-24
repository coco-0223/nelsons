"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { 
  onAuthStateChanged, 
  signOut, 
  User 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { UserProfile } from "@/types";

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  logout: () => Promise<void>;
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  authView: 'login' | 'register';
  setAuthView: (view: 'login' | 'register') => void;
  openAuth: (view: 'login' | 'register') => void;
}

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  
  // UI State for Auth Modal
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'register'>('login');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: User | null) => {
      if (firebaseUser) {
        // Fetch custom user profile from Firestore
        const docRef = doc(db, "users", firebaseUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          setUser(docSnap.data() as UserProfile);
        } else {
          // Fallback if doc doesn't exist yet
          const newProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            role: "customer",
            isClubMember: false,
            points: 0,
            createdAt: Date.now()
          };
          await setDoc(docRef, newProfile);
          setUser(newProfile);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    await signOut(auth);
    setUser(null);
  };

  const openAuth = (view: 'login' | 'register') => {
    setAuthView(view);
    setShowAuthModal(true);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      logout, 
      showAuthModal, 
      setShowAuthModal, 
      authView, 
      setAuthView,
      openAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
