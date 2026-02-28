import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(express.static(__dirname));

app.post("/api/search", async (req, res) => {
  try {
    const { city } = req.body;
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;

    if (!city) {
      return res.status(400).json({ error: "City required" });
    }

    // Cleaner search query
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=live+music+venue+in+${encodeURIComponent(city)}&key=${apiKey}`;

    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();

    if (!searchData.results || searchData.results.length === 0) {
      return res.json({ venues: [] });
    }

    const venues = [];

    for (let place of searchData.results.slice(0, 15)) {
      if (place.business_status !== "OPERATIONAL") continue;

      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,user_ratings_total,formatted_address,website,opening_hours,photos,reviews,business_status&key=${apiKey}`;

      const detailsResponse = await fetch(detailsUrl);
      const detailsData = await detailsResponse.json();

      const details = detailsData.result;
      if (!details) continue;

      let photoUrl = null;

      if (details.photos && details.photos.length > 0) {
        photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=800&photo_reference=${details.photos[0].photo_reference}&key=${apiKey}`;
      }

      venues.push({
        name: details.name,
        address: details.formatted_address,
        rating: details.rating || 0,
        reviewCount: details.user_ratings_total || 0,
        website: details.website || null,
        isOpen: details.opening_hours?.open_now ?? null,
        photo: photoUrl,
        reviewSnippet: details.reviews?.[0]?.text || null
      });
    }

    res.json({ venues });

  } catch (error) {
    console.error("Google Places error:", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
