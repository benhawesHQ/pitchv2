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

    const primary = [];
    const secondary = [];

    data.forEach(v => {
      if (v.replyClass === "reply-low") {
        secondary.push(v);
      } else {
        primary.push(v);
      }
    });

    function renderVenue(venue) {

      const googleLink =
        `https://www.google.com/search?q=${encodeURIComponent(venue.name + " " + city)}`;

      return `
        <div class="venue-card">
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

          <div style="font-size:13px; opacity:.7; margin-bottom:12px;">
            Best fit: ${venue.bestFit || "Similar audience size"}
          </div>

          <a href="${googleLink}" target="_blank" class="see-venue-btn">
            See Venue
          </a>
        </div>
      `;
    }

    if (primary.length > 0) {
      resultsDiv.innerHTML += primary.map(renderVenue).join("");
    }

    if (secondary.length > 0) {
      resultsDiv.innerHTML += `
        <div style="margin-top:40px; font-family:Poppins; font-size:18px;">
          Additional venues (lower reply likelihood)
        </div>
        <div style="opacity:.7; margin-bottom:15px;">
          These venues host music but may be slower to respond.
        </div>
      `;
      resultsDiv.innerHTML += secondary.map(renderVenue).join("");
    }

  } catch (err) {
    resultsDiv.innerHTML = "Error loading venues.";
  }

  overlay.classList.remove("active");
}
