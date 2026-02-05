// -------------------------
// Step Navigation
// -------------------------

const step1 = document.getElementById("step1");
const step2 = document.getElementById("step2");
const step3 = document.getElementById("step3");

document.getElementById("to-step2").onclick = () => {
  if (!validatePlayers()) return;
  step1.classList.add("hidden");
  step2.classList.remove("hidden");
};

document.getElementById("back-to-step1").onclick = () => {
  step2.classList.add("hidden");
  step1.classList.remove("hidden");
};

document.getElementById("restart").onclick = () => {
  location.reload();
};

// -------------------------
// Render player inputs
// -------------------------

const playersContainer = document.getElementById("players-container");

function renderPlayerInputs() {
  for (let i = 0; i < 6; i++) {
    const row = document.createElement("div");
    row.className = "player-row";

    row.innerHTML = `
      <input type="text" placeholder="Name" id="pname-${i}">
      <input type="number" placeholder="HI" id="hi-${i}" step="0.1">
    `;

    playersContainer.appendChild(row);
  }
}

renderPlayerInputs();

// -------------------------
// Validate players
// -------------------------

function validatePlayers() {
  for (let i = 0; i < 6; i++) {
    const name = document.getElementById(`pname-${i}`).value.trim();
    const hi = parseFloat(document.getElementById(`hi-${i}`).value);

    if (!name || isNaN(hi)) {
      alert("Please fill in all player names and handicaps.");
      return false;
    }
  }
  return true;
}

// -------------------------
// Playing Handicap Calculation
// -------------------------

function calculatePlayingHandicap(hi, cr, sr, par) {
  const ph = hi * (sr / 113) + (cr - par);
  return Math.round(ph);
}

// -------------------------
// Generate Pairings
// -------------------------

document.getElementById("generate").onclick = () => {
  const cr = parseFloat(document.getElementById("cr").value);
  const sr = parseInt(document.getElementById("sr").value);
  const par = parseInt(document.getElementById("par").value);

  if (isNaN(cr) || isNaN(sr) || isNaN(par)) {
    alert("Please fill in CR, SR and Par.");
    return;
  }

  // Build players with playing handicaps
  const players = [];
  for (let i = 0; i < 6; i++) {
    const name = document.getElementById(`pname-${i}`).value.trim();
    const hi = parseFloat(document.getElementById(`hi-${i}`).value);
    const ph = calculatePlayingHandicap(hi, cr, sr, par);

    players.push(new Player(i.toString(), name, ph));
  }

  // Generate pairings
  const allPairings = generateAllGreensomePairings(players);
  const validPairings = allPairings.filter(pairs =>
    isValidGreensomeSetup(players, pairs)
  );

  renderResults(validPairings);

  step2.classList.add("hidden");
  step3.classList.remove("hidden");
};

// -------------------------
// Render Results
// -------------------------

function renderResults(validPairings) {
  const results = document.getElementById("results");
  results.innerHTML = "";

  if (validPairings.length === 0) {
    results.innerHTML = "<p>No valid pairings found.</p>";
    return;
  }

  validPairings.forEach((pairs, idx) => {
    const block = document.createElement("div");
    block.className = "result-block";

    const { singles, captainChoices } = deriveSinglesOrder(pairs);

    block.innerHTML = `
      <h3>Setup ${idx + 1}</h3>
      <p><strong>Pairs:</strong></p>
      <ul>
        ${pairs
          .map(
            p =>
              `<li>${p.players[0].name} & ${p.players[1].name} (PH sum: ${p.sumPH()})</li>`
          )
          .join("")}
      </ul>

      <p><strong>Singles order:</strong> ${singles
        .map(p => p.name)
        .join(" → ")}</p>

      ${
        captainChoices.length
          ? `<p><strong>Captain choices:</strong> ${captainChoices
              .map(c => `Pair ${c.pairIndex + 1}`)
              .join(", ")}</p>`
          : ""
      }
    `;

    results.appendChild(block);
  });
}
