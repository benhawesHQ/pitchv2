export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { city, audience, shortlistSize, filters } = req.body;

    const prompt = `
You are an expert live music venue researcher.

Find ${shortlistSize} real live music venues in ${city} that fit an audience size of approximately ${audience} people.

Apply filters if provided: ${JSON.stringify(filters)}

Return ONLY valid JSON in this exact format:

[
  {
    "name": "Venue Name",
    "neighborhood": "Neighborhood",
    "capacity": "Estimated capacity",
    "whyFit": "Short explanation of why this venue is a strong fit"
  }
]

No commentary. JSON only.
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt
      })
    });

    const data = await response.json();

    if (!response.ok) {
      console.error(data);
      return res.status(500).json({ error: "OpenAI API error" });
    }

    const text = data.output_text;

    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch {
      console.error("Bad JSON:", text);
      return res.status(500).json({ error: "Invalid JSON from model" });
    }

    return res.status(200).json(parsed);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Server error" });
  }
}
