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
      `Live performance spaces in ${city}. We surface the rooms — you make the ask.`;

    await new Promise(r => setTimeout(r, 1500));
    hideLoading();

  } catch (err) {
    hideLoading();
    alert("Something went wrong.");
  }
}

/* =========================
   CLASSIFICATION
========================= */

function classifyVenue(v) {
  const name = v.name.toLowerCase();
  const types = (v.types || []).join(" ").toLowerCase();

  if (name.includes("arena") || name.includes("stadium"))
    return "arena";

  if (name.includes("theatre") || name.includes("theater") || name.includes("opera"))
    return "large_theater";

  if (name.includes("music hall") || name.includes("concert hall") || name.includes("ballroom"))
    return "mid_music_hall";

  if (types.includes("bar") || types.includes("night_club"))
    return "small_room";

  if (
    name.includes("club") ||
    name.includes("room") ||
    name.includes("basement") ||
    name.includes("improv") ||
    name.includes("studio")
  )
    return "intimate_bar";

  return "small_room";
}

/* =========================
   AUDIENCE MATCHING
========================= */

function matchByAudience(bucket, size) {
  if (size <= 20)
    return bucket === "intimate_bar";

  if (size <= 40)
    return bucket === "intimate_bar" || bucket === "small_room";

  if (size <= 60)
    return bucket === "small_room";

  if (size <= 80)
    return bucket === "small_room" || bucket === "mid_music_hall";

  if (size <= 150)
    return bucket === "mid_music_hall";

  if (size <= 300)
    return bucket === "mid_music_hall";

  if (size <= 800)
    return bucket === "large_theater";

  return bucket === "arena";
}

function filterByAudience(venues, audience) {
  const size = parseInt(audience);
  if (!size) return venues;

  return venues.filter(v => {
    const bucket = classifyVenue(v);
    v.bucket = bucket;
    return matchByAudience(bucket, size);
  });
}

/* =========================
   REPLY LIKELIHOOD
========================= */

function getReplyLikelihood(v) {
  const reviews = v.user_ratings_total || 0;

  if (reviews < 400)
    return { text: "Likely to reply", class: "reply-high" };

  if (reviews < 1200)
    return { text: "Might reply", class: "reply-medium" };

  return { text: "Harder to book", class: "reply-low" };
}

/* =========================
   DESCRIPTION BUILDER
========================= */

function buildDescription(v) {
  const bucket = v.bucket;

  if (bucket === "intimate_bar")
    return "An intimate performance space ideal for stripped-down sets and small audiences.";

  if (bucket === "small_room")
    return "A neighborhood venue hosting live music, comedy, and emerging artists.";

  if (bucket === "mid_music_hall")
    return "A larger concert space designed for touring acts and ticketed events.";

  if (bucket === "large_theater")
    return "A historic theater space built for large-scale productions and touring performances.";

  return "A live performance venue.";
}

/* =========================
   RENDER
========================= */

function renderResults() {
  const container = document.getElementById("results");
  container.innerHTML = "";

  const slice = allVenues.slice(0, visibleCount);

  slice.forEach(v => {
    const reply = getReplyLikelihood(v);
    const description = buildDescription(v);

    const card = document.createElement("div");
    card.className = "venue-card";

    card.innerHTML = `
      <div class="venue-image-wrapper">
        <img src="${v.photo || "https://via.placeholder.com/300x375"}"
             class="venue-image">
        <div class="reply-badge ${reply.class}">
          ${reply.text}
        </div>
      </div>

      <div class="venue-content">
        <div class="venue-name">${v.name}</div>

        <div class="venue-rating">
          ⭐ ${v.rating || "N/A"}
        </div>

        <div class="venue-description">
          ${description}
        </div>

        <div class="venue-actions">
          <a href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.address)}"
             target="_blank"
             class="map-link">
             View on map
          </a>

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
    "🎸 Loading your short list...",
    "✨ Every arena artist started in a room like this.",
    "🎤 Great shows begin with the right stage.",
    "🎶 Matching your crowd size...",
    "🌟 Finding spaces that fit your vibe..."
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
