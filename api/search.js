export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  try {
    const body = req.body || {};

    const prompt = `Return JSON with a list of venues in ${body.city}`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt
      })
    });

    const raw = await response.text();

    return res.status(200).json({
      openaiStatus: response.status,
      rawResponse: raw
    });

  } catch (error) {
    return res.status(500).json({
      crash: error.message
    });
  }
}
