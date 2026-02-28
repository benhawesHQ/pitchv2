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
  if (n <= 25) return { min: 15, max: 75, tier: "indie" };
  if (n <= 75) return { min: 40, max: 150, tier: "indie" };
  if (n <= 120) return { min: 75, max: 250, tier: "indie" };
  if (n <= 300) return { min: 150, max: 500, tier: "mixed" };
  if (n <= 1200) return { min: 500, max: 2000, tier: "large" };
  return { mode: "platform" };
}

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { city, audience, extra, count } = req.body;

  if (!city) {
    return res.status(400).json({ error: "City required" });
  }

  const audienceNumber = extractAudienceNumber(audience);
  const window = capacityWindow(audienceNumber);
  const venueCount = parseInt(count) || 10;

  const lowerExtra = (extra || "").toLowerCase();
  const comedyRequested =
    lowerExtra.includes("comedy") ||
    lowerExtra.includes("standup") ||
    lowerExtra.includes("improv");

  let priorityLogic = "";

  if (window.tier === "indie") {
    priorityLogic = `
Prioritize independent venues, small rooms, backroom stages, DIY spaces.
Avoid major touring theaters.
`;
  }

  if (window.tier === "large") {
    priorityLogic = `
Include larger theaters and established music halls.
Do not limit to indie rooms.
`;
  }

  let systemPrompt = `
You are a live music booking researcher.

CRITICAL RULES:
- Return ONLY real, currently operating venues.
- No duplicates.
- Never invent venues.
- Never fabricate details.

DEFAULT BEHAVIOR:
Only include venues that host LIVE MUSIC shows with booked performers.
Exclude:
- DJ-only venues
- Nightlife-only bars
- Party bars
- Dance clubs
- Event spaces without recurring live music programming

${comedyRequested ? `
Comedy clubs allowed only if user requested comedy.
` : `
Exclude comedy clubs unless live music is core programming.
`}

Each venue must:
- Have a stage or dedicated performance space
- Publicly list events
- Have history of hosting performers

Each result must include:
- name
- neighborhood
- description (10-15 factual words specific to music programming)
- emoji
- replyLabel (High booking signal, Moderate booking signal, Lower booking signal)
- replyClass (reply-high, reply-medium, reply-low)

BOOKING SIGNAL:
High booking signal:
- Active event calendar
- Public booking contact
- Regular weekly music programming

Moderate booking signal:
- Some live music programming
- Basic online presence

Lower booking signal:
- Infrequent music programming

STRICT FORMAT:
Return ONLY a JSON array.
No markdown.
No commentary.
No wrapper object.
`;

  let userPrompt = `
City: ${city}
Target capacity range: ${window.min || ""}-${window.max || ""}
Expected audience: approximately ${audienceNumber}
Preferences: ${extra || "none"}

${priorityLogic}

Return ${venueCount} venues that:
- Match capacity range
- Regularly host live music performances
- Are recognized locally for music programming
- Match stated preferences

Include neighborhood.
Descriptions must be factual.
`;

  try {

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.2,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt }
      ],
    });

    const content = completion.choices[0].message.content;

    let parsed;
    try {
      parsed = JSON.parse(content);
    } catch (e) {
      const match = content.match(/\[.*\]/s);
      if (match) {
        parsed = JSON.parse(match[0]);
      } else {
        return res.status(500).json({ error: "Invalid JSON from AI" });
      }
    }

    return res.status(200).json(parsed);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Search failed" });
  }
}
