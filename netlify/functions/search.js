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
- emoji
- detailed 3–5 sentence description
- likelihood of response (High / Medium / Low)
- googleQuery (venue name + city)

Return ONLY JSON array. No commentary.
`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: "Return valid JSON only." },
        { role: "user", content: prompt }
      ],
      temperature: 0.7
    });

    let raw = completion.choices[0].message.content.trim();

    // Remove possible markdown wrapping
    raw = raw.replace(/```json/g, "").replace(/```/g, "");

    // Extract JSON array if extra text appears
    const jsonMatch = raw.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      throw new Error("No JSON array found in response");
    }

    const venues = JSON.parse(jsonMatch[0]);

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ venues })
    };

  } catch (error) {
    console.error("Search function error:", error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: "Function failed",
        details: error.message
      })
    };
  }
}
