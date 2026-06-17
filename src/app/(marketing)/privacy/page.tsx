import React from "react";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans">
            <main className="max-w-4xl mx-auto px-6 py-16 prose prose-invert prose-slate">
                <h1 className="text-[#F8FAFC] font-bold tracking-tight mb-8">Cryptographic Privacy Framework & Compliance Standard</h1>
                
                <h2 className="text-[#F8FAFC] font-bold mt-12 mb-4">1. Statutory Alignment: DPDP Act 2023 Compliance</h2>
                <p className="leading-relaxed mb-6">
                    DiagnoVerse enforces absolute data protection safeguards designed to comply fully with India’s Digital Personal Data Protection (DPDP) Act 2023. We reject the traditional model of compiling, data-mining, and storing identifiable health records for commercial optimization. Data processing is managed through a localized, ephemeral execution model.
                </p>

                <h2 className="text-[#F8FAFC] font-bold mt-12 mb-4">2. Localized Cryptography & Asset Garbage Collection</h2>
                <ul className="list-disc pl-6 mb-6 space-y-4">
                    <li>
                        <strong>Client-Side Sanitation:</strong> High-resolution optical assets and respiratory audio data frames undergo localized execution memory initialization. They are scaled and transformed directly within the browser V8 runtime engine.
                    </li>
                    <li>
                        <strong>Aggressive Heap Purging:</strong> To counter local device indexing hazards and RAM memory bloat, active asset paths are systematically expunged using aggressive garbage collection via <code>URL.revokeObjectURL(url)</code> immediately after being saved to local IndexedDB or securely transmitted.
                    </li>
                    <li>
                        <strong>Serverless Anonymization:</strong> Upstream endpoints run within isolated serverless environments. Personally Identifiable Information (PII) is completely decoupled. Every single transaction silently invokes an append-only <code>auditLogger.ts</code> process that runs a SHA-256 cryptographic hash of the incoming payload, linking it to a non-identifiable timestamp and triage priority metric within a read-only Firebase Firestore collection.
                    </li>
                </ul>

                <h2 className="text-[#F8FAFC] font-bold mt-12 mb-4">3. Zero Commercialization Policy</h2>
                <p className="leading-relaxed mb-6">
                    Health metrics processed by our AI engines (Gemini 1.5 Flash via Google Genkit) are bound under strict parameter constraints (including a fixed temperature of 0.1 to avoid creative logical processing). No processed health logs, telemetry data, or biometric data layers are shared, leased, or exported to third-party data analytics firms, insurance providers, or advertising networks.
                </p>
            </main>
        </div>
    );
}
