const prompt = `
You are helping an indie musician book shows.

Return EXACTLY 15 REAL venues in ${city}.

Audience draw: ${audience} people.

If audience is small (<150), prioritize 20–200 capacity rooms.
If large (>1000), include larger venues.

Respect filters if present.

Return ONLY valid JSON.

Format:

{
  "venues": [
    {
      "name": "Venue Name",
      "neighborhood": "Area",
      "capacity": "Approx capacity range",
      "replyLikelihood": 1-100,
      "activitySignal": "Why they seem active recently",
      "whyThisFits": "Why this venue makes sense",
      "bookingTip": "How to approach them",
      "instagram": "Instagram URL if known or null",
      "email": "Booking email if known or null",
      "phone": "Public phone number if known or null",
      "website": "Official website URL if known or null"
    }
  ]
}
`;
