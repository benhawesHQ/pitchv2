document.getElementById("searchBtn").addEventListener("click", async function() {

  const city = document.getElementById("city").value;
  const audience = document.getElementById("audience").value;
  const vibe = document.getElementById("vibe").value;
  const count = document.getElementById("count").value;

  const resultsContainer = document.getElementById("results");

  if (!city || !audience) {
    showError("Please enter a city and audience size.");
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

    const card = document.createElement("div");
    card.className = "result-card";

    card.innerHTML = `
      <h3>🎸 ${venue.name}</h3>
      <p><strong>Capacity:</strong> ${venue.capacity}</p>
      <p>${venue.description}</p>
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
