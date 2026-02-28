let allVenues = [];
let visibleCount = 0;

async function searchVenues() {
  const city = document.getElementById("cityInput").value.trim();
  const audience = document.getElementById("audienceInput").value.trim();
  const count = parseInt(document.getElementById("countSelect").value);

  if (!city) {
    alert("Enter a city first.");
    return;
  }

  showLoading();

  try {
    const res = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city })
    });

    const data = await res.json();

    if (!data.venues || data.venues.length === 0) {
      hideLoading();
      alert("No venues found.");
      return;
    }

    // Deduplicate by name
    const unique = [];
    const names = new Set();

    data.venues.forEach(v => {
      if (!names.has(v.name)) {
        names.add(v.name);
        unique.push(v);
      }
    });

    // Apply audience filtering
    allVenues = filterByAudience(unique, audience);

    visibleCount = count;
    renderResults();

    document.getElementById("resultsWrapper").style.display = "block";
    document.getElementById("resultsSub").innerText =
      `Live performance spaces in ${city} curated for an expected audience of ${audience || "varied sizes"}.`;

    hideLoading();

  } catch (err) {
    hideLoading();
    console.error(err);
    alert("Something went wrong.");
  }
}

function filterByAudience(venues, audience) {
  const size = parseInt(audience);

  if (!size || size > 80) return venues;

  const largeWords = [
    "theatre","theater","arena","concert hall",
    "stadium","music hall","center","centre"
  ];

  return venues.filter(v => {
    const name = v.name.toLowerCase();
    return !largeWords.some(word => name.includes(word));
  });
}

function getLikelihood(v) {
  const rating = v.rating || 0;
  const reviews = v.user_ratings_total || 0;

  if (rating >= 4.4 && reviews > 200)
    return { text: "Likely to reply", class: "good" };

  if (rating >= 4.0)
    return { text: "Worth reaching out", class: "medium" };

  return { text: "Less likely to reply", class: "low" };
}

function renderResults() {
  const container = document.getElementById("results");
  container.innerHTML = "";

  const slice = allVenues.slice(0, visibleCount);

  slice.forEach(v => {
    const likelihood = getLikelihood(v);

    const card = document.createElement("div");
    card.className = "venue-card";
    card.innerHTML = `
      <img src="${v.photo || "https://via.placeholder.com/100"}"
           class="venue-image">

      <div class="venue-content">
        <div class="venue-name">${v.name}</div>

        <div class="venue-rating">
          ⭐ ${v.rating || "N/A"} (${v.user_ratings_total || 0})
        </div>

        <a 
          href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.address)}"
          target="_blank"
          class="venue-meta"
        >
          ${v.address}
        </a>

        <div class="badge ${likelihood.class}">
          ${likelihood.text}
        </div>

        <a href="${v.website || '#'}"
           target="_blank"
           class="see-venue-btn">
          See Venue
        </a>
      </div>
    `;

    container.appendChild(card);
  });

  document.getElementById("moreBtn").style.display =
    visibleCount < allVenues.length ? "inline-block" : "none";
}

function showMore() {
  visibleCount += 5;
  renderResults();
}

function showLoading() {
  document.getElementById("loadingOverlay").classList.add("active");
}

function hideLoading() {
  document.getElementById("loadingOverlay").classList.remove("active");
}
