import { motion } from "framer-motion";
import { PhoneCall, Activity } from "lucide-react";

export function EmergencyOverlay({ onDismiss }: { onDismiss: () => void }) {
    return (
        <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 z-[9999] bg-rose-600 flex flex-col items-center justify-center text-white p-6 font-space text-center"
        >
            <div className="absolute inset-0 bg-black/20 animate-pulse pointer-events-none" />
            
            <Activity className="w-24 h-24 mb-6 text-white animate-bounce relative z-10" />
            <h1 className="text-5xl md:text-6xl font-black mb-4 tracking-tighter relative z-10">CRITICAL EMERGENCY</h1>
            <p className="text-xl md:text-2xl mb-12 opacity-90 relative z-10">Immediate medical attention is required. Do not wait.</p>
            
            <a href="tel:108" className="bg-white text-rose-600 px-12 py-6 rounded-full text-4xl md:text-5xl font-black mb-12 hover:scale-105 transition-transform shadow-2xl flex items-center gap-4 relative z-10">
                <PhoneCall className="w-10 h-10 animate-ping" />
                CALL 108 NOW
            </a>
            
            <div className="bg-black/20 p-8 rounded-3xl max-w-lg w-full backdrop-blur-md relative z-10 text-left border border-white/20">
                <h3 className="font-bold text-2xl mb-4 text-emerald-300">Basic CPR Instructions:</h3>
                <ol className="list-decimal pl-6 space-y-3 text-lg">
                    <li>Lay the person flat on their back on a firm surface.</li>
                    <li>Place the heel of one hand in the center of their chest, and your other hand on top.</li>
                    <li>Push hard and fast (at least 2 inches deep, 100-120 times a minute).</li>
                    <li>Do not stop until medical help arrives.</li>
                </ol>
            </div>
            
            <button onClick={onDismiss} className="mt-12 text-white/50 underline relative z-10 hover:text-white transition-colors">
                I understand, dismiss warning
            </button>
        </motion.div>
    );
}
