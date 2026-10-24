import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  projectId: "empanadas-coquetas",
  appId: "1:148281082757:web:23e959b05aa9df967ebaec",
  storageBucket: "empanadas-coquetas.firebasestorage.app",
  apiKey: "AIzaSyBBzfBDWcxhqK8sUsHb2cQpPIoc0l9gspw",
  authDomain: "empanadas-coquetas.firebaseapp.com",
  messagingSenderId: "148281082757",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

export { app, db, auth, storage };
