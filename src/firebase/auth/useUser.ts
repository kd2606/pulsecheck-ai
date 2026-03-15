"use client";

import { useFirebaseContext } from "../provider";
import { auth } from "../clientApp";
import {
    signOut as firebaseSignOut,
    GoogleAuthProvider,
    signInWithPopup,
    signInWithRedirect,
    RecaptchaVerifier,
    signInWithPhoneNumber,
    ConfirmationResult,
} from "firebase/auth";
import { useRouter } from "next/navigation";

declare global {
    interface Window {
        recaptchaVerifier: RecaptchaVerifier;
    }
}

export function useUser() {
    const { user, loading } = useFirebaseContext();
    const router = useRouter();

    const signOut = async () => {
        try {
            await firebaseSignOut(auth);
            router.push("/");
        } catch (error) {
            console.error("Sign out error", error);
        }
    };

    const signInWithGoogle = async () => {
        const provider = new GoogleAuthProvider();
        try {
            // Try popup first (works on localhost and when domains are properly configured)
            return await signInWithPopup(auth, provider);
        } catch (error: any) {
            // If popup fails due to cross-origin/iframe issues, fall back to redirect
            if (
                error.code === "auth/popup-blocked" ||
                error.code === "auth/popup-closed-by-user" ||
                error.code === "auth/unauthorized-domain" ||
                error.message?.includes("Illegal url") ||
                error.message?.includes("cross-origin")
            ) {
                console.warn("Popup sign-in failed, falling back to redirect:", error.message);
                return await signInWithRedirect(auth, provider);
            } else {
                throw error;
            }
        }
    };

    const setupRecaptcha = () => {
        if (!window.recaptchaVerifier) {
            window.recaptchaVerifier = new RecaptchaVerifier(auth, "recaptcha-container", {
                size: "invisible",
            });
        }
        return window.recaptchaVerifier;
    };

    const sendPhoneCode = async (phoneNumber: string) => {
        const recaptchaVerifier = setupRecaptcha();
        return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
    };

    const verifyPhoneCode = async (confirmationResult: ConfirmationResult, code: string) => {
        await confirmationResult.confirm(code);
    };

    return {
        user,
        loading,
        signOut,
        signInWithGoogle,
        sendPhoneCode,
        verifyPhoneCode,
    };
}
