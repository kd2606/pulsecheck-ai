import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

const SLA_MINUTES = Number(process.env.NEXT_PUBLIC_SLA_MINUTES ?? 60);
const FACILITY_FIELDS = ['facilityId', 'facility_id', 'assignedFacilityId', 'destinationFacilityId'];

export type ReferralRow = {
  id: string;
  patientName: string;
  age: number | null;
  gender: string;
  village: string;
  ashaName: string;
  reason: string;
  urgency: 'critical' | 'high' | 'routine';
  status: 'pending' | 'acknowledged' | 'in_transit' | 'admitted' | 'completed' | 'cancelled';
  facilityId: string;
  createdAt: string | null;
  updatedAt: string | null;
  ageMinutes: number | null;
  slaBreached: boolean;
};

function toIso(value: unknown): string | null {
  if (!value) return null;
  if (typeof value === 'string') {
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d.toISOString();
  }
  if (typeof value === 'number') {
    const ms = value < 1e12 ? value * 1000 : value;
    return new Date(ms).toISOString();
  }
  const v = value as { toDate?: () => Date; _seconds?: number; seconds?: number };
  if (typeof v.toDate === 'function') return v.toDate().toISOString();
  const secs = v._seconds ?? v.seconds;
  if (typeof secs === 'number') return new Date(secs * 1000).toISOString();
  return null;
}

function normalizeStatus(raw: unknown): ReferralRow['status'] {
  const s = String(raw ?? 'pending').toLowerCase().replace(/[\s-]+/g, '_');
  const allowed = ['pending', 'acknowledged', 'in_transit', 'admitted', 'completed', 'cancelled'];
  if (allowed.includes(s)) return s as ReferralRow['status'];
  if (s === 'new' || s === 'created' || s === 'synced' || s === 'open') return 'pending';
  if (s === 'transit' || s === 'ontheway' || s === 'en_route') return 'in_transit';
  if (s === 'done' || s === 'closed' || s === 'discharged') return 'completed';
  return 'pending';
}

function normalizeUrgency(raw: unknown): ReferralRow['urgency'] {
  const s = String(raw ?? 'routine').toLowerCase();
  if (['critical', 'emergency', 'red', 'severe'].includes(s)) return 'critical';
  if (['high', 'urgent', 'yellow', 'moderate'].includes(s)) return 'high';
  return 'routine';
}

function pick(data: Record<string, unknown>, keys: string[], fallback = ''): string {
  for (const k of keys) {
    const val = data[k];
    if (typeof val === 'string' && val.trim()) return val.trim();
    if (typeof val === 'number') return String(val);
  }
  return fallback;
}

function mapDoc(id: string, data: Record<string, unknown>): ReferralRow {
  const createdAt =
    toIso(data.createdAt) ?? toIso(data.created_at) ?? toIso(data.syncedAt) ?? toIso(data.timestamp);
  const status = normalizeStatus(data.status);
  const ageMinutes = createdAt
    ? Math.max(0, Math.round((Date.now() - new Date(createdAt).getTime()) / 60000))
    : null;
  const isOpen = !['completed', 'admitted', 'cancelled'].includes(status);

  const rawAge = data.age ?? data.patientAge;
  const parsedAge = typeof rawAge === 'number' ? rawAge : Number.parseInt(String(rawAge ?? ''), 10);

  return {
    id,
    patientName: pick(data as Record<string, unknown>, ['patientName', 'patient_name', 'name'], 'Unnamed patient'),
    age: Number.isFinite(parsedAge) ? parsedAge : null,
    gender: pick(data as Record<string, unknown>, ['gender', 'sex'], '—'),
    village: pick(data as Record<string, unknown>, ['village', 'villageName', 'location', 'address'], '—'),
    ashaName: pick(data as Record<string, unknown>, ['ashaName', 'asha_name', 'createdByName', 'workerName'], 'ASHA Worker'),
    reason: pick(data as Record<string, unknown>, ['reason', 'referralReason', 'complaint', 'symptoms', 'notes'], '—'),
    urgency: normalizeUrgency(data.urgency ?? data.priority ?? data.severity),
    status,
    facilityId: pick(data as Record<string, unknown>, FACILITY_FIELDS, ''),
    createdAt,
    updatedAt: toIso(data.updatedAt) ?? toIso(data.updated_at),
    ageMinutes,
    slaBreached: isOpen && ageMinutes !== null && ageMinutes > SLA_MINUTES,
  };
}

async function resolveFacilityId(req: Request): Promise<{ facilityId: string | null; source: string }> {
  const header = req.headers.get('authorization') ?? '';
  const token = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : '';

    if (token) {
    try {
      const decoded = await adminAuth().verifyIdToken(token);
      const claimFacility = (decoded.facilityId as string | undefined) ?? undefined;
      if (claimFacility) return { facilityId: claimFacility, source: 'claims' };
      if (decoded.admin === true || decoded.role === 'mo') {
        const url = new URL(req.url);
        const q = url.searchParams.get('facilityId');
        if (q) return { facilityId: q, source: 'admin-query' };
      }
    } catch {
      // fall through to query param — never hard-fail the dashboard
    }
  }

  const url = new URL(req.url);
  const q = url.searchParams.get('facilityId');
  return q ? { facilityId: q, source: 'query' } : { facilityId: null, source: 'none' };
}

export async function GET(req: Request) {
  try {
    const { facilityId, source } = await resolveFacilityId(req);

    if (!facilityId) {
      return NextResponse.json(
        { referrals: [], count: 0, facilityId: null, source, warning: 'No facilityId resolved from token claims or query.' },
        { status: 200, headers: { 'Cache-Control': 'no-store' } },
      );
    }

    const seen = new Map<string, ReferralRow>();

    // Single-field equality queries only -> no composite index required.
    for (const field of FACILITY_FIELDS) {
      try {
        const snap = await adminDb().collection('referrals').where(field, '==', facilityId).limit(300).get();
        snap.forEach((doc) => {
          if (!seen.has(doc.id)) seen.set(doc.id, mapDoc(doc.id, doc.data() as Record<string, unknown>));
        });
        if (seen.size > 0) break; // primary field matched; stop probing aliases
      } catch {
        continue;
      }
    }

    const referrals = Array.from(seen.values()).sort((a, b) => {
      const at = a.createdAt ? new Date(a.createdAt).getTime() : 0;
      const bt = b.createdAt ? new Date(b.createdAt).getTime() : 0;
      return bt - at;
    });

    const openCount = referrals.filter((r) => !['completed', 'admitted', 'cancelled'].includes(r.status)).length;

    return NextResponse.json(
      {
        referrals,
        count: referrals.length,
        openCount,
        breachedCount: referrals.filter((r) => r.slaBreached).length,
        criticalCount: referrals.filter((r) => r.urgency === 'critical').length,
        facilityId,
        source,
        slaMinutes: SLA_MINUTES,
      },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  } catch (error) {
    console.error('[district/referrals] fatal:', error);
    return NextResponse.json(
      { referrals: [], count: 0, openCount: 0, breachedCount: 0, criticalCount: 0, facilityId: null, error: 'fetch_failed' },
      { status: 200, headers: { 'Cache-Control': 'no-store' } },
    );
  }
}
