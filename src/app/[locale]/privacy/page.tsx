import React from 'react';

export default function PrivacyPage() {
    return (
        <div className="container mx-auto max-w-4xl py-16 px-4 space-y-8 text-foreground">
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight border-b border-border pb-4">
                Privacy Policy – SIH Prototype Version
            </h1>
            
            <p className="text-lg leading-relaxed text-muted-foreground">
                <strong>Scope:</strong> This Privacy Policy explains how the DiagnoVerse SIH prototype handles information used during demonstration and testing. DiagnoVerse is currently a healthcare workflow and triage-support prototype.
            </p>

            <p className="text-lg leading-relaxed text-muted-foreground">
                <strong>Synthetic data only:</strong> The current prototype is intended for synthetic demonstration data only. Please do not enter real patient names, phone numbers, Aadhaar numbers, medical records, photographs, medical reports or other personally identifiable health information into this prototype. Demo records may be reset, changed or deleted as part of testing.
            </p>

            <p className="text-lg leading-relaxed text-muted-foreground">
                <strong>Clinical limitation:</strong> Any risk or urgency shown by the prototype is a preliminary decision-support suggestion. It is not a diagnosis, prescription or treatment recommendation. Final clinical decisions must be made by a qualified healthcare professional.
            </p>
        </div>
    );
}
