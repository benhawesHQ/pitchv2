import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(express.json());

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

// ===== STATIC FILES =====
app.use(express.static(__dirname));

// Explicit root handler
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ===== API ROUTE =====
app.post("/api/search", async (req, res) => {
  try {
    const { city } = req.body;

    if (!city) {
      return res.json({ venues: [] });
    }

    const query = `live music venue in ${city}`;

    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}&key=${GOOGLE_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    console.log("GOOGLE RESPONSE:", data.status);

    if (!data.results || data.results.length === 0) {
      return res.json({ venues: [] });
    }

    const venues = data.results
      .filter(place => place.business_status === "OPERATIONAL")
      .map(place => ({
        name: place.name,
        address: place.formatted_address,
        rating: place.rating || "N/A",
        reviews: place.user_ratings_total || 0,
        photo:
          place.photos?.[0]
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
            : null
      }));

    res.json({ venues });

  } catch (err) {
    console.error("SEARCH ERROR:", err);
    res.status(500).json({ venues: [] });
  }
});

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
