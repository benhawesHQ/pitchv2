async function searchVenues(){

  const city = document.getElementById("cityInput").value;
  const audience = document.getElementById("audienceInput").value;
  const vibe = document.getElementById("vibeInput").value;

  const overlay = document.getElementById("loadingOverlay");
  overlay.classList.add("active");

  const response = await fetch("/api/search", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ city, audience, vibe })
  });

  const data = await response.json();

  const container = document.getElementById("results");
  container.innerHTML = "";

  data.venues.forEach(v => {
    container.innerHTML += renderVenue(v);
  });

  overlay.classList.remove("active");
}

function renderVenue(v){

  const likelihoodClass =
    v.contact_likelihood === "likely"
      ? "solid-green"
      : v.contact_likelihood === "unlikely"
      ? "solid-red"
      : "";

  return `
    <div class="venue-row">

      ${likelihoodClass ? `
        <div class="likelihood-badge ${likelihoodClass}">
          ${v.contact_likelihood === "likely" ? "Likely to Reply" : "Harder to Book"}
        </div>
      ` : ""}

      <div class="venue-content">

        <div class="label-row">
          ${v.labels.map(label => `
            <span class="venue-label">${label}</span>
          `).join("")}
        </div>

        <h3>${v.name}</h3>

        <div class="capacity-line">
          Estimated capacity: ${v.capacity_estimate}
        </div>

      </div>
    </div>
  `;
}
