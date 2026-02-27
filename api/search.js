export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = req.body || {};

    const city = body.city || "";
    const audience = body.audience || "";
    const filters = Object.keys(body)
      .filter(key => body[key] === true)
      .join(", ");

    const prompt = `
Return ONLY valid JSON.
No backticks.
No explanation.
No text outside JSON.

Format:
{
  "venues": [
    {
      "name": "Venue Name",
      "neighborhood": "Area",
      "capacity": "Approx capacity",
      "why": "Why it's a fit"
    }
  ]
}

City: ${city}
Audience size: ${audience}
Filters: ${filters}
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: \`Bearer \${process.env.OPENAI_API_KEY}\`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt
      })
    });

    const data = await response.json();

    const text = data.output?.[0]?.content?.[0]?.text || "{}";

    const clean = text.replace(/```json/g, "").replace(/```/g, "").trim();

    const parsed = JSON.parse(clean);

    res.status(200).json(parsed);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
