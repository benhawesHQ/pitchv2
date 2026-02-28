const searchForm = document.getElementById("searchForm");
const resultsWrapper = document.getElementById("resultsWrapper");
const loadingOverlay = document.getElementById("loadingOverlay");
const funFactEl = document.getElementById("funFact");

const funFacts = [
  "🎤 Taylor Swift played tiny Nashville venues before stadium tours.",
  "🎸 Ed Sheeran busked before Wembley Stadium.",
  "🎶 Lady Gaga performed in Lower East Side clubs before global fame.",
  "🎵 Billie Eilish recorded in her bedroom before Grammys.",
  "🎤 Harry Styles played 1,000-capacity rooms before arenas.",
  "🎸 Lizzo toured indie venues before Coachella.",
  "🎶 Phoebe Bridgers built her audience in intimate clubs.",
  "🎵 Adele performed in London pubs early on.",
  "🎤 Paramore toured VFW halls before festivals.",
  "🎸 Coldplay played student unions before stadiums.",
  "🎶 Dua Lipa toured mid-size venues before arenas.",
  "🎵 The Killers played Vegas bars before world tours.",
  "🎤 Olivia Rodrigo started in intimate LA rooms.",
  "🎸 The Lumineers busked before selling out arenas.",
  "🎶 Arctic Monkeys built buzz in Sheffield clubs."
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
  if (recentFacts.length > 10) recentFacts.shift();
  return fact;
}

function startShowLights() {
  document.body.classList.add("lights-down");
  loadingOverlay.classList.add("active");
  loadingOverlay.classList.add("blink");
  funFactEl.textContent = getRandomFact();
}

function stopShowLights() {
  document.body.classList.remove("lights-down");
  loadingOverlay.classList.remove("active");
  loadingOverlay.classList.remove("blink");
}

searchForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const city = document.getElementById("city").value;
  const audience = document.getElementById("audience").value;
  const count = document.getElementById("count").value;

  startShowLights();

  try {
    const res = await fetch("/.netlify/functions/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, audience, count })
    });

    const data = await res.json();
    stopShowLights();
    renderResults(data.venues);

  } catch (err) {
    stopShowLights();
    alert("Something went wrong.");
  }
});

function renderResults(venues) {
  resultsWrapper.innerHTML = "";

  venues.forEach(v => {
    const card = document.createElement("div");
    card.className = "venue-card";
    card.innerHTML = `
      <h3>${v.emoji} ${v.name}</h3>
      <p class="venue-city">${v.city}</p>
      <p>${v.description}</p>
      <p class="likelihood">🎯 Likelihood: ${v.likelihood}</p>
      <a target="_blank" class="venue-btn"
        href="https://www.google.com/search?q=${encodeURIComponent(v.googleQuery)}">
        View Venue
      </a>
    `;
    resultsWrapper.appendChild(card);
  });
}
