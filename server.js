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

    // 1️⃣ Geocode city
    const geoUrl = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(city)}&key=${apiKey}`;
    const geoResponse = await fetch(geoUrl);
    const geoData = await geoResponse.json();

    if (!geoData.results || geoData.results.length === 0) {
      return res.json({ venues: [] });
    }

    const location = geoData.results[0].geometry.location;

    // 2️⃣ Broader Nearby Search (no type restriction)
    const nearbyUrl = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${location.lat},${location.lng}&radius=8000&keyword=live+music+venue+club+theater+stage&key=${apiKey}`;

    const nearbyResponse = await fetch(nearbyUrl);
    const nearbyData = await nearbyResponse.json();

    if (!nearbyData.results) {
      return res.json({ venues: [] });
    }

    const seen = new Set();
    const venues = [];

    for (let place of nearbyData.results) {
      if (place.business_status !== "OPERATIONAL") continue;
      if (seen.has(place.place_id)) continue;

      seen.add(place.place_id);

      const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place.place_id}&fields=name,rating,user_ratings_total,formatted_address,website,opening_hours,photos,reviews&key=${apiKey}`;

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

      if (venues.length >= 15) break;
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
