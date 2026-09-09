import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';

export function getAdminApp(): App {
  if (getApps().length > 0) {
    return getApps()[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  
  // Safely parse Vercel environment keys (stripping rogue quotes and escaping newlines)
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;
  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, '\n').replace(/(^"|"$)/g, '');
  }

  if (!projectId || !clientEmail || !privateKey) {
    throw new Error('FATAL: Firebase Admin environment variables missing or malformed.');
  }

  return initializeApp({
    credential: cert({ projectId, clientEmail, privateKey }),
  });
}

export const adminDb = (): Firestore => getFirestore(getAdminApp());
export const adminAuth = (): Auth => getAuth(getAdminApp());
