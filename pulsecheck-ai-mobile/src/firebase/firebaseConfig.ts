import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";

const firebaseConfig = {
    apiKey: "AIzaSyCGPulX7bwZy7_FpjW8pOf9cWnwUbiDc7M",
    authDomain: "healthsense-ai-prod-478.firebaseapp.com",
    projectId: "healthsense-ai-prod-478",
    storageBucket: "healthsense-ai-prod-478.firebasestorage.app",
    messagingSenderId: "218534686639",
    appId: "1:218534686639:web:ea566353997d51f20f095a",
};

const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();

const auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
});

const db = getFirestore(app);

export { app, auth, db };
