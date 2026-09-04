import { NextResponse } from 'next/server';
import { adminAuth, adminDb } from '@/lib/firebase/admin';

export async function GET(request: Request) {
  try {
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Missing or invalid authorization header.' }, { status: 401 });
    }
    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await adminAuth.verifyIdToken(token);
    const role = decodedToken.role;
    
    // Authorization logic
    let allowedDistrict = null;
    let allowedFacility = null;
    
    if (role === 'district_admin' || role === 'asha' || role === 'admin') {
       allowedDistrict = decodedToken.district_id;
    } else if (role === 'mo') {
       allowedDistrict = decodedToken.district_id;
       allowedFacility = decodedToken.facility_id;
       if (!allowedFacility) {
          return NextResponse.json({ error: 'User token missing facility_id for MO.' }, { status: 403 });
       }
    } else {
       return NextResponse.json({ error: 'Unauthorized role for facility lookup.' }, { status: 403 });
    }

    if (!allowedDistrict) {
      return NextResponse.json({ error: 'User token missing district_id.' }, { status: 403 });
    }

    const facilities: any[] = [];
    
    let docs = [];
    if (allowedFacility) {
       const docSnap = await adminDb.collection('facilities').doc(allowedFacility).get();
       if (docSnap.exists && docSnap.data()?.districtId === allowedDistrict) {
          docs.push(docSnap);
       }
    } else {
       const snap = await adminDb.collection('facilities').where('districtId', '==', allowedDistrict).get();
       docs = snap.docs;
    }

    for (const doc of docs) {
       const facData = doc.data()!;
       facData.id = doc.id;
       
       // Load services subcollection
       const servicesSnap = await doc.ref.collection('services').get();
       facData.services = servicesSnap.docs.map((sDoc: any) => {
          const sData = sDoc.data();
          return {
             serviceId: sDoc.id,
             serviceName: sData.serviceName || sDoc.id,
             category: sData.category || 'CLINICAL',
             availabilityStatus: sData.availabilityStatus || 'UNAVAILABLE',
             operatingDays: sData.operatingDays,
             operatingHours: sData.operatingHours,
             lastUpdatedAt: sData.lastUpdatedAt?.toMillis?.() || Date.now()
          };
       });
       
       facilities.push(facData);
    }

    return NextResponse.json({ facilities });
  } catch (error: any) {
    console.error('API Error /facility/list:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
