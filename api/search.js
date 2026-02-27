export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const body = req.body || {};
    const city = body.city || "Utah";
    const audience = body.audience || "";

    const prompt = `
Return ONLY valid JSON.
No explanation.
No markdown.
No backticks.

Format:
{
  "venues": [
    {
      "name": "Venue Name",
      "location": "Neighborhood or area",
      "capacity": "Approx capacity",
      "why": "Why it fits this artist"
    }
  ]
}

City: ${city}
Audience size: ${audience}
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
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

    return res.status(200).json(parsed);

  } catch (error) {
    return res.status(500).json({
      error: "Parsing or OpenAI error",
      details: error.message
    });
  }
}
