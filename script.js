let allVenues = [];
let visibleCount = 10;

const funFacts = [
  "🎤 Taylor Swift played tiny Nashville venues before selling out stadium tours.",
  "🎸 Ed Sheeran busked on the streets before Wembley Stadium.",
  "🎶 Lady Gaga performed in Lower East Side clubs before global fame.",
  "🎵 Billie Eilish recorded songs in her bedroom before Grammys.",
  "🎤 Harry Styles played 1,000-capacity rooms before arenas.",
  "🎸 Lizzo toured indie venues before Coachella.",
  "🎶 Phoebe Bridgers built her audience in intimate clubs.",
  "🎵 Adele performed in London pubs early on.",
  "🎤 Paramore toured VFW halls before festivals.",
  "🎸 Coldplay played student unions before stadiums.",
  "🎶 Dua Lipa toured mid-size venues before arenas."
];

let recentFacts = [];

function getRandomFact() {
  let available = funFacts.filter(f => !recentFacts.includes(f));
  if (available.length === 0) {
    recentFacts = [];
    available = funFacts;
  }
  const fact = available[Math.floor(Math.random() * available.length)];
  recentFacts.push(fact);
  if (recentFacts.length > 8) recentFacts.shift();
  return fact;
}

function showLoading() {
  const overlay = document.getElementById("loadingOverlay");
  const lore = document.getElementById("loreText");
  lore.innerText = getRandomFact();
  overlay.classList.add("active");
}

function hideLoading() {
  document.getElementById("loadingOverlay").classList.remove("active");
}

async function searchVenues() {
  const city = document.getElementById("cityInput").value;
  const audience = document.getElementById("audienceInput").value;
  const count = document.getElementById("countSelect").value;

  if (!city || !audience) {
    alert("Please fill in both fields.");
    return;
  }

  showLoading();

  try {
    const response = await fetch("/.netlify/functions/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, audience, count })
    });

    const data = await response.json();
    hideLoading();

    if (!data.venues) {
      alert("Something went wrong.");
      return;
    }

    allVenues = data.venues;
    visibleCount = 10;

    document.getElementById("resultsWrapper").style.display = "block";
    document.getElementById("resultsSub").innerText =
      `${allVenues.length} venues found in ${city}`;

    renderResults();

  } catch (err) {
    hideLoading();
    alert("Search failed.");
  }
}

function renderResults() {
  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = "";

  allVenues.slice(0, visibleCount).forEach(v => {
    const card = document.createElement("div");
    card.className = "venue-card";

    card.innerHTML = `
      <div class="venue-name">${v.emoji} ${v.name}</div>
      <div class="venue-description">
        ${v.description}
        <br><br>
        🎯 Likelihood: <strong>${v.likelihood}</strong>
      </div>
      <a class="see-venue-btn"
        href="https://www.google.com/search?q=${encodeURIComponent(v.googleQuery)}"
        target="_blank">
        View Venue
      </a>
    `;

    resultsContainer.appendChild(card);
  });

  if (visibleCount < allVenues.length) {
    document.getElementById("moreBtn").style.display = "inline-block";
  } else {
    document.getElementById("moreBtn").style.display = "none";
  }
}

function showMore() {
  visibleCount += 5;
  renderResults();
}
