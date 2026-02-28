import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export default async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(405).json({ error: "Method not allowed" });
    }

    const { city, audience } = req.body;

    if (!city) {
      return res.status(400).json({ error: "City required" });
    }

    const prompt = `
Return a JSON array of 10 real music venues in ${city}.
Each object must follow this format:

[
  { "name": "Venue Name" }
]

Only return JSON. No markdown. No explanation.
`;

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: prompt,
      temperature: 0.7
    });

    const text = response.output[0].content[0].text;

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch {
      console.error("Failed to parse model response:", text);
      return res.status(500).json({ error: "Invalid AI response" });
    }

    return res.status(200).json(parsed);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}
