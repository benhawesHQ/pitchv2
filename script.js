document.addEventListener("DOMContentLoaded", function(){
  document.getElementById("searchBtn")
    .addEventListener("click", searchVenues);
});

const funFacts = [
  "Before selling out arenas, Lizzo played 150-person rooms in Minneapolis.",
  "Lady Gaga used to perform at The Bitter End in NYC.",
  "Brandi Carlile built her audience in intimate Seattle bars.",
  "Ed Sheeran once played tiny pub gigs with just a loop pedal.",
  "Taylor Swift started performing at small Nashville coffeehouses."
];

let factInterval;

async function searchVenues(){

  const city = document.getElementById("cityInput").value.trim();
  const audience = parseInt(document.getElementById("audienceInput").value);
  const count = parseInt(document.getElementById("countSelect").value);

  const overlay = document.getElementById("loadingOverlay");
  const resultsContainer = document.getElementById("results");
  const wrapper = document.getElementById("resultsWrapper");

  overlay.classList.add("active");
  startFunFacts();

  try {

    const response = await fetch(`/api/search?city=${encodeURIComponent(city)}`);
    const data = await response.json();

    resultsContainer.innerHTML = "";

    const filtered = (data.results || [])
      .filter(v => capacityMatch(v, audience))
      .slice(0, count);

    filtered.forEach(v => {
      resultsContainer.innerHTML += renderVenue(v);
    });

    wrapper.style.display = "block";

  } catch (err) {
    console.error(err);
  }

  stopFunFacts();
  overlay.classList.remove("active");
}

function startFunFacts(){
  const factEl = document.querySelector(".fun-fact");

  if(!factEl) return;

  let index = 0;

  factInterval = setInterval(() => {
    factEl.classList.remove("show");

    setTimeout(() => {
      factEl.textContent = funFacts[index];
      factEl.classList.add("show");
      index = (index + 1) % funFacts.length;
    },300);

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

  const googleUrl =
    `https://www.google.com/maps/search/?api=1&query=${
      encodeURIComponent(v.name + " " + v.formatted_address)
    }`;

  return `
    <div class="venue-row">
      <div class="venue-image"
           style="background-image:url('${image}')">
      </div>
      <div class="venue-content">
        <h3>${v.name}</h3>
        <div class="meta">
          ⭐ ${v.rating || "N/A"} • ${v.formatted_address}
        </div>
        <a href="${googleUrl}" target="_blank" class="cta">
          View on Google
        </a>
      </div>
    </div>
  `;
}
