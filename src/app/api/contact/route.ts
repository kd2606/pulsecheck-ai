import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase/admin';
import { FieldValue } from 'firebase-admin/firestore';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        
        const { fullName, organization, role, email, location, enquiryType, message, consent } = body;

        // Basic validation
        if (!fullName || !email || !message || !enquiryType || !consent) {
            return NextResponse.json({ error: 'Missing required fields or consent' }, { status: 400 });
        }
        
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Invalid email address' }, { status: 400 });
        }

        const enquiry = {
            fullName,
            organization: organization || '',
            role: role || '',
            email,
            location: location || '',
            enquiryType,
            message,
            consent,
            createdAt: FieldValue.serverTimestamp(),
            status: 'new'
        };

        // Prevent duplicate submissions by generating a deterministic hash or simply relying on Firestore auto ID 
        // if rate limiting is not strictly defined here, we will just store it.
        await adminDb.collection('contact_enquiries').add(enquiry);

        return NextResponse.json({ success: true, message: 'Enquiry received successfully.' }, { status: 200 });

    } catch (error: any) {
        console.error('Contact API error:', error);
        return NextResponse.json({ error: 'Internal server error processing enquiry' }, { status: 500 });
    }
}
