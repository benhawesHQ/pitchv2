function normalizeCity(input) {
  if (!input) return "";

  let city = input
    .toLowerCase()
    .trim()
    .replace(/\./g, "")
    .replace(/\s+/g, " ");

  city = city
    .replace("city of ", "")
    .replace("downtown ", "")
    .replace("metro ", "");

  city = city
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");

  return city;
}

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const {
      city: rawCity,
      capacity,
      genre = "",
      filters = [],
      extra = ""
    } = req.body;

    const city = normalizeCity(rawCity);

    if (!city) {
      return res.status(400).json({ error: "City required" });
    }

    const filterText =
      filters.length > 0
        ? `Must match these filters if applicable: ${filters.join(", ")}.`
        : "";

    const prompt = `
You are a venue research assistant for indie touring musicians.

Return 15 REAL venues in ${city}.
Capacity around ${capacity}.
Genre or vibe: ${genre}.

${filterText}

Additional artist context:
${extra}

These venues should be likely to respond to emerging indie artists.

Return JSON ONLY in this format:

{
  "venues": [
    {
      "name": "",
      "description": "",
      "capacity": "",
      "email": "",
      "phone": "",
      "website": "",
      "instagram": ""
    }
  ]
}
`;

    const response = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.7,
        input: prompt
      })
    });

    if (!response.ok) {
      return res.status(500).json({ error: "OpenAI failed" });
    }

    const data = await response.json();

    const outputText = data.output?.[0]?.content?.[0]?.text || "";

    const cleaned = outputText.replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch (err) {
      return res.status(500).json({ error: "Invalid JSON returned" });
    }

    return res.status(200).json(parsed);

  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Search failed" });
  }
}
