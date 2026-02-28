const searchBtn = document.getElementById("searchBtn");

searchBtn.addEventListener("click", async () => {

  const city = document.getElementById("cityInput").value.trim();
  const audience = document.getElementById("audienceInput").value.trim();
  const extra = document.getElementById("extraInput").value.trim();

  if(!city) return;

  const overlay = document.getElementById("loadingOverlay");
  overlay.classList.add("active");

  const resultsContainer = document.getElementById("results");
  resultsContainer.innerHTML = "";

  try{

    const res = await fetch("/api/search", {
      method:"POST",
      headers:{"Content-Type":"application/json"},
      body:JSON.stringify({ city, audience, extra })
    });

    const data = await res.json();

    data.forEach(venue => {

      const card = document.createElement("div");
      card.className = "venue-card";

      const info = document.createElement("div");
      info.className = "venue-info";

      const name = document.createElement("div");
      name.className = "venue-name";
      name.innerText = venue.name;

      const badge = document.createElement("div");
      badge.className = "badge";
      badge.innerText = venue.likelihood || "Active venue";

      info.appendChild(name);
      info.appendChild(badge);

      const btn = document.createElement("a");
      btn.className = "view-btn";
      btn.innerText = "View venue";
      btn.href = venue.googleUrl;
      btn.target = "_blank";

      card.appendChild(info);
      card.appendChild(btn);

      resultsContainer.appendChild(card);

    });

  }catch(e){
    console.error(e);
  }

  overlay.classList.remove("active");
});
