async function searchVenues() {

  const city = document.getElementById("cityInput").value.trim();
  const audience = document.getElementById("audienceInput").value.trim();
  const vibe = document.getElementById("vibeInput").value.trim();

  if (!city || !audience) {
    alert("Please enter city and audience size.");
    return;
  }

  const overlay = document.getElementById("loadingOverlay");
  const container = document.getElementById("results");

  overlay.classList.add("active");
  container.innerHTML = "";

  try {

    const response = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ city, audience, vibe })
    });

    if (!response.ok) {
      throw new Error("Server error");
    }

    const data = await response.json();

    if (!data.venues || data.venues.length === 0) {
      container.innerHTML = "<p>No venues found.</p>";
      return;
    }

    data.venues.forEach(v => {
      container.innerHTML += renderVenue(v);
    });

  } catch (err) {
    console.error("Search failed:", err);
    container.innerHTML = "<p>Something went wrong. Try again.</p>";
  } finally {
    overlay.classList.remove("active");
  }
}

function renderVenue(v) {

  const statusClass =
    v.contact_likelihood === "likely"
      ? "status-good"
      : v.contact_likelihood === "unlikely"
      ? "status-hard"
      : "status-neutral";

  const statusText =
    v.contact_likelihood === "likely"
      ? "Likely to Reply"
      : v.contact_likelihood === "unlikely"
      ? "Harder to Book"
      : "Open";

  return `
    <div class="venue-card">

      <div class="status-badge ${statusClass}">
        ${statusText}
      </div>

      <div class="venue-name">${v.name}</div>

      <div class="venue-capacity">
        Estimated capacity: ${v.capacity_estimate || "Unknown"}
      </div>

      <div class="venue-labels">
        ${(v.labels || []).map(label =>
          `<span class="venue-pill">${label}</span>`
        ).join("")}
      </div>

    </div>
  `;
}
