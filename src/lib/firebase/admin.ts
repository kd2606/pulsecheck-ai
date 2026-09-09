import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

export function getAdminApp(): App | null {
  try {
    if (getApps().length > 0) {
      return getApps()[0];
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    let privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (privateKey) {
      privateKey = privateKey.replace(/\\n/g, '\n').replace(/(^"|"$)/g, '');
    }

    if (!projectId || !clientEmail || !privateKey) {
      console.warn('Firebase Admin Init: Missing or malformed Env Vars. Falling back silently.');
      return null; // NEVER THROW HERE
    }

    return initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  } catch (error) {
    console.error('Firebase Admin Init Exception:', error);
    return null; // NEVER THROW HERE
  }
}

export const adminDb = (): Firestore | null => {
  const app = getAdminApp();
  return app ? getFirestore(app) : null;
};

export const adminAuth = (): Auth | null => {
  const app = getAdminApp();
  return app ? getAuth(app) : null;
};