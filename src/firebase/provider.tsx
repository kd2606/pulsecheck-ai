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
        if (!auth) {
            setLoading(false);
            return;
        }

        // Handle redirect result (from signInWithRedirect)
        const handleRedirect = async () => {
            try {
                const result = await getRedirectResult(auth);
                if (result) {
                    console.log("Redirect sign-in successful for:", result.user.email);
                }
            } catch (error: any) {
                console.error("Critical Redirect sign-in error:", error);
            }
        };

        handleRedirect();

        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser && db) {
                // Sync minimal profile logic
                try {
                    const userProfileRef = doc(db, "users", firebaseUser.uid, "profile", "data");
                    await setDoc(
                                userProfileRef,
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
            
            setUser(firebaseUser);
            setLoading(false);
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

