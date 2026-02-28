let allVenues = [];
let displayedCount = 0;

const loreMoments = [
  "One global superstar once played to 14 people in a bookstore.",
  "A Grammy winner once passed out flyers outside their own show.",
  "One arena headliner once drove 8 hours to perform for 20 guests.",
  "A festival closer once lived in a van touring small bars.",
  "A platinum artist once opened for free drink tickets.",
  "One chart-topper once played unpaid weeknight gigs.",
  "A stadium act once rehearsed in a basement with broken amps.",
  "One global icon once performed for a birthday party crowd.",
  "A touring legend once got rejected by 20 venues in a row.",
  "One breakout artist once begged venues for stage time.",
  "A headline act once played coffee shops for tips.",
  "One superstar once built their fanbase 30 people at a time.",
  "A festival headliner once cold-emailed venues for bookings.",
  "One arena artist once performed for 12 friends and family.",
  "A global pop icon once opened for a bar trivia night."
];

let loreIndex = 0;

function getLore(){
  const text = loreMoments[loreIndex];
  loreIndex = (loreIndex + 1) % loreMoments.length;
  return text;
}

function searchVenues(){
  document.getElementById("resultsWrapper").style.display="block";

  const overlay = document.getElementById("loadingOverlay");
  overlay.classList.add("active");

  document.getElementById("loreText").innerText = getLore();

  setTimeout(() => {
    overlay.classList.remove("active");
    generateResults();
  }, 1800);
}

function generateResults(){
  const results = document.getElementById("results");
  results.innerHTML="";
  displayedCount = 0;

  const sampleVenues = [
    {
      name:"The Sultan Room",
      location:"Brooklyn, NY",
      capacityMin:50,
      capacityMax:150,
      description:"Independent music venue above a Turkish restaurant with dedicated stage and ticketed shows.",
      reply:"high"
    },
    {
      name:"Union Hall",
      location:"Park Slope, Brooklyn",
      capacityMin:60,
      capacityMax:140,
      description:"Intimate downstairs performance room hosting comedy, music, and ticketed events.",
      reply:"high"
    },
    {
      name:"The Lost Church",
      location:"San Francisco, CA",
      capacityMin:30,
      capacityMax:80,
      description:"Listening room focused on original music with seated ticketed shows.",
      reply:"medium"
    },
    {
      name:"The Independent",
      location:"San Francisco, CA",
      capacityMin:150,
      capacityMax:500,
      description:"Established concert venue hosting national touring acts and ticketed shows.",
      reply:"medium"
    }
  ];

  allVenues = sampleVenues;

  showMore();
}

function showMore(){
  const results = document.getElementById("results");
  const moreBtn = document.getElementById("moreBtn");

  const nextChunk = allVenues.slice(displayedCount, displayedCount + 5);

  nextChunk.forEach(v => {
    const badgeClass = v.reply==="high" ? "reply-high" :
                       v.reply==="medium" ? "reply-medium" : "reply-low";

    results.innerHTML += `
      <div class="venue-card">
        <div class="venue-header">
          <div class="venue-name">${v.name}</div>
          <div class="booking-badge ${badgeClass}">
            ${v.reply==="high" ? "Likely to Reply" :
              v.reply==="medium" ? "May Reply" : "Harder to Reach"}
          </div>
        </div>
        <div class="venue-location">${v.location}</div>
        <div class="venue-description">${v.description}</div>
        <a class="see-venue-btn" target="_blank"
           href="https://www.google.com/search?q=${encodeURIComponent(v.name + " " + v.location)}">
          See venue
        </a>
      </div>
    `;
  });

  displayedCount += 5;

  if(displayedCount < allVenues.length){
    moreBtn.style.display="block";
  } else {
    moreBtn.style.display="none";
  }

  launchConfetti();
}

function launchConfetti(){
  for(let i=0;i<40;i++){
    const confetti=document.createElement("div");
    confetti.style.position="fixed";
    confetti.style.left=Math.random()*100+"%";
    confetti.style.top="0";
    confetti.style.width="6px";
    confetti.style.height="6px";
    confetti.style.background="#f94501";
    confetti.style.zIndex="9999";
    confetti.style.transition="1s ease-out";
    document.body.appendChild(confetti);

    setTimeout(()=>{
      confetti.style.top="100%";
      confetti.style.opacity="0";
    },10);

    setTimeout(()=>{
      confetti.remove();
    },1000);
  }
}
