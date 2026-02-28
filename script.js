let generatedResults = [];
let displayedCount = 0;

async function searchVenues() {
  const city = document.getElementById("cityInput").value.trim();
  const audience = document.getElementById("audienceInput").value.trim();
  const vibe = document.getElementById("vibeInput").value.trim();
  const count = parseInt(document.getElementById("countSelect").value);

  if (!city || !audience) {
    alert("Please enter city and audience size.");
    return;
  }

  document.getElementById("resultsWrapper").style.display = "block";
  document.getElementById("results").innerHTML = "Searching real venues...";

  const response = await fetch("/.netlify/functions/search", {
    method: "POST",
    body: JSON.stringify({ city, audience, vibe, count }),
  });

  const data = await response.json();

  generatedResults = data;
  displayedCount = 0;
  document.getElementById("results").innerHTML = "";
  renderMore(count);
}

function renderMore(limit) {
  const results = document.getElementById("results");
  const moreBtn = document.getElementById("moreBtn");

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

  if (displayedCount < generatedResults.length) {
    moreBtn.style.display = "block";
  } else {
    moreBtn.style.display = "none";
  }

  encoreConfetti();
}

function showMore() {
  renderMore(5);
}

function encoreConfetti() {
  for (let i = 0; i < 30; i++) {
    const confetti = document.createElement("div");
    confetti.style.position = "fixed";
    confetti.style.left = Math.random() * 100 + "%";
    confetti.style.top = "0";
    confetti.style.width = "6px";
    confetti.style.height = "6px";
    confetti.style.background = "#f94501";
    confetti.style.transition = "1s ease-out";
    confetti.style.zIndex = "9999";
    document.body.appendChild(confetti);

    setTimeout(() => {
      confetti.style.top = "100%";
      confetti.style.opacity = "0";
    }, 10);

    setTimeout(() => confetti.remove(), 1000);
  }
}
