import fs from 'fs';

const OVERPASS_URL = "https://maps.mail.ru/osm/tools/overpass/api/interpreter";

async function test() {
    const lat = 19.0760;
    const lng = 72.8777;
    const radius = 3000;
    const type = "hospital";
    let nodeType = '["amenity"="hospital"]';

    const query = `
        [out:json][timeout:15];
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
        });

        if (!response.ok) {
            console.error("Status:", response.status);
            return;
        }

        const data = await response.json();
        const places = data.elements.map(el => {
            const lat = el.lat || el.center?.lat;
            const lon = el.lon || el.center?.lon;
            return {
                id: el.id,
                name: el.tags?.name || "Unnamed Facility",
                type: el.tags?.amenity || type,
                lat,
                lng: lon,
                address: [
                    el.tags?.['addr:street'],
                    el.tags?.['addr:city']
                ].filter(Boolean).join(", ") || "Address not available",
                phone: el.tags?.phone || el.tags?.['contact:phone'] || null,
                website: el.tags?.website || el.tags?.['contact:website'] || null
            };
        });

        console.log("Places:", places);
    } catch (e) {
        console.error(e);
    }
}

test();
