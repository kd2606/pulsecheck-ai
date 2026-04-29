"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/firebase/clientApp";

// ─── Brand colors ──────────────────────────────────────────────────────────
const TEAL = "#00BFA5";
const NAVY = "#0A0F1A";

// ─── Scroll-fade hook ──────────────────────────────────────────────────────
function useFadeIn() {
    const ref = useRef<HTMLDivElement>(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const obs = new IntersectionObserver(
            ([entry]) => { if (entry.isIntersecting) { el.style.opacity = "1"; el.style.transform = "translateY(0)"; } },
            { threshold: 0.15 }
        );
        obs.observe(el);
        return () => obs.disconnect();
    }, []);
    return ref;
}

const APK_URL = "https://expo.dev/artifacts/eas/a4cyVYKBAo1t1yKs552SYf4.apk";

// ─── Install Details Component for Landing Page ────────────────────────────
function InstallTooltip({ children }: { children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false);
    return (
        <div style={{ position: "relative", display: "inline-block" }}>
            <div 
                onMouseEnter={() => setIsOpen(true)} 
                onMouseLeave={() => setIsOpen(false)}
                onClick={() => setIsOpen(!isOpen)}
            >
                {children}
            </div>
            {isOpen && (
                <div style={{
                    position: "absolute",
                    bottom: "100%",
                    left: "50%",
                    transform: "translateX(-50%)",
                    marginBottom: "12px",
                    width: "240px",
                    background: "#000",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: "12px",
                    padding: "16px",
                    boxShadow: "0 10px 40px rgba(0,0,0,0.5)",
                    zIndex: 100,
                    textAlign: "left"
                }}>
                    <div style={{ color: TEAL, fontWeight: 700, fontSize: "14px", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                        <span>📱</span> How to install:
                    </div>
                    <ol style={{ margin: 0, paddingLeft: "16px", fontSize: "12px", color: "rgba(255,255,255,0.8)", lineHeight: 1.6 }}>
                        <li style={{ paddingBottom: "4px" }}>Click Download APK</li>
                        <li style={{ paddingBottom: "4px" }}>Open downloaded file</li>
                        <li style={{ paddingBottom: "4px" }}>Allow 'Install unknown apps' if prompted</li>
                        <li>Install & enjoy!</li>
                    </ol>
                    <div style={{
                        position: "absolute",
                        bottom: "-6px",
                        left: "50%",
                        transform: "translateX(-50%) rotate(45deg)",
                        width: "12px",
                        height: "12px",
                        background: "#000",
                        borderRight: "1px solid rgba(255,255,255,0.1)",
                        borderBottom: "1px solid rgba(255,255,255,0.1)",
                    }} />
                </div>
            )}
        </div>
    );
}

function FadeSection({ children, className = "" }: { children: React.ReactNode; className?: string }) {
    const ref = useFadeIn();
    return (
        <div
            ref={ref}
            className={className}
            style={{ opacity: 0, transform: "translateY(28px)", transition: "opacity 0.65s ease, transform 0.65s ease" }}
        >
            {children}
        </div>
    );
}

// ─── Animated particles canvas ─────────────────────────────────────────────
function ParticleCanvas() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        let w = canvas.width = canvas.offsetWidth;
        let h = canvas.height = canvas.offsetHeight;

        const pts = Array.from({ length: 60 }, () => ({
            x: Math.random() * w, y: Math.random() * h,
            r: Math.random() * 2 + 1,
            vx: (Math.random() - 0.5) * 0.4, vy: (Math.random() - 0.5) * 0.4,
            a: Math.random() * 0.5 + 0.1,
        }));

        let raf: number;
        function draw() {
            ctx!.clearRect(0, 0, w, h);
            pts.forEach((p) => {
                p.x += p.vx; p.y += p.vy;
                if (p.x < 0 || p.x > w) p.vx *= -1;
                if (p.y < 0 || p.y > h) p.vy *= -1;
                ctx!.beginPath();
                ctx!.arc(p.x, p.y, p.r, 0, Math.PI * 2);
                ctx!.fillStyle = `rgba(0,191,165,${p.a})`;
                ctx!.fill();
            });
            // Draw connecting lines
            pts.forEach((a, i) => pts.slice(i + 1).forEach((b) => {
                const d = Math.hypot(a.x - b.x, a.y - b.y);
                if (d < 120) {
                    ctx!.beginPath();
                    ctx!.moveTo(a.x, a.y); ctx!.lineTo(b.x, b.y);
                    ctx!.strokeStyle = `rgba(0,191,165,${0.08 * (1 - d / 120)})`;
                    ctx!.lineWidth = 0.6;
                    ctx!.stroke();
                }
            }));
            raf = requestAnimationFrame(draw);
        }
        draw();
        const onResize = () => { w = canvas.width = canvas.offsetWidth; h = canvas.height = canvas.offsetHeight; };
        window.addEventListener("resize", onResize);
        return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", onResize); };
    }, []);
    return <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none" />;
}

