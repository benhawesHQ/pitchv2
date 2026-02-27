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

Return EXACTLY 15 venues in ${city}.

These must be REAL venues that host live music.

Audience draw: ${audience} people.

If audience is small (<150), prioritize 20–200 capacity rooms.
If large (>1000), include larger venues.

If filters are selected (${activeFilters}), respect them.

Do NOT include:
- Arenas unless audience is large
- Corporate event spaces
- Wedding-only venues

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
      "whyThisFits": "Why this venue makes sense for this draw",
      "bookingTip": "How to approach them"
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

    const parsed = JSON.parse(cleaned);

    // Sort by replyLikelihood descending
    parsed.venues.sort((a, b) => b.replyLikelihood - a.replyLikelihood);

    return res.status(200).json({ venues: parsed.venues });

  } catch (error) {
    return res.status(500).json({
      error: "Search failed",
      details: error.message
    });
  }
}
