exports.handler = async (event, context) => {
  const { queryStringParameters } = event;
  const { lat, lng, radius = "3000", type = "hospital" } = queryStringParameters;

  if (!lat || !lng) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing latitude or longitude" })
    };
  }

  try {
    const OVERPASS_URL = "https://maps.mail.ru/osm/tools/overpass/api/interpreter";
    
    let nodeType = '["amenity"="hospital"]';
    if (type === "clinic") nodeType = '["amenity"="clinic"]';
    if (type === "pharmacy") nodeType = '["amenity"="pharmacy"]';

    const query = `
        [out:json][timeout:15];
        (
          node${nodeType}(around:${radius},${lat},${lng});
          way${nodeType}(around:${radius},${lat},${lng});
          relation${nodeType}(around:${radius},${lat},${lng});
        );
        out center 20;
    `;

    const response = await fetch(OVERPASS_URL, {
      method: "POST",
      body: query,
    });

    if (!response.ok) {
      throw new Error(`Overpass API responded with status: ${response.status}`);
    }

    const data = await response.json();

    const places = data.elements.map((el) => {
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

    return {
      statusCode: 200,
      body: JSON.stringify({ places })
    };

  } catch (error) {
    console.error("Overpass API Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to fetch nearby facilities" })
    };
  }
};
