import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fetch from "node-fetch";
import OpenAI from "openai";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 10000;

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

/* -----------------------------
   HEALTH CHECK
------------------------------ */

app.get("/", (req, res) => {
  res.json({ status: "Server is running 🚀" });
});

/* -----------------------------
   OPENAI ENDPOINT
------------------------------ */

app.post("/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt }
      ]
    });

    res.json({
      result: completion.choices[0].message.content
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "OpenAI request failed" });
  }
});

/* -----------------------------
   GOOGLE PLACES PROXY
------------------------------ */

app.get("/places", async (req, res) => {
  try {
    const { query } = req.query;

    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${process.env.GOOGLE_PLACES_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Google Places request failed" });
  }
});

/* -----------------------------
   START SERVER
------------------------------ */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
