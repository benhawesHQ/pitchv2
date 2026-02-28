document.addEventListener("DOMContentLoaded", function(){

  document.getElementById("searchBtn")
    .addEventListener("click", searchVenues);

});

async function searchVenues(){

  const city = document.getElementById("cityInput").value.trim();
  const audience = parseInt(document.getElementById("audienceInput").value);
  const count = parseInt(document.getElementById("countSelect").value);

  const overlay = document.getElementById("loadingOverlay");
  const resultsContainer = document.getElementById("results");
  const wrapper = document.getElementById("resultsWrapper");

  overlay.classList.add("active");
  resultsContainer.innerHTML = "";

  try {

    const response = await fetch(`/api/search?city=${encodeURIComponent(city)}`);

    if (!response.ok) {
      throw new Error("API error");
    }

    const data = await response.json();

    let filtered = data.results || [];

    filtered = filtered.filter(v => capacityMatch(v, audience));

    filtered.slice(0, count).forEach(v => {
      resultsContainer.innerHTML += renderVenue(v, audience);
    });

    wrapper.style.display = "block";

  } catch (err) {
    console.error(err);
    resultsContainer.innerHTML = `
      <div style="padding:40px;text-align:center;">
        Search failed.
      </div>
    `;
    wrapper.style.display = "block";
  }

  overlay.classList.remove("active");
}

function capacityMatch(place, audience){

  const name = place.name.toLowerCase();

  const largeWords = ["arena","stadium","paramount","center","hall","theater"];

  if(audience <= 40){
    if(largeWords.some(w => name.includes(w))){
      return false;
    }
  }

  return true;
}

function renderVenue(v, audience){

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
