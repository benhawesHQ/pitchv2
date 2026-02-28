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
Prioritize independent venues and smaller bookable rooms.
Avoid major touring halls unless capacity clearly requires it.
`;
  }

  if (window.tier === "large") {
    priorityLogic = `
Larger established theaters are allowed due to audience size.
`;
  }

  let systemPrompt = `
You are a live music booking researcher in 2026.

CRITICAL FRESHNESS RULE:
Only include venues that are confirmed to still be operating as of 2024–2026.
If uncertain whether a venue is open, EXCLUDE it.

Do NOT include:
- Permanently closed venues
- Recently closed venues
- Relocated venues that no longer operate under original name
- DJ-only clubs
- Nightlife-only bars
- Event spaces without recurring live music

Default behavior:
Only include venues that host LIVE MUSIC with booked performers.

${comedyRequested ? `
Comedy venues allowed only if explicitly requested.
` : `
Exclude comedy clubs unless live music is core programming.
`}

Venue must:
- Have active event listings
- Maintain current online presence
- Be publicly booking or hosting music

Each result must include:
- name
- neighborhood
- description (10–15 factual words specific to music programming)
- emoji
- replyLabel (High booking signal, Moderate booking signal, Lower booking signal)
- replyClass (reply-high, reply-medium, reply-low)

BOOKING SIGNAL guidance:
High booking signal:
- Active 2024–2026 event listings
- Visible booking contact
- Frequent programming

Moderate booking signal:
- Some recurring shows
- Limited booking visibility

Lower booking signal:
- Occasional music events

STRICT OUTPUT:
Return ONLY a JSON array.
No markdown.
No commentary.
No wrapper.
No duplicate venues.
`;

  let userPrompt = `
City: ${city}
Target capacity range: ${window.min || ""}-${window.max || ""}
Expected audience: approximately ${audienceNumber}
Preferences: ${extra || "none"}

${priorityLogic}

Return ${venueCount} venues that:
- Match capacity range
- Are currently operating in 2026
- Regularly host live music
- Match stated preferences

Descriptions must be factual and specific.
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
