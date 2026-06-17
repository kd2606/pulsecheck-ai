import React from "react";

export default function AboutPage() {
    return (
        <div className="min-h-screen bg-[#0B1120] text-slate-300 font-sans">
            <main className="max-w-4xl mx-auto px-6 py-16 prose prose-invert prose-slate">
                <h1 className="text-[#F8FAFC] font-bold tracking-tight mb-8">Deep-Tier Technical Blueprint & Organizational Vision</h1>
                
                <h2 className="text-[#F8FAFC] font-bold mt-12 mb-4">1. Executive Mandate & Architectural Vision</h2>
                <p className="leading-relaxed mb-6">
                    DiagnoVerse (PulseCheck AI) is an engineered last-mile healthcare infrastructure designed to eliminate the fatal latency constraints of the "Golden Hour" across rural India. In regional ecosystems where the local physician density sits at a stark 1:10,000 ratio, initial clinical data is lost, allowing survivable anomalies to degrade into acute crises. Founded by Lead Engineer Krrish Dewangan, DiagnoVerse bypasses traditional SaaS operational dependencies by functioning entirely as an edge-first, network-agnostic primary triage platform. 
                </p>

                <h2 className="text-[#F8FAFC] font-bold mt-12 mb-4">2. Engineering Paradigm Shift: Surviving the Last Mile</h2>
                <p className="leading-relaxed mb-6">
                    Our engineering framework assumes that mobile networks are inherently unstable (2G/EDGE standard) and smartphone hardware in rural sectors is strictly resource-constrained (shared devices with low active RAM heaps). By offloading primary file compression to an offscreen HTML5 canvas execution tier, we compress 10MB diagnostic payloads down to ~400KB WebP files directly in the browser runtime. This prevents upstream network timeouts (HTTP 413) and keeps the UI running smoothly. When connectivity fails entirely, an asynchronous transactional IndexedDB queue safely warehouses the encrypted payloads locally, flushing to our serverless endpoints sequentially only upon deterministic network restoration via foreground listeners.
                </p>

                <h2 className="text-[#F8FAFC] font-bold mt-12 mb-4">3. Collaborative Synthesis</h2>
                <p className="leading-relaxed mb-6">
                    We do not operate as an autonomous diagnostic authority. The underlying neural architecture serves strictly as a high-throughput pre-processor and administrative co-pilot. By converting raw user reports into structured clinical summaries, we optimize the operational capacity of Accredited Social Health Activists (ASHA workers) and local primary clinics, shifting healthcare from reactive emergency intervention to predictive edge screening.
                </p>
            </main>
        </div>
    );
}
