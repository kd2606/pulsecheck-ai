"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, MapPin, Phone, Globe, Navigation, Building2 } from "lucide-react";
import { FadeIn, StaggerContainer, StaggerItem } from "@/components/ui/fade-in";

interface Facility {
    id: number;
    name: string;
    type: string;
    lat: number;
    lng: number;
    address: string;
    phone: string | null;
    website: string | null;
}

export default function NearbyHospitalsPage() {
    const t = useTranslations("nav");
    const [facilities, setFacilities] = useState<Facility[]>([]);
    const [loading, setLoading] = useState(false);
    const [locationError, setLocationError] = useState<string | null>(null);

    const fetchFacilities = () => {
        setLoading(true);
        setLocationError(null);

        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser");
            setLoading(false);
            return;
        }

        navigator.geolocation.getCurrentPosition(
            async (position) => {
                try {
                    const { latitude, longitude } = position.coords;
                    const res = await fetch(`/api/nearby-facilities?lat=${latitude}&lng=${longitude}&radius=5000`);
                    if (!res.ok) throw new Error("Failed to fetch facilities");
                    const data = await res.json();
                    setFacilities(data.places || []);
                } catch (error) {
                    console.error("Error fetching facilities:", error);
                    setLocationError("Could not fetch nearby facilities. Please try again.");
                } finally {
                    setLoading(false);
                }
            },
            (error) => {
                console.error("Geolocation error:", error);
                let errorMessage = "Could not get your location.";
                if (error.code === 1) errorMessage = "Location permission denied. Please allow location access to find nearby hospitals.";
                setLocationError(errorMessage);
                setLoading(false);
            }
        );
    };

    useEffect(() => {
        fetchFacilities();
    }, []);

    const openMaps = (lat: number, lng: number, name: string) => {
        window.open(`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`, "_blank");
    };

    return (
        <div className="space-y-6">
            <FadeIn direction="down" className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Nearby Hospitals & Clinics</h1>
                    <p className="text-muted-foreground">Find real healthcare facilities around your current location.</p>
                </div>
                <Button onClick={fetchFacilities} disabled={loading}>
                    {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <MapPin className="mr-2 h-4 w-4" />}
                    Refresh Location
                </Button>
            </FadeIn>

            {locationError && (
                <Card className="border-destructive">
                    <CardContent className="pt-6">
                        <p className="text-destructive font-medium">{locationError}</p>
                    </CardContent>
                </Card>
            )}

            {loading ? (
                <div className="flex flex-col items-center justify-center p-12 text-muted-foreground space-y-4">
                    <Loader2 className="h-12 w-12 animate-spin" />
                    <p>Detecting your location and finding facilities...</p>
                </div>
            ) : facilities.length === 0 && !locationError ? (
                <Card>
                    <CardContent className="flex flex-col items-center gap-4 p-12">
                        <Building2 className="h-12 w-12 text-muted-foreground" />
                        <p className="text-muted-foreground">No hospitals or clinics found within 5km.</p>
                    </CardContent>
                </Card>
            ) : (
                <StaggerContainer className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {facilities.map((facility) => (
                        <StaggerItem key={facility.id}>
                            <Card className="h-full flex flex-col">
                                <CardHeader className="pb-2">
                                    <div className="flex justify-between items-start gap-4">
                                        <CardTitle className="text-lg leading-tight">{facility.name}</CardTitle>
                                        <Badge variant="outline" className="capitalize shrink-0">
                                            {facility.type}
                                        </Badge>
                                    </div>
                                    <CardDescription className="flex items-start mt-2">
                                        <MapPin className="h-3.5 w-3.5 mr-1.5 mt-0.5 shrink-0" />
                                        <span className="text-xs">{facility.address}</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="flex-1 flex flex-col justify-end gap-4">
                                    <div className="space-y-2 text-sm text-muted-foreground">
                                        {facility.phone && (
                                            <div className="flex items-center">
                                                <Phone className="h-3.5 w-3.5 mr-2" />
                                                <a href={`tel:${facility.phone}`} className="hover:text-primary transition-colors">{facility.phone}</a>
                                            </div>
                                        )}
                                        {facility.website && (
                                            <div className="flex items-center">
                                                <Globe className="h-3.5 w-3.5 mr-2" />
                                                <a href={facility.website} target="_blank" rel="noreferrer" className="hover:text-primary transition-colors line-clamp-1">Website</a>
                                            </div>
                                        )}
                                    </div>

                                    <Button
                                        variant="secondary"
                                        className="w-full mt-2"
                                        onClick={() => openMaps(facility.lat, facility.lng, facility.name)}
                                    >
                                        <Navigation className="mr-2 h-4 w-4" />
                                        Get Directions
                                    </Button>
                                </CardContent>
                            </Card>
                        </StaggerItem>
                    ))}
                </StaggerContainer>
            )}
        </div>
    );
}
