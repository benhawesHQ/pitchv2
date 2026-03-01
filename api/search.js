import OpenAI from "openai";

export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { city, audience, vibe, count } = req.body;

    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const prompt = `
    Give me ${count} real music venues in ${city}.
    Ideal capacity around ${audience}.
    Vibe: ${vibe || "any"}.
    Return as JSON array.
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    const text = completion.choices[0].message.content;

    return res.status(200).json({ result: text });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}
