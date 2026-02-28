let generatedResults = [];
let displayedCount = 0;

const loreMoments = [
  "Taylor Swift once played small Nashville cafés before stadium tours.",
  "Lady Gaga built her audience in downtown New York clubs.",
  "Green Day grew their fanbase in tiny Bay Area venues.",
  "Bruce Springsteen played small Jersey bars before arenas.",
  "Ed Sheeran busked on streets before selling out stadiums.",
  "Beyoncé performed in local competitions before global tours.",
  "Prince built momentum in Minneapolis clubs before worldwide fame.",
  "Madonna performed in NYC dance rooms before pop superstardom.",
  "Adele sang in small London venues before global recognition.",
  "Kendrick Lamar performed in intimate LA rooms before festival headlines."
];

let loreIndex = 0;

function getLore() {
  const text = loreMoments[loreIndex];
  loreIndex = (loreIndex + 1) % loreMoments.length;
  return text;
}

function searchVenues() {
  const city = document.getElementById("cityInput").value.trim();
  const audience = parseInt(document.getElementById("audienceInput").value);
  const count = parseInt(document.getElementById("countSelect").value);

  if (!city || isNaN(audience)) {
    alert("Please enter a city and audience size.");
    return;
  }

  document.getElementById("resultsWrapper").style.display = "block";

  const overlay = document.getElementById("loadingOverlay");
  overlay.classList.add("active");
  document.getElementById("loreText").innerText = getLore();

  setTimeout(() => {
    overlay.classList.remove("active");
    buildResults(city, audience, count);
  }, 1600);
}

function buildResults(city, audience, count) {
  const results = document.getElementById("results");
  results.innerHTML = "";
  generatedResults = [];
  displayedCount = 0;

  const sizeTier = getSizeTier(audience);
  const baseCategories = getCategoriesForTier(sizeTier);

  for (let i = 0; i < count; i++) {
    const category = baseCategories[i % baseCategories.length];
    generatedResults.push(generateCard(city, audience, category));
  }

  document.getElementById("resultsSub").innerText =
    `Showing ${count} intelligent venue pathways for ~${audience} guests in ${city}.`;

  showMore();
}

function getSizeTier(audience) {
  if (audience <= 60) return "small";
  if (audience <= 150) return "medium";
  if (audience <= 400) return "large";
  return "theater";
}

function getCategoriesForTier(tier) {

  if (tier === "small") {
    return [
      "Intimate Listening Rooms",
      "Indie Back Rooms Above Bars",
      "DIY Music Spaces",
      "Small Theaters Under 75 Seats",
      "Neighborhood Music Bars",
      "Artist-Run Performance Rooms",
      "Warehouse-Style Micro Venues",
      "All-Ages Community Stages",
      "Residency-Friendly Rooms",
      "Basement Performance Spaces",
      "Coffeehouse Stages",
      "Alternative Arts Spaces",
      "Upstairs Bar Stages",
      "Creative Event Lofts",
      "Experimental Music Rooms"
    ];
  }

  if (tier === "medium") {
    return [
      "Mid-Size Concert Halls",
      "Standing-Room Indie Venues",
      "Ticketed Touring Rooms",
      "Converted Industrial Spaces",
      "Music-Focused Event Venues",
      "Ballroom-Style Stages",
      "Established Indie Rooms",
      "Hybrid Bar + Stage Venues",
      "Flexible Capacity Event Spaces",
      "City Arts Centers",
      "Regional Touring Venues",
      "Multi-Room Music Spaces",
      "Community Performance Halls",
      "Late-Night Live Music Rooms",
      "Local Festival-Scale Spaces"
    ];
  }

  if (tier === "large") {
    return [
      "Large Independent Concert Venues",
      "Warehouse Concert Spaces",
      "City Performance Centers",
      "Historic Music Halls",
      "Multi-Level Event Spaces",
      "Festival-Sized Indoor Rooms",
      "Standing-Room Ballrooms",
      "Large Touring Venues",
      "Converted Theater Spaces",
      "Major Indie Music Rooms",
      "Regional Event Centers",
      "High-Capacity Music Venues",
      "Arena-Scale Indie Halls",
      "Urban Performance Warehouses",
      "Major Ticketed Music Rooms"
    ];
  }

  return [
    "Theater-Scale Performance Venues",
    "City Concert Halls",
    "Large Touring Stages",
    "Multi-Thousand Capacity Rooms",
    "Regional Event Arenas",
    "Landmark Music Theaters",
    "Historic Grand Performance Spaces",
    "Major City Performance Centers",
    "Festival Headline Stages",
    "High-Capacity Theater Rentals",
    "Urban Concert Theaters",
    "Premier Touring Venues",
    "Metropolitan Music Halls",
    "Mainstage City Auditoriums",
    "Large-Scale Indoor Concert Spaces"
  ];
}

function generateCard(city, audience, category) {

  const searchQuery =
    `${category} in ${city} capacity ${audience} live music booking`;

  return {
    title: category,
    description:
      `These are the kinds of spaces where artists build real momentum at this level. 
For a crowd around ${audience}, rooms like this create energy without feeling empty. 
Many touring acts passed through venues in this tier before scaling up. 
Explore current live options in ${city} that match this scale and vibe.`,
    googleLink:
      `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`
  };
}

function showMore() {

  const results = document.getElementById("results");
  const moreBtn = document.getElementById("moreBtn");

  const nextChunk =
    generatedResults.slice(displayedCount, displayedCount + 5);

  nextChunk.forEach(card => {

    results.innerHTML += `
      <div class="venue-card">
        <div class="venue-name">${card.title}</div>
        <div class="venue-description">${card.description}</div>
        <a class="see-venue-btn" target="_blank" href="${card.googleLink}">
          Explore Live Options →
        </a>
      </div>
    `;
  });

  displayedCount += 5;

  if (displayedCount < generatedResults.length) {
    moreBtn.style.display = "block";
  } else {
    moreBtn.style.display = "none";
  }

  launchConfetti();
}

function launchConfetti() {

  for (let i = 0; i < 35; i++) {

    const confetti = document.createElement("div");
    confetti.style.position = "fixed";
    confetti.style.left = Math.random() * 100 + "%";
    confetti.style.top = "0";
    confetti.style.width = "6px";
    confetti.style.height = "6px";
    confetti.style.background = "#f94501";
    confetti.style.zIndex = "9999";
    confetti.style.transition = "1s ease-out";

    document.body.appendChild(confetti);

    setTimeout(() => {
      confetti.style.top = "100%";
      confetti.style.opacity = "0";
    }, 10);

    setTimeout(() => {
      confetti.remove();
    }, 1000);
  }
}
