import express from "express";
import cors from "cors";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

/* ===============================
   ROOT ROUTE (fixes Cannot GET /)
================================ */

app.get("/", (req, res) => {
  res.send("Pitch backend is live 🎤");
});

/* ===============================
   SEARCH ROUTE
================================ */

app.post("/search", async (req, res) => {
  try {
    const { city, audience, count = 10 } = req.body;

    if (!city) {
      return res.status(400).json({ error: "City required" });
    }

    /* ===============================
       GOOGLE PLACES SEARCH
    ================================= */

    const googleResponse = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=live music venue in ${encodeURIComponent(city)}&key=${process.env.GOOGLE_PLACES_API_KEY}`
    );

    const googleData = await googleResponse.json();

    if (!googleData.results) {
      return res.status(500).json({ error: "Google Places failed" });
    }

    const places = googleData.results.slice(0, count);

    /* ===============================
       ENRICH WITH OPENAI
    ================================= */

    const venues = [];

    for (const place of places) {
      const prompt = `
Write a compelling 3–4 sentence description of the live music venue:
Name: ${place.name}
Location: ${place.formatted_address}
Audience size target: ${audience || "general live music audience"}

Make it feel vivid and performance-focused.
Include capacity feel, vibe, and what type of artist fits best.
Do NOT invent fake history.
      `;

      const openaiResponse = await fetch(
        "https://api.openai.com/v1/chat/completions",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [{ role: "user", content: prompt }],
            temperature: 0.8
          })
        }
      );

      const openaiData = await openaiResponse.json();

      const description =
        openaiData.choices?.[0]?.message?.content ||
        "A live performance venue with active programming.";

      venues.push({
        name: place.name,
        city: city,
        address: place.formatted_address,
        emoji: "🎤",
        description: description,
        googleQuery: `${place.name} ${city}`
      });
    }

    return res.json({ venues });

  } catch (error) {
    console.error("SERVER ERROR:", error);
    return res.status(500).json({ error: "Server error" });
  }
});

/* ===============================
   START SERVER
================================ */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
