import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

const DEMO_EMAIL = 'demo@diagnoverseai.in';

/**
 * Assigns a Firebase custom-claim role to a user.
 * For demo users, the role is inferred from the requested dashboard path.
 * For real users, this should only be called during signup/onboarding.
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { idToken, role } = body;

    if (!idToken || !role) {
      return NextResponse.json({ error: 'missing idToken or role' }, { status: 400 });
    }

    const validRoles = ['patient', 'worker', 'asha', 'district_admin', 'mo', 'admin', 'district'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'invalid role' }, { status: 400 });
    }

    // Verify the token to get the UID
    const decoded = await adminAuth.verifyIdToken(idToken);
    const uid = decoded.uid;

    // Set the custom claim (preserve any existing claims)
    const existingUser = await adminAuth.getUser(uid);
    const existingClaims = existingUser.customClaims || {};
    await adminAuth.setCustomUserClaims(uid, { ...existingClaims, role });

    return NextResponse.json({ ok: true, role });
  } catch (error: any) {
    console.error('ASSIGN-ROLE ERROR:', error);
    return NextResponse.json({ error: error.message || 'server error' }, { status: 500 });
  }
}
