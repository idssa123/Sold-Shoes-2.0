import { createContext, useContext, useEffect, useState } from "react";
import {
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signInWithEmailAndPassword,
    signOut,
} from "firebase/auth";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { auth, db } from "../lib/firebase";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);
        });
        return () => unsubscribe();
    }, []);

    const login = (email, password) => signInWithEmailAndPassword(auth, email, password);
    const logout = () => signOut(auth);
    const register = async ({ email, password, profile }) => {
        const credential = await createUserWithEmailAndPassword(auth, email, password);
        if (profile) {
            await setDoc(doc(db, "users", credential.user.uid), { ...profile, email, createdAt: serverTimestamp() });
        }
        return credential;
    };

    const value = { user, loading, login, logout, register };
    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}
