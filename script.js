document.getElementById("searchBtn").addEventListener("click", async function () {

  const overlay = document.getElementById("searchOverlay");

  const city = document.getElementById("city").value;
  const audience = document.getElementById("audience").value;
  const vibe = document.getElementById("vibe").value;
  const count = document.getElementById("count").value;

  if (!city || !audience) return;

  // Show loading overlay
  overlay.classList.add("active");

  try {

    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, audience, vibe, count })
    });

    const data = await response.json();
    displayResults(data.venues || []);

  } catch (error) {
    console.error("Search error:", error);
  } finally {
    // Hide overlay after search completes
    overlay.classList.remove("active");
  }

});

function displayResults(venues){
  const container = document.getElementById("results");
  container.innerHTML = "";

  venues.forEach(v => {
    const card = document.createElement("div");
    card.style.marginBottom = "40px";
    card.innerHTML = `
      <h3>${v.name}</h3>
      <p>${v.description}</p>
      <a href="${v.googleMapsUrl}" target="_blank">See Venue</a>
    `;
    container.appendChild(card);
  });
}
