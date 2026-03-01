document.getElementById("searchBtn").addEventListener("click", async function() {

  const city = document.getElementById("city").value;
  const audience = document.getElementById("audience").value;
  const vibe = document.getElementById("vibe").value;
  const count = document.getElementById("count").value;

  if (!city || !audience) {
    alert("Please enter at least a city and audience size.");
    return;
  }

  try {

    const response = await fetch("/api/search", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ city, audience, vibe, count })
    });

    if (!response.ok) {
      throw new Error("Server error");
    }

    const data = await response.json();

    displayResults(data.result);

  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong. Check console.");
  }

});


function displayResults(text) {

  const container = document.getElementById("results");
  container.innerHTML = "";

  if (!text) {
    container.innerHTML = "<p>No results returned.</p>";
    return;
  }

  const card = document.createElement("div");
  card.className = "result-card";
  card.innerHTML = `
    <h3>🎸 Suggested Venues</h3>
    <pre style="white-space: pre-wrap; font-family: inherit;">${text}</pre>
  `;

  container.appendChild(card);

}
