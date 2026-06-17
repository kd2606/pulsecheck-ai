import React from "react";

export default function DisclaimerPage() {
    return (
        <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans">
            <main className="max-w-4xl mx-auto px-6 py-16 prose prose-invert prose-slate">
                <h1 className="text-[#F8FAFC] font-bold tracking-tight mb-8">Formal Regulatory Briefing & Medical-Legal Disclaimer</h1>
                
                <h2 className="text-[#F8FAFC] font-bold mt-12 mb-4">1. Operational Boundaries (Non-Diagnostic Tier)</h2>
                <p className="leading-relaxed mb-6">
                    The algorithmic models deployed across the DiagnoVerse network (covering Skin Scan, Vision Scan, Cardio Wellness, Cough Analysis, and Mental Health modules) are designed exclusively for preliminary triage and risk stratification. This application DOES NOT constitute, offer, or replace professional medical diagnosis, definitive clinical prognosis, or direct pharmaceutical treatment plans. All output parameters are generated through probabilistic pattern recognition matrices and lack the holistic diagnostic precision of physical clinical evaluation.
                </p>

                <h2 className="text-[#F8FAFC] font-bold mt-12 mb-4">2. High-Acuity Emergency Intercept & Deterministic Overrides</h2>
                <p className="leading-relaxed mb-4">
                    This application is strictly forbidden from being utilized as a processing channel for unstable, life-threatening, or acute clinical conditions. To enforce this safety layer without relying on server availability, the system integrates a client-side Regex-driven Red-Flag Interceptor. 
                </p>
                <ul className="list-disc pl-6 mb-6 space-y-2">
                    <li>Input sequences containing structural matches for acute symptoms (e.g., "chest pain", "paralysis", "acute respiratory distress") immediately trigger a critical bypass event.</li>
                    <li>The AI pipeline is forcefully terminated to completely avoid the risk of LLM generation latency or logical hallucination.</li>
                    <li>The application unmounts standard operational views to render a non-panic full-screen Emergency Overlay, displaying an instantaneous local emergency utility (108 Ambulance Dialer) and synchronized visual cardiopulmonary resuscitation (CPR) reference sequences.</li>
                </ul>

                <h2 className="text-[#F8FAFC] font-bold mt-12 mb-4">3. Indemnification & Liability Limitation</h2>
                <p className="leading-relaxed mb-6">
                    By initializing an evaluation sequence within this Progressive Web App, the user, health proxy, or supervisor explicitly establishes a data transaction profile governed under an absolute limitation of liability. DiagnoVerse, its core developers, and its clinical advisory board reject any liability for adverse patient outcomes resulting from delayed direct medical treatment, self-directed pharmacological shifts, or misinterpretation of probabilistic triage scores.
                </p>
            </main>
        </div>
    );
}