// ─── Dashboard mocckup ─────────────────────────────────────────────────────
function DashboardMockup() {
    return (
        <div
            style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,191,165,0.25)", borderRadius: 16, padding: "20px", backdropFilter: "blur(8px)", minWidth: 280, maxWidth: 380 }}
            className="w-full shadow-2xl"
        >
            <div className="flex items-center gap-2 mb-4">
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#ff5f57" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#febc2e" }} />
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#28c840" }} />
                <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginLeft: 8 }}>Diagnoverse AI — Dashboard</span>
            </div>
            {/* Holistic Score */}
            <div style={{ background: "rgba(0,191,165,0.08)", border: "1px solid rgba(0,191,165,0.2)", borderRadius: 10, padding: "12px 16px", marginBottom: 10 }}>
                <div style={{ fontSize: 11, color: TEAL, marginBottom: 4 }}>🌿 Holistic Health Score</div>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 36, fontWeight: 800, color: "#fff" }}>78</div>
                    <div style={{ flex: 1 }}>
                        <div style={{ height: 6, background: "rgba(255,255,255,0.1)", borderRadius: 3, overflow: "hidden" }}>
                            <div style={{ width: "78%", height: "100%", background: TEAL, borderRadius: 3 }} />
                        </div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 4 }}>Good — keep it up!</div>
                    </div>
                </div>
            </div>
            {/* Mini cards row */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
                {[
                    { icon: "🤒", label: "Last Symptom", val: "2 days ago" },
                    { icon: "😊", label: "Mental Score", val: "82 / 100" },
                    { icon: "👁️", label: "Vision", val: "No fatigue" },
                    { icon: "🎤", label: "Cough", val: "Dry, mild" },
                ].map((c) => (
                    <div key={c.label} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 8, padding: "8px 10px" }}>
                        <div style={{ fontSize: 13 }}>{c.icon}</div>
                        <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{c.label}</div>
                        <div style={{ fontSize: 12, color: "#fff", fontWeight: 600 }}>{c.val}</div>
                    </div>
                ))}
            </div>
            {/* Pulse bar */}
            <div style={{ background: "rgba(0,191,165,0.06)", border: "1px solid rgba(0,191,165,0.15)", borderRadius: 8, padding: "8px 12px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: "50%", background: TEAL, boxShadow: `0 0 6px ${TEAL}` }} />
                <span style={{ fontSize: 11, color: TEAL }}>Pulse is ready to help you 🤖</span>
            </div>
        </div>
    );
}

