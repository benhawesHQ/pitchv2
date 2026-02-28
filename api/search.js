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
  if (n <= 50) return { min: 15, max: 100, tier: "micro" };
  if (n <= 120) return { min: 40, max: 200, tier: "indie" };
  if (n <= 300) return { min: 150, max: 500, tier: "mid" };
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

  if (window.tier === "micro") {
    priorityLogic = `
Strictly prioritize small rooms, backroom stages, bars with intimate music setups.
Avoid venues over 120 capacity.
`;
  }

  if (window.tier === "indie") {
    priorityLogic = `
Prioritize independent venues and mid-sized rooms.
Avoid major touring halls.
`;
  }

  if (window.tier === "large") {
    priorityLogic = `
Larger established music halls allowed due to audience size.
`;
  }

  let systemPrompt = `
You are a live music booking researcher in 2026.

CRITICAL RULES:
- Return ONLY real, currently operating venues.
- If uncertain about operational status, exclude the venue.
- No duplicates.
- Never invent venues.

DEFAULT:
Only include venues that host LIVE MUSIC with booked performers.

Exclude:
- DJ-only venues
- Nightlife-only bars
- Party bars
- Event spaces without recurring live music

${comedyRequested ? `
Comedy venues allowed because user requested comedy.
` : `
Exclude comedy clubs unless live music is core programming.
`}

Each venue must:
- Have active event listings
- Maintain online presence
- Host live music performers

Each result must include:
- name
- neighborhood
- description (20–30 factual words specific to live music programming)
- emoji (bright, visible on dark background)
- replyLabel (High likelihood to reply, Moderate likelihood to reply, Lower likelihood to reply)
- replyClass (reply-high, reply-medium, reply-low)
- bestFit (estimated ideal audience range, like "30–80 guests")

LIKELIHOOD LOGIC:
High likelihood:
- Active calendar
- Public booking contact
- Frequent programming

Moderate likelihood:
- Some recurring shows
- Limited booking visibility

Lower likelihood:
- Occasional live music

STRICT OUTPUT:
Return ONLY a JSON array.
No markdown.
No commentary.
No wrapper.
`;

  let userPrompt = `
City: ${city}
Target capacity range: ${window.min || ""}-${window.max || ""}
Expected audience: approximately ${audienceNumber}
Preferences: ${extra || "none"}

${priorityLogic}

Return ${venueCount} venues that:
- Match capacity range
- Are currently operating
- Regularly host live music
- Match stated preferences

Descriptions must be specific and factual.
Include neighborhood.
`;

  try {

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.1,
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
