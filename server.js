import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());

// Serve root files (because you don't have a public folder)
app.use(express.static(__dirname));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

app.post("/api/search", async (req, res) => {
  try {
    const { city, audience, vibe } = req.body;

    const prompt = `
You are a booking agent.

Find 10 real music venues in ${city} appropriate for an audience of around ${audience} people.

Preferred vibe: ${vibe || "intimate live music space"}.

Return JSON only in this format:

{
  "venues": [
    {
      "name": "Venue Name",
      "capacity_estimate": "Number",
      "labels": ["Cabaret", "Intimate"],
      "contact_likelihood": "likely"
    }
  ]
}
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7
    });

    const text = completion.choices[0].message.content;

    const parsed = JSON.parse(text);

    res.json(parsed);

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Search failed." });
  }
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
