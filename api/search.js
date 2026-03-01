/* ============================= */
/* AUDIENCE SIZE → QUERY LOGIC  */
/* ============================= */

function buildQueries(city, audience) {

  const size = Number(audience);

  if (size <= 25) {
    return [
      `acoustic cafe live music near ${city}`,
      `wine bar with live music near ${city}`,
      `intimate lounge with stage near ${city}`,
      `small back room bar near ${city}`
    ];
  }

  if (size <= 60) {
    return [
      `bar with live music near ${city}`,
      `small concert venue near ${city}`,
      `listening room near ${city}`,
      `comedy club with stage near ${city}`
    ];
  }

  if (size <= 120) {
    return [
      `live music venue near ${city}`,
      `mid size concert venue near ${city}`,
      `music theater near ${city}`,
      `performance space with stage near ${city}`
    ];
  }

  return [
    `concert venue near ${city}`,
    `music hall near ${city}`,
    `event venue with stage near ${city}`
  ];
}


/* ============================= */
/* MAIN HANDLER */
/* ============================= */

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { city, audience, vibe, count } = req.body;

  if (!city || !audience) {
    return res.status(400).json({ error: "Missing city or audience size" });
  }

  try {

    const queries = buildQueries(city, audience);
    let allResults = [];

    /* ============================= */
    /* GOOGLE TEXT SEARCH ONLY      */
    /* ============================= */

    for (const q of queries) {

      const googleRes = await fetch(
        `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(q)}&region=us&key=${process.env.GOOGLE_API_KEY}`
      );

      const googleData = await googleRes.json();

      if (googleData.results) {
        allResults.push(...googleData.results);
      }
    }

    /* ============================= */
    /* DEDUPE RESULTS               */
    /* ============================= */

    const uniqueMap = new Map();

    for (const place of allResults) {
      if (!uniqueMap.has(place.place_id)) {
        uniqueMap.set(place.place_id, place);
      }
    }

    const uniqueResults = Array.from(uniqueMap.values()).slice(0, count);

    /* ============================= */
    /* ENRICH WITH DETAILS          */
    /* ============================= */

    const enrichedVenues = await Promise.all(
      uniqueResults.map(async (place) => {

        try {

          const detailsRes = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=photos,formatted_address,website,formatted_phone_number,rating,user_ratings_total,opening_hours&key=${process.env.GOOGLE_API_KEY}`
          );

          const detailsData = await detailsRes.json();
          const details = detailsData.result || {};

          let imageUrl = null;

          if (details.photos && details.photos.length > 0) {
            const photoRef = details.photos[0].photo_reference;

            imageUrl =
              `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${process.env.GOOGLE_API_KEY}`;
          }

          return {
            name: place.name,
            neighborhood: place.vicinity || "",
            formatted_address: details.formatted_address || "",
            description: vibe
              ? `Strong fit for ${vibe} shows around ${audience} guests.`
              : `Potential venue for performances around ${audience} guests.`,
            googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
            website: details.website || null,
            rating: details.rating || null,
            user_ratings_total: details.user_ratings_total || null,
            opening_hours: details.opening_hours || null,
            image: imageUrl
          };

        } catch {
          return null;
        }

      })
    );

    const cleaned = enrichedVenues.filter(Boolean);

    return res.status(200).json({ venues: cleaned });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }

}
