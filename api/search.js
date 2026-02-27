import OpenAI from "openai";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { city, genre, likely } = req.body;

  if (!city) {
    return res.status(400).json({ error: "City required" });
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  const vibe = genre || "live music";

  const likelihoodNote = likely
    ? "Focus on venues that book emerging or independent artists."
    : "Include a mix of established and smaller venues.";

  const prompt = `
Generate 6 real venues in ${city} that host ${vibe} performances.
${likelihoodNote}

Respond ONLY with valid JSON.
No explanation.

Format:

{
  "results": [
    {
      "name": "",
      "address": "",
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

    // Safely extract JSON if AI wraps it in code blocks
    const cleaned = text.replace(/```json|```/g, "").trim();

    const json = JSON.parse(cleaned);

    res.status(200).json(json);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI search failed." });
  }
}
