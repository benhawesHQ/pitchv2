document.addEventListener("DOMContentLoaded", function(){
  document.getElementById("searchBtn")
    .addEventListener("click", searchVenues);
});

const funFacts = [
  "Before selling out arenas, Lizzo played 150-person rooms in Minneapolis.",
  "Lady Gaga performed early shows at The Bitter End in NYC.",
  "Brandi Carlile built her audience in intimate Seattle bars.",
  "Ed Sheeran once played tiny pub gigs with just a loop pedal."
];

let factInterval;

async function searchVenues(){

  const city = document.getElementById("cityInput").value.trim();
  const audience = parseInt(document.getElementById("audienceInput").value);
  const count = parseInt(document.getElementById("countSelect").value);

  if(!city) return;

  const overlay = document.getElementById("loadingOverlay");
  overlay.classList.add("active");

  startFunFacts();

  try{
    const response = await fetch(`/api/search?city=${encodeURIComponent(city)}`);
    const data = await response.json();

    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = "";

    const filtered = (data.results || [])
      .filter(v => capacityMatch(v, audience))
      .slice(0, count);

    filtered.forEach(v => {
      resultsContainer.innerHTML += renderVenue(v);
    });

    document.getElementById("resultsWrapper").style.display = "block";

  }catch(err){
    console.error(err);
  }

  stopFunFacts();
  overlay.classList.remove("active");
}

function startFunFacts(){
  const factEl = document.querySelector(".fun-fact");
  let index = 0;

  factInterval = setInterval(()=>{
    factEl.textContent = funFacts[index];
    index = (index + 1) % funFacts.length;
  },2500);
}

function stopFunFacts(){
  clearInterval(factInterval);
}

function capacityMatch(place, audience){
  if(!audience) return true;

  const name = place.name.toLowerCase();
  const largeWords = ["arena","stadium","paramount","center","hall","theater"];

  if(audience <= 50){
    if(largeWords.some(w => name.includes(w))){
      return false;
    }
  }
  return true;
}

function renderVenue(v){

  const image = v.photo || "hero.jpg";

  const searchUrl =
    `https://www.google.com/search?q=${
      encodeURIComponent(v.name + " " + v.formatted_address)
    }`;

  const mapUrl =
    `https://www.google.com/maps/search/?api=1&query=${
      encodeURIComponent(v.name + " " + v.formatted_address)
    }`;

  const likelihoodClass =
    v.user_ratings_total > 100 ? "likely" : "unlikely";

  const likelihoodText =
    v.user_ratings_total > 100 ?
    "Likely to Reply" :
    "Unlikely to Reply";

  return `
    <div class="venue-row">

      <div class="likelihood-badge ${likelihoodClass}">
        ${likelihoodText}
      </div>

      <div class="venue-image"
           style="background-image:url('${image}')">
      </div>

      <div class="venue-content">
        <h3 style="font-family:'Poppins';font-weight:700;font-size:24px;">
          ${v.name}
        </h3>

        <div style="margin:6px 0 14px 0;">
          ⭐ ${v.rating || "N/A"} • ${v.formatted_address}
        </div>

        <p style="line-height:1.6;">
          ${v.name} is a live performance venue that regularly hosts music
          and community-driven events, making it a strong option for artists
          building audience momentum.
        </p>

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
