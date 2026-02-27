export default async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { city, genre, likely } = req.body;

  if (!city) {
    return res.status(400).json({ error: "City is required" });
  }

  // Temporary mock data so we know frontend works
  const mockVenues = [
    {
      name: "The Indie Room",
      address: `${city}`,
      instagram: "https://instagram.com",
      email: "booking@indieroom.com",
      phone: "123-456-7890"
    },
    {
      name: "Cabaret Nights",
      address: `${city}`,
      instagram: "https://instagram.com",
      email: "info@cabaretnights.com",
      phone: "123-456-7890"
    }
  ];

  res.status(200).json({ results: mockVenues });
}
