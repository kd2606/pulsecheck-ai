import { NextRequest, NextResponse } from 'next/server';
import { getApps, initializeApp, applicationDefault, cert, type App } from 'firebase-admin/app';
import { getFirestore, Timestamp, type Firestore, type Query } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

/* ------------------------------------------------------------------ *
 * Types + guaranteed-safe fallback payload
 * ------------------------------------------------------------------ */

type DistrictAnalytics = {
  activeReferrals: number;
  breachedCases: number;
  incomingPatients: number;
  completedReferrals: number;
  avgResponseMinutes: number | null;
  byStatus: Record<string, number>;
};

const EMPTY_PAYLOAD: DistrictAnalytics = {
  activeReferrals: 0,
  breachedCases: 0,
  incomingPatients: 0,
  completedReferrals: 0,
  avgResponseMinutes: null,
  byStatus: {},
};

type Meta = {
  degraded: boolean;
  reason?: string;
  facilityId: string | null;
  district: string | null;
  startDate: string | null;
  endDate: string | null;
  generatedAt: string;
};

function ok(payload: DistrictAnalytics, meta: Meta) {
  return NextResponse.json(
    { ...payload, meta },
    { status: 200, headers: { 'Cache-Control': 'no-store' } }
  );
}

/* ------------------------------------------------------------------ *
 * Admin SDK bootstrap (idempotent, never throws)
 * ------------------------------------------------------------------ */

let cachedApp: App | null = null;

function getAdminApp(): App | null {
  try {
    if (cachedApp) return cachedApp;
    const existing = getApps();
    if (existing.length > 0) {
      cachedApp = existing[0];
      return cachedApp;
    }

    const raw = process.env.FIREBASE_SERVICE_ACCOUNT_KEY ?? process.env.FIREBASE_SERVICE_ACCOUNT;
    if (raw) {
      const parsed = JSON.parse(raw.trim().startsWith('{') ? raw : Buffer.from(raw, 'base64').toString('utf8'));
      cachedApp = initializeApp({ credential: cert(parsed) });
      return cachedApp;
    }

    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');
    if (projectId && clientEmail && privateKey) {
      cachedApp = initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
      return cachedApp;
    }

    cachedApp = initializeApp({ credential: applicationDefault() });
    return cachedApp;
  } catch (err) {
    console.error('[analytics/district] admin init failed:', err);
    return null;
  }
}

/* ------------------------------------------------------------------ *
 * Utilities
 * ------------------------------------------------------------------ */

function parseDate(value: string | null, fallback: Date): Date {
  if (!value) return fallback;
  const asNumber = Number(value);
  const d = Number.isFinite(asNumber) && value.length >= 10 && !value.includes('-')
    ? new Date(asNumber)
    : new Date(value);
  return Number.isNaN(d.getTime()) ? fallback : d;
}

/** count() aggregation with a get().size fallback for emulators / old rules. */
async function safeCount(query: Query): Promise<number> {
  try {
    const agg = await query.count().get();
    const n = agg.data().count;
    return Number.isFinite(n) ? n : 0;
  } catch {
    try {
      const snap = await query.limit(2000).get();
      return snap.size ?? 0;
    } catch (err) {
      console.warn('[analytics/district] count fallback failed:', err);
      return 0;
    }
  }
}

const ACTIVE_STATUSES = ['pending', 'accepted', 'active', 'in_transit', 'en_route', 'assigned'];
const INCOMING_STATUSES = ['in_transit', 'en_route', 'dispatched'];

/* ------------------------------------------------------------------ *
 * GET
 * ------------------------------------------------------------------ */

