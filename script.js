async function searchVenues() {

  const city = document.getElementById("cityInput").value;
  const audience = document.getElementById("audienceInput").value;
  const extra = document.getElementById("extraInput")?.value;
  const count = document.getElementById("countSelect")?.value;

  if (!city) return;

  const overlay = document.getElementById("loadingOverlay");
  overlay.classList.add("active");

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "";

  try {

    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, audience, extra, count })
    });

    const data = await res.json();

    data.forEach(venue => {

      const card = document.createElement("div");
      card.className = "venue-card";

      const googleLink = `https://www.google.com/search?q=${encodeURIComponent(venue.name + " " + city)}`;

      card.innerHTML = `
        <div class="venue-header">
          <div class="venue-name">
            ${venue.emoji || "🎵"} ${venue.name}
          </div>
          <div class="booking-badge ${venue.replyClass}">
            ${venue.replyLabel}
          </div>
        </div>

        <div class="venue-location">
          ${venue.neighborhood}, ${city}
        </div>

        <div class="venue-description">
          ${venue.description}
        </div>

        <div class="venue-actions">
          <a href="${googleLink}" target="_blank" class="see-venue-btn">
            See Venue
          </a>
        </div>
      `;

      resultsDiv.appendChild(card);
    });

  } catch (err) {
    resultsDiv.innerHTML = "Error loading venues.";
  }

  overlay.classList.remove("active");
}
