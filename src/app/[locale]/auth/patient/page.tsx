"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Heart, ArrowLeft, LockKeyhole } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PatientAuthPage() {
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
      router.push(`/${locale}/dashboard/patient`);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length <= 1) {
      const newOtp = [...otp];
      newOtp[index] = value;
      setOtp(newOtp);
      if (value !== "" && index < 3) {
        const nextInput = document.getElementById(`patient-otp-${index + 1}`);
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
                  Access your health records and appointments
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {step === "phone" ? (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="patient-phone" className="text-slate-300">Mobile Number or ABHA Address</Label>
                    <div className="flex relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-medium z-10">
                        +91
                      </span>
                      <Input
                        id="patient-phone"
                        type="tel"
                        maxLength={10}
                        placeholder="Enter 10 digit number"
                        className="pl-12 bg-slate-950 border-slate-800 text-slate-100 h-12 focus-visible:ring-teal-500"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      />
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white h-12 font-medium"
                    onClick={handleSendOtp}
                    disabled={phone.length !== 10}
                  >
                    Send OTP
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="text-center text-sm text-slate-400">
                    OTP sent to +91 {phone}. <button onClick={() => setStep("phone")} className="text-teal-400 hover:underline">Edit</button>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-slate-300 text-center block mb-4">Enter 4-digit OTP</Label>
                    <div className="flex justify-center gap-3">
                      {otp.map((digit, i) => (
                        <Input
                          key={i}
                          id={`patient-otp-${i}`}
                          type="text"
                          maxLength={1}
                          className="w-14 h-14 text-center text-2xl bg-slate-950 border-slate-800 text-slate-100 focus-visible:ring-teal-500"
                          value={digit}
                          onChange={(e) => handleOtpChange(i, e.target.value)}
                        />
                      ))}
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-teal-600 hover:bg-teal-700 text-white h-12 font-medium"
                    onClick={handleVerify}
                    disabled={otp.join("").length !== 4}
                  >
                    Verify & Login
                  </Button>
                </div>
              )}
              
              <div className="pt-4 border-t border-slate-800 text-center flex flex-col space-y-4">
                <button className="text-sm text-teal-400 hover:text-teal-300 transition-colors">
                  Create ABHA ID (Ayushman Bharat Health Account)
                </button>
                <div className="flex items-center justify-center space-x-2 text-xs text-slate-500">
                  <LockKeyhole className="w-3 h-3" />
                  <span>Your health data is encrypted and DPDP Act compliant</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
