import OpenAI from "openai";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { city, audience, vibe, count } = req.body;

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
  });

  try {

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You return only clean JSON. No commentary."
        },
        {
          role: "user",
          content: `
Return ONLY valid JSON.

Format exactly like this:

[
  {
    "name": "Venue Name",
    "description": "Short description",
    "capacity": "Approx capacity"
  }
]

Give me ${count} real music venues in ${city}.
Ideal capacity around ${audience}.
Vibe: ${vibe || "any"}.
`
        }
      ],
      temperature: 0.7
    });

    const text = completion.choices[0].message.content.trim();

    let venues;

    try {
      venues = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({
        error: "Invalid JSON from AI",
        raw: text
      });
    }

    return res.status(200).json({ venues });

  } catch (error) {
    return res.status(500).json({ error: "OpenAI failed", details: error.message });
  }

}