// ─── Pulse chat mockup ────────────────────────────────────────────────────
function ChatMockup() {
    const messages = [
        { role: "user", text: "mujhe bukhar hai aur sar dard ho raha hai" },
        { role: "ai", text: "🟡 Sounds like viral fever. Monitor for 24-48 hrs. Take rest and stay hydrated. If temp > 103°F, see a doctor." },
        { role: "user", text: "chest mein bahut dard ho raha hai" },
        { role: "ai", text: "🔴 URGENT: Chest pain can indicate a cardiac emergency. Call 108 immediately. Please do not ignore this." },
    ];
    return (
        <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(0,191,165,0.2)", borderRadius: 16, overflow: "hidden", maxWidth: 360, width: "100%" }}>
            {/* Header */}
            <div style={{ background: "rgba(0,191,165,0.1)", borderBottom: "1px solid rgba(0,191,165,0.2)", padding: "12px 16px", display: "flex", alignItems: "center", gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: "50%", background: TEAL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>🤖</div>
                <div>
                    <div style={{ fontWeight: 700, color: "#fff", fontSize: 13 }}>Pulse</div>
                    <div style={{ fontSize: 10, color: TEAL }}>● Online — Health Agent</div>
                </div>
            </div>
            {/* Messages */}
            <div style={{ padding: "14px", display: "flex", flexDirection: "column", gap: 10 }}>
                {messages.map((m, i) => (
                    <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
                        <div style={{
                            maxWidth: "82%", padding: "8px 12px", borderRadius: m.role === "user" ? "12px 12px 2px 12px" : "12px 12px 12px 2px",
                            background: m.role === "user" ? "rgba(0,191,165,0.3)" : "rgba(255,255,255,0.07)",
                            color: "#fff", fontSize: 12, lineHeight: 1.5,
                        }}>
                            {m.text}
                        </div>
                    </div>
                ))}
            </div>
            {/* Input bar */}
            <div style={{ borderTop: "1px solid rgba(255,255,255,0.07)", padding: "10px 14px", display: "flex", alignItems: "center", gap: 8 }}>
                <div style={{ flex: 1, background: "rgba(255,255,255,0.06)", borderRadius: 20, padding: "6px 14px", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>Apne symptoms batao...</div>
                <div style={{ width: 30, height: 30, borderRadius: "50%", background: TEAL, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>➤</div>
            </div>
        </div>
    );
}

// ─── Feature cards data ────────────────────────────────────────────────────
const features = [
    { icon: "🤒", title: "Symptom Checker", desc: "Describe symptoms in Hindi or English and get an instant AI diagnosis", href: "/en/symptom-checker" },
    { icon: "🔬", title: "Skin & Vision Scan", desc: "AI-powered analysis of skin conditions and eye fatigue from a photo", href: "/en/skin-scan" },
    { icon: "🧠", title: "Mental Health Screen", desc: "Private mental wellness assessment with a personalised report", href: "/en/mental-health-screen" },
    { icon: "🏛️", title: "Govt Schemes Finder", desc: "Discover free healthcare schemes you're eligible for in seconds", href: "/en/govt-schemes" },
    { icon: "🤖", title: "Pulse Health Agent", desc: "24/7 Hindi/English AI chat that knows your health history", href: "/en/dashboard" },
    { icon: "📋", title: "Health Records", desc: "Every result auto-saved and organised — your full health history", href: "/en/health-records" },
];

const steps = [
    { num: "1", title: "Sign up free in 30 seconds", desc: "No credit card. No hospital visits. Just your phone." },
    { num: "2", title: "Describe symptoms or upload a scan", desc: "Works in Hindi, English and Hinglish." },
    { num: "3", title: "Get instant AI-powered results", desc: "Verified verdict, home care tips & doctor escalation if needed." },
];

const stats = [
    { icon: "🏥", stat: "82,000+", label: "villages without health centres" },
    { icon: "👨‍⚕️", stat: "1:10,000", label: "doctor-to-patient ratio in rural India" },
    { icon: "⏰", stat: "60%", label: "deaths due to delayed medical attention" },
];

// ─── MAIN PAGE ─────────────────────────────────────────────────────────────
export default function LandingPage() {
    const router = useRouter();
    const [authChecked, setAuthChecked] = useState(false);

    useEffect(() => {
        const unsub = onAuthStateChanged(auth, (user) => {
            if (user) router.replace("/en/dashboard");
            else setAuthChecked(true);
        });
        return () => unsub();
    }, [router]);

    if (!authChecked) {
        return (
            <div style={{ minHeight: "100vh", background: NAVY, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div style={{ width: 40, height: 40, border: `3px solid ${TEAL}`, borderTopColor: "transparent", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
        );
    }

    return (
        <div style={{ background: NAVY, color: "#fff", fontFamily: "system-ui, -apple-system, sans-serif", scrollBehavior: "smooth" }}>

            {/* ═══ NAVBAR ═══════════════════════════════════════════════════════════ */}
            <nav style={{ position: "sticky", top: 0, zIndex: 50, background: "rgba(10,15,26,0.85)", backdropFilter: "blur(16px)", borderBottom: "1px solid rgba(255,255,255,0.06)", padding: "0 5vw" }}>
                <div style={{ maxWidth: 1200, margin: "0 auto", display: "flex", alignItems: "center", justifyContent: "space-between", height: 64 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={{ width: 34, height: 34, background: TEAL, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 16, color: "#fff" }}>P</div>
                        <span style={{ fontWeight: 800, fontSize: 18, letterSpacing: -0.5 }}>Diagnoverse <span style={{ color: TEAL }}>AI</span></span>
                    </div>
                    <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
                        <Link href="/en/login" style={{ color: "rgba(255,255,255,0.75)", fontSize: 14, fontWeight: 500, textDecoration: "none", padding: "8px 16px" }}>
                            Sign In
                        </Link>
                        <Link href="/en/signup" style={{ background: TEAL, color: "#fff", fontSize: 14, fontWeight: 700, padding: "8px 20px", borderRadius: 8, textDecoration: "none" }}>
                            Try Free
                        </Link>
                    </div>
                </div>
            </nav>

            {/* ═══ SECTION 1 — HERO ═════════════════════════════════════════════════ */}
            <section style={{ minHeight: "calc(100vh - 64px)", position: "relative", overflow: "hidden", display: "flex", alignItems: "center", padding: "60px 5vw" }}>
                <ParticleCanvas />
                {/* Pulse glow blob */}
                <div style={{ position: "absolute", top: "30%", left: "20%", width: 600, height: 600, borderRadius: "50%", background: `radial-gradient(circle, rgba(0,191,165,0.08) 0%, transparent 70%)`, pointerEvents: "none", transform: "translate(-50%,-50%)" }} />

                <div style={{ maxWidth: 1200, margin: "0 auto", width: "100%", display: "flex", alignItems: "center", gap: 60, flexWrap: "wrap", position: "relative" }}>
                    {/* Left content */}
                    <div style={{ flex: "1 1 400px" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: "rgba(0,191,165,0.1)", border: `1px solid rgba(0,191,165,0.3)`, borderRadius: 20, padding: "5px 14px", marginBottom: 24, fontSize: 13, color: TEAL, fontWeight: 600 }}>
                            🇮🇳 Built for Rural Bharat
                        </div>
                        <h1 style={{ fontSize: "clamp(2.2rem, 5vw, 3.8rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: 20, letterSpacing: -1 }}>
                            Healthcare for <br /><span style={{ color: TEAL }}>Every Indian.</span>
                        </h1>
                        <p style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)", color: "rgba(255,255,255,0.65)", lineHeight: 1.7, maxWidth: 500, marginBottom: 36 }}>
                            AI-powered health platform with symptom checker, skin scan, mental health screening & more — <strong style={{ color: "#fff" }}>completely free.</strong>
                        </p>
                        <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
                            <Link href="/en/signup" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: TEAL, color: "#fff", fontWeight: 700, fontSize: 16, padding: "14px 28px", borderRadius: 10, textDecoration: "none", boxShadow: `0 4px 24px rgba(0,191,165,0.4)` }}>
                                🚀 Try for Free
                            </Link>
                            <a href="#how-it-works" style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: "#fff", fontWeight: 600, fontSize: 16, padding: "14px 28px", borderRadius: 10, textDecoration: "none", border: "1.5px solid rgba(255,255,255,0.2)" }}>
                                ▶ See How it Works
                            </a>
                        </div>
                        <div style={{ marginTop: 16 }}>
                            <Link
                                href="/en/login"
                                style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", textDecoration: "none", fontWeight: 500 }}
                                onClick={async (e) => {
                                    e.preventDefault();
                                    window.location.href = "/en/login?demo=1";
                                }}
                            >
                                👀 Preview without signup →
                            </Link>
                        </div>
                        {/* APK Download Button — hero shortcut */}
                        <div style={{ marginTop: 12 }}>
                            <a
                                href={APK_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => console.log('APK Download clicked')}
                                style={{
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    gap: 8,
                                    background: TEAL,
                                    color: "#fff",
                                    fontWeight: 700,
                                    fontSize: 15,
                                    padding: "13px 24px",
                                    borderRadius: 10,
                                    textDecoration: "none",
                                    boxShadow: `0 4px 20px rgba(0,191,165,0.3)`,
                                    marginBottom: 6,
                                }}
                            >
                                📱 Download Android App (Free APK)
                            </a>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", textAlign: "center" }}>
                                ⭐ Free • No Play Store needed
                            </div>
                        </div>

                        {/* Android Download Section */}
                        <div style={{ marginTop: 32, paddingTop: 32, borderTop: "1px solid rgba(255,255,255,0.1)" }}>
                            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 10 }}>
                                <Link 
                                    href="/en/login"
                                    style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "transparent", color: "#fff", fontWeight: 600, fontSize: 15, padding: "12px 24px", borderRadius: 10, textDecoration: "none", border: `1.5px solid ${TEAL}` }}
                                >
                                    🌐 Open Web App
                                </Link>
                                <InstallTooltip>
                                    <a 
                                        href={APK_URL}
                                        onClick={() => console.log('APK Download clicked')}
                                        style={{ display: "inline-flex", alignItems: "center", gap: 8, background: TEAL, color: "#fff", fontWeight: 700, fontSize: 15, padding: "12px 24px", borderRadius: 10, textDecoration: "none", boxShadow: `0 4px 20px rgba(0,191,165,0.3)` }}
                                    >
                                        📱 Download Android App ↓
                                    </a>
                                </InstallTooltip>
                            </div>
                            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.4)", display: "flex", alignItems: "center", gap: 6 }}>
                                ⭐ Free • No Play Store needed • Direct APK install
                            </div>
                        </div>

                        <div style={{ marginTop: 40, display: "flex", gap: 28, flexWrap: "wrap" }}>
                            {[["100%", "Free Forever"], ["5+", "AI Health Tools"], ["24/7", "Pulse Agent"]].map(([v, l]) => (
                                <div key={l}>
                                    <div style={{ fontSize: 22, fontWeight: 800, color: TEAL }}>{v}</div>
                                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)" }}>{l}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                    {/* Right: Dashboard mockup */}
                    <div style={{ flex: "0 1 400px", display: "flex", justifyContent: "center" }}>
                        <DashboardMockup />
                    </div>
                </div>
            </section>

            {/* ═══ SECTION 2 — PROBLEM ══════════════════════════════════════════════ */}
            <section style={{ padding: "100px 5vw", background: "rgba(0,0,0,0.3)", textAlign: "center" }}>
                <FadeSection>
                    <p style={{ fontSize: "clamp(1.6rem, 3.5vw, 2.6rem)", fontWeight: 800, lineHeight: 1.25, marginBottom: 12 }}>
                        <span style={{ color: TEAL }}>70% of India</span> lives in rural areas.
                    </p>
                    <p style={{ color: "rgba(255,255,255,0.55)", fontSize: "1.1rem", marginBottom: 60 }}>
                        Yet most healthcare platforms are built for cities.
                    </p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 24, maxWidth: 900, margin: "0 auto 56px" }}>
                        {stats.map((s) => (
                            <div key={s.stat} style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "28px 20px" }}>
                                <div style={{ fontSize: 32, marginBottom: 8 }}>{s.icon}</div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: TEAL, marginBottom: 6 }}>{s.stat}</div>
                                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.5 }}>{s.label}</div>
                            </div>
                        ))}
                    </div>
                    <p style={{ fontSize: "1.15rem", fontWeight: 700 }}>
                        Diagnoverse AI changes this. <span style={{ color: TEAL }}>Free. For everyone.</span>
                    </p>
                </FadeSection>
            </section>

            {/* ═══ SECTION 3 — FEATURES ══════════════════════════════════════════════ */}
            <section style={{ padding: "100px 5vw" }}>
                <FadeSection>
                    <h2 style={{ textAlign: "center", fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 800, marginBottom: 12 }}>
                        Everything You Need. <span style={{ color: TEAL }}>One Platform.</span>
                    </h2>
                    <p style={{ textAlign: "center", color: "rgba(255,255,255,0.5)", marginBottom: 56 }}>Six powerful health tools, designed for Bharat.</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20, maxWidth: 1100, margin: "0 auto" }}>
                        {features.map((f) => (
                            <Link
                                key={f.title}
                                href={f.href}
                                style={{ display: "block", background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", borderRadius: 14, padding: "28px 24px", textDecoration: "none", color: "inherit", transition: "border-color 0.25s, transform 0.25s, box-shadow 0.25s" }}
                                onMouseEnter={(e) => {
                                    (e.currentTarget as HTMLAnchorElement).style.borderColor = TEAL;
                                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(-4px)";
                                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = `0 12px 40px rgba(0,191,165,0.12)`;
                                }}
                                onMouseLeave={(e) => {
                                    (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.08)";
                                    (e.currentTarget as HTMLAnchorElement).style.transform = "translateY(0)";
                                    (e.currentTarget as HTMLAnchorElement).style.boxShadow = "none";
                                }}
                            >
                                <div style={{ fontSize: 32, marginBottom: 12 }}>{f.icon}</div>
                                <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>{f.title}</div>
                                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6 }}>{f.desc}</div>
                            </Link>
                        ))}
                    </div>
                </FadeSection>
            </section>

            {/* ═══ SECTION 4 — PULSE AGENT ══════════════════════════════════════════ */}
            <section style={{ padding: "100px 5vw", background: "rgba(0,0,0,0.25)" }}>
                <FadeSection>
                    <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", gap: 60, alignItems: "center", flexWrap: "wrap" }}>
                        {/* Left: chat mockup */}
                        <div style={{ flex: "0 1 360px", display: "flex", justifyContent: "center" }}>
                            <ChatMockup />
                        </div>
                        {/* Right: copy */}
                        <div style={{ flex: "1 1 320px" }}>
                            <div style={{ display: "inline-flex", gap: 6, alignItems: "center", background: "rgba(0,191,165,0.1)", border: `1px solid rgba(0,191,165,0.3)`, borderRadius: 20, padding: "5px 14px", marginBottom: 20, fontSize: 12, color: TEAL, fontWeight: 600 }}>
                                🤖 Powered by Gemini
                            </div>
                            <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 800, marginBottom: 24, lineHeight: 1.2 }}>
                                Meet <span style={{ color: TEAL }}>Pulse</span> — Your AI Health Agent
                            </h2>
                            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 32 }}>
                                {[
                                    "Works in Hindi, English & Hinglish",
                                    "Available 24/7, completely free",
                                    "Knows your health history",
                                    "Emergency detection — calls 108",
                                ].map((point) => (
                                    <div key={point} style={{ display: "flex", alignItems: "flex-start", gap: 10, fontSize: 15 }}>
                                        <span style={{ color: TEAL, fontWeight: 700, fontSize: 16, marginTop: 1 }}>✓</span>
                                        <span style={{ color: "rgba(255,255,255,0.8)" }}>{point}</span>
                                    </div>
                                ))}
                            </div>
                            <Link href="/en/signup" style={{ display: "inline-flex", alignItems: "center", gap: 6, background: TEAL, color: "#fff", fontWeight: 700, fontSize: 15, padding: "12px 24px", borderRadius: 9, textDecoration: "none" }}>
                                Chat with Pulse →
                            </Link>
                        </div>
                    </div>
                </FadeSection>
            </section>

            {/* ═══ SECTION 5 — HOW IT WORKS ══════════════════════════════════════════ */}
            <section id="how-it-works" style={{ padding: "100px 5vw", textAlign: "center" }}>
                <FadeSection>
                    <h2 style={{ fontSize: "clamp(1.6rem, 3vw, 2.4rem)", fontWeight: 800, marginBottom: 12 }}>
                        Simple. Fast. <span style={{ color: TEAL }}>Life-Saving.</span>
                    </h2>
                    <p style={{ color: "rgba(255,255,255,0.5)", marginBottom: 60 }}>From first visit to AI diagnosis in under a minute.</p>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 32, maxWidth: 900, margin: "0 auto 60px" }}>
                        {steps.map((s, i) => (
                            <div key={s.num} style={{ position: "relative" }}>
                                {i < steps.length - 1 && (
                                    <div style={{ position: "absolute", right: -16, top: 20, width: 32, height: 2, background: `linear-gradient(to right, ${TEAL}, transparent)`, display: "none" }} className="step-arrow" />
                                )}
                                <div style={{ width: 52, height: 52, borderRadius: "50%", background: `rgba(0,191,165,0.15)`, border: `2px solid ${TEAL}`, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, color: TEAL, margin: "0 auto 20px" }}>
                                    {s.num}
                                </div>
                                <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 10 }}>{s.title}</h3>
                                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.5)", lineHeight: 1.65 }}>{s.desc}</p>
                            </div>
                        ))}
                    </div>
                    <Link href="/en/signup" style={{ display: "inline-flex", gap: 8, alignItems: "center", background: TEAL, color: "#fff", fontWeight: 700, fontSize: 17, padding: "16px 36px", borderRadius: 10, textDecoration: "none", boxShadow: `0 4px 24px rgba(0,191,165,0.35)` }}>
                        🚀 Start for Free — No Sign-up Fee
                    </Link>
                </FadeSection>
            </section>

            {/* ═══ FOOTER ══════════════════════════════════════════════════════════ */}
            <footer style={{ padding: "48px 5vw", borderTop: "1px solid rgba(255,255,255,0.06)", background: "rgba(0,0,0,0.35)" }}>
                <div style={{ maxWidth: 1100, margin: "0 auto", display: "flex", flexWrap: "wrap", gap: 40, justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                            <div style={{ width: 30, height: 30, background: TEAL, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, color: "#fff" }}>P</div>
                            <span style={{ fontWeight: 800, fontSize: 16 }}>Diagnoverse <span style={{ color: TEAL }}>AI</span></span>
                        </div>
                        <p style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", maxWidth: 220, lineHeight: 1.6 }}>
                            AI-powered healthcare for every Indian. Free forever.
                        </p>
                    </div>
                    <div style={{ display: "flex", gap: 60, flexWrap: "wrap" }}>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.3)", marginBottom: 12, letterSpacing: 1, textTransform: "uppercase" }}>Product</div>
                            {[["Dashboard", "/en/dashboard"], ["Symptom Checker", "/en/symptom-checker"], ["Health Records", "/en/health-records"]].map(([l, h]) => (
                                <div key={l} style={{ marginBottom: 8 }}>
                                    <Link href={h} style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>{l}</Link>
                                </div>
                            ))}
                        </div>
                        <div>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.3)", marginBottom: 12, letterSpacing: 1, textTransform: "uppercase" }}>Legal</div>
                            {[["About", "/en/about"], ["Privacy Policy", "/en/privacy-policy"], ["Terms", "/en/privacy-policy"]].map(([l, h]) => (
                                <div key={l} style={{ marginBottom: 8 }}>
                                    <Link href={h} style={{ fontSize: 13, color: "rgba(255,255,255,0.55)", textDecoration: "none" }}>{l}</Link>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                <div style={{ maxWidth: 1100, margin: "36px auto 0", paddingTop: 24, borderTop: "1px solid rgba(255,255,255,0.06)", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.35)" }}>Made with ❤️ for Bharat 🇮🇳</p>
                    <p style={{ fontSize: 13, color: "rgba(255,255,255,0.3)" }}>Team Hackboard — Amity University CG</p>
                </div>
            </footer>
        </div>
    );
}
