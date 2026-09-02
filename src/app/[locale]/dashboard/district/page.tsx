'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertOctagon, 
  Activity, 
  Users, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  Search,
  Filter,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { TriageTier, ReferralStatus } from '@/lib/diagnoverse/types';

// ─── Mock Data ───────────────────────────────────────────────

interface DashboardReferral {
  id: string;
  mrNo: string;
  patientName: string;
  tier: TriageTier;
  referredFrom: string; // ASHA Name
  assignedPhc: string;
  slaDueTime: string;
  status: ReferralStatus;
  isBreached: boolean;
}

const MOCK_REFERRALS: DashboardReferral[] = [
  {
    id: 'REF-8891',
    mrNo: 'MR-004-992',
    patientName: 'Sunita Devi',
    tier: TriageTier.RED,
    referredFrom: 'Priya Sharma (ASHA)',
    assignedPhc: 'PHC Tendua',
    slaDueTime: '2026-09-02T10:30:00Z',
    status: ReferralStatus.SENT,
    isBreached: true, // Red SLA is usually 1 hour. This is breached.
  },
  {
    id: 'REF-8892',
    mrNo: 'MR-005-112',
    patientName: 'Ramesh Patel',
    tier: TriageTier.ORANGE,
    referredFrom: 'Anita Verma (ASHA)',
    assignedPhc: 'PHC Kachhar',
    slaDueTime: '2026-09-02T19:00:00Z',
    status: ReferralStatus.ARRIVED,
    isBreached: false,
  },
  {
    id: 'REF-8893',
    mrNo: 'MR-005-118',
    patientName: 'Baby Yadav',
    tier: TriageTier.RED,
    referredFrom: 'Kavita Singh (ASHA)',
    assignedPhc: 'PHC Basantpur',
    slaDueTime: '2026-09-02T12:15:00Z',
    status: ReferralStatus.SENT,
    isBreached: true,
  },
  {
    id: 'REF-8894',
    mrNo: 'MR-006-001',
    patientName: 'Kamlesh Rao',
    tier: TriageTier.YELLOW,
    referredFrom: 'Priya Sharma (ASHA)',
    assignedPhc: 'PHC Tendua',
    slaDueTime: '2026-09-03T09:00:00Z',
    status: ReferralStatus.DRAFT,
    isBreached: false,
  },
  {
    id: 'REF-8895',
    mrNo: 'MR-006-044',
    patientName: 'Dinesh Kumar',
    tier: TriageTier.ORANGE,
    referredFrom: 'Sushma Devi (ASHA)',
    assignedPhc: 'CHC Raipur',
    slaDueTime: '2026-09-02T11:00:00Z',
    status: ReferralStatus.CLOSED,
    isBreached: false,
  },
];

// ─── Helpers ─────────────────────────────────────────────────

const TIER_COLORS: Record<TriageTier, string> = {
  [TriageTier.RED]: 'bg-red-100 text-red-800 border-red-200',
  [TriageTier.ORANGE]: 'bg-orange-100 text-orange-800 border-orange-200',
  [TriageTier.YELLOW]: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  [TriageTier.GREEN]: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const STATUS_CONFIG: Record<ReferralStatus, { label: string; icon: any; color: string }> = {
  [ReferralStatus.DRAFT]: { label: 'Pending Device Sync', icon: Clock, color: 'text-slate-500' },
  [ReferralStatus.SENT]: { label: 'In Transit', icon: ArrowUpRight, color: 'text-blue-600' },
  [ReferralStatus.ARRIVED]: { label: 'Arrived at PHC', icon: CheckCircle2, color: 'text-amber-600' },
  [ReferralStatus.CLOSED]: { label: 'Closed / Treated', icon: CheckCircle2, color: 'text-emerald-600' },
};

export default function DistrictDashboardPage() {
  const [search, setSearch] = useState('');

  const activeReferrals = MOCK_REFERRALS.filter(r => r.status !== ReferralStatus.CLOSED).length;
  const breachedCases = MOCK_REFERRALS.filter(r => r.isBreached && r.status !== ReferralStatus.CLOSED).length;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* ─── Metrics Row ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6">
        
        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-blue-50 rounded-full border border-blue-100">
              <Users className="size-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Active Referrals</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-slate-900">{activeReferrals}</h3>
                <span className="text-xs font-medium text-slate-500">across 14 PHCs</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-red-100 shadow-sm ring-1 ring-red-500/10">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-red-50 rounded-full border border-red-100">
              <AlertOctagon className="size-6 text-red-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">SLA Breached Cases</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-red-700">{breachedCases}</h3>
                <span className="text-xs font-medium text-red-500 flex items-center">
                  <ArrowUpRight className="size-3 mr-0.5" /> +2 since yesterday
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white border-slate-200 shadow-sm">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="p-4 bg-emerald-50 rounded-full border border-emerald-100">
              <Activity className="size-6 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-slate-500 mb-1">Diagnostic Availability</p>
              <div className="flex items-baseline gap-2">
                <h3 className="text-3xl font-bold text-slate-900">84%</h3>
                <span className="text-xs font-medium text-slate-500">Active Stock/Docs</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Open Defects Table ─── */}
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">Open Defects & Referral Tracking</CardTitle>
              <CardDescription className="text-slate-500">Monitor SLA compliance and closure rates across all district facilities.</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search MR No, Patient..."
                  className="w-full h-9 pl-9 pr-3 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 text-slate-600 border-slate-300">
                <Filter className="size-4" />
              </Button>
              <Button variant="outline" size="icon" className="h-9 w-9 shrink-0 text-slate-600 border-slate-300">
                <Download className="size-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">Patient MR No</th>
                  <th className="px-6 py-3 font-semibold">Triage Tier</th>
                  <th className="px-6 py-3 font-semibold">Referred From</th>
                  <th className="px-6 py-3 font-semibold">Assigned PHC</th>
                  <th className="px-6 py-3 font-semibold">SLA Due</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {MOCK_REFERRALS.map((ref) => {
                  const statusConf = STATUS_CONFIG[ref.status];
                  const StatusIcon = statusConf.icon;
                  
                  // Format time
                  const timeString = new Date(ref.slaDueTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

                  return (
                    <tr 
                      key={ref.id} 
                      className={cn(
                        "transition-colors hover:bg-slate-50/80",
                        ref.isBreached && ref.status !== ReferralStatus.CLOSED ? "bg-red-50/50" : ""
                      )}
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {ref.mrNo}
                        <div className="text-xs text-slate-500 font-normal">{ref.patientName}</div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={cn("font-bold text-[10px]", TIER_COLORS[ref.tier])}>
                          {ref.tier}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {ref.referredFrom}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {ref.assignedPhc}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <span className={cn(
                            "font-medium",
                            ref.isBreached && ref.status !== ReferralStatus.CLOSED ? "text-red-600 font-bold" : "text-slate-600"
                          )}>
                            Today, {timeString}
                          </span>
                          {ref.isBreached && ref.status !== ReferralStatus.CLOSED && (
                            <Badge className="bg-red-100 text-red-700 border-red-200 hover:bg-red-100 text-[10px] px-1.5 py-0">Breached</Badge>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn("flex items-center gap-1.5 font-medium", statusConf.color)}>
                          <StatusIcon className="size-4" />
                          {statusConf.label}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {MOCK_REFERRALS.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              No active referrals found.
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
