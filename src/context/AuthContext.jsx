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

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      setUser(firebaseUser);
      setLoading(false);
    });
    return () => unsub();
  }, []);

  const login = (email, password) =>
    signInWithEmailAndPassword(auth, email, password);

  const logout = () => signOut(auth);

  const register = async ({ email, password, profile }) => {
    const credential = await createUserWithEmailAndPassword(auth, email, password);

    await setDoc(doc(db, "users", credential.user.uid), {
      ...profile,
      email,
      role: "user",
      createdAt: serverTimestamp(),
    });

    await sendEmailVerification(credential.user);
    return credential;
  };
  const loginWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const { user: gUser } = result;


    const userRef = doc(db, "users", gUser.uid);
    const snap = await getDoc(userRef);
    if (!snap.exists()) {
      await setDoc(userRef, {
        name: gUser.displayName?.split(" ")[0] || "",
        surname: gUser.displayName?.split(" ").slice(1).join(" ") || "",
        email: gUser.email,
        photo: gUser.photoURL || "",
        role: "user",
        provider: "google",
        createdAt: serverTimestamp(),
      });
    }
    return result;
  };

  const value = { user, loading, login, logout, register, loginWithGoogle };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
