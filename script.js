const funFacts = [
"Did you know? Lady Gaga built her early fanbase in small NYC venues.",
"Did you know? Ed Sheeran played over 300 small gigs before breaking out.",
"Did you know? Taylor Swift opened for other artists in bars at 14.",
"Did you know? Billie Eilish recorded her early songs in her bedroom."
];

document.getElementById("searchBtn").addEventListener("click", async function () {

  const city = document.getElementById("city").value;
  const audience = document.getElementById("audience").value;
  const vibe = document.getElementById("vibe").value;
  const count = document.getElementById("count").value;

  if (!city || !audience) return;

  startStageMoment();

  try {

    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, audience, vibe, count })
    });

    const data = await response.json();

    setTimeout(() => {
      stopStageMoment();
      displayResults(data.venues || []);
    }, 1800);

  } catch {
    stopStageMoment();
  }

});

function startStageMoment(){
  const overlay = document.getElementById("stage-overlay");
  const fact = document.getElementById("funFact");
  overlay.classList.add("active");
  fact.textContent = funFacts[Math.floor(Math.random() * funFacts.length)];
}

function stopStageMoment(){
  document.getElementById("stage-overlay").classList.remove("active");
}

function displayResults(venues){
  const container = document.getElementById("results");
  container.innerHTML = "";

  venues.forEach(v => {

    let pride = "";
    const text = (v.description || "").toLowerCase();

    if(text.includes("queer") || text.includes("gay") || text.includes("lgbt")){
      pride = " 🏳️‍🌈";
    }

    const card = document.createElement("div");
    card.className = "venue-card-glass";

    card.innerHTML = `
      <div class="venue-image-wrapper">
        <img src="${v.image}" />
      </div>
      <div class="venue-content">
        <div class="venue-top">
          <div>
            <h3>${v.name}${pride}</h3>
            <div class="venue-location">
              ${v.neighborhood || ""}${v.neighborhood ? "," : ""} ${v.city || ""}
            </div>
          </div>
          <div class="reply-badge">
            Likely to Reply
          </div>
        </div>
        <p class="venue-description">${v.description}</p>
        <div>
          <a href="${v.googleMapsUrl}" target="_blank" class="btn-orange">
            See Venue
          </a>
        </div>
      </div>
    `;
    container.appendChild(card);
  });
}
