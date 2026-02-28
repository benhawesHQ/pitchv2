import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

app.use(express.json());
app.use(express.static(__dirname));

// Root
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ===== FIXED API ROUTE (GET) =====
app.get("/api/search", async (req, res) => {
  try {
    const { city } = req.query;

    if (!city) {
      return res.json({ results: [] });
    }

    const query = `live music venue in ${city}`;

    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    if (!data.results) {
      return res.json({ results: [] });
    }

    const results = data.results
      .filter(place => place.business_status === "OPERATIONAL")
      .map(place => ({
        name: place.name,
        formatted_address: place.formatted_address,
        rating: place.rating || "N/A",
        user_ratings_total: place.user_ratings_total || 0,
        photo:
          place.photos?.[0]
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
            : null
      }));

    res.json({ results });

  } catch (err) {
    console.error("SEARCH ERROR:", err);
    res.status(500).json({ results: [] });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
