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
   PATH SETUP (for static files)
============================== */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* ==============================
   SERVE FRONTEND FILES
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
   OPENAI ENDPOINT
============================== */

app.post("/api/generate", async (req, res) => {
  try {
    const { prompt } = req.body;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You are a helpful assistant helping musicians find venues." },
        { role: "user", content: prompt }
      ]
    });

    res.json({
      result: completion.choices[0].message.content
    });

  } catch (error) {
    console.error("OpenAI error:", error);
    res.status(500).json({ error: "OpenAI request failed" });
  }
});

/* ==============================
   GOOGLE PLACES PROXY
============================== */

app.get("/api/places", async (req, res) => {
  try {
    const { query } = req.query;

    const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${process.env.GOOGLE_PLACES_API_KEY}`;

    const response = await fetch(url);
    const data = await response.json();

    res.json(data);

  } catch (error) {
    console.error("Google Places error:", error);
    res.status(500).json({ error: "Google Places request failed" });
  }
});

/* ==============================
   FALLBACK ROUTE (SERVE INDEX)
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
