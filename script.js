let allVenues = [];
let visibleCount = 0;
let factInterval;

/* =========================
   SEARCH
========================= */

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

    // Remove duplicates
    const unique = [];
    const names = new Set();

    data.venues.forEach(v => {
      if (!names.has(v.name)) {
        names.add(v.name);
        unique.push(v);
      }
    });

    allVenues = filterByAudience(unique, audience);

    visibleCount = count;
    renderResults();

    document.getElementById("resultsWrapper").style.display = "block";
    document.getElementById("resultsSub").innerText =
      `Curated performance spaces in ${city}. We surface the venues — you make the ask.`;

    await new Promise(resolve => setTimeout(resolve, 1500));
    hideLoading();

  } catch (err) {
    hideLoading();
    console.error(err);
    alert("Something went wrong.");
  }
}

/* =========================
   CAPACITY INTELLIGENCE
========================= */

function estimateVenueScale(v) {
  const reviews = v.user_ratings_total || 0;
  const name = v.name.toLowerCase();
  const types = (v.types || []).join(" ").toLowerCase();

  let base;

  // Review baseline (proxy for scale)
  if (reviews < 100) base = 25;
  else if (reviews < 300) base = 60;
  else if (reviews < 800) base = 150;
  else if (reviews < 2000) base = 400;
  else base = 900;

  // Small signals
  if (name.includes("improv")) base *= 0.6;
  if (name.includes("studio")) base *= 0.6;
  if (name.includes("comedy")) base *= 0.7;
  if (name.includes("basement")) base *= 0.5;
  if (types.includes("bar")) base *= 0.8;

  // Large signals
  if (name.includes("arena")) base *= 2;
  if (name.includes("stadium")) base *= 2;
  if (name.includes("opera")) base *= 1.5;
  if (name.includes("civic")) base *= 1.4;
  if (name.includes("theatre") && reviews > 800) base *= 1.5;

  return Math.round(base);
}

function getFitLabel(estimated, requested) {
  const diff = estimated - requested;

  if (Math.abs(diff) <= requested * 0.4)
    return { text: "🎯 Great fit", class: "fit-perfect" };

  if (diff > 0)
    return { text: "🏟 Larger space", class: "fit-large" };

  return { text: "🔥 Intimate room", class: "fit-small" };
}

function filterByAudience(venues, audience) {
  const size = parseInt(audience);
  if (!size) return venues;

  return venues
    .map(v => {
      const estimated = estimateVenueScale(v);
      const matchScore = Math.abs(estimated - size);
      const fit = getFitLabel(estimated, size);

      return { ...v, estimated, matchScore, fit };
    })
    .sort((a, b) => a.matchScore - b.matchScore)
    .filter(v => v.matchScore < size * 3);
}

/* =========================
   RENDER
========================= */

function renderResults() {
  const container = document.getElementById("results");
  container.innerHTML = "";

  const slice = allVenues.slice(0, visibleCount);

  slice.forEach(v => {
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

        <div class="fit-badge ${v.fit.class}">
          ${v.fit.text}
        </div>

        <button class="address-btn"
          onclick="window.open('https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.address)}','_blank')">
          📍 View on Map
        </button>

        <div style="margin-top:10px;">
          <a href="${v.website || '#'}"
             target="_blank"
             class="see-venue-btn">
             See Venue →
          </a>
        </div>
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

/* =========================
   LOADING EXPERIENCE
========================= */

function showLoading() {
  const overlay = document.getElementById("loadingOverlay");
  const lore = document.getElementById("loreText");

  const facts = [
    "🎸 Building your short list...",
    "🎤 Lady Gaga played tiny rooms before arenas.",
    "🎶 Ed Sheeran started in bars.",
    "✨ Every big act begins small.",
    "🎵 Great shows start with the right room."
  ];

  let i = 0;
  lore.innerText = facts[i];

  factInterval = setInterval(() => {
    i = (i + 1) % facts.length;
    lore.innerText = facts[i];
  }, 1600);

  overlay.classList.add("active");
}

function hideLoading() {
  clearInterval(factInterval);
  document.getElementById("loadingOverlay").classList.remove("active");
}
