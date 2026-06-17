import React from 'react';

export default function MedicalDisclaimerPage() {
  return (
    <div className="container mx-auto min-h-screen py-16 px-4 md:px-6 lg:px-8 max-w-4xl text-muted-foreground">
      <div className="bg-warning/10 border border-warning/20 text-warning p-5 rounded-lg mb-10 shadow-sm">
        <p className="font-medium text-sm md:text-base">
          This document is being finalized in consultation with a healthcare legal advisor under India's DPDP Act 2023 and the CDSCO Medical Device Rules.
        </p>
      </div>

      <h1 className="text-4xl font-bold text-foreground mb-10">Medical Disclaimer</h1>

      <div className="space-y-8 text-muted-foreground">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-3 pb-2 border-b border-border">1. Not Medical Advice</h2>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-3 pb-2 border-b border-border">2. Triage and Screening Only</h2>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-3 pb-2 border-b border-border">3. Emergency Situations</h2>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-3 pb-2 border-b border-border">4. Accuracy of AI-Assisted Output</h2>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-3 pb-2 border-b border-border">5. Consultation with Healthcare Professionals</h2>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-3 pb-2 border-b border-border">6. Assumption of Risk</h2>
        </section>
      </div>
    </div>
  );
}
