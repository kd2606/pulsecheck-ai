import { Mail } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="container mx-auto max-w-4xl py-16 px-4 space-y-16 text-muted-foreground">
            {/* Section 1 - Mission */}
            <div className="text-center space-y-6">
                <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
                    Healthcare that reaches where doctors can't.
                </h1>
                <p className="text-xl text-muted-foreground">
                    Built for rural India. Offline-first, AI-assisted, human-supervised triage.
                </p>
            </div>

            {/* Section 2 - The Problem */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">The Problem</h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                    70% of India lives in rural areas, yet access to immediate healthcare advice is severely limited. 
                    The distance to primary health centers and the shortage of medical professionals lead to delayed care 
                    and preventable complications. Healthcare wasn't built for them. We're changing that.
                </p>
            </div>

            {/* Section 3 - What We're Building */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">What We're Building</h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                    DiagnoVerse AI is an offline-first diagnostic platform tailored for rural communities. We empower 
                    families and ASHA workers with reliable tools to screen symptoms, analyze coughs, scan skin conditions, 
                    and evaluate mental wellness—all seamlessly integrated with a 24/7 AI companion, Pulse.
                </p>
                <p className="text-lg leading-relaxed text-slate-300">
                    By providing rapid, AI-assisted triage, we bridge the gap between uncertainty and the right clinical care.
                </p>
            </div>

            {/* Section 4 - Safety */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">Safety & Privacy</h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                    Trust is our core product. We acknowledge the limitations of AI in healthcare, which is why our system is 
                    built with strict, hardcoded emergency overrides. If a critical symptom is detected, the AI is bypassed 
                    instantly, directing the user to dial 108.
                </p>
                <p className="text-lg leading-relaxed text-slate-300">
                    We are actively aligning our architecture with India's DPDP Act 2023 and the CDSCO SaMD guidelines to 
                    ensure end-to-end encrypted health records and anonymous audit logging.
                </p>
            </div>

            {/* Section 5 - Team */}
            <div className="space-y-6">
                <h2 className="text-2xl font-bold text-foreground border-b border-border pb-2">Team Hackboard</h2>
                <p className="text-lg leading-relaxed text-muted-foreground">
                    We are a dedicated team of engineers and designers deeply committed to solving the healthcare accessibility 
                    gap in rural India. We are actively partnering with practicing physicians and ASHA workers to validate every 
                    clinical workflow before public deployment.
                </p>
            </div>

            {/* Section 6 - Contact */}
            <div className="space-y-6 pt-8 text-center">
                <h2 className="text-2xl font-bold text-foreground">Contact Us</h2>
                <p className="text-lg text-muted-foreground pb-4">
                    Have questions or want to partner with us?
                </p>
                <a 
                    href="mailto:team@diagnoverse.in" 
                    className="inline-flex items-center gap-2 bg-[#14B8A6] hover:bg-[#0F9488] text-black font-semibold py-3 px-8 rounded-lg transition-colors"
                >
                    <Mail className="h-5 w-5" />
                    team@diagnoverse.in
                </a>
            </div>
        </div>
    );
}
