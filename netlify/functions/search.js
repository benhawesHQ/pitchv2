import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function handler(event) {
  try {
    const { city, audience, count } = JSON.parse(event.body);

    const prompt = `
Return ${count} real performance venues in ${city}
suitable for an audience of about ${audience} people.

For each venue return:
- name
- city (include state if US)
- emoji
- 2–3 sentence description
- likelihood (High / Medium / Low)
- googleQuery (venue name + city)

Return ONLY JSON array.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Return valid JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.6,
      max_tokens: 1000
    });

    let raw = completion.choices[0].message.content.trim();
    raw = raw.replace(/```json/g, "").replace(/```/g, "");

    const match = raw.match(/\[[\s\S]*\]/);
    if (!match) throw new Error("Invalid JSON");

    const venues = JSON.parse(match[0]);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ venues })
    };

  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
}
