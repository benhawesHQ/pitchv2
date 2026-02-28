import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

function extractAudienceNumber(input) {
  if (!input) return 50;

  const numbers = input.match(/\d+/g);
  if (!numbers) return 50;

  return parseInt(numbers[0]);
}

function capacityWindow(n) {
  if (n <= 25) return { min: 15, max: 75 };
  if (n <= 75) return { min: 40, max: 150 };
  if (n <= 200) return { min: 100, max: 300 };
  if (n <= 500) return { min: 300, max: 700 };
  if (n <= 1000) return { min: 500, max: 1200 };
  if (n > 10000) return { mode: "platform" };

  return { min: 200, max: 500 };
}

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { city, audience } = req.body;

  if (!city) {
    return res.status(400).json({ error: "City required" });
  }

  const audienceNumber = extractAudienceNumber(audience);
  const window = capacityWindow(audienceNumber);

  let systemPrompt = `
You are a live music booking researcher.

Return real, currently operating venues that regularly book emerging independent musicians.

STRICT RULES:
- Only suggest venues under 500 capacity unless capacity range allows higher.
- Never suggest arenas.
- Never suggest stadiums.
- Never suggest theaters over 1500 capacity.
- Never suggest major touring stops.
- Avoid famous legacy rooms.
- Avoid corporate event venues.
- Avoid wedding venues.
- Favor slightly smaller rooms over larger ones if uncertain.

Only return real venue names.

Output STRICT JSON array format:
[
  { "name": "Venue Name" }
]

No markdown.
No commentary.
No extra text.
`;

  let userPrompt = "";

  if (window.mode === "platform") {

    userPrompt = `
City: ${city}

The artist wants to reach extremely large audiences (10,000+).

Do NOT suggest stadiums or arenas.

Instead return scalable platforms such as:
- Festivals that accept emerging artists
- Showcase circuits
- Regional support slot pathways
- College booking networks
- Sofar-style showcase platforms

Return only real, legitimate platforms or circuits.
`;

  } else {

    userPrompt = `
City: ${city}

Target venue capacity range: ${window.min}–${window.max}.

Match venue size closely to the artist's expected draw of approximately ${audienceNumber} people.

Only include venues known locally for booking independent artists.

Do not suggest venues significantly larger than the expected audience.
Favor slightly smaller rooms if uncertain.
`;

  }

  try {

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
    });

    let content = completion.choices[0].message.content;

    // Force clean JSON parsing
    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      return res.status(500).json({ error: "Invalid JSON from AI" });
    }

    return res.status(200).json(parsed);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Search failed" });
  }
}
