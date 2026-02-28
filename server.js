import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();

const app = express();
app.use(express.json());

app.post("/search", async (req, res) => {
  try {
    const { city, count } = req.body;

    const apiKey = process.env.GOOGLE_PLACES_KEY;

    const query = `live music venue in ${city}`;

    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${apiKey}`;

    const response = await fetch(url);
    const data = await response.json();

    const venues = data.results.slice(0, count || 10).map(place => ({
      name: place.name,
      city,
      emoji: "🎤",
      description: `Rated ${place.rating || "N/A"} stars with ${place.user_ratings_total || 0} reviews.`,
      likelihood: "Medium",
      googleQuery: `${place.name} ${city}`
    }));

    res.json({ venues });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
