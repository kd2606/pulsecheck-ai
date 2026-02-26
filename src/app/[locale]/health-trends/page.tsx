"use client";

import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { TrendingUp, Brain, Activity, Mic, Loader2 } from "lucide-react";
import {
    LineChart,
    Line,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
} from "recharts";
import { useState, useEffect } from "react";
import { useUser } from "@/firebase/auth/useUser";
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore";
import { db } from "@/firebase/clientApp";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";

interface ChartData {
    mentalWellnessData: any[];
    coughData: any[];
    fatigueData: any[];
}

export default function TrendsPage() {
    const t = useTranslations("trends");
    const { user } = useUser();

    const [people, setPeople] = useState<{ id: string; name: string }[]>([]);
    const [selectedMember, setSelectedMember] = useState("self");
    const [loading, setLoading] = useState(false);
    const [chartData, setChartData] = useState<ChartData>({
        mentalWellnessData: [],
        coughData: [],
        fatigueData: [],
    });

    useEffect(() => {
        if (user) {
            loadPeople();
        }
    }, [user]);

    useEffect(() => {
        if (user && selectedMember) {
            loadMemberData();
        }
    }, [user, selectedMember]);

    const loadPeople = async () => {
        if (!user) return;
        try {
            const peopleRef = collection(db, "users", user.uid, "people");
            const snapshot = await getDocs(peopleRef);
            const loadedPeople = snapshot.docs.map(d => ({ id: d.id, name: d.data().name }));
            setPeople(loadedPeople);
        } catch (error) {
            console.error("Error loading people:", error);
        }
    };

    const loadMemberData = async () => {
        if (!user) return;
        setLoading(true);
        try {
            // Mental Health Scores
            const mentalRef = collection(db, "users", user.uid, "people", selectedMember, "mentalHealthScreens");
            const mentalSnap = await getDocs(mentalRef);
            let mwData = mentalSnap.docs.map(doc => {
                const data = doc.data();
                const dDate = data.createdAt?.toMillis ? new Date(data.createdAt.toMillis()) : new Date();
                return {
                    date: dDate.toLocaleDateString(),
                    score: data.wellnessScore || 0,
                    timestamp: dDate.getTime()
                };
            });
            // Sort by client side to avoid missing firebase indices
            mwData = mwData.sort((a, b) => a.timestamp - b.timestamp).slice(-20);

            // Cough Analysis
            const coughRef = collection(db, "users", user.uid, "people", selectedMember, "coughAnalyses");
            const coughSnap = await getDocs(coughRef);
            const coughCounts: Record<string, number> = { "dry": 0, "wet": 0, "wheezing": 0, "barking": 0, "unknown": 0 };
            coughSnap.docs.forEach(doc => {
                const type = doc.data().coughType?.toLowerCase() || "unknown";
                if (coughCounts[type] !== undefined) {
                    coughCounts[type]++;
                } else {
                    coughCounts["unknown"]++;
                }
            });
            const cData = Object.keys(coughCounts).map(key => ({
                type: key.charAt(0).toUpperCase() + key.slice(1),
                count: coughCounts[key]
            }));

            // Vision Scans (Fatigue)
            const visionRef = collection(db, "users", user.uid, "people", selectedMember, "visionScans");
            const visionSnap = await getDocs(visionRef);
            let vData = visionSnap.docs.map(doc => {
                const data = doc.data();
                const dDate = data.createdAt?.toMillis ? new Date(data.createdAt.toMillis()) : new Date();
                return {
                    date: dDate.toLocaleDateString(),
                    fatigued: data.fatigueDetected ? 1 : 0,
                    timestamp: dDate.getTime()
                };
            });
            // Sort by client side to avoid missing firebase indices
            vData = vData.sort((a, b) => a.timestamp - b.timestamp).slice(-20);

            setChartData({
                mentalWellnessData: mwData,
                coughData: cData,
                fatigueData: vData,
            });

        } catch (error) {
            console.error("Error loading trend data:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <FadeIn direction="down" className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">{t("title")}</h1>
                    <p className="text-muted-foreground">{t("subtitle")}</p>
                </div>
                <Select value={selectedMember} onValueChange={setSelectedMember}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder={t("selectMember")} />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="self">Self</SelectItem>
                        {people.map((p: any) => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </FadeIn>

            {loading ? (
                <div className="flex h-64 items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
            ) : (
                <StaggerContainer delay={0.1} className="space-y-6">
                    {/* Mental Wellness Line Chart */}
                    <StaggerItem>
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Brain className="h-5 w-5 text-purple-500" />
                                    {t("mentalWellness")}
                                </CardTitle>
                                <CardDescription>Score over time (0-100)</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className="h-64">
                                    {chartData.mentalWellnessData.length > 0 ? (
                                        <ResponsiveContainer width="100%" height="100%">
                                            <LineChart data={chartData.mentalWellnessData}>
                                                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                <XAxis dataKey="date" className="text-xs" />
                                                <YAxis domain={[0, 100]} className="text-xs" />
                                                <Tooltip />
                                                <Legend />
                                                <Line
                                                    type="monotone"
                                                    dataKey="score"
                                                    stroke="hsl(var(--chart-1))"
                                                    strokeWidth={2}
                                                    dot={{ r: 4 }}
                                                    name="Wellness Score"
                                                />
                                            </LineChart>
                                        </ResponsiveContainer>
                                    ) : (
                                        <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                                            No mental health data available.
                                        </div>
                                    )}
                                </div>
                            </CardContent>
                        </Card>
                    </StaggerItem>

                    <div className="grid gap-6 md:grid-cols-2">
                        {/* Fatigue Trend */}
                        <StaggerItem>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="h-5 w-5 text-orange-500" />
                                        {t("fatigueTrend")}
                                    </CardTitle>
                                    <CardDescription>Daily fatigue instances (Yes=1, No=0)</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-48">
                                        {chartData.fatigueData.length > 0 ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={chartData.fatigueData}>
                                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                    <XAxis dataKey="date" className="text-xs" />
                                                    <YAxis domain={[0, 1]} ticks={[0, 1]} className="text-xs" />
                                                    <Tooltip />
                                                    <Bar dataKey="fatigued" fill="hsl(var(--chart-4))" radius={[4, 4, 0, 0]} name="Fatigued" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                                                No vision scan data available.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </StaggerItem>

                        {/* Cough Type Distribution */}
                        <StaggerItem>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Mic className="h-5 w-5 text-green-500" />
                                        {t("coughTypes")}
                                    </CardTitle>
                                    <CardDescription>Distribution of detected cough types</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="h-48">
                                        {chartData.coughData.some((d: any) => d.count > 0) ? (
                                            <ResponsiveContainer width="100%" height="100%">
                                                <BarChart data={chartData.coughData}>
                                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                                                    <XAxis dataKey="type" className="text-xs" />
                                                    <YAxis className="text-xs" allowDecimals={false} />
                                                    <Tooltip />
                                                    <Bar dataKey="count" fill="hsl(var(--chart-2))" radius={[4, 4, 0, 0]} name="Count" />
                                                </BarChart>
                                            </ResponsiveContainer>
                                        ) : (
                                            <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                                                No cough data available.
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>
                        </StaggerItem>
                    </div>
                </StaggerContainer>
            )}
        </div>
    );
}
