"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { FadeIn } from "@/components/ui/fade-in";
import { Loader2, ExternalLink, Landmark, Briefcase, HeartPulse, UserCircle } from "lucide-react";
import { toast } from "sonner";
import { suggestGovtSchemes } from "@/ai/flows/govt-schemes";

type Results = Awaited<ReturnType<typeof suggestGovtSchemes>>;

const INDIAN_STATES = [
    "Andhra Pradesh", "Arunachal Pradesh", "Assam", "Bihar", "Chhattisgarh", "Goa", "Gujarat", "Haryana",
    "Himachal Pradesh", "Jharkhand", "Karnataka", "Kerala", "Madhya Pradesh", "Maharashtra", "Manipur",
    "Meghalaya", "Mizoram", "Nagaland", "Odisha", "Punjab", "Rajasthan", "Sikkim", "Tamil Nadu", "Telangana",
    "Tripura", "Uttar Pradesh", "Uttarakhand", "West Bengal", "Delhi", "Jammu and Kashmir"
];

export default function GovtSchemesPage() {
    const [age, setAge] = useState("");
    const [gender, setGender] = useState("");
    const [stateLocation, setStateLocation] = useState("");
    const [income, setIncome] = useState("");
    const [occupation, setOccupation] = useState("");
    const [healthConditions, setHealthConditions] = useState("");

    const [loading, setLoading] = useState(false);
    const [results, setResults] = useState<Results | null>(null);

    const handleSearch = async () => {
        setLoading(true);
        setResults(null);
        try {
            const response = await fetch("/api/govt-schemes", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    profile: {
                        age: age ? parseInt(age, 10) : undefined,
                        gender: gender || undefined,
                        state: stateLocation || undefined,
                        income: income || undefined,
                        occupation: occupation || undefined,
                        healthConditions: healthConditions || undefined,
                    }
                }),
            });

            if (!response.ok) {
                throw new Error("Failed to fetch schemes");
            }

            const data = await response.json();
            setResults(data);
        } catch (error) {
            console.error("Schemes check error:", error);
            toast.error("Analysis failed. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-4xl mx-auto">
            <FadeIn direction="down">
                <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400">
                        <Landmark className="h-5 w-5" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold tracking-tight">Govt Schemes Finder</h1>
                        <p className="text-muted-foreground">Discover health and welfare schemes tailored to you.</p>
                    </div>
                </div>
            </FadeIn>

            <FadeIn delay={0.1}>
                <Card>
                    <CardHeader>
                        <CardTitle>Enter Your Profile</CardTitle>
                        <CardDescription>Fill out these details to discover eligible government programs.</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="age">Age</Label>
                                <Input
                                    id="age"
                                    type="number"
                                    min={1}
                                    max={120}
                                    placeholder="e.g. 45"
                                    value={age}
                                    onChange={(e) => setAge(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Gender</Label>
                                <Select value={gender} onValueChange={setGender}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Gender" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Male">Male</SelectItem>
                                        <SelectItem value="Female">Female</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>State of Residence</Label>
                                <Select value={stateLocation} onValueChange={setStateLocation}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select State" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {INDIAN_STATES.map((s) => (
                                            <SelectItem key={s} value={s}>{s}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Annual Household Income</Label>
                                <Select value={income} onValueChange={setIncome}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select Income Range" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Below 50,000 INR">Below ₹50,000</SelectItem>
                                        <SelectItem value="50,000 - 1 Lakh INR">₹50,000 - ₹1 Lakh</SelectItem>
                                        <SelectItem value="1 - 2.5 Lakhs INR">₹1 Lakh - ₹2.5 Lakhs</SelectItem>
                                        <SelectItem value="2.5 - 5 Lakhs INR">₹2.5 Lakhs - ₹5 Lakhs</SelectItem>
                                        <SelectItem value="Above 5 Lakhs INR">Above ₹5 Lakhs</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="occupation">Occupation / Category</Label>
                                <Input
                                    id="occupation"
                                    placeholder="e.g. Farmer, Student, Pregnant Woman, etc."
                                    value={occupation}
                                    onChange={(e) => setOccupation(e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="healthConditions">Pre-existing Health Conditions (Optional)</Label>
                                <Input
                                    id="healthConditions"
                                    placeholder="e.g. Diabetes, physical disability, TB..."
                                    value={healthConditions}
                                    onChange={(e) => setHealthConditions(e.target.value)}
                                />
                            </div>
                        </div>

                        <Button onClick={handleSearch} disabled={loading} className="w-full mt-4" size="lg">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Analyzing Eligibility...
                                </>
                            ) : (
                                <>
                                    <Landmark className="mr-2 h-4 w-4" />
                                    Find Schemes
                                </>
                            )}
                        </Button>
                    </CardContent>
                </Card>
            </FadeIn>

            {results && (
                <FadeIn delay={0.2} className="space-y-6">
                    <Card className="border-orange-500/20 bg-orange-50/50 dark:bg-orange-900/10">
                        <CardHeader>
                            <CardTitle className="text-xl text-orange-700 dark:text-orange-400">Next Steps & Guidance</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                                {results.generalAdvice}
                            </p>
                        </CardContent>
                    </Card>

                    <h3 className="text-xl font-bold mt-8 mb-4">Recommended Schemes</h3>

                    <div className="grid gap-4">
                        {results.schemes.map((scheme, i) => (
                            <Card key={i} className="overflow-hidden">
                                <CardHeader className="bg-muted/30 border-b pb-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <CardTitle className="text-lg text-primary">{scheme.name}</CardTitle>
                                            <CardDescription className="mt-1">{scheme.description}</CardDescription>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="pt-4 space-y-4">
                                    <div className="space-y-1">
                                        <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                            <UserCircle className="h-3 w-3" /> Eligibility
                                        </Label>
                                        <p className="text-sm font-medium">{scheme.eligibility}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                            <HeartPulse className="h-3 w-3" /> Key Benefits
                                        </Label>
                                        <p className="text-sm">{scheme.benefits}</p>
                                    </div>

                                    <div className="space-y-1">
                                        <Label className="text-xs uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                                            <Briefcase className="h-3 w-3" /> How to Apply
                                        </Label>
                                        <p className="text-sm">{scheme.howToApply}</p>
                                    </div>
                                </CardContent>
                                <CardFooter className="bg-muted/10 border-t pt-4">
                                    <Button variant="outline" className="w-full" asChild>
                                        <a href={scheme.officialLink} target="_blank" rel="noopener noreferrer">
                                            <ExternalLink className="mr-2 h-4 w-4" />
                                            Find Official Information
                                        </a>
                                    </Button>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                </FadeIn>
            )}
        </div>
    );
}
