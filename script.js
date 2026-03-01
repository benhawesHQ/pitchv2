document.getElementById("searchBtn").addEventListener("click", async function () {

  const city = document.getElementById("city").value;
  const audience = document.getElementById("audience").value;
  const vibe = document.getElementById("vibe").value;
  const count = document.getElementById("count").value;

  const resultsContainer = document.getElementById("results");

  if (!city || !audience) {
    showError("Please enter a city or neighborhood and estimated audience size.");
    return;
  }

  const button = document.getElementById("searchBtn");
  button.textContent = "Generating...";
  button.disabled = true;

  try {

    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, audience, vibe, count })
    });

    const data = await response.json();

    if (!data.venues) {
      showError("Something went wrong generating venues.");
      console.error(data);
      return;
    }

    displayResults(data.venues);

  } catch (error) {
    showError("Server error. Try again.");
    console.error(error);
  }

  button.textContent = "Generate Venues";
  button.disabled = false;

});


function displayResults(venues) {

  const container = document.getElementById("results");
  container.innerHTML = "";

  venues.forEach(venue => {

    const score = venue.replyScore || 70;

    let badgeClass = "reply-medium";
    let badgeText = "Likely to Reply";

    if (score >= 80) {
      badgeClass = "reply-high";
      badgeText = "Very Likely";
    } else if (score < 60) {
      badgeClass = "reply-low";
      badgeText = "Harder to Reach";
    }

    const card = document.createElement("div");
    card.className = "venue-card-glass";

    card.innerHTML = `
      <div class="venue-image-wrapper">
        <img src="https://source.unsplash.com/800x600/?live,music,venue" />
      </div>

      <div class="venue-content">

        <div class="venue-top">

          <div>
            <h3>${venue.name}</h3>
            <div class="venue-location">
              ${venue.neighborhood || ""}${venue.neighborhood ? "," : ""} ${venue.city || ""}
            </div>
          </div>

          <div class="reply-badge ${badgeClass}">
            ${badgeText}
          </div>

        </div>

        <p class="venue-description">
          ${venue.description}
        </p>

        <div class="venue-buttons">
          <a href="${venue.googleMapsUrl || '#'}" target="_blank" class="btn-orange">
            See Venue
          </a>
        </div>

      </div>
    `;

    container.appendChild(card);

  });

}


function showError(message) {
  const container = document.getElementById("results");
  container.innerHTML = `
    <div class="error-box">
      ${message}
    </div>
  `;
}
