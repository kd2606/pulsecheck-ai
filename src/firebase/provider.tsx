"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User, onAuthStateChanged, getRedirectResult } from "firebase/auth";
import { auth, db } from "./clientApp";
import { doc, setDoc } from "firebase/firestore";

interface FirebaseContextType {
    user: User | null;
    loading: boolean;
}

const FirebaseContext = createContext<FirebaseContextType>({
    user: null,
    loading: true,
});

export function FirebaseProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Handle redirect result (from signInWithRedirect)
        getRedirectResult(auth).catch((error) => {
            console.error("Redirect sign-in error:", error);
        });

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            setUser(firebaseUser);
            setLoading(false);

            if (firebaseUser) {
                // Sync minimal profile logic
                try {
                    const userRef = doc(db, "users", firebaseUser.uid);
                    await setDoc(
                        userRef,
                        {
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            photoURL: firebaseUser.photoURL,
                            lastLogin: new Date().toISOString(),
                        },
                        { merge: true }
                    );
                } catch (e) {
                    console.warn("Could not sync profile (offline or blocked)", e);
                }
            }
        });

        return () => unsubscribe();
    }, []);

    return (
        <FirebaseContext.Provider value={{ user, loading }}>
            {children}
        </FirebaseContext.Provider>
    );
}

export const useFirebaseContext = () => useContext(FirebaseContext);

