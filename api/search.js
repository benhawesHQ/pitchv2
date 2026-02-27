export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const { city, audience, ...filters } = req.body;

    const activeFilters = Object.keys(filters)
      .filter(key => filters[key] === true)
      .join(", ");

    const prompt = `
You are helping an indie musician book shows.

Return EXACTLY 15 REAL venues in ${city}.

Audience draw: ${audience} people.

If audience is small (<150), prioritize 20–200 capacity rooms.
If large (>1000), include larger venues.

If filters are selected (${activeFilters}), respect them.

Return ONLY valid JSON.
No markdown.
No backticks.

Format:

{
  "venues": [
    {
      "name": "Venue Name",
      "neighborhood": "Area",
      "capacity": "Approx capacity range",
      "replyLikelihood": 1-100,
      "activitySignal": "Why they seem active recently",
      "whyThisFits": "Why this venue makes sense",
      "bookingTip": "How to approach them",
      "instagram": "Instagram URL if known or null",
      "email": "Booking email if known or null",
      "phone": "Public phone number if known or null",
      "website": "Official website URL if known or null"
    }
  ]
}
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.7,
        input: prompt
      })
    });

    const data = await response.json();
    const text = data.output?.[0]?.content?.[0]?.text || "";

    const cleaned = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    let parsed;

    try {
      parsed = JSON.parse(cleaned);
    } catch (e) {
      console.error("AI returned invalid JSON:", text);
      return res.status(500).json({
        error: "AI returned invalid JSON"
      });
    }

    if (!parsed.venues || !Array.isArray(parsed.venues)) {
      return res.status(500).json({
        error: "Invalid venue structure from AI"
      });
    }

    // Ensure exactly 15
    parsed.venues = parsed.venues.slice(0, 15);

    // Normalize missing fields
    parsed.venues = parsed.venues.map(v => ({
      name: v.name || "Unknown Venue",
      neighborhood: v.neighborhood || "—",
      capacity: v.capacity || "—",
      replyLikelihood: v.replyLikelihood || 50,
      activitySignal: v.activitySignal || "",
      whyThisFits: v.whyThisFits || "",
      bookingTip: v.bookingTip || "",
      instagram: v.instagram || null,
      email: v.email || null,
      phone: v.phone || null,
      website: v.website || null
    }));

    // Sort highest reply likelihood first
    parsed.venues.sort((a, b) => b.replyLikelihood - a.replyLikelihood);

    return res.status(200).json({ venues: parsed.venues });

  } catch (error) {
    console.error("Search error:", error);
    return res.status(500).json({
      error: "Search failed",
      details: error.message
    });
  }
}
