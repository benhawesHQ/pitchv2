const prompt = `
Generate 8 real venues in ${normalizedCity} that host ${vibe} performances.
${likelihoodNote}

For each venue include ONLY:

- name
- neighborhood
- description (max 12 words)
- likelihood score 1-10 for responding to emerging artists
- one emoji that matches the venue vibe

Do NOT invent emails, phone numbers, or Instagram handles.

Respond ONLY with valid JSON:

{
  "results": [
    {
      "name": "",
      "neighborhood": "",
      "description": "",
      "likelihood": 0,
      "emoji": ""
    }
  ]
}
`;
