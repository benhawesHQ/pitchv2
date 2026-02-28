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

  const { city, audience, extra, count } = req.body;

  if (!city) {
    return res.status(400).json({ error: "City required" });
  }

  const audienceNumber = extractAudienceNumber(audience);
  const window = capacityWindow(audienceNumber);
  const venueCount = parseInt(count) || 10;

  let systemPrompt = `
You are a live music booking researcher.

Return REAL, currently operating venues only.

Never invent venues.
Never fabricate details.
Never guess websites.
Never include venues that do not exist.

Each result must include:
- name
- short description (10-15 words max)
- emoji representing vibe
- replyLabel (one of: "High reply signal", "Moderate reply signal", "Low reply signal")
- replyClass (one of: reply-high, reply-medium, reply-low)

Reply signal estimation logic:
High reply signal:
- Active Instagram
- Regular live events
- Public booking email or DM booking process

Moderate reply signal:
- Some event history
- Basic online presence

Low reply signal:
- Sparse updates
- Hard-to-find contact method

STRICT OUTPUT FORMAT:
Return ONLY a JSON array.
No markdown.
No explanation.
No wrapper object.
`;

  let userPrompt = "";

  if (window.mode === "platform") {

    userPrompt = `
City: ${city}

The artist is targeting extremely large audiences.

Return ${venueCount} scalable platforms such as:
- Emerging artist festivals
- Showcase circuits
- Regional support pathways

Still follow JSON format rules.
`;

  } else {

    userPrompt = `
City: ${city}
Target capacity range: ${window.min}-${window.max}
Artist expected audience: approximately ${audienceNumber}
Preferences: ${extra || "none specified"}

Return ${venueCount} venues that:
- Match capacity range
- Regularly book emerging artists
- Match preferences when possible
- Are locally known for live music

Short description must be 10-15 words only.
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
