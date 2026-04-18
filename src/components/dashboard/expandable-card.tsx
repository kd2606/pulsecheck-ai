import { useState } from "react";
import { Maximize2, X } from "lucide-react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export function ExpandableCard({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <div className="h-full w-full relative group">
                <div className="h-full w-full pointer-events-none">
                    {children}
                </div>
                <div 
                    className="absolute inset-0 z-10 cursor-pointer flex items-end justify-end p-4 opacity-0 group-hover:opacity-100 transition-opacity bg-black/0 hover:bg-black/10 rounded-[2.5rem]"
                    onClick={() => setOpen(true)}
                >
                    <div className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/50 p-3 rounded-full text-emerald-400 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-110 active:scale-95 transition-all">
                        <Maximize2 className="w-5 h-5" />
                    </div>
                </div>
            </div>
            <DialogContent className="max-w-[95vw] md:max-w-[80vw] w-full max-h-[95vh] h-[95vh] md:h-auto overflow-hidden bg-transparent border-none shadow-none p-0 [&>button]:hidden">
                <div className="relative h-full w-full bg-[#0a0a0a] rounded-[3rem] border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] overflow-y-auto">
                    {/* Background glows */}
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-500/5 blur-[150px] -mr-96 -mt-96 pointer-events-none" />
                    <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-500/5 blur-[150px] -ml-48 -mb-48 pointer-events-none" />
                    
                    <button 
                        onClick={() => setOpen(false)} 
                        className="absolute top-6 right-6 z-50 p-3 bg-white/10 hover:bg-rose-500 text-white rounded-full backdrop-blur-md transition-all border border-white/10 shadow-2xl hover:scale-105 active:scale-95"
                    >
                        <X className="w-6 h-6" />
                    </button>
                    
                    <div className="p-4 md:p-12 w-full h-full min-h-[500px]">
                        {children}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
