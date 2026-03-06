async function testNominatim() {
    const lat = 19.0760;
    const lng = 72.8777;
    // Nominatim doesn't officially support "amenity" without a q, but we can do a q=hospital
    const url = `https://nominatim.openstreetmap.org/search?q=hospital&format=json&lat=${lat}&lon=${lng}&limit=10`;
    try {
        const res = await fetch(url, {
            headers: {
                "User-Agent": "PulseCheckAI-App/1.0",
                "Accept-Language": "en-US,en;q=0.9"
            }
        });
        console.log("Nominatim Status:", res.status);
        const data = await res.json();
        console.log("Results length:", data.length);
        if (data.length > 0) {
            console.log("Sample:", data[0].display_name, data[0].lat, data[0].lon);
        }
    } catch (e) {
        console.error("Nominatim error:", e);
    }
}
testNominatim();
