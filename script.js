let generatedResults = [];
let displayedCount = 0;

async function generateVenues() {
  const city = document.querySelector("input[placeholder*='City']").value.trim();
  const audience = document.querySelector("input[placeholder*='Audience']").value.trim();
  const vibeField = document.querySelector("#vibeInput");
  const vibe = vibeField ? vibeField.value.trim() : "";
  const count = parseInt(document.querySelector("select").value);

  if (!city || !audience) {
    alert("Please enter city and audience size.");
    return;
  }

  const resultsWrapper = document.querySelector(".results-wrapper");
  const resultsContainer = document.querySelector("#results");

  if (resultsWrapper) resultsWrapper.style.display = "block";
  if (resultsContainer) resultsContainer.innerHTML = "Searching real venues...";

  const response = await fetch("/.netlify/functions/search", {
    method: "POST",
    body: JSON.stringify({ city, audience, vibe, count }),
  });

  const data = await response.json();

  generatedResults = data;
  displayedCount = 0;
  resultsContainer.innerHTML = "";
  renderMore(count);
}

function renderMore(limit) {
  const results = document.querySelector("#results");
  const moreBtn = document.querySelector("#moreBtn");

  const slice = generatedResults.slice(displayedCount, displayedCount + limit);

  slice.forEach(venue => {
    results.innerHTML += `
      <div class="venue-card">
        <div class="venue-name">${venue.name}</div>
        <div>${venue.neighborhood}</div>
        <div>${venue.description}</div>
        <div>Reply Likelihood: ${venue.replyLikelihood}</div>
      </div>
    `;
  });

  displayedCount += limit;

  if (moreBtn) {
    moreBtn.style.display =
      displayedCount < generatedResults.length ? "block" : "none";
  }

  encoreConfetti();
}

function showMore() {
  renderMore(5);
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
