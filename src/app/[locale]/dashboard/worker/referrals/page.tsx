'use client';

import { use, useMemo, useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { getOfflineDb } from '@/lib/db/offline-db';
import { SyncStatusBar } from '@/components/sync-status-bar';
import { QRCodeSVG } from 'qrcode.react';

type Urgency = 'ROUTINE' | 'URGENT' | 'EMERGENCY';
type ReferralStatus = 'CREATED' | 'ACCEPTED' | 'CLOSED';

interface PatientRecord {
  id: string;
  name: string;
}

interface ReferralRecord {
  id: string;
  patient_id: string;
  target_facility: string;
  urgency: Urgency;
  status: ReferralStatus;
  timestamp: number | string;
}

interface ReferralRow extends ReferralRecord {
  patientName: string;
  sortKey: number;
}

const ACTIVE_STATUSES: ReadonlySet<ReferralStatus> = new Set<ReferralStatus>([
  'CREATED',
  'ACCEPTED',
]);

const URGENCY_ORDER: Record<Urgency, number> = {
  EMERGENCY: 0,
  URGENT: 1,
  ROUTINE: 2,
};

const URGENCY_BADGE: Record<Urgency, string> = {
  EMERGENCY: 'bg-red-500/10 text-red-400',
  URGENT: 'bg-yellow-500/10 text-yellow-400',
  ROUTINE: 'bg-emerald-500/10 text-emerald-400',
};

function toEpoch(timestamp: number | string): number {
  if (typeof timestamp === 'number') return timestamp;
  const parsed = Date.parse(timestamp);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function formatWhen(epoch: number, locale: string): string {
  if (epoch <= 0) return '—';
  return new Intl.DateTimeFormat(locale, {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(epoch));
}

interface ReferralsPageProps {
  params: Promise<{ locale: string }>;
}

export default function ActiveReferralsPage({ params }: ReferralsPageProps) {
  const { locale } = use(params);
  const [selectedQr, setSelectedQr] = useState<string | null>(null);

  const rows = useLiveQuery<ReferralRow[] | undefined>(async () => {
    const db = getOfflineDb();

    const referrals = (await db.referrals.toArray()) as ReferralRecord[];

    const active = referrals.filter((referral) =>
      ACTIVE_STATUSES.has(referral.status),
    );

    if (active.length === 0) return [];

    const patientIds = Array.from(
      new Set(active.map((referral) => referral.patient_id)),
    );

    const patients = (await db.patients.bulkGet(patientIds as any)) as Array<
      PatientRecord | undefined
    >;

    const nameById = new Map<string, string>();
    patients.forEach((patient) => {
      if (patient) nameById.set(patient.id, patient.name);
    });

    return active
      .map<ReferralRow>((referral) => ({
        ...referral,
        patientName: nameById.get(referral.patient_id) ?? 'Unknown patient',
        sortKey: toEpoch(referral.timestamp),
      }))
      .sort((a, b) => b.sortKey - a.sortKey);
  }, []);

  const isLoading: boolean = rows === undefined;

  const emergencyCount: number = useMemo(
    () => (rows ?? []).filter((row) => row.urgency === 'EMERGENCY').length,
    [rows],
  );

  return (
    <div className="min-h-screen bg-[#0B1120]">
      <SyncStatusBar/>

      <main className="mx-auto w-full max-w-7xl px-4 py-8">
        <header className="mb-6 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-white">
              Active Referrals
            </h1>
            <p className="mt-1 text-sm text-slate-400">
              Live from local storage. Works fully offline.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="rounded-md border border-slate-800 bg-slate-900 px-3 py-1.5 text-xs font-medium text-slate-400">
              Active
              <span className="ml-2 font-semibold tabular-nums text-white">
                {rows?.length ?? 0}
              </span>
            </span>
            {emergencyCount > 0 ? (
              <span className="rounded-md bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400">
                {emergencyCount} emergency
              </span>
            ) : null}
          </div>
        </header>

        <section className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
          {rows === undefined ? (
            <TableSkeleton/>
          ) : rows.length === 0 ? (
            <EmptyState/>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-slate-800">
                    <Th>Patient</Th>
                    <Th>Target Facility</Th>
                    <Th>Urgency</Th>
                    <Th>Status</Th>
                    <Th className="text-right">Raised</Th>
                    <Th className="text-right">Action</Th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row) => (
                    <tr
                      key={row.id}
                      className="border-b border-slate-800 last:border-b-0 transition-colors hover:bg-slate-800/40"
                    >
                      <td className="px-4 py-3">
                        <span className="font-medium text-white">
                          {row.patientName}
                        </span>
                        <span className="mt-0.5 block font-mono text-xs text-slate-400">
                          #{row.id.slice(0, 8)}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-400">
                        {row.target_facility}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-semibold ${URGENCY_BADGE[row.urgency]}`}
                        >
                          {row.urgency}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-md border border-slate-800 bg-slate-800/60 px-2 py-1 text-xs font-medium text-slate-400">
                          <span
                            className="h-1.5 w-1.5 rounded-full bg-slate-400"
                            aria-hidden="true"
                          />
                          {row.status}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right tabular-nums text-slate-400">
                        {formatWhen(row.sortKey, locale)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <button 
                          onClick={() => setSelectedQr(row.id)}
                          className="px-3 py-1.5 bg-slate-800 text-white text-xs font-semibold rounded-md hover:bg-slate-700 transition-colors"
                        >
                          Show QR
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="mt-4 text-xs text-slate-400">
          Sorted newest first. Closed referrals are hidden.
        </p>

        {selectedQr && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm px-4">
            <div className="bg-slate-900 p-6 rounded-2xl w-full max-w-sm flex flex-col items-center border border-slate-800 shadow-2xl">
              <h3 className="text-xl font-bold text-white mb-2">Referral QR Code</h3>
              <p className="text-sm text-slate-400 mb-6 text-center">Show this to the hospital staff upon arrival.</p>
              <div className="p-4 bg-white rounded-xl mb-6 shadow-sm">
                <QRCodeSVG value={selectedQr} size={200} />
              </div>
              <p className="font-mono text-slate-500 text-xs mb-6 break-all text-center">{selectedQr}</p>
              <button 
                onClick={() => setSelectedQr(null)}
                className="w-full py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-colors border border-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function Th({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      scope="col"
      className={`px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-400 ${className}`}
    >
      {children}
    </th>
  );
}

function TableSkeleton() {
  return (
    <div className="divide-y divide-slate-800" aria-busy="true">
      {[0, 1, 2, 3].map((key) => (
        <div key={key} className="flex items-center gap-4 px-4 py-4">
          <div className="h-3 w-40 animate-pulse rounded bg-slate-800" />
          <div className="h-3 w-32 animate-pulse rounded bg-slate-800" />
          <div className="ml-auto h-5 w-20 animate-pulse rounded bg-slate-800" />
        </div>
      ))}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
      <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-slate-800 bg-slate-800/40">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={1.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-6 w-6 text-slate-400"
          aria-hidden="true"
        >
          <path d="M9 12h6M12 9v6" />
          <path d="M20 12a8 8 0 1 1-8-8 8 8 0 0 1 8 8Z" />
        </svg>
      </div>
      <h2 className="text-base font-semibold text-white">No active referrals</h2>
      <p className="mt-1 max-w-sm text-sm text-slate-400">
        Every referral has been closed. New ones you create offline will appear
        here instantly, before they sync.
      </p>
    </div>
  );
}
