import { cert, getApp, getApps, initializeApp, type App } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

function buildCredential() {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
  if (raw) {
    const parsed = JSON.parse(raw);
    return cert({
      projectId: parsed.project_id ?? parsed.projectId,
      clientEmail: parsed.client_email ?? parsed.clientEmail,
      privateKey: (parsed.private_key ?? parsed.privateKey ?? '').replace(/\\n/g, '\n'),
    });
  }
  
  const projectId = process.env.FIREBASE_PROJECT_ID || process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const privateKey = (process.env.FIREBASE_PRIVATE_KEY ?? '').replace(/\\n/g, '\n');
  
  if (projectId && clientEmail && privateKey) {
    return cert({
      projectId,
      clientEmail,
      privateKey,
    });
  }
  
  return null;
}

const credential = buildCredential();

export const app: App = getApps().length
  ? getApp()
  : initializeApp(credential ? { credential } : { projectId: 'demo-project' });

export const adminAuth = getAuth(app);
export const adminDb = getFirestore(app);

export function getAdminApp(): App {
  return app;
}
