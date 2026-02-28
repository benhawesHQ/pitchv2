document.addEventListener("DOMContentLoaded", function(){
  document.getElementById("searchBtn")
    .addEventListener("click", searchVenues);
});

let selectedTags = [];

document.querySelectorAll(".tag-filter").forEach(btn=>{
  btn.addEventListener("click", function(){
    const tag = this.dataset.tag;

    if(selectedTags.includes(tag)){
      selectedTags = selectedTags.filter(t => t !== tag);
      this.classList.remove("active");
    } else {
      selectedTags.push(tag);
      this.classList.add("active");
    }
  });
});

async function searchVenues(){

  const city = document.getElementById("cityInput").value.trim();
  const audience = parseInt(document.getElementById("audienceInput").value);
  const count = parseInt(document.getElementById("countSelect").value);

  if(!city) return;

  const overlay = document.getElementById("loadingOverlay");
  overlay.classList.add("active");

  try{
    const response = await fetch(`/api/search?city=${encodeURIComponent(city)}`);
    const data = await response.json();

    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = "";

    const filtered = (data.results || [])
      .filter(v => capacityMatch(v))
      .filter(v => tagMatch(v))
      .slice(0, count);

    filtered.forEach(v => {
      resultsContainer.innerHTML += renderVenue(v, audience);
    });

    document.getElementById("resultsWrapper").style.display = "block";

  }catch(err){
    console.error(err);
  }

  overlay.classList.remove("active");
}

/* -------- Capacity filter -------- */

function capacityMatch(place){

  const name = place.name.toLowerCase();

  const bigWords = [
    "arena","stadium","paramount","center",
    "amphitheater","ballroom","civic",
    "theatre","theater","hall"
  ];

  // Hard exclude obvious large venues
  if(bigWords.some(w => name.includes(w))){
    return false;
  }

  return true;
}

/* -------- Tag filter -------- */

function tagMatch(place){

  if(selectedTags.length === 0) return true;

  const text = place.name.toLowerCase();

  return selectedTags.some(tag => text.includes(tag));
}

/* -------- Emoji logic -------- */

function getEmoji(name){
  const lower = name.toLowerCase();

  if(lower.includes("jazz")) return "🎷";
  if(lower.includes("theater") || lower.includes("cabaret")) return "🎭";
  if(lower.includes("rock") || lower.includes("music")) return "🎸";
  if(lower.includes("club")) return "🌙";
  return "🎤";
}

/* -------- Likelihood logic -------- */

function getLikelihood(place){

  const name = place.name.toLowerCase();

  if(name.includes("bar") || name.includes("club") || name.includes("lounge")){
    return "likely";
  }

  return null; // no badge
}

/* -------- Why this fits -------- */

function getFitLine(audience){

  if(!audience) return "Strong fit for emerging artists.";

  if(audience <= 40)
    return "Great for 20–60 person ticketed shows.";

  if(audience <= 100)
    return "Solid mid-size crowd potential.";

  return "Strong programming footprint.";
}

/* -------- Render -------- */

function renderVenue(v, audience){

  const image = v.photo || "hero.jpg";

  const searchUrl =
    `https://www.google.com/search?q=${
      encodeURIComponent(v.name + " " + v.formatted_address)
    }`;

  const mapUrl =
    `https://www.google.com/maps/search/?api=1&query=${
      encodeURIComponent(v.name + " " + v.formatted_address)
    }`;

  const likelihood = getLikelihood(v);
  const emoji = getEmoji(v.name);

  return `
    <div class="venue-row">

      ${likelihood ? `
        <div class="likelihood-badge solid-green">
          Likely to Reply
        </div>
      ` : ""}

      <div class="venue-image"
           style="background-image:url('${image}')">
      </div>

      <div class="venue-content">

        <h3 class="venue-title">
          ${emoji} ${v.name}
        </h3>

        <div class="venue-city">
          ${v.formatted_address}
        </div>

        <p class="venue-description">
          ${v.name} is an independent performance space hosting live music
          and community-driven events.
        </p>

        <div class="venue-fit">
          ${getFitLine(audience)}
        </div>

        <a href="${searchUrl}" target="_blank" class="cta">
          See Venue
        </a>

        <a href="${mapUrl}" target="_blank" class="secondary">
          View on Map
        </a>

      </div>
    </div>
  `;
}
