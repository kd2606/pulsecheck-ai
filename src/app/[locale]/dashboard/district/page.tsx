'use client';

import { useMemo } from 'react';
import { useAuthClaims } from '@/hooks/useAuthClaims';
import { useDistrictReferrals } from '@/hooks/useDistrictReferrals';
import type { ReferralRow } from '@/app/api/district/referrals/route';

const STATUS_STYLES: Record<ReferralRow['status'], string> = {
  pending: 'bg-amber-500/15 text-amber-200 ring-1 ring-amber-400/30',
  acknowledged: 'bg-sky-500/15 text-sky-200 ring-1 ring-sky-400/30',
  in_transit: 'bg-indigo-500/15 text-indigo-200 ring-1 ring-indigo-400/30',
  admitted: 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30',
  completed: 'bg-emerald-500/15 text-emerald-200 ring-1 ring-emerald-400/30',
  cancelled: 'bg-slate-500/20 text-slate-300 ring-1 ring-slate-400/30',
};

const URGENCY_STYLES: Record<ReferralRow['urgency'], string> = {
  critical: 'bg-rose-500/20 text-rose-200 ring-1 ring-rose-400/40',
  high: 'bg-orange-500/15 text-orange-200 ring-1 ring-orange-400/30',
  routine: 'bg-slate-600/30 text-slate-200 ring-1 ring-slate-400/20',
};

function label(value: string) {
  return value.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function relativeTime(iso: string | null) {
  if (!iso) return '—';
  const mins = Math.max(0, Math.round((Date.now() - new Date(iso).getTime()) / 60000));
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins} min ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ${mins % 60}m ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

function StatCard({ title, value, tone }: { title: string; value: string | number; tone: string }) {
  return (
    <div className="rounded-2xl border border-slate-700/60 bg-slate-800/60 p-5 shadow-lg">
      <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">{title}</p>
      <p className={`mt-2 text-3xl font-bold ${tone}`}>{value}</p>
    </div>
  );
}

export default function DistrictDashboardPage() {
  const { claims, loading: claimsLoading } = useAuthClaims();
  const facilityId = claims?.facilityId ?? null;
  const { referrals, meta, loading, error, lastUpdated, refetch } = useDistrictReferrals(facilityId);

  const slaCompliance = useMemo(() => {
    if (!referrals.length) return '—';
    const ok = referrals.filter((r) => !r.slaBreached).length;
    return `${Math.round((ok / referrals.length) * 100)}%`;
  }, [referrals]);

  const isLoading = claimsLoading || loading;

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-8">
        <header className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-white">District Command Dashboard</h1>
            <p className="mt-1 text-sm text-slate-300">
              {claims?.district ?? 'District'} · Gadchiroli District Hospital
              <span className="ml-2 text-slate-400">({facilityId ?? 'no facility claim'})</span>
            </p>
          </div>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center justify-center rounded-lg bg-sky-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-sky-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
          >
            Refresh data
          </button>
        </header>

        <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total referrals" value={meta?.count ?? 0} tone="text-white" />
          <StatCard title="Active / open" value={meta?.openCount ?? 0} tone="text-sky-300" />
          <StatCard title="SLA breached" value={meta?.breachedCount ?? 0} tone="text-rose-300" />
          <StatCard title="SLA compliance" value={slaCompliance} tone="text-emerald-300" />
        </section>

        <section className="overflow-hidden rounded-2xl border border-slate-700/60 bg-slate-900 shadow-2xl">
          <div className="flex flex-col gap-2 border-b border-slate-700/60 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-semibold text-white">Live Referral Tracking</h2>
              <p className="mt-1 text-sm text-slate-300">
                Real-time referrals assigned to your facility by ASHA workers in the field.
              </p>
            </div>
            <p className="text-xs text-slate-400">
              {lastUpdated ? `Updated ${lastUpdated.toLocaleTimeString()}` : 'Syncing…'}
              {meta?.slaMinutes ? ` · SLA ${meta.slaMinutes} min` : ''}
            </p>
          </div>

          {error && (
            <div className="border-b border-rose-500/30 bg-rose-500/10 px-6 py-3 text-sm text-rose-200">
              Could not reach the referral service: {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-700/60">
              <thead className="bg-slate-800/80">
                <tr>
                  {['Patient', 'Village', 'Reason', 'Urgency', 'Status', 'Raised', 'ASHA'].map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-300"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {isLoading &&
                  Array.from({ length: 3 }).map((_, i) => (
                    <tr key={`skeleton-${i}`}>
                      <td colSpan={7} className="px-6 py-4">
                        <div className="h-4 w-full animate-pulse rounded bg-slate-700/60" />
                      </td>
                    </tr>
                  ))}

                {!isLoading &&
                  referrals.map((r) => (
                    <tr key={r.id} className="transition hover:bg-slate-800/50">
                      <td className="whitespace-nowrap px-6 py-4">
                        <p className="text-sm font-semibold text-slate-100">{r.patientName}</p>
                        <p className="text-xs text-slate-400">
                          {r.age !== null ? `${r.age} yrs` : 'Age N/A'} · {label(r.gender)}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-100">{r.village}</td>
                      <td className="max-w-xs px-6 py-4 text-sm text-slate-200">
                        <span className="line-clamp-2">{r.reason}</span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${URGENCY_STYLES[r.urgency]}`}>
                          {label(r.urgency)}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${STATUS_STYLES[r.status]}`}>
                          {label(r.status)}
                        </span>
                        {r.slaBreached && (
                          <span className="ml-2 text-xs font-semibold text-rose-300">SLA breach</span>
                        )}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        <p className="text-sm text-slate-100">{relativeTime(r.createdAt)}</p>
                        <p className="text-xs text-slate-400">
                          {r.ageMinutes !== null ? `${r.ageMinutes} min elapsed` : '—'}
                        </p>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-slate-200">{r.ashaName}</td>
                    </tr>
                  ))}

                {!isLoading && referrals.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-6 py-16 text-center">
                      <p className="text-base font-semibold text-slate-100">No active referrals found</p>
                      <p className="mt-1 text-sm text-slate-400">
                        Create one from the ASHA portal — it will appear here within seconds.
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
