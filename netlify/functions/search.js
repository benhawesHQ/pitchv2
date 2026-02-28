import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function handler(event) {
  try {
    const { city, audience, vibe, count } = JSON.parse(event.body);

    const prompt = `
Suggest ${count + 5} real live music venues in ${city}
suitable for approximately ${audience} guests.

Vibe preference: ${vibe || "None specified"}.

Return ONLY valid JSON in this format:

[
  {
    "name": "",
    "neighborhood": "",
    "description": "",
    "replyLikelihood": "High | Medium | Low"
  }
]
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Return JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    return {
      statusCode: 200,
      body: completion.choices[0].message.content
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
