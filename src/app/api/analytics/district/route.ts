import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    
    const role = decodedToken.role;
    const allowedRoles = ['district_admin', 'admin', 'mo'];
    if (!role || typeof role !== 'string' || !allowedRoles.includes(role)) {
       return NextResponse.json({ error: 'Forbidden: Invalid or Missing Role' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const startParam = searchParams.get('startDate');
    const endParam = searchParams.get('endDate');
    let facilityParam = searchParams.get('facilityId');
    
    // Default to last 30 days if not provided
    const now = Date.now();
    const startDate = startParam ? parseInt(startParam) : now - (30 * 24 * 60 * 60 * 1000);
    const endDate = endParam ? parseInt(endParam) : now;

    // Bounded date range check (max 90 days)
    if (endDate - startDate > 90 * 24 * 60 * 60 * 1000) {
      return NextResponse.json({ error: 'Date range cannot exceed 90 days' }, { status: 400 });
    }

    let authorizedFacilityIds = new Set<string>();
    const facilities: any[] = [];

    // Enforce Strict Scope based on verified claims
    if (role === 'mo') {
      if (!decodedToken.facility_id) {
         return NextResponse.json({ error: 'Forbidden: MO missing facility claim' }, { status: 403 });
      }
      // Force the facilityParam to the MO's assigned facility
      facilityParam = decodedToken.facility_id;
      
      const facSnap = await adminDb.collection('facilities').doc(decodedToken.facility_id).get();
      if (facSnap.exists) {
         authorizedFacilityIds.add(facSnap.id);
         facilities.push({ id: facSnap.id, name: facSnap.data()?.name });
      }
    } else {
      // district_admin or admin
      if (role === 'district_admin' && !decodedToken.district_id) {
         return NextResponse.json({ error: 'Forbidden: District Admin missing district claim' }, { status: 403 });
      }
      
      let facilitiesQuery: any = adminDb.collection('facilities');
      if (role === 'district_admin') {
         facilitiesQuery = facilitiesQuery.where('district', '==', decodedToken.district_id);
      }
      const facilitiesSnap = await facilitiesQuery.get();
      
      facilitiesSnap.forEach((doc: any) => {
        authorizedFacilityIds.add(doc.id);
        facilities.push({ id: doc.id, name: doc.data().name });
      });

      if (facilityParam) {
        if (!authorizedFacilityIds.has(facilityParam) && role !== 'admin') {
           return NextResponse.json({ error: 'Forbidden: Facility not in your district' }, { status: 403 });
        }
        authorizedFacilityIds = new Set([facilityParam]);
      }
    }

    if (authorizedFacilityIds.size === 0) {
       return NextResponse.json({
          success: true,
          metrics: {
             totalReferrals: 0, statusCounts: {}, triageCounts: {}, facilityCounts: {},
             averageTurnaroundHours: 0, missingSlaData: 0, pendingReferrals: 0,
             overdueFollowUps: 0, appointments: { total: 0, completed: 0 },
             followUps: { total: 0, completed: 0 }, trend: []
          },
          facilities
       });
    }

    // Fetch Referrals in date range
    const referralsQuery = adminDb.collection('referrals')
      .where('timestamp', '>=', startDate)
      .where('timestamp', '<=', endDate);
    
    const referralsSnap = await referralsQuery.get();
    
    let totalReferrals = 0;
    const statusCounts: Record<string, number> = { CREATED: 0, ACCEPTED: 0, INFO_REQUESTED: 0, REJECTED: 0, CLOSED: 0 };
    const triageCounts: Record<string, number> = { RED: 0, YELLOW: 0, GREEN: 0 };
    const facilityCounts: Record<string, number> = {};
    
    let totalTurnaroundTimeMs = 0;
    let turnaroundCount = 0;
    let missingSlaData = 0;
    let pendingReferrals = 0;

    const triageRecordIds = new Set<string>();
    const referralDocs: any[] = [];

    referralsSnap.forEach(doc => {
      const data = doc.data();
      if (data.target_facility && authorizedFacilityIds.has(data.target_facility)) {
        referralDocs.push({ id: doc.id, ...data });
        if (data.triage_record_id) {
          triageRecordIds.add(data.triage_record_id);
        }
      }
    });

    const triageData: Record<string, string> = {};
    const triageIdsArray = Array.from(triageRecordIds);
    for (let i = 0; i < triageIdsArray.length; i += 30) {
      const chunk = triageIdsArray.slice(i, i + 30);
      if (chunk.length > 0) {
        const tSnap = await adminDb.collection('triage_records').where('__name__', 'in', chunk).get();
        tSnap.forEach(tDoc => {
           triageData[tDoc.id] = tDoc.data().risk_level;
        });
      }
    }

    referralDocs.forEach(data => {
      totalReferrals++;
      
      const status = data.status || 'CREATED';
      if (statusCounts[status] !== undefined) statusCounts[status]++;
      else statusCounts[status] = 1;

      if (status !== 'CLOSED') {
        pendingReferrals++;
      }

      const riskLevel = data.triage_record_id ? (triageData[data.triage_record_id] || 'YELLOW') : 'YELLOW';
      if (triageCounts[riskLevel] !== undefined) triageCounts[riskLevel]++;
      else triageCounts[riskLevel] = 1;

      const facId = data.target_facility;
      if (facId) {
        facilityCounts[facId] = (facilityCounts[facId] || 0) + 1;
      }

      // Calculate SLA: Server timestamps strictly
      if (status === 'CLOSED') {
        const createdMs = typeof data.timestamp === 'number' ? data.timestamp : null;
        let closedMs = null;
        
        if (data.updated_at) {
           closedMs = typeof data.updated_at.toMillis === 'function' ? data.updated_at.toMillis() : (typeof data.updated_at === 'number' ? data.updated_at : null);
        }
        
        if (createdMs && closedMs && closedMs >= createdMs) {
          totalTurnaroundTimeMs += (closedMs - createdMs);
          turnaroundCount++;
        } else {
          missingSlaData++;
        }
      }
    });

    const averageTurnaroundHours = turnaroundCount > 0 
      ? (totalTurnaroundTimeMs / turnaroundCount) / (1000 * 60 * 60) 
      : 0;

    let completedAppointments = 0;
    let totalAppointments = 0;
    const apptsSnap = await adminDb.collection('appointments')
      .where('created_at', '>=', new Date(startDate))
      .where('created_at', '<=', new Date(endDate))
      .get();
      
    apptsSnap.forEach(doc => {
       const data = doc.data();
       if (data.facility_id && authorizedFacilityIds.has(data.facility_id)) {
          totalAppointments++;
          if (data.status === 'COMPLETED') completedAppointments++;
       }
    });

    let overdueFollowUps = 0;
    let completedFollowUps = 0;
    let totalFollowUps = 0;
    
    const tasksSnap = await adminDb.collection('worker_tasks')
      .where('created_at', '>=', new Date(startDate))
      .where('created_at', '<=', new Date(endDate))
      .get();

    const authorizedReferralIds = new Set(referralDocs.map(r => r.id));
    
    tasksSnap.forEach(doc => {
       const data = doc.data();
       if (data.referral_id && authorizedReferralIds.has(data.referral_id)) {
          totalFollowUps++;
          if (data.status === 'COMPLETED') {
             completedFollowUps++;
          } else if (data.due_date && new Date(data.due_date).getTime() < now) {
             overdueFollowUps++;
          }
       }
    });

    const trend: Record<string, number> = {};
    referralDocs.forEach(data => {
      const dateStr = new Date(data.timestamp).toISOString().split('T')[0];
      trend[dateStr] = (trend[dateStr] || 0) + 1;
    });

    const sortedTrend = Object.keys(trend).sort().map(date => ({
      date,
      count: trend[date]
    }));

    return NextResponse.json({
      success: true,
      metrics: {
        totalReferrals,
        statusCounts,
        triageCounts,
        facilityCounts,
        averageTurnaroundHours,
        missingSlaData,
        pendingReferrals,
        overdueFollowUps,
        appointments: { total: totalAppointments, completed: completedAppointments },
        followUps: { total: totalFollowUps, completed: completedFollowUps },
        trend: sortedTrend
      },
      facilities 
    });

  } catch (error: any) {
    console.error('Analytics Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
