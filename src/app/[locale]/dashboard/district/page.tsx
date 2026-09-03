'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  AlertOctagon, Activity, Users, ArrowUpRight, Clock, CheckCircle2, 
  Search, Filter, Download, ScanLine
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { collection, onSnapshot, query, getDocs, doc, updateDoc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase/clientApp';
import { toast } from 'sonner';

// ─── Helpers ─────────────────────────────────────────────────

const TIER_COLORS: Record<string, string> = {
  'RED': 'bg-red-100 text-red-800 border-red-200',
  'ORANGE': 'bg-orange-100 text-orange-800 border-orange-200',
  'YELLOW': 'bg-yellow-100 text-yellow-800 border-yellow-200',
  'GREEN': 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const STATUS_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  'CREATED': { label: 'In Transit', icon: ArrowUpRight, color: 'text-blue-600' },
  'ACCEPTED': { label: 'Arrived at PHC', icon: CheckCircle2, color: 'text-amber-600' },
  'CLOSED': { label: 'Closed / Treated', icon: CheckCircle2, color: 'text-emerald-600' },
};

export default function DistrictDashboardPage() {
  const [search, setSearch] = useState('');
  const [liveReferrals, setLiveReferrals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showScanner, setShowScanner] = useState(false);
  const [scanInput, setScanInput] = useState('');

  // ─── Live Data Fetching ───
  useEffect(() => {
    // We listen to all referrals for the district demo.
    // In production, we'd filter by target_facility matching the logged in DMO's facility.
    const q = query(collection(db, 'referrals'));
    
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      try {
        const referralDocs = snapshot.docs.map(d => ({ fbId: d.id, ...(d.data() as any) }));
        
        // Fetch corresponding patients and triage records
        const enriched = await Promise.all(referralDocs.map(async (ref: any) => {
          // Patient
          let patientName = 'Unknown Patient';
          if (ref.patient_id) {
            const pDoc = await getDoc(doc(db, 'patients', ref.patient_id));
            if (pDoc.exists()) patientName = (pDoc.data() as any).name;
          }

          // Triage for risk level
          let tier = 'YELLOW'; // Default
          if (ref.triage_record_id) {
            const tDoc = await getDoc(doc(db, 'triage_records', ref.triage_record_id));
            if (tDoc.exists()) tier = (tDoc.data() as any).risk_level;
          }

          // Compute SLA Breach (mock logic for demo: RED breached if > 1 hour old)
          const ageMs = Date.now() - (ref.timestamp || Date.now());
          const isBreached = (tier === 'RED' && ageMs > 3600000) || (tier === 'YELLOW' && ageMs > 86400000);

          return {
            ...ref,
            patientName,
            tier,
            isBreached
          };
        }));

        setLiveReferrals(enriched.sort((a: any, b: any) => b.timestamp - a.timestamp));
      } catch (err) {
        console.error("Error fetching live data", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  const activeReferrals = liveReferrals.filter(r => r.status !== 'CLOSED').length;
  const breachedCases = liveReferrals.filter(r => r.isBreached && r.status !== 'CLOSED').length;

  const handleManualScan = async () => {
    if (!scanInput) return;
    
    // Find referral in our live list by referral ID
    const referral = liveReferrals.find(r => r.id === scanInput || r.fbId === scanInput);
    
    if (!referral) {
      toast.error('Invalid QR Code or Referral Not Found');
      return;
    }

    try {
      await updateDoc(doc(db, 'referrals', referral.fbId), {
        status: 'ACCEPTED',
        updated_at: Date.now(),
        rev: (referral.rev || 0) + 1
      });
      toast.success('Patient Arrived! Status updated to ACCEPTED.');
      setScanInput('');
      setShowScanner(false);
    } catch (error: any) {
      toast.error('Failed to update status: ' + error.message);
    }
  };

  const handleMarkTreated = async (fbId: string, currentRev: number) => {
    try {
      await updateDoc(doc(db, 'referrals', fbId), {
        status: 'CLOSED',
        updated_at: Date.now(),
        rev: (currentRev || 0) + 1
      });
      toast.success('Case Closed Successfully');
    } catch (error: any) {
      toast.error('Failed to close case: ' + error.message);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* ─── Scanner Modal ─── */}
      {showScanner && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-white p-6 rounded-2xl shadow-2xl w-full max-w-md">
            <h3 className="text-xl font-bold mb-4 text-slate-900">Scan Patient QR</h3>
            <p className="text-sm text-slate-500 mb-6">In a real environment, this activates the webcam. For this demo, enter the Referral ID.</p>
            
            <div className="space-y-4">
              <input 
                type="text" 
                placeholder="Enter Referral ID (e.g. ref-1234)"
                className="w-full h-12 px-4 rounded-xl border border-slate-300 focus:ring-2 focus:ring-blue-500 outline-none"
                value={scanInput}
                onChange={(e) => setScanInput(e.target.value)}
              />
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1 h-12" onClick={() => setShowScanner(false)}>Cancel</Button>
                <Button className="flex-1 h-12 bg-blue-600 hover:bg-blue-700" onClick={handleManualScan}>Simulate Scan</Button>
              </div>
            </div>
          </div>
        </div>
      )}

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
                <h3 className="text-3xl font-bold text-slate-900">{loading ? '-' : activeReferrals}</h3>
                <span className="text-xs font-medium text-slate-500">Live from Field</span>
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
                <h3 className="text-3xl font-bold text-red-700">{loading ? '-' : breachedCases}</h3>
                <span className="text-xs font-medium text-red-500 flex items-center">
                  Requires Attention
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-blue-600 border-blue-700 shadow-lg cursor-pointer hover:bg-blue-700 transition-colors" onClick={() => setShowScanner(true)}>
          <CardContent className="p-6 flex items-center justify-between h-full">
            <div>
              <p className="text-blue-100 font-medium mb-1">Incoming Patient?</p>
              <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                <ScanLine className="size-6" /> Scan QR Code
              </h3>
            </div>
            <div className="p-3 bg-white/10 rounded-full">
              <ArrowUpRight className="size-6 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ─── Open Defects Table ─── */}
      <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
        <CardHeader className="border-b border-slate-100 bg-slate-50/50 pb-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle className="text-lg font-semibold text-slate-900">Live Referral Tracking</CardTitle>
              <CardDescription className="text-slate-500">Syncs instantly when ASHA workers update data offline.</CardDescription>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Search Referral ID..."
                  className="w-full h-9 pl-9 pr-3 text-sm rounded-md border border-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 font-semibold">Patient Name</th>
                  <th className="px-6 py-3 font-semibold">Triage Tier</th>
                  <th className="px-6 py-3 font-semibold">Referral ID</th>
                  <th className="px-6 py-3 font-semibold">Assigned PHC</th>
                  <th className="px-6 py-3 font-semibold">Status</th>
                  <th className="px-6 py-3 font-semibold">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {liveReferrals.filter(r => r.id.toLowerCase().includes(search.toLowerCase()) || r.patientName.toLowerCase().includes(search.toLowerCase())).map((ref) => {
                  const statusConf = STATUS_CONFIG[ref.status] || STATUS_CONFIG['CREATED'];
                  const StatusIcon = statusConf.icon;
                  
                  return (
                    <tr 
                      key={ref.fbId} 
                      className={cn(
                        "transition-colors hover:bg-slate-50/80",
                        ref.isBreached && ref.status !== 'CLOSED' ? "bg-red-50/50" : ""
                      )}
                    >
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {ref.patientName}
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="outline" className={cn("font-bold text-[10px]", TIER_COLORS[ref.tier] || TIER_COLORS['YELLOW'])}>
                          {ref.tier}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-slate-600 font-mono text-xs">
                        {ref.id}
                      </td>
                      <td className="px-6 py-4 font-medium text-slate-700">
                        {ref.target_facility || 'PHC Default'}
                      </td>
                      <td className="px-6 py-4">
                        <div className={cn("flex items-center gap-1.5 font-medium", statusConf.color)}>
                          <StatusIcon className="size-4" />
                          {statusConf.label}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {ref.status === 'ACCEPTED' && (
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="h-8 text-emerald-600 border-emerald-200 hover:bg-emerald-50"
                            onClick={() => handleMarkTreated(ref.fbId, ref.rev)}
                          >
                            Mark Treated
                          </Button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {!loading && liveReferrals.length === 0 && (
            <div className="text-center py-12 text-slate-500">
              <div className="flex justify-center mb-4"><Activity className="size-12 text-slate-300" /></div>
              No active referrals found. Create one from the ASHA portal!
            </div>
          )}
          {loading && (
            <div className="text-center py-12 text-slate-500">
              <Activity className="size-8 animate-spin mx-auto text-blue-500 mb-4" />
              Syncing live data from field...
            </div>
          )}
        </CardContent>
      </Card>

    </div>
  );
}
