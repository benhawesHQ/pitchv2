// DATASET

const venues = [
  // BROOKLYN SMALL
  {name:"The Sultan Room",city:"brooklyn",min:50,max:150,desc:"Independent upstairs venue with ticketed live music.",reply:"high"},
  {name:"Union Hall",city:"brooklyn",min:80,max:140,desc:"Intimate performance room hosting music and comedy.",reply:"high"},
  {name:"Baby's All Right",city:"brooklyn",min:100,max:280,desc:"Indie music venue with national touring acts.",reply:"medium"},
  {name:"Music Hall of Williamsburg",city:"brooklyn",min:250,max:650,desc:"Established Brooklyn concert venue for touring artists.",reply:"medium"},
  {name:"The Bell House",city:"brooklyn",min:150,max:300,desc:"Gowanus venue with full stage and ticketed shows.",reply:"medium"},

  // SAN FRANCISCO
  {name:"The Lost Church",city:"san francisco",min:30,max:80,desc:"Listening room focused on original music.",reply:"medium"},
  {name:"The Independent",city:"san francisco",min:200,max:500,desc:"Established venue hosting touring acts.",reply:"medium"},
  {name:"Bottom of the Hill",city:"san francisco",min:150,max:300,desc:"Historic indie venue with dedicated stage.",reply:"high"},

  // PORTLAND
  {name:"Mississippi Studios",city:"portland",min:200,max:300,desc:"Beloved Portland venue hosting touring acts.",reply:"medium"},
  {name:"The Old Church",city:"portland",min:100,max:300,desc:"Historic church venue with seated performances.",reply:"medium"},
  {name:"The Waypost",city:"portland",min:40,max:100,desc:"Cozy neighborhood venue with live music nights.",reply:"high"}
];

let filteredVenues = [];
let displayedCount = 0;

const loreMoments = [
  "One arena artist once played to 14 people in a bookstore.",
  "A chart-topping singer once handed out their own flyers.",
  "A Grammy winner once toured in a borrowed van.",
  "One superstar once opened for a trivia night crowd.",
  "A festival headliner once begged venues for stage time."
];

let loreIndex = 0;

function getLore(){
  const text = loreMoments[loreIndex];
  loreIndex = (loreIndex + 1) % loreMoments.length;
  return text;
}

function searchVenues(){
  const cityInput = document.getElementById("cityInput").value.toLowerCase();
  const audience = parseInt(document.getElementById("audienceInput").value);
  const count = parseInt(document.getElementById("countSelect").value);

  document.getElementById("resultsWrapper").style.display="block";

  const overlay = document.getElementById("loadingOverlay");
  overlay.classList.add("active");
  document.getElementById("loreText").innerText = getLore();

  setTimeout(() => {
    overlay.classList.remove("active");

    filteredVenues = venues
      .filter(v => cityInput.includes(v.city))
      .sort((a,b) => Math.abs(a.min - audience) - Math.abs(b.min - audience))
      .slice(0,count);

    displayedCount = 0;
    document.getElementById("results").innerHTML="";
    document.getElementById("resultsSub").innerText =
      `Showing ${filteredVenues.length} venues matching ~${audience} guests in ${cityInput}.`;

    showMore();
  }, 1500);
}

function showMore(){
  const results = document.getElementById("results");
  const moreBtn = document.getElementById("moreBtn");

  const nextChunk = filteredVenues.slice(displayedCount, displayedCount + 5);

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
        <div class="venue-location">${v.city}</div>
        <div class="venue-description">${v.desc}</div>
        <a class="see-venue-btn" target="_blank"
           href="https://www.google.com/search?q=${encodeURIComponent(v.name + " " + v.city)}">
          See venue
        </a>
      </div>
    `;
  });

  displayedCount += 5;

  if(displayedCount < filteredVenues.length){
    moreBtn.style.display="block";
  } else {
    moreBtn.style.display="none";
  }

  launchConfetti();
}

function launchConfetti(){
  for(let i=0;i<30;i++){
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
