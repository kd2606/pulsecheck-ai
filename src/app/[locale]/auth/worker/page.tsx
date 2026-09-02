"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, ArrowLeft, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function WorkerAuthPage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || "en";
  const [step, setStep] = useState<"phone" | "otp">("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);

  const handleSendOtp = () => {
    if (phone.length === 10) {
      setStep("otp");
    }
  };

  const handleVerify = () => {
    if (otp.join("").length === 4) {
      router.push(`/${locale}/dashboard/worker`);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      // Auto-focus next input (simplified for mock)
      if (value !== "" && index < 3) {
        const nextInput = document.getElementById(`otp-${index + 1}`);
        if (nextInput) nextInput.focus();
      }
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
            <div className="h-1.5 bg-blue-600" />
            <CardHeader className="space-y-4 pb-6">
              <div className="flex items-center justify-center space-x-3 mb-2">
                <div className="w-12 h-12 rounded-xl bg-blue-950/50 flex items-center justify-center border border-blue-900/50">
                  <Shield className="w-6 h-6 text-blue-400" />
                </div>
              </div>
              <div className="text-center">
                <CardTitle className="text-2xl text-white">Health Worker Login</CardTitle>
                <CardDescription className="text-slate-400 mt-1">
                  Secure access for ASHA, ANM, and MO
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === "phone" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-slate-300">Mobile Number</Label>
                    <div className="flex relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium z-10">
                        +91
                      </span>
                      <Input
                        id="phone"
                        type="tel"
                        maxLength={10}
                        placeholder="Enter 10 digit number"
                        className="pl-12 bg-slate-950 border-slate-800 text-slate-100 h-12 focus-visible:ring-blue-500"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      />
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 font-medium"
                    onClick={handleSendOtp}
                    disabled={phone.length !== 10}
                  >
                    Send OTP
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center text-sm text-slate-400">
                    OTP sent to +91 {phone}. <button onClick={() => setStep("phone")} className="text-blue-400 hover:underline">Edit</button>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-center block mb-4">Enter 4-digit OTP</Label>
                    <div className="flex justify-center gap-3">
                      {otp.map((digit, i) => (
                        <Input
                          key={i}
                          id={`otp-${i}`}
                          type="text"
                          maxLength={1}
                          className="w-14 h-14 text-center text-2xl bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-blue-500"
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                        />
                      ))}
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white h-12 font-medium"
                    onClick={handleVerify}
                    disabled={otp.join("").length !== 4}
                  >
                    Verify & Login
                  </Button>
                </div>
              )}
              
              <div className="pt-4 border-t border-slate-800 text-center">
                <button className="text-sm text-slate-400 hover:text-blue-400 flex items-center justify-center w-full space-x-2 transition-colors">
                  <Building2 className="w-4 h-4" />
                  <span>Login with Aadhaar / NHA ID</span>
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
