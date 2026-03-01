let allResults = [];
let visibleCount = 6;

document.getElementById("searchBtn").addEventListener("click", searchVenues);
document.getElementById("loadMoreBtn").addEventListener("click", showMore);

async function searchVenues(){

  document.getElementById("loadingOverlay").style.display = "flex";

  const city = document.getElementById("cityInput").value;
  const audience = document.getElementById("audienceInput").value;
  const vibe = document.getElementById("vibeInput").value;
  const count = document.getElementById("countSelect").value;

  try{
    const response = await fetch("/search",{
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ city, audience, vibe, count })
    });

    const data = await response.json();
    allResults = data.venues || [];
    visibleCount = 6;

    renderResults();

  }catch(error){
    console.error(error);
  }

  document.getElementById("loadingOverlay").style.display = "none";
}

function renderResults(){

  const container = document.getElementById("results");
  container.innerHTML = "";

  const visibleResults = allResults.slice(0, visibleCount);

  visibleResults.forEach(venue=>{
    const card = document.createElement("div");
    card.className = "result-card";
    card.innerHTML = `
      <h3>${venue.name}</h3>
      <p><strong>Capacity:</strong> ${venue.capacity}</p>
      <p>${venue.description || ""}</p>
    `;
    container.appendChild(card);
  });

  document.getElementById("resultsWrapper").style.display = "block";

  if(visibleCount < allResults.length){
    document.getElementById("loadMoreBtn").style.display = "block";
  }else{
    document.getElementById("loadMoreBtn").style.display = "none";
  }

}

function showMore(){
  visibleCount += 6;
  renderResults();
}
