const resultsWrapper = document.getElementById("resultsWrapper");
const resultsContainer = document.getElementById("results");
const resultsSub = document.getElementById("resultsSub");
const loadingOverlay = document.getElementById("loadingOverlay");
const loreText = document.getElementById("loreText");
const moreBtn = document.getElementById("moreBtn");

let currentVenues = [];
let shownCount = 0;

const funFacts = [
  "🎤 Taylor Swift played tiny Nashville venues before selling out stadium tours.",
  "🎸 Ed Sheeran used to busk on the streets before headlining Wembley Stadium.",
  "🎶 Lady Gaga performed in Lower East Side clubs before global fame.",
  "🎵 Billie Eilish recorded songs in her bedroom before winning Grammys.",
  "🎼 Adele performed in London pubs before arenas.",
  "🎷 Lizzo toured small indie venues before Coachella main stage.",
  "🎺 Hozier gained momentum in intimate Irish venues.",
  "🎹 Coldplay played student unions before stadium tours.",
  "🎻 Paramore toured VFW halls before festivals.",
  "🎙️ The Killers played Vegas bars before world tours."
];

function getRandomFact() {
  return funFacts[Math.floor(Math.random() * funFacts.length)];
}

function showLoading() {
  loreText.innerText = getRandomFact();
  loadingOverlay.classList.add("active");
}

function hideLoading() {
  loadingOverlay.classList.remove("active");
}

async function searchVenues() {
  const city = document.getElementById("cityInput").value;
  const audience = document.getElementById("audienceInput").value;
  const count = document.getElementById("countSelect").value;

  if (!city) {
    alert("Enter a city");
    return;
  }

  showLoading();

  try {
    const response = await fetch("https://pitch-lboq.onrender.com/search", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ city, audience, count })
    });

    const data = await response.json();

    hideLoading();

    currentVenues = data.venues || [];
    shownCount = 0;

    resultsContainer.innerHTML = "";
    resultsWrapper.style.display = "block";
    resultsSub.innerText = `${currentVenues.length} venues found in ${city}`;

    showMore();

  } catch (err) {
    hideLoading();
    alert("Something went wrong connecting to the server.");
  }
}

function showMore() {
  const nextBatch = currentVenues.slice(shownCount, shownCount + 5);

  nextBatch.forEach(v => {
    const card = document.createElement("div");
    card.className = "venue-card";

    card.innerHTML = `
      <div class="venue-name">${v.emoji} ${v.name}</div>
      <div class="venue-description">${v.description}</div>
      <a class="see-venue-btn" target="_blank"
         href="https://www.google.com/search?q=${encodeURIComponent(v.googleQuery)}">
         View Venue
      </a>
    `;

    resultsContainer.appendChild(card);
  });

  shownCount += 5;

  if (shownCount < currentVenues.length) {
    moreBtn.style.display = "inline-block";
  } else {
    moreBtn.style.display = "none";
  }
}
