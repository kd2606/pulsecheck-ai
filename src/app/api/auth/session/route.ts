import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { adminAuth } from '@/lib/firebase/admin';

const SESSION_COOKIE = '__session';
const EXPIRES_IN_MS = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function POST(request: Request) {
  const { idToken } = await request.json();
  if (!idToken) return NextResponse.json({ error: 'missing idToken' }, { status: 400 });

  try {
    const decoded = await adminAuth.verifyIdToken(idToken, true);
    if (Date.now() / 1000 - decoded.auth_time > 5 * 60) {
      return NextResponse.json({ error: 'recent sign-in required' }, { status: 401 });
    }

    const sessionCookie = await adminAuth.createSessionCookie(idToken, {
      expiresIn: EXPIRES_IN_MS,
    });

    (await cookies()).set(SESSION_COOKIE, sessionCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: EXPIRES_IN_MS / 1000,
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: 'invalid token' }, { status: 401 });
  }
}

export async function DELETE() {
  const store = await cookies();
  const existing = store.get(SESSION_COOKIE)?.value;
  if (existing) {
    try {
      const decoded = await adminAuth.verifySessionCookie(existing);
      await adminAuth.revokeRefreshTokens(decoded.sub); 
    } catch { /* already invalid */ }
  }
  store.delete(SESSION_COOKIE);
  return NextResponse.json({ ok: true });
}
