const searchBtn = document.getElementById("searchBtn");

searchBtn.addEventListener("click", async () => {

  const city = document.getElementById("cityInput").value.trim();
  const audience = document.getElementById("audienceInput").value.trim();
  const extra = document.getElementById("extraInput").value.trim();
  const count = document.getElementById("countSelect").value;

  if(!city) return;

  const overlay = document.getElementById("loadingOverlay");
  overlay.classList.add("active");

  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = "";

  try{

    const res = await fetch("/api/search", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ city, audience, extra, count })
    });

    const data = await res.json();

    data.forEach(venue => {

      const card = document.createElement("div");
      card.className = "venue-card";

      const header = document.createElement("div");
      header.className = "venue-header";

      const name = document.createElement("div");
      name.className = "venue-name";
      name.innerText = `${venue.emoji || "🎶"} ${venue.name}`;

      const badge = document.createElement("div");
      badge.className = `reply-badge ${venue.replyClass}`;
      badge.innerText = venue.replyLabel;

      header.appendChild(name);
      header.appendChild(badge);

      const cityText = document.createElement("div");
      cityText.className = "venue-city";
      cityText.innerText = city;

      const description = document.createElement("div");
      description.className = "venue-description";
      description.innerText = venue.description;

      const btn = document.createElement("a");
      btn.className = "see-btn";
      btn.innerText = "See venue";
      btn.href = `https://www.google.com/search?q=${encodeURIComponent(venue.name + " " + city)}`;
      btn.target = "_blank";

      card.appendChild(header);
      card.appendChild(cityText);
      card.appendChild(description);
      card.appendChild(btn);

      resultsContainer.appendChild(card);
    });

  }catch(e){
    console.error(e);
  }

  overlay.classList.remove("active");
});
