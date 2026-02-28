import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function handler(event) {
  try {
    const { city, audience, count } = JSON.parse(event.body);

    const prompt = `
You are helping a touring musician find real performance venues.

Return ${count} real venues in ${city} appropriate for an audience of around ${audience} people.

For each venue, return:

- name
- city (include state if US)
- emoji that represents the vibe
- detailed 3–5 sentence description about the venue, its programming style, and why it fits this audience size
- likelihood of response (High / Medium / Low)
- googleQuery (venue name + city only)

Return ONLY valid JSON in this exact format:

[
  {
    "name": "",
    "city": "",
    "emoji": "",
    "description": "",
    "likelihood": "",
    "googleQuery": ""
  }
]

No commentary.
No markdown.
No explanation.
JSON only.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "You return clean JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    const raw = completion.choices[0].message.content.trim();

    const venues = JSON.parse(raw);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ venues })
    };

  } catch (error) {
    console.error("Function error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Something went wrong in search function.",
        details: error.message
      })
    };
  }
}
