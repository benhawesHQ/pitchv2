async function searchVenues() {
  console.log("Search clicked");

  const city = document.getElementById("cityInput").value.trim();

  if (!city) {
    alert("Please enter a city.");
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
      body: JSON.stringify({ city })
    });

    const data = await response.json();

    console.log("API Response:", data);

    overlay.classList.remove("active");

    if (!data.venues || data.venues.length === 0) {
      alert("No venues found.");
      return;
    }

    renderVenues(data.venues, city);

  } catch (err) {
    overlay.classList.remove("active");
    console.error(err);
    alert("Something went wrong connecting to the server.");
  }
}

function renderVenues(venues, city) {
  const wrapper = document.getElementById("resultsWrapper");
  const results = document.getElementById("results");
  const sub = document.getElementById("resultsSub");

  results.innerHTML = "";
  wrapper.style.display = "block";
  sub.innerText = `Live performance spaces in ${city}`;

  venues.forEach(venue => {
    const card = document.createElement("div");
    card.className = "venue-card";

    card.innerHTML = `
      ${venue.photo ? `<img src="${venue.photo}" style="width:100%;border-radius:8px;margin-bottom:15px;">` : ""}
      <div class="venue-name">${venue.name}</div>
      <div style="font-size:14px;margin-bottom:8px;">
        ⭐ ${venue.rating} (${venue.reviewCount} reviews)
        ${venue.isOpen === true ? 
          `<span style="color:#00ff88;font-weight:600;margin-left:10px;">● Open Now</span>` : ""}
      </div>
      <div class="venue-description">${venue.address}</div>
      ${venue.reviewSnippet ? 
        `<div style="font-size:13px;margin-top:10px;color:#ccc;">“${venue.reviewSnippet.substring(0,150)}...”</div>` 
        : ""}
      ${venue.website ? 
        `<a href="${venue.website}" target="_blank" class="see-venue-btn" style="margin-top:15px;">Visit Website</a>` 
        : ""}
    `;

    results.appendChild(card);
  });
}
