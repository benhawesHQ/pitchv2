import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(express.json());

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

/* ===== STATIC ===== */
app.use(express.static(__dirname));
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* ===== SEARCH ROUTE ===== */
app.post("/api/search", async (req, res) => {
  try {
    const { city, audience, vibe } = req.body;

    const googleQuery = `live music venue in ${city}`;

    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(googleQuery)}&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results) return res.json({ venues: [] });

    /* HARD EXCLUDE LARGE VENUES */
    const filtered = data.results.filter(place => {
      const name = place.name.toLowerCase();

      const bigWords = [
        "arena",
        "stadium",
        "paramount",
        "center",
        "hall",
        "theatre",
        "theater",
        "pavilion"
      ];

      if (bigWords.some(word => name.includes(word))) return false;
      if (place.user_ratings_total > 1500) return false;

      return true;
    });

    /* SEND TO AI FOR CLASSIFICATION */
    const prompt = `
You are a booking agent.

Artist details:
City: ${city}
Expected audience: ${audience}
Desired vibe: ${vibe}

From the list below, classify each venue.

Return JSON:
{
  venues: [
    {
      name,
      capacity_estimate,
      contact_likelihood (likely | neutral | unlikely),
      labels: [max 4 short badges]
    }
  ]
}

Badges should feel like:
"🎯 Great for 30–60"
"🎸 Rock-ready stage"
"💌 DM friendly"
"🕯 Intimate room"
"🏠 Back room energy"

Do not rank them.
Do not invent venues.
Only classify the list provided.

Venues:
${JSON.stringify(filtered.map(v => ({
      name: v.name,
      reviews: v.user_ratings_total,
      address: v.formatted_address
    })))}
`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3
    });

    const parsed = JSON.parse(aiResponse.choices[0].message.content);

    res.json({ venues: parsed.venues });

  } catch (err) {
    console.error(err);
    res.status(500).json({ venues: [] });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on ${PORT}`);
});
