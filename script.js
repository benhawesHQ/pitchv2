let allVenues = [];
let currentIndex = 0;

let pageSize = 5; // initial from dropdown
const seeMoreBatchSize = 5;
const maxSeeMoreClicks = 5;
let seeMoreClicks = 0;

/* ============================= */
/* MODERN LOADING MESSAGES */
/* ============================= */

const loadingMessages = [
  "Finding venues...",
  "Analyzing audience fit...",
  "Scanning neighborhoods...",
  "Ranking by response likelihood...",
  "Zeroing in on the best rooms..."
];

let loadingInterval;

function startLoadingMessages() {
  let index = 0;
  const textEl = document.getElementById("loadingText");

  loadingInterval = setInterval(() => {
    index = (index + 1) % loadingMessages.length;

    textEl.style.opacity = 0;

    setTimeout(() => {
      textEl.textContent = loadingMessages[index];
      textEl.style.opacity = 1;
    }, 200);

  }, 1500);
}

function stopLoadingMessages() {
  clearInterval(loadingInterval);
}

/* ============================= */
/* SEARCH CLICK */
/* ============================= */

document.getElementById("searchBtn").addEventListener("click", async function () {

  const overlay = document.getElementById("searchOverlay");
  overlay.classList.add("active");
  startLoadingMessages();

  const city = document.getElementById("city").value;
  const audience = document.getElementById("audience").value;
  const vibe = document.getElementById("vibe").value;
  const count = parseInt(document.getElementById("count").value);

  pageSize = count;

  if (!city || !audience) {
    stopLoadingMessages();
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

    const venuesWithScore = (data.venues || []).map(v => ({
      ...v,
      score: calculateScore(v)
    }));

    venuesWithScore.sort((a, b) => b.score - a.score);

    const cutoffIndex = Math.floor(venuesWithScore.length * 0.6);
    const thresholdScore = venuesWithScore[cutoffIndex]?.score || 0;

    venuesWithScore.forEach(v => {
      v.showBadge = v.score >= thresholdScore;
    });

    allVenues = venuesWithScore;
    currentIndex = 0;
    seeMoreClicks = 0;

    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = "";

    resultsContainer.insertAdjacentHTML(
      "afterbegin",
      `<h2 style="margin-bottom:40px;">Showing ${Math.min(count, allVenues.length)} venues in ${city}</h2>`
    );

    renderNextBatch();

    stopLoadingMessages();
    overlay.classList.remove("active");

    document.querySelector(".results-section")
      .scrollIntoView({ behavior: "smooth" });

  } catch (err) {
    stopLoadingMessages();
    overlay.classList.remove("active");
    console.error(err);
  }

});


/* ============================= */
/* SCORING SYSTEM */
/* ============================= */

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


/* ============================= */
/* PAGINATION */
/* ============================= */

function renderNextBatch() {

  const container = document.getElementById("results");

  const batchSize = currentIndex === 0 ? pageSize : seeMoreBatchSize;

  const nextBatch = allVenues.slice(currentIndex, currentIndex + batchSize);

  nextBatch.forEach(v => {
    container.appendChild(createVenueCard(v));
  });

  currentIndex += batchSize;

  renderSeeMoreButton();
}


function renderSeeMoreButton() {

  const container = document.getElementById("results");

  let existingBtn = document.getElementById("seeMoreBtn");
  if (existingBtn) existingBtn.remove();

  let existingRefine = document.getElementById("refineBox");
  if (existingRefine) existingRefine.remove();

  const noMoreResults = currentIndex >= allVenues.length;
  const hitLimit = seeMoreClicks >= maxSeeMoreClicks;

  if (!noMoreResults && !hitLimit) {

    const btn = document.createElement("button");
    btn.id = "seeMoreBtn";
    btn.className = "primary-btn";
    btn.style.margin = "40px auto 0 auto";
    btn.style.display = "block";
    btn.innerText = "See More Venues";

    btn.addEventListener("click", () => {
      seeMoreClicks++;
      renderNextBatch();
    });

    container.appendChild(btn);

  } else {

    const refineBox = document.createElement("div");
    refineBox.id = "refineBox";
    refineBox.style.textAlign = "center";
    refineBox.style.margin = "60px auto";
    refineBox.style.opacity = "0.9";

    refineBox.innerHTML = `
      <p style="margin-bottom:18px; font-size:16px; color:#ccc;">
        Want more? Try refining your search.
      </p>
      <button class="primary-btn" style="padding:14px 24px;">
        Refine Your Search
      </button>
    `;

    refineBox.querySelector("button").addEventListener("click", () => {
      document.querySelector(".hero")
        .scrollIntoView({ behavior: "smooth" });
    });

    container.appendChild(refineBox);
  }
}


/* ============================= */
/* EMOJI SYSTEM */
/* ============================= */

function getVenueEmoji(v) {

  const name = (v.name || "").toLowerCase();

  const emojiRules = [
    { words: ["blue", "note", "jazz"], emoji: "🎷" },
    { words: ["piano", "keys"], emoji: "🎹" },
    { words: ["rock", "electric"], emoji: "🎸" },
    { words: ["club", "disco"], emoji: "🪩" },
    { words: ["lounge", "velvet"], emoji: "🍸" },
    { words: ["theatre", "theater", "stage"], emoji: "🎭" },
    { words: ["hall", "opera"], emoji: "🏛️" },
    { words: ["rooftop", "sky"], emoji: "🌇" },
    { words: ["garden", "park"], emoji: "🌿" },
    { words: ["cellar", "wine"], emoji: "🍷" },
    { words: ["basement", "underground"], emoji: "🕯️" },
    { words: ["factory", "warehouse"], emoji: "🏭" },
    { words: ["palace"], emoji: "👑" },
    { words: ["moon"], emoji: "🌙" },
    { words: ["sun"], emoji: "☀️" },
    { words: ["star"], emoji: "⭐" },
    { words: ["fox"], emoji: "🦊" },
    { words: ["cat"], emoji: "🐈" },
    { words: ["bird"], emoji: "🕊️" },
    { words: ["river", "water"], emoji: "🌊" },
    { words: ["corner"], emoji: "📍" },
    { words: ["barn"], emoji: "🐎" }
  ];

  for (let rule of emojiRules) {
    if (rule.words.some(word => name.includes(word))) {
      return rule.emoji;
    }
  }

  if (name.split(" ").length >= 3) return "✨";
  if (name.length > 15) return "🌙";
  if (name.length < 8) return "⭐";

  return "🪩";
}


/* ============================= */
/* CARD CREATION */
/* ============================= */

function createVenueCard(v) {

  const emoji = getVenueEmoji(v);

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    (v.name || "") + " " + (v.formatted_address || "")
  )}`;

  const card = document.createElement("div");
  card.className = "venue-card";

  card.innerHTML = `
    <div class="venue-img-wrap">
      <img src="${v.image || 'https://via.placeholder.com/400x300'}" alt="${v.name}">
    </div>

    <div class="venue-content">

      <div class="venue-title-row">
        <div>
          <div class="venue-title">${emoji} ${v.name}</div>
          <div class="venue-location">${v.neighborhood || ""}</div>
          <div class="venue-address">${v.formatted_address || ""}</div>
        </div>

        ${v.showBadge ? `<div class="reply-badge">Likely to respond</div>` : ""}
      </div>

      <p class="venue-description">
        ${v.description || ""}
      </p>

      <a href="${mapsUrl}" target="_blank" rel="noopener noreferrer" class="venue-btn">
        View Venue
      </a>

    </div>
  `;

  return card;
}
