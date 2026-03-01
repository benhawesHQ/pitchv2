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
          content: "You return ONLY valid JSON. No commentary. No markdown."
        },
        {
          role: "user",
          content: `
Return an array of venues in this exact format:

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

    let text = completion.choices[0].message.content.trim();

    // 🔥 Remove markdown code fences if they exist
    if (text.startsWith("```")) {
      text = text.replace(/```json/g, "")
                 .replace(/```/g, "")
                 .trim();
    }

    let venues;

    try {
      venues = JSON.parse(text);
    } catch (e) {
      return res.status(500).json({
        error: "JSON parse failed",
        raw: text
      });
    }

    return res.status(200).json({ venues });

  } catch (error) {
    return res.status(500).json({
      error: "OpenAI request failed",
      details: error.message
    });
  }

}
