console.log("script loaded");

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
      body: JSON.stringify({
        city,
        audience,
        vibe
      })
    });

    const data = await response.json();

    const container = document.getElementById("results");
    container.innerHTML = "";

    if (!data.venues || data.venues.length === 0) {
      container.innerHTML = "<p>No venues found.</p>";
      overlay.classList.remove("active");
      return;
    }

    data.venues.forEach(venue => {
      container.innerHTML += renderVenue(venue);
    });

  } catch (err) {
    console.error("Search failed:", err);
    alert("Something went wrong.");
  }

  overlay.classList.remove("active");
}


function renderVenue(v) {

  const likelihoodClass =
    v.contact_likelihood === "likely"
      ? "solid-green"
      : v.contact_likelihood === "unlikely"
      ? "solid-red"
      : "";

  const likelihoodText =
    v.contact_likelihood === "likely"
      ? "Likely to Reply"
      : v.contact_likelihood === "unlikely"
      ? "Harder to Book"
      : "";

  return `
    <div class="venue-row">

      ${likelihoodClass ? `
        <div class="likelihood-badge ${likelihoodClass}">
          ${likelihoodText}
        </div>
      ` : ""}

      <div class="venue-content">

        <div class="label-row">
          ${(v.labels || []).map(label =>
            `<span class="venue-label">${label}</span>`
          ).join("")}
        </div>

        <h3>${v.name}</h3>

        <div class="capacity-line">
          Estimated capacity: ${v.capacity_estimate || "Unknown"}
        </div>

      </div>
    </div>
  `;
}
