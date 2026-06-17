import React from 'react';

export default function TermsPage() {
  return (
    <div className="container mx-auto min-h-screen py-16 px-4 md:px-6 lg:px-8 max-w-4xl text-muted-foreground">
      <div className="bg-warning/10 border border-warning/20 text-warning p-5 rounded-lg mb-10 shadow-sm">
        <p className="font-medium text-sm md:text-base">
          This document is being finalized in consultation with a healthcare legal advisor under India's DPDP Act 2023 and the CDSCO Medical Device Rules.
        </p>
      </div>

      <h1 className="text-4xl font-bold text-foreground mb-10">Terms of Service</h1>

      <div className="space-y-8 text-muted-foreground">
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-3 pb-2 border-b border-border">1. Introduction and Acceptance</h2>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-3 pb-2 border-b border-border">2. Description of Services</h2>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-3 pb-2 border-b border-border">3. User Responsibilities and Eligibility</h2>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-3 pb-2 border-b border-border">4. Medical Disclaimer and Limitations</h2>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-3 pb-2 border-b border-border">5. Data Privacy and Security</h2>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-3 pb-2 border-b border-border">6. Intellectual Property</h2>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-3 pb-2 border-b border-border">7. Limitation of Liability</h2>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-3 pb-2 border-b border-border">8. Governing Law and Dispute Resolution</h2>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-3 pb-2 border-b border-border">9. Changes to Terms</h2>
        </section>
        <section>
          <h2 className="text-2xl font-semibold text-foreground mb-3 pb-2 border-b border-border">10. Contact Information</h2>
        </section>
      </div>
    </div>
  );
}
