import React from 'react';

export default function DisclaimerPage() {
    return (
        <div className="container mx-auto max-w-4xl py-16 px-4 space-y-8 text-foreground">
            <h1 className="text-4xl font-extrabold tracking-tight leading-tight border-b border-border pb-4">
                Medical Disclaimer
            </h1>
            
            <p className="text-lg leading-relaxed text-muted-foreground">
                DiagnoVerse is a healthcare workflow and triage-support prototype for SIH demonstration purposes.
            </p>

            <h2 className="text-2xl font-bold mt-8">It does not:</h2>
            <ul className="list-disc pl-8 space-y-2 text-lg text-muted-foreground">
                <li>Diagnose diseases.</li>
                <li>Prescribe medicines.</li>
                <li>Replace a doctor, Medical Officer or other qualified healthcare professional.</li>
                <li>Provide emergency medical services.</li>
                <li>Dispatch or track government ambulances unless an authorised integration is explicitly implemented.</li>
            </ul>

            <p className="text-lg leading-relaxed text-muted-foreground mt-8">
                Risk and urgency results are preliminary, protocol-guided suggestions intended to support workflow prioritization. A qualified Medical Officer must validate or modify the final clinical decision.
            </p>
        </div>
    );
}
