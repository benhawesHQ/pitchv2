async function searchVenues(){

  const city = document.getElementById("cityInput").value.trim();
  const audience = parseInt(document.getElementById("audienceInput").value);
  const notes = document.getElementById("notesInput").value.trim();
  const count = parseInt(document.getElementById("countSelect").value);

  const overlay = document.getElementById("loadingOverlay");
  const resultsContainer = document.getElementById("results");
  const wrapper = document.getElementById("resultsWrapper");

  overlay.classList.add("active");
  resultsContainer.innerHTML = "";

  try {

    const response = await fetch(`/api/search?city=${encodeURIComponent(city)}&notes=${encodeURIComponent(notes)}`);

    if (!response.ok) {
      throw new Error("API request failed");
    }

    const data = await response.json();

    if (!data.results || !Array.isArray(data.results)) {
      throw new Error("Invalid API response");
    }

    let filtered = data.results.filter(v => capacityMatch(v, audience));

    if (filtered.length === 0) {
      resultsContainer.innerHTML = `
        <div style="padding:40px;text-align:center;">
          No great matches found for that size yet. Try adjusting the audience or vibe.
        </div>
      `;
    } else {
      filtered.slice(0, count).forEach(v => {
        resultsContainer.innerHTML += renderVenue(v, audience);
      });
    }

    wrapper.style.display = "block";

  } catch (err) {
    console.error("Search error:", err);
    resultsContainer.innerHTML = `
      <div style="padding:40px;text-align:center;">
        Something went wrong connecting to venues. Check API route.
      </div>
    `;
    wrapper.style.display = "block";
  }

  // 🔥 GUARANTEED overlay removal
  overlay.classList.remove("active");
}



/* ===============================
   CAPACITY MATCHING LOGIC
   Granular + aggressive filtering
================================= */

function capacityMatch(place, audience){

  const name = place.name.toLowerCase();

  const largeKeywords = [
    "arena",
    "stadium",
    "paramount",
    "center",
    "hall",
    "theater",
    "theatre",
    "ballroom"
  ];

  const mediumKeywords = [
    "music hall",
    "concert hall",
    "event center"
  ];

  if(audience <= 20){
    if(largeKeywords.some(word => name.includes(word))) return false;
    if(mediumKeywords.some(word => name.includes(word))) return false;
  }

  if(audience <= 40){
    if(largeKeywords.some(word => name.includes(word))) return false;
  }

  if(audience <= 80){
    if(name.includes("arena") || name.includes("stadium")) return false;
  }

  return true;
}



/* ===============================
   REPLY LIKELIHOOD LOGIC
================================= */

function replyLikelihood(place){

  const reviews = place.user_ratings_total || 0;

  if(reviews < 75){
    return { label: "More personal feel", class: "reply" };
  }

  if(reviews < 300){
    return { label: "Likely to reply", class: "reply" };
  }

  return { label: "High traffic venue", class: "" };
}



/* ===============================
   RENDER VENUE ROW
================================= */

function renderVenue(v, audience){

  const reply = replyLikelihood(v);

  const image = v.photo
    ? v.photo
    : "hero.jpg";

  const googleUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.name + " " + v.formatted_address)}`;

  return `
    <div class="venue-row">

      <div class="venue-image"
           style="background-image:url('${image}')">
      </div>

      <div class="venue-content">

        <div>
          <h3>${v.name}</h3>

          <div class="meta">
            ⭐ ${v.rating || "N/A"} • ${v.formatted_address}
          </div>

          <div class="tags">
            <div class="tag">
              Best fit for ${audience} guests
            </div>
            <div class="tag ${reply.class}">
              ${reply.label}
            </div>
          </div>
        </div>

        <div>
          <a href="${googleUrl}" target="_blank" class="cta">
            View on Google
          </a>
        </div>

      </div>

    </div>
  `;
}
