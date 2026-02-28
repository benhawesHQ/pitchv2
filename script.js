async function searchVenues() {

  const city = document.getElementById("cityInput").value.trim();
  const audience = document.getElementById("audienceInput").value.trim();
  const vibe = document.getElementById("vibeInput").value.trim();

  if (!city || !audience) {
    alert("Please enter city and audience size.");
    return;
  }

  const overlay = document.getElementById("loadingOverlay");
  overlay.classList.add("active");

  try {
    const response = await fetch("/api/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ city, audience, vibe })
    });

    const data = await response.json();

    const container = document.getElementById("results");
    container.innerHTML = "";

    if (!data.venues) {
      container.innerHTML = "<p>No venues found.</p>";
      overlay.classList.remove("active");
      return;
    }

    data.venues.forEach(v => {
      container.innerHTML += `
        <div class="venue-row">
          <div class="venue-content">
            <div class="label-row">
              ${(v.labels || []).map(l => `<span class="venue-label">${l}</span>`).join("")}
            </div>
            <h3>${v.name}</h3>
            <div class="capacity-line">
              Estimated capacity: ${v.capacity_estimate}
            </div>
          </div>
        </div>
      `;
    });

  } catch (err) {
    console.error(err);
    alert("Something went wrong.");
  }

  overlay.classList.remove("active");
}
