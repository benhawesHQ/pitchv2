import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import OpenAI from "openai";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

/* ==============================
   PATH SETUP
============================== */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ==============================
   SERVE FRONTEND
============================== */

app.use(express.static(__dirname));

/* ==============================
   OPENAI SETUP
============================== */

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* ==============================
   HEALTH CHECK
============================== */

app.get("/api/health", (req, res) => {
  res.json({ status: "Server is running 🚀" });
});

/* ==============================
   GOOGLE PLACES VENUE SEARCH
============================== */

app.get("/api/places", async (req, res) => {
  try {
    const { city, audience = 50, count = 10 } = req.query;

    if (!city) {
      return res.status(400).json({ error: "City is required." });
    }

    // Tuned query for music venues
    const searchQuery = `live music venue OR performance space OR music club OR small theater in ${city}`;

    const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      searchQuery
    )}&key=${process.env.GOOGLE_PLACES_API_KEY}`;

    const textResponse = await fetch(textSearchUrl);
    const textData = await textResponse.json();

    if (!textData.results) {
      return res.json([]);
    }

    // Filter out permanently closed
    const openVenues = textData.results.filter(
      (place) => place.business_status !== "CLOSED_PERMANENTLY"
    );

    // Get detailed info
    const detailedResults = await Promise.all(
      openVenues.slice(0, count).map(async (place) => {
        const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,user_ratings_total,website,opening_hours,photos,formatted_address,business_status,types,url&key=${process.env.GOOGLE_PLACES_API_KEY}`;

        const detailsRes = await fetch(detailsUrl);
        const detailsData = await detailsRes.json();

        const details = detailsData.result;

        if (!details) return null;

        let photoUrl = null;

        if (details.photos && details.photos.length > 0) {
          photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${details.photos[0].photo_reference}&key=${process.env.GOOGLE_PLACES_API_KEY}`;
        }

        return {
          name: details.name,
          address: details.formatted_address,
          rating: details.rating ?? null,
          reviewCount: details.user_ratings_total ?? 0,
          website: details.website ?? null,
          isOpen: details.opening_hours?.open_now ?? null,
          googleMapsLink: details.url,
          photo: photoUrl,
          types: details.types ?? []
        };
      })
    );

    res.json(detailedResults.filter(Boolean));

  } catch (error) {
    console.error("Google Places error:", error);
    res.status(500).json({ error: "Places request failed." });
  }
});

/* ==============================
   OPENAI ENHANCEMENT LAYER
============================== */

app.post("/api/generate", async (req, res) => {
  try {
    const { venues, audience } = req.body;

    const prompt = `
You are helping a touring musician choose venues.

Audience size: ${audience}

Here are venues:
${JSON.stringify(venues, null, 2)}

For each venue, briefly explain why it might be a good fit.
Keep it concise and helpful.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a venue research assistant." },
        { role: "user", content: prompt }
      ]
    });

    res.json({
      result: completion.choices[0].message.content
    });

  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: "OpenAI request failed." });
  }
});

/* ==============================
   FALLBACK ROUTE
============================== */

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

/* ==============================
   START SERVER
============================== */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
