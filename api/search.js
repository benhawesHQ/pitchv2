async function search() {

  const city = document.getElementById("city").value;
  const genre = document.getElementById("genre").value;
  const likely = document.getElementById("likely").checked;

  const resultsDiv = document.getElementById("results");
  resultsDiv.innerHTML = "🎵 Searching venues...";

  try {

    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, genre, likely })
    });

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      resultsDiv.innerHTML = "No venues found.";
      return;
    }

    resultsDiv.innerHTML = "";

    data.results.forEach(venue => {

      const card = document.createElement("div");
      card.className = "card";

      card.innerHTML = `
        <h3>${venue.name}</h3>
        <div>${venue.address || ""}</div>
        <div class="stack">
          ${venue.instagram ? `<a href="${venue.instagram}" target="_blank">Instagram</a>` : ""}
          ${venue.email ? `<a href="mailto:${venue.email}">Email</a>` : ""}
          ${venue.phone ? `<a href="tel:${venue.phone}">Phone</a>` : ""}
        </div>
      `;

      resultsDiv.appendChild(card);
    });

  } catch (err) {
    resultsDiv.innerHTML = "Error loading venues.";
  }
}
