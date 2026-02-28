const express = require("express");
const fetch = require("node-fetch");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(express.static("public"));

const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

app.post("/api/search", async (req, res) => {
  try {
    const { city } = req.body;

    if (!city) {
      return res.status(400).json({ venues: [] });
    }

    const query = `live music venue in ${city}`;

    const textSearchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
      query
    )}&key=${GOOGLE_API_KEY}`;

    const response = await fetch(textSearchUrl);
    const data = await response.json();

    console.log("TEXT SEARCH RAW:", data);

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
        open_now:
          place.opening_hours?.open_now !== undefined
            ? place.opening_hours.open_now
            : null,
        photo:
          place.photos && place.photos.length > 0
            ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photo_reference=${place.photos[0].photo_reference}&key=${GOOGLE_API_KEY}`
            : null
      }));

    res.json({ venues });
  } catch (error) {
    console.error("SEARCH ERROR:", error);
    res.status(500).json({ venues: [] });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
