import OpenAI from "openai";

function normalizeCity(input) {
  if (!input) return "";

  const value = input.trim().toLowerCase();

  const majorCities = {
    "nyc": "New York City",
    "new york": "New York City",
    "new york city": "New York City",
    "la": "Los Angeles",
    "los angeles": "Los Angeles",
    "sf": "San Francisco",
    "san francisco": "San Francisco",
    "chicago": "Chicago",
    "nashville": "Nashville",
    "london": "London",
    "tokyo": "Tokyo"
  };

  return majorCities[value] || input
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { city, genre, likely } = req.body;

  if (!city) {
    return res.status(400).json({ error: "City required" });
  }

  const normalizedCity = normalizeCity(city);

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const vibe = genre || "live music";

  const likelihoodNote = likely
    ? "Focus on venues known to book emerging or independent artists."
    : "Include a mix of established and smaller venues.";

  const prompt = `
Generate 8 real venues in ${normalizedCity} that host ${vibe} performances.
${likelihoodNote}

For each venue include:
- name
- neighborhood
- description (max 12 words)
- likelihood score 1-10 for responding to emerging artists
- one emoji that matches the venue vibe
- instagram handle (without URL)
- booking email if available
- phone if available

Respond ONLY with valid JSON:

{
  "results": [
    {
      "name": "",
      "neighborhood": "",
      "description": "",
      "likelihood": 0,
      "emoji": "",
      "instagram": "",
      "email": "",
      "phone": ""
    }
  ]
}
`;

  try {

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    const text = completion.choices[0].message.content;
    const cleaned = text.replace(/```json|```/g, "").trim();
    const json = JSON.parse(cleaned);

    res.status(200).json({
      city: normalizedCity,
      results: json.results
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI search failed." });
  }
}
