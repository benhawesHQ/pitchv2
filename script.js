let allVenues = [];
let currentIndex = 0;
const pageSize = 5;

document.getElementById("searchBtn").addEventListener("click", async function () {

  const overlay = document.getElementById("searchOverlay");
  overlay.classList.add("active");

  const city = document.getElementById("city").value;
  const audience = document.getElementById("audience").value;
  const vibe = document.getElementById("vibe").value;
  const count = parseInt(document.getElementById("count").value);

  if (!city || !audience) {
    overlay.classList.remove("active");
    return;
  }

  try {

    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, audience, vibe, count })
    });

    const data = await response.json();

    // Add score to each venue
    const venuesWithScore = (data.venues || []).map(v => ({
      ...v,
      score: calculateScore(v)
    }));

    // Sort by score descending
    venuesWithScore.sort((a, b) => b.score - a.score);

    // Determine top 60% threshold
    const cutoffIndex = Math.floor(venuesWithScore.length * 0.6);
    const thresholdScore = venuesWithScore[cutoffIndex]?.score || 0;

    // Mark which venues get badge
    venuesWithScore.forEach(v => {
      v.showBadge = v.score >= thresholdScore;
    });

    allVenues = venuesWithScore;
    currentIndex = 0;

    document.getElementById("results").innerHTML = "";

    renderNextBatch();

    overlay.classList.remove("active");

    document.querySelector(".results-section")
      .scrollIntoView({ behavior: "smooth" });

  } catch (err) {
    overlay.classList.remove("active");
    console.error(err);
  }

});


function calculateScore(place) {
  let score = 0;

  if (place.website) score += 25;
  if (place.rating && place.rating >= 4) score += 20;
  if (place.user_ratings_total && place.user_ratings_total > 100) score += 15;
  if (place.business_status === "OPERATIONAL") score += 10;
  if (place.opening_hours) score += 10;
  if (place.formatted_phone_number) score += 10;
  if (place.user_ratings_total && place.user_ratings_total > 25) score += 10;

  return score;
}


function renderNextBatch() {

  const container = document.getElementById("results");

  const nextBatch = allVenues.slice(currentIndex, currentIndex + pageSize);

  nextBatch.forEach(v => {
    container.appendChild(createVenueCard(v));
  });

  currentIndex += pageSize;

  renderSeeMoreButton();
}


function renderSeeMoreButton() {

  const container = document.getElementById("results");

  let existingBtn = document.getElementById("seeMoreBtn");
  if (existingBtn) existingBtn.remove();

  if (currentIndex >= allVenues.length) return;

  const btn = document.createElement("button");
  btn.id = "seeMoreBtn";
  btn.className = "primary-btn";
  btn.style.margin = "40px auto 0 auto";
  btn.style.display = "block";
  btn.innerText = "See More Venues";

  btn.addEventListener("click", renderNextBatch);

  container.appendChild(btn);
}


function createVenueCard(v) {

  const card = document.createElement("div");
  card.className = "venue-card";

  card.innerHTML = `
    <div class="venue-img-wrap">
      <img src="${v.image || 'https://via.placeholder.com/400x300'}" alt="${v.name}">
    </div>

    <div class="venue-content">

      <div class="venue-title-row">
        <div>
          <div class="venue-title">${v.emoji || "🎶"} ${v.name}</div>
          <div class="venue-location">${v.neighborhood || ""}</div>
          <div class="venue-address">${v.formatted_address || ""}</div>
        </div>

        ${v.showBadge ? `<div class="reply-badge">Likely to respond</div>` : ""}
      </div>

      <p class="venue-description">
        ${v.description || ""}
      </p>

      <div class="venue-tags">
        ${(v.tags || []).map(tag => `<span class="venue-tag">${tag}</span>`).join("")}
      </div>

      <a href="${v.googleMapsUrl}" target="_blank" class="venue-btn">
        View Venue
      </a>
    </div>
  `;

  return card;
}
