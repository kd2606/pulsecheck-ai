import React from 'react';

export default function AboutPage() {
    return (
        <div className="container mx-auto max-w-4xl py-16 px-4 space-y-8 text-foreground">
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight border-b border-border pb-4">
                About DiagnoVerse: Healthcare coordination for rural and underserved communities
            </h1>
            
            <p className="text-lg leading-relaxed text-muted-foreground">
                DiagnoVerse is an SIH prototype designed to improve referral coordination and continuity of care in rural and underserved communities. The platform connects ASHA workers, Medical Officers, public healthcare facilities and district health teams through one coordinated workflow.
            </p>

            <h2 className="text-2xl font-bold mt-8">What DiagnoVerse does not claim:</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
                DiagnoVerse does not independently diagnose diseases, prescribe medicines, replace qualified healthcare professionals, dispatch ambulances, or guarantee that a facility has live service availability. The system is designed to complement—not replace—existing public-health programmes, ASHA workers, Medical Officers, public hospitals, emergency services and official health-data systems.
            </p>

            <h2 className="text-2xl font-bold mt-8">Current prototype status:</h2>
            <p className="text-lg leading-relaxed text-muted-foreground">
                The current version is an SIH demonstration prototype and uses synthetic demonstration data. It is not approved for clinical deployment and must not be used as a substitute for professional medical advice or emergency care.
            </p>
        </div>
    );
}