export async function GET(request: NextRequest) {
  const now = new Date();
  const url = new URL(request.url);

  const startDate = parseDate(url.searchParams.get('startDate'), new Date(now.getTime() - 30 * 864e5));
  const endDate = parseDate(url.searchParams.get('endDate'), now);

  let facilityId = url.searchParams.get('facilityId');
  let district = url.searchParams.get('district');

  const baseMeta = (): Meta => ({
    degraded: true,
    facilityId,
    district,
    startDate: startDate.toISOString(),
    endDate: endDate.toISOString(),
    generatedAt: new Date().toISOString(),
  });

  try {
    const app = getAdminApp();
    if (!app) return ok(EMPTY_PAYLOAD, { ...baseMeta(), reason: 'admin-unavailable' });

    // --- Identity (soft): scope the query to the caller's facility/district.
    // A bad/absent token yields zeros rather than a 401 that would blank the UI.
    try {
      const authHeader = request.headers.get('authorization') ?? '';
      const token = authHeader.toLowerCase().startsWith('bearer ') ? authHeader.slice(7).trim() : null;
      if (token) {
        const decoded = await getAuth(app).verifyIdToken(token);
        const isPrivileged = decoded.admin === true || decoded.role === 'mo';
        if (!isPrivileged) {
          return ok(EMPTY_PAYLOAD, { ...baseMeta(), reason: 'insufficient-claims' });
        }
        facilityId = facilityId ?? (decoded.facilityId as string | undefined) ?? null;
        district = district ?? (decoded.district as string | undefined) ?? null;
      }
    } catch (authErr) {
      console.warn('[analytics/district] token verify failed, continuing unscoped:', authErr);
    }

    const db: Firestore = getFirestore(app);
    const start = Timestamp.fromDate(startDate);
    const end = Timestamp.fromDate(endDate);

    // Scope: facilityId is the primary partition key written by the ASHA portal.
    const scope = (col: string): Query => {
      let q: Query = db.collection(col);
      if (facilityId) q = q.where('facilityId', '==', facilityId);
      else if (district) q = q.where('district', '==', district);
      return q;
    };

    const referrals = scope('referrals');

    // Every branch is settled independently: one missing index or empty
    // collection can never take down the whole response.
    const [active, breached, incoming, completed, windowed] = await Promise.allSettled([
      safeCount(referrals.where('status', 'in', ACTIVE_STATUSES)),
      safeCount(referrals.where('slaBreached', '==', true)),
      safeCount(referrals.where('status', 'in', INCOMING_STATUSES)),
      safeCount(referrals.where('status', '==', 'completed')),
      referrals.where('createdAt', '>=', start).where('createdAt', '<=', end).limit(1000).get(),
    ]);

    const num = (r: PromiseSettledResult<number>) => (r.status === 'fulfilled' ? r.value : 0);

    const byStatus: Record<string, number> = {};
    let responseSum = 0;
    let responseCount = 0;

    if (windowed.status === 'fulfilled') {
      for (const doc of windowed.value.docs) {
        const d = doc.data() ?? {};
        const status = typeof d.status === 'string' ? d.status : 'unknown';
        byStatus[status] = (byStatus[status] ?? 0) + 1;

        const created = d.createdAt?.toDate?.() ?? null;
        const acked = (d.acknowledgedAt ?? d.acceptedAt)?.toDate?.() ?? null;
        if (created && acked && acked >= created) {
          responseSum += (acked.getTime() - created.getTime()) / 60000;
          responseCount += 1;
        }
      }
    } else {
      console.warn('[analytics/district] window query failed:', windowed.reason);
    }

    const anyFailure = [active, breached, incoming, completed, windowed].some((r) => r.status === 'rejected');

    const payload: DistrictAnalytics = {
      activeReferrals: num(active),
      breachedCases: num(breached),
      incomingPatients: num(incoming),
      completedReferrals: num(completed),
      avgResponseMinutes: responseCount > 0 ? Math.round(responseSum / responseCount) : null,
      byStatus,
    };

    return ok(payload, {
      ...baseMeta(),
      degraded: anyFailure,
      reason: anyFailure ? 'partial-data' : undefined,
    });
  } catch (err) {
    // Absolute last resort — the dashboard still gets a 200.
    console.error('[analytics/district] unhandled error:', err);
    return ok(EMPTY_PAYLOAD, { ...baseMeta(), reason: 'unhandled-error' });
  }
}
