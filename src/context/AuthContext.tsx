"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { 
  onAuthStateChanged, 
  signOut, 
  User 
} from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { UserProfile, SUPERADMIN_EMAIL } from "@/types";

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
      try {
        if (firebaseUser) {
          const userEmail = (firebaseUser.email || "").toLowerCase();
          const isSuperadmin = userEmail === SUPERADMIN_EMAIL.toLowerCase();

          // Perfil base inmediato (así nunca se queda bloqueada la app si falla Firestore)
          const fallbackProfile: UserProfile = {
            uid: firebaseUser.uid,
            email: firebaseUser.email || '',
            displayName: firebaseUser.displayName || undefined,
            role: isSuperadmin ? "admin" : "customer",
            isClubMember: false,
            points: isSuperadmin ? 9999 : 0,
            createdAt: Date.now()
          };

          try {
            // Intentar leer y actualizar Firestore
            const docRef = doc(db, "users", firebaseUser.uid);
            const docSnap = await getDoc(docRef);
            
            if (docSnap.exists()) {
              const profile = docSnap.data() as UserProfile;
              if (isSuperadmin && profile.role !== "admin") {
                const updatedProfile = { ...profile, role: "admin" as const };
                try {
                  await setDoc(docRef, updatedProfile, { merge: true });
                } catch {}
                setUser(updatedProfile);
              } else {
                setUser(profile);
              }
            } else {
              try {
                await setDoc(docRef, fallbackProfile);
              } catch {}
              setUser(fallbackProfile);
            }
          } catch (firestoreErr) {
            console.warn("No se pudo conectar a Firestore o faltan permisos, usando perfil en memoria:", firestoreErr);
            setUser(fallbackProfile);
          }
        } else {
          setUser(null);
        }
      } catch (err) {
        console.error("Error en AuthStateChanged:", err);
        setUser(null);
      } finally {
        // SIEMPRE liberamos el loading para que nunca se congele la pantalla
        setLoading(false);
      }
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
