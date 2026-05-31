import { createContext, useContext, useEffect, useState } from "react";
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const AuthContext = createContext(null);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [role,    setRole]    = useState(null);   
  const [loading, setLoading] = useState(true);

  
  useEffect(() => {
    if (!auth) {
      // Firebase not configured (missing env vars) — skip auth watcher to avoid runtime errors.
      setLoading(false);
      return;
    }
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
        try {
          const snap = await getDoc(doc(db, "users", firebaseUser.uid));
          setRole(snap.exists() ? (snap.data().role || "user") : "user");
        } catch {
          setRole("user");
        }
      } else {
        setUser(null);
        setRole(null);
      }
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = (email, password) =>
    (!auth ? Promise.reject(new Error('Firebase no configurado')) : signInWithEmailAndPassword(auth, email, password));

  const logout = () => { signOut(auth); setRole(null); };

  const register = async ({ email, password, profile }) => {
    if (!auth) throw new Error('Firebase no configurado');
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await setDoc(doc(db, "users", credential.user.uid), {
      ...profile,
      email,
      role: "user",
      createdAt: serverTimestamp(),
    });
    await sendEmailVerification(credential.user);
    setRole("user");
    return credential;
  };

  const loginWithGoogle = async () => {
    if (!auth) throw new Error('Firebase no configurado');
    const result  = await signInWithPopup(auth, googleProvider);
    const gUser   = result.user;
    const userRef = doc(db, "users", gUser.uid);
    const snap    = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        name:      gUser.displayName?.split(" ")[0] || "",
        surname:   gUser.displayName?.split(" ").slice(1).join(" ") || "",
        email:     gUser.email,
        photo:     gUser.photoURL || "",
        role:      "user",
        provider:  "google",
        createdAt: serverTimestamp(),
      });
      setRole("user");
    } else {
      setRole(snap.data().role || "user");
    }
    return result;
  };

  const isAdmin = role === "admin";

  return (
    <AuthContext.Provider value={{ user, role, isAdmin, loading, login, logout, register, loginWithGoogle }}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
