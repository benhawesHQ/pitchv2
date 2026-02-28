let allVenues = [];
let visibleCount = 0;
let factInterval;

/* =========================
   SEARCH
========================= */

async function searchVenues() {
  const city = document.getElementById("cityInput").value.trim();
  const audience = parseInt(document.getElementById("audienceInput").value.trim());
  const notes = document.getElementById("notesInput")?.value.trim() || "";
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
      body: JSON.stringify({ city, notes })
    });

    const data = await res.json();

    if (!data.venues) {
      hideLoading();
      alert("No venues found.");
      return;
    }

    // remove duplicates
    const seen = new Set();
    const unique = data.venues.filter(v => {
      if (seen.has(v.name)) return false;
      seen.add(v.name);
      return true;
    });

    allVenues = filterByAudience(unique, audience);

    visibleCount = count;
    renderResults();

    document.getElementById("resultsWrapper").style.display = "block";
    document.getElementById("resultsSub").innerText =
      `Live performance spaces in ${city}. We surface the rooms — you reach out directly.`;

    await new Promise(r => setTimeout(r, 2200));
    hideLoading();

  } catch (err) {
    hideLoading();
    alert("Something went wrong.");
  }
}

/* =========================
   VENUE CLASSIFICATION
========================= */

function classifyVenue(v) {
  const name = v.name.toLowerCase();
  const types = (v.types || []).join(" ").toLowerCase();

  if (name.includes("arena") || name.includes("stadium"))
    return "arena";

  if (name.includes("theatre") || name.includes("theater") || name.includes("opera"))
    return "large_theater";

  if (
    name.includes("music hall") ||
    name.includes("ballroom") ||
    name.includes("concert hall")
  )
    return "mid_hall";

  if (
    types.includes("bar") ||
    name.includes("club") ||
    name.includes("basement") ||
    name.includes("room") ||
    name.includes("improv") ||
    name.includes("studio")
  )
    return "small_room";

  return "small_room";
}

/* =========================
   STRICT AUDIENCE MATCH
========================= */

function matchesAudience(bucket, size) {
  if (!size) return true;

  if (size <= 20)
    return bucket === "small_room";

  if (size <= 40)
    return bucket === "small_room";

  if (size <= 60)
    return bucket === "small_room";

  if (size <= 80)
    return bucket === "small_room" || bucket === "mid_hall";

  if (size <= 150)
    return bucket === "mid_hall";

  if (size <= 300)
    return bucket === "mid_hall" || bucket === "large_theater";

  return true;
}

function filterByAudience(venues, audience) {
  if (!audience) return venues;

  return venues.filter(v => {
    const bucket = classifyVenue(v);
    v.bucket = bucket;
    return matchesAudience(bucket, audience);
  });
}

/* =========================
   REPLY LIKELIHOOD
========================= */

function getReplyBadge(v) {
  const reviews = v.user_ratings_total || 0;

  if (reviews < 400)
    return { text: "Likely to reply", class: "high" };

  if (reviews < 1200)
    return { text: "Might reply", class: "medium" };

  return { text: "Harder to book", class: "low" };
}

/* =========================
   DESCRIPTION BUILDER
========================= */

function buildDescription(v) {
  const bucket = v.bucket;

  if (bucket === "small_room")
    return "An intimate performance space ideal for small audiences and emerging artists.";

  if (bucket === "mid_hall")
    return "A larger concert venue hosting touring acts and ticketed live events.";

  if (bucket === "large_theater")
    return "A historic theater built for large-scale productions and major performances.";

  if (bucket === "arena")
    return "A high-capacity venue designed for major touring productions.";

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
    const badge = getReplyBadge(v);
    const description = buildDescription(v);

    const card = document.createElement("div");
    card.className = "venue-card";

    card.innerHTML = `
      <div class="image-wrap">
        <img src="${v.photo || "https://via.placeholder.com/280x350"}"
             class="venue-image">
        <div class="badge ${badge.class}">
          ${badge.text}
        </div>
      </div>

      <div class="venue-info">
        <div class="venue-header">
          <div class="venue-name">${v.name}</div>
          <div class="rating">⭐ ${v.rating || "N/A"}</div>
        </div>

        <div class="venue-description">
          ${description}
        </div>

        <div class="venue-links">
          <a href="https://www.google.com/maps/place/?q=place_id:${v.place_id}"
             target="_blank"
             class="map-link">
             View on Google
          </a>

          <a href="https://www.google.com/maps/place/?q=place_id:${v.place_id}"
             target="_blank"
             class="see-btn">
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
   SEARCH EXPERIENCE
========================= */

function showLoading() {
  const overlay = document.getElementById("loadingOverlay");
  const lore = document.getElementById("loreText");

  const lines = [
    "Building your short list…",
    "Scanning local live venues…",
    "Matching your crowd size…",
    "Every great act starts in the right room…"
  ];

  let i = 0;
  lore.innerText = lines[i];

  factInterval = setInterval(() => {
    i = (i + 1) % lines.length;
    lore.innerText = lines[i];
  }, 1600);

  overlay.classList.add("active");
}

function hideLoading() {
  clearInterval(factInterval);
  document.getElementById("loadingOverlay").classList.remove("active");
}
