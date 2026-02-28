async function searchVenues(){

  const city = document.getElementById("cityInput").value;
  const audience = parseInt(document.getElementById("audienceInput").value);
  const notes = document.getElementById("notesInput").value;
  const count = parseInt(document.getElementById("countSelect").value);

  const overlay = document.getElementById("loadingOverlay");
  overlay.classList.add("active");

  setTimeout(async () => {

    const response = await fetch(`/api/search?city=${city}`);
    const data = await response.json();

    overlay.classList.remove("active");

    const resultsContainer = document.getElementById("results");
    resultsContainer.innerHTML = "";

    let filtered = data.results.filter(v => capacityMatch(v, audience));

    filtered.slice(0,count).forEach(v => {
      resultsContainer.innerHTML += renderVenue(v, audience);
    });

    document.getElementById("resultsWrapper").style.display="block";

  },1500);
}

function capacityMatch(place, audience){

  const name = place.name.toLowerCase();

  const bigWords = ["arena","stadium","paramount","center","hall"];

  if(audience <= 40){
    for(let w of bigWords){
      if(name.includes(w)) return false;
    }
  }

  return true;
}

function replyLikelihood(place){
  if(place.user_ratings_total > 300) return "Very likely to reply";
  if(place.user_ratings_total > 100) return "Likely to reply";
  return "Smaller venue — higher personal response chance";
}

function renderVenue(v, audience){

  return `
    <div class="venue-row">

      <div class="venue-image"
        style="background-image:url('${v.photo || "hero.jpg"}')">
      </div>

      <div class="venue-content">

        <div>
          <h3>${v.name}</h3>
          <div class="meta">
            ⭐ ${v.rating || "N/A"} • ${v.formatted_address}
          </div>

          <div class="tags">
            <div class="tag">Best for ${audience} guests</div>
            <div class="tag reply">${replyLikelihood(v)}</div>
          </div>
        </div>

        <div>
          <a class="cta"
             href="https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(v.name + " " + v.formatted_address)}"
             target="_blank">
             View on Google
          </a>
        </div>

      </div>

    </div>
  `;
}
