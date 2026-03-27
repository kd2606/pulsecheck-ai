import { Card, CardContent } from "@/components/ui/card";
import { Info, Code, Globe, Github, Mail, Smartphone } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="container max-w-5xl py-10 px-4 space-y-16">
            {/* Section 1 - Mission */}
            <div className="text-center space-y-6 py-10">
                <blockquote className="text-3xl md:text-5xl font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-indigo-400 max-w-4xl mx-auto leading-tight">
                    "Every life in rural India deserves the same quality of healthcare as urban India."
                </blockquote>
                <p className="text-xl text-muted-foreground">That's why we built PulseCheck AI</p>
            </div>

            {/* Section 2 - The Story & Stats */}
            <div className="grid md:grid-cols-5 gap-10 items-center">
                <div className="md:col-span-3 space-y-6 text-lg text-muted-foreground leading-relaxed">
                    <h2 className="text-3xl font-semibold text-white mb-4">Our Story</h2>
                    <p>
                        PulseCheck AI was born from a simple observation — millions of people in rural India, 
                        especially in states like Chhattisgarh, have no easy access to immediate healthcare advice.
                    </p>
                    <p>
                        We are students from <strong>Amity University Chhattisgarh</strong> who saw this problem in 
                        our own backyard and decided to do something about it.
                    </p>
                    <p className="text-emerald-400 font-medium">
                        Built with AI, designed for Bharat — PulseCheck AI is our answer.
                    </p>
                </div>
                <div className="md:col-span-2">
                    <Card className="bg-white/5 dark:bg-black/40 border-white/10 shadow-2xl">
                        <CardContent className="p-8 space-y-6">
                            <div className="flex items-center text-lg"><span className="text-2xl mr-4">🏥</span> 12+ Health Features</div>
                            <div className="flex items-center text-lg"><span className="text-2xl mr-4">🤖</span> Powered by Google Gemini AI</div>
                            <div className="flex items-center text-lg"><span className="text-2xl mr-4">🇮🇳</span> Built for Rural India</div>
                            <div className="flex items-center text-lg"><span className="text-2xl mr-4">📱</span> Available on Web & Mobile</div>
                            <div className="flex items-center text-lg"><span className="text-2xl mr-4">💰</span> 100% Free Forever</div>
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Section 2.5 - Android App */}
            <div className="pt-10 border-t border-white/10">
                <Card className="bg-gradient-to-br from-teal-950/40 to-black border-teal-500/20 max-w-3xl mx-auto overflow-hidden shadow-2xl">
                    <CardContent className="p-8 sm:p-12 text-center space-y-8 relative">
                        {/* Decorative background circle */}
                        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-teal-500/10 rounded-full blur-[100px] -z-10 pointer-events-none" />
                        
                        <div className="space-y-3">
                            <h2 className="text-3xl font-bold text-white flex items-center justify-center gap-3">
                                <Smartphone className="w-8 h-8 text-teal-400" /> Available on Android
                            </h2>
                            <p className="text-lg text-muted-foreground">
                                Take your AI health companion everywhere you go.
                            </p>
                        </div>
                        
                        <a 
                            href="https://expo.dev/artifacts/eas/a4cyVYKBAo1t1yKs552SYf4.apk"
                            onClick={() => console.log('APK Download clicked')}
                            className="inline-flex items-center gap-3 bg-teal-500 hover:bg-teal-400 text-black font-bold text-lg px-8 py-4 rounded-xl transition-all hover:scale-105 hover:shadow-[0_0_30px_rgba(0,191,165,0.4)]"
                        >
                            ⬇️ Download Android App (.apk)
                        </a>
                        
                        <div className="max-w-md mx-auto bg-black/50 p-6 rounded-xl border border-white/5 text-left">
                            <h4 className="font-semibold text-teal-400 mb-3 flex items-center gap-2">
                                <Info className="h-5 w-5" /> How to install:
                            </h4>
                            <ol className="list-decimal list-inside space-y-2.5 text-sm text-white/80">
                                <li>Tap the Download button above</li>
                                <li>Open the downloaded <code className="bg-white/10 px-1.5 py-0.5 rounded text-teal-300">.apk</code> file</li>
                                <li>Allow <b>&quot;Install unknown apps&quot;</b> if prompted in settings</li>
                                <li>Click Install and you&apos;re ready to use!</li>
                            </ol>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Section 3 - Team */}
            <div className="space-y-8 pt-10 border-t border-white/10">
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold">Team Hackboard</h2>
                    <p className="text-muted-foreground">B.Tech CSE 2nd Semester | Amity University Chhattisgarh</p>
                </div>
                
                <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 pt-6">
                    <TeamCard emoji="👨‍💻" name="Krrish Dewangan" role="Lead Developer & UI/UX" />
                    <TeamCard emoji="🎨" name="Hetansh Panigrahi" role="Frontend & Content Strategy" />
                    <TeamCard emoji="⚙️" name="Prince Kumar Mishra" role="Backend & AI Integration" />
                    <TeamCard emoji="📝" name="Pratham Vashishtha" role="Research & Documentation" />
                </div>
            </div>

            {/* Section 4 - Technology */}
            <div className="space-y-6 pt-10 border-t border-white/10">
                <h2 className="text-2xl font-bold text-center">Built With</h2>
                <div className="flex flex-wrap justify-center gap-4">
                    <TechPill label="Next.js" />
                    <TechPill label="Firebase" />
                    <TechPill label="Google Gemini AI" />
                    <TechPill label="React Native" />
                    <TechPill label="Tailwind CSS" />
                    <TechPill label="Vercel" />
                </div>
            </div>

            {/* Section 5 - Contact & Links */}
            <div className="text-center space-y-4 pt-10 border-t border-white/10 pb-10">
                <p className="text-lg font-medium text-white flex items-center justify-center gap-2">
                    Made with <span className="text-rose-500">❤️</span> for Bharat 🇮🇳
                </p>
                <div className="flex items-center justify-center gap-6 text-muted-foreground">
                    <a href="https://pulsecheckai-orcin.vercel.app" target="_blank" rel="noreferrer" className="flex items-center hover:text-emerald-400 transition-colors">
                        <Globe className="w-4 h-4 mr-2" /> Website
                    </a>
                    <a href="mailto:dewangankrrish50@gmail.com" className="flex items-center hover:text-emerald-400 transition-colors">
                        <Mail className="w-4 h-4 mr-2" /> Email
                    </a>
                </div>
            </div>
        </div>
    );
}

function TeamCard({ emoji, name, role }: { emoji: string, name: string, role: string }) {
    return (
        <Card className="bg-white/5 border-white/10 text-center hover:bg-white/10 transition-colors">
            <CardContent className="pt-6">
                <div className="text-5xl mb-4">{emoji}</div>
                <h3 className="font-semibold text-lg">{name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{role}</p>
            </CardContent>
        </Card>
    );
}

function TechPill({ label }: { label: string }) {
    return (
        <div className="px-4 py-2 rounded-full border border-white/10 bg-white/5 text-sm font-medium text-emerald-100 hover:border-emerald-500/50 hover:bg-emerald-500/10 transition-colors cursor-default">
            {label}
        </div>
    );
}
