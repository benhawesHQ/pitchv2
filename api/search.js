export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { city, audience } = req.body;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: `Find 5 live music venues in ${city} that fit an audience size of ${audience}.
Return ONLY valid JSON in this exact format:
[
  {
    "name": "",
    "neighborhood": "",
    "capacity": "",
    "likelihood_score": 0,
    "reason": ""
  }
]`
      })
    });

    const data = await response.json();

    res.status(200).json(data);

  } catch (error) {
    res.status(500).json({ error: "Server error." });
  }
}
