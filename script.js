let generatedResults = [];
let displayedCount = 0;

const loreLines = [
  "Scanning local show calendars...",
  "Cross-referencing programming history...",
  "Checking venue capacity patterns...",
  "Matching vibe to room acoustics...",
  "Curating your short list..."
];

function showLoading() {
  const overlay = document.getElementById("loadingOverlay");
  const loreText = document.getElementById("loreText");

  overlay.classList.add("active");

  let i = 0;
  loreText.textContent = loreLines[i];

  const interval = setInterval(() => {
    i = (i + 1) % loreLines.length;
    loreText.textContent = loreLines[i];
  }, 1500);

  return interval;
}

function hideLoading(interval) {
  clearInterval(interval);
  document.getElementById("loadingOverlay").classList.remove("active");
}

async function searchVenues() {
  const city = document.getElementById("cityInput").value.trim();
  const audience = document.getElementById("audienceInput").value.trim();
  const count = parseInt(document.getElementById("countSelect").value);

  if (!city || !audience) {
    alert("Please enter city and audience size.");
    return;
  }

  const loadingInterval = showLoading();

  try {
    const response = await fetch("/.netlify/functions/search", {
      method: "POST",
      body: JSON.stringify({ city, audience, vibe: "", count }),
    });

    const data = await response.json();

    generatedResults = data;
    displayedCount = 0;

    renderResults(count);

  } catch (error) {
    alert("Something went wrong.");
  }

  hideLoading(loadingInterval);
}

function renderResults(limit) {
  const wrapper = document.getElementById("resultsWrapper");
  const results = document.getElementById("results");
  const moreBtn = document.getElementById("moreBtn");
  const sub = document.getElementById("resultsSub");

  wrapper.style.display = "block";
  results.innerHTML = "";

  const slice = generatedResults.slice(0, limit);

  slice.forEach(venue => {
    results.innerHTML += `
      <div class="venue-card">
        <div class="venue-name">${venue.name}</div>
        <div class="venue-description">${venue.description}</div>
        <div><strong>Reply Likelihood:</strong> ${venue.replyLikelihood}</div>
      </div>
    `;
  });

  displayedCount = limit;

  moreBtn.style.display =
    displayedCount < generatedResults.length ? "block" : "none";

  sub.textContent = `${generatedResults.length} venues surfaced`;
}

function showMore() {
  const results = document.getElementById("results");
  const moreBtn = document.getElementById("moreBtn");

  const slice = generatedResults.slice(displayedCount, displayedCount + 5);

  slice.forEach(venue => {
    results.innerHTML += `
      <div class="venue-card">
        <div class="venue-name">${venue.name}</div>
        <div class="venue-description">${venue.description}</div>
        <div><strong>Reply Likelihood:</strong> ${venue.replyLikelihood}</div>
      </div>
    `;
  });

  displayedCount += 5;

  if (displayedCount >= generatedResults.length) {
    moreBtn.style.display = "none";
  }

  encoreConfetti();
}

function encoreConfetti() {
  for (let i = 0; i < 25; i++) {
    const piece = document.createElement("div");
    piece.style.position = "fixed";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.top = "0";
    piece.style.width = "6px";
    piece.style.height = "6px";
    piece.style.background = "#f94501";
    piece.style.transition = "1s ease-out";
    piece.style.zIndex = "9999";
    document.body.appendChild(piece);

    setTimeout(() => {
      piece.style.top = "100%";
      piece.style.opacity = "0";
    }, 10);

    setTimeout(() => piece.remove(), 1000);
  }
}
