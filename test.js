const OVERPASS_URL = "https://maps.mail.ru/osm/tools/overpass/api/interpreter";

async function test() {
    const lat = 19.0760;
    const lng = 72.8777;
    const radius = 3000;
    const type = "hospital";
    let nodeType = '["amenity"="hospital"]';

    const query = `
        [out:json][timeout:10];
        (
          node${nodeType}(around:${radius},${lat},${lng});
          way${nodeType}(around:${radius},${lat},${lng});
          relation${nodeType}(around:${radius},${lat},${lng});
        );
        out center 20;
    `;

    try {
        const response = await fetch(OVERPASS_URL, {
            method: "POST",
            body: query,
            headers: {
                "User-Agent": "PulseCheckAI-App/1.0"
            }
        });

        console.log("Status:", response.status);
        if (!response.ok) {
            const txt = await response.text();
            console.log("Error text:", txt.substring(0, 500));
        } else {
            const data = await response.json();
            console.log("Data elements:", data.elements?.length);
        }
    } catch (e) {
        console.error("Exception:", e);
    }
}

test();
