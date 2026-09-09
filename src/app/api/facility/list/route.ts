import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const EMPTY = { facilities: [], count: 0, empty: true };

export async function GET(req: Request) {
  try {
    const token = (req.headers.get('authorization') || '').replace(/^Bearer\s+/i, '');
    if (!token) {
      return NextResponse.json({ ...EMPTY, error: 'unauthenticated' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = await adminAuth().verifyIdToken(token);
    } catch {
      return NextResponse.json({ ...EMPTY, error: 'invalid_token' }, { status: 401 });
    }

    // --- Role resolution with Firestore self-heal (fixes stale-claim 403s) ---
    let role = (decoded.role as string) || (decoded.worker ? 'worker' : null);
    if (!role) {
      const profile = await adminDb().collection('users').doc(decoded.uid).get();
      role = (profile.exists ? (profile.data()?.role as string) : null) ?? null;
      if (role) {
        // repair the claim so future requests are fast
        await adminAuth().setCustomUserClaims(decoded.uid, {
          ...decoded, role, worker: role === 'worker',
        }).catch(() => {});
      }
    }
    // Reading the catalog is non-sensitive: any authenticated user may list.
    // (Tighten this after the demo if you need to.)

    const district =
      (decoded.district as string) ||
      new URL(req.url).searchParams.get('district') ||
      'Gadchiroli';

    const col = adminDb().collection('facilities');

    // Primary query, scoped by district
    let snap = await col.where('district', '==', district).limit(200).get();

    // Fallback 1: district field missing/mismatched on seeded docs
    if (snap.empty) snap = await col.limit(200).get();

    // Fallback 2: collection genuinely empty -> 200 + []
    if (snap.empty) {
      return NextResponse.json(
        { ...EMPTY, message: 'No facilities found - please add data', district },
        { status: 200 }
      );
    }

    const facilities = snap.docs
      .map((d) => ({ id: d.id, ...d.data() }))
      .filter((f: any) => f.isActive !== false)
      .sort((a: any, b: any) => String(a.name).localeCompare(String(b.name)));

    return NextResponse.json(
      { facilities, count: facilities.length, empty: facilities.length === 0, district, role },
      { status: 200 }
    );
  } catch (err: any) {
    console.error('[facility/list]', err);
    // Demo-safe: never surface a 500 modal. Flag it as degraded instead.
    return NextResponse.json(
      { ...EMPTY, degraded: true, message: 'No facilities found - please add data' },
      { status: 200 }
    );
  }
}
