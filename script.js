function formatCity(city) {
  return city
    .toLowerCase()
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

async function search() {

  const cityInput = document.getElementById("city").value;
  const genre = document.getElementById("genre").value;
  const likely = document.getElementById("likely").checked;

  const cleanCity = formatCity(cityInput);

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "🎵 Finding venues...";

  try {

    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city: cleanCity, genre, likely })
    });

    const data = await response.json();

    resultsDiv.innerHTML = `<div class="section-title">🎶 Venues in ${cleanCity}</div>`;

    data.results.forEach(venue => {

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <h3>${venue.name}</h3>
        <div class="badge">${genre || "Live Music Venue"}</div>
        <div style="margin-top:10px; opacity:.7;">${cleanCity}</div>

        <div class="stack">
          ${venue.instagram ? `<a class="contact-btn" href="${venue.instagram}" target="_blank">Instagram</a>` : ""}
          ${venue.email ? `<a class="contact-btn" href="mailto:${venue.email}">Email</a>` : ""}
          ${venue.phone ? `<a class="contact-btn" href="tel:${venue.phone}">Call</a>` : ""}
        </div>
      `;

      resultsDiv.appendChild(card);
    });

  } catch (err) {
    resultsDiv.innerHTML = "Error loading venues.";
  }
}
