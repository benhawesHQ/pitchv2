import OpenAI from "openai";

function buildQueries(city, audience) {

  if (audience <= 25) {
    return [
      `acoustic cafe in ${city}`,
      `wine bar with live music in ${city}`,
      `small listening room in ${city}`,
      `intimate lounge with live music in ${city}`,
      `back room bar in ${city}`
    ];
  }

  if (audience <= 60) {
    return [
      `bar with live music in ${city}`,
      `small concert venue in ${city}`,
      `intimate music venue in ${city}`,
      `comedy club with stage in ${city}`,
      `indie performance space in ${city}`
    ];
  }

  if (audience <= 120) {
    return [
      `live music venue in ${city}`,
      `mid size concert venue in ${city}`,
      `music theater in ${city}`,
      `event venue with stage in ${city}`
    ];
  }

  return [
    `concert venue in ${city}`,
    `large music venue in ${city}`,
    `event venue with stage in ${city}`,
    `concert hall in ${city}`
  ];
}

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { city, audience, vibe, count } = req.body;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  try {

    // STEP 1 — Ask AI for venue list
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You return only valid JSON."
        },
        {
          role: "user",
          content: `
You are a music booking agent.

City or area: ${city}
Expected audience: ${audience}
Vibe: ${vibe || "any"}

Return ${count} appropriate venues.

Format:

[
  {
    "name": "",
    "neighborhood": "",
    "city": "",
    "description": "",
    "googleMapsUrl": "",
    "replyScore": 0
  }
]
`
        }
      ],
      temperature: 0.7
    });

    let text = completion.choices[0].message.content.trim();

    if (text.startsWith("```")) {
      text = text.replace(/```json/g, "").replace(/```/g, "").trim();
    }

    let venues = JSON.parse(text);

    // STEP 2 — Enrich each venue with Google image
    const enrichedVenues = await Promise.all(
      venues.map(async (venue) => {

        try {

          // Find place_id
          const findRes = await fetch(
            `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(
              venue.name + " " + venue.city
            )}&inputtype=textquery&fields=place_id&key=${process.env.GOOGLE_API_KEY}`
          );

          const findData = await findRes.json();

          if (!findData.candidates || !findData.candidates.length) {
            return venue;
          }

          const placeId = findData.candidates[0].place_id;

          // Get place details
          const detailsRes = await fetch(
            `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=photos,formatted_address,website&key=${process.env.GOOGLE_API_KEY}`
          );

          const detailsData = await detailsRes.json();

          let imageUrl = null;

          if (detailsData.result.photos && detailsData.result.photos.length > 0) {
            const photoRef = detailsData.result.photos[0].photo_reference;

            imageUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${photoRef}&key=${process.env.GOOGLE_API_KEY}`;
          }

          return {
            ...venue,
            image: imageUrl
          };

        } catch {
          return venue;
        }

      })
    );

    return res.status(200).json({ venues: enrichedVenues });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }

}
