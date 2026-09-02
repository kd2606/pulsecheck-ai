"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ArrowLeft, LockKeyhole } from "lucide-react";
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/firebase/clientApp";

export default function PatientAuthPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "en";
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push(`/${locale}/dashboard/patient`);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Failed to sign in with Google.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col font-sans text-slate-100">
      <div className="bg-[#1e3a5f] text-white py-2 px-4 text-xs font-medium text-center tracking-wide border-b border-blue-900/50">
        Ministry of Health & Family Welfare | Ayushman Bharat Digital Mission
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div className="w-full max-w-md space-y-6">
          <Button 
            variant="ghost" 
            className="text-slate-400 hover:text-white mb-4 -ml-4"
            onClick={() => router.push(`/${locale}/auth`)}
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Roles
          </Button>

          <Card className="bg-slate-900 border-slate-800 shadow-xl overflow-hidden">
            <div className="h-1.5 bg-teal-500" />
            <CardHeader className="space-y-4 pb-6">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-teal-950/50 flex items-center justify-center border border-teal-900/50">
                  <Heart className="w-6 h-6 text-teal-400" />
                </div>
              </div>
              <div className="text-center">
                <CardTitle className="text-2xl text-white">Patient / Citizen Login</CardTitle>
                <CardDescription className="text-slate-400 mt-1">
                  Access your AI health tools and appointments
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              
              <div className="space-y-4">
                {error && (
                  <div className="bg-red-500/10 border border-red-500/50 text-red-400 text-sm p-3 rounded-lg text-center">
                    {error}
                  </div>
                )}
                
                <Button 
                  className="w-full bg-white hover:bg-gray-200 text-slate-900 h-12 font-medium flex items-center justify-center gap-3 text-base"
                  onClick={handleGoogleLogin}
                  disabled={loading}
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M22.56 12.25C22.56 11.47 22.49 10.72 22.36 10H12V14.26H17.92C17.67 15.63 16.86 16.79 15.69 17.57V20.34H19.26C21.35 18.42 22.56 15.6 22.56 12.25Z" fill="#4285F4"/>
                    <path d="M12 23C14.97 23 17.46 22.02 19.26 20.34L15.69 17.57C14.71 18.23 13.46 18.63 12 18.63C9.18 18.63 6.79 16.72 5.92 14.18H2.23V17.03C4.03 20.61 7.72 23 12 23Z" fill="#34A853"/>
                    <path d="M5.92 14.18C5.7 13.52 5.57 12.78 5.57 12C5.57 11.22 5.7 10.48 5.92 9.82V6.97H2.23C1.49 8.44 1.06 10.16 1.06 12C1.06 13.84 1.49 15.56 2.23 17.03L5.92 14.18Z" fill="#FBBC05"/>
                    <path d="M12 5.38C13.62 5.38 15.06 5.93 16.2 7.02L19.34 3.88C17.45 2.12 14.97 1 12 1C7.72 1 4.03 3.39 2.23 6.97L5.92 9.82C6.79 7.28 9.18 5.38 12 5.38Z" fill="#EA4335"/>
                  </svg>
                  {loading ? "Signing in..." : "Continue with Google"}
                </Button>
              </div>
              
              <div className="pt-4 border-t border-slate-800 text-center flex flex-col space-y-4">
                <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
                  <LockKeyhole className="w-3 h-3" />
                  <span>Your health data is encrypted and secure</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
