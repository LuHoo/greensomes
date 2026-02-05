// -------------------------
// 1. Models
// -------------------------

class Player {
  constructor(id, name, playingHandicap) {
    this.id = id;
    this.name = name;
    this.playingHandicap = playingHandicap;
  }
}

class Pair {
  constructor(player1, player2) {
    this.players = [player1, player2];
  }

  sumPH() {
    return this.players[0].playingHandicap + this.players[1].playingHandicap;
  }

  // geeft alle mogelijke singles-volgorden bij gelijke PH
  singlesOrders() {
    const [p1, p2] = this.players;
    if (p1.playingHandicap === p2.playingHandicap) {
      return [
        [p1, p2],
        [p2, p1]
      ];
    } else {
      // laagste PH eerst
      return p1.playingHandicap < p2.playingHandicap
        ? [[p1, p2]]
        : [[p2, p1]];
    }
  }
}

/*
// -------------------------
// 2. Validator
// -------------------------

function isValidGreensomeSetup(players, pairs) {
  if (players.length !== 6 || pairs.length !== 3) return false;

  // Alle spelers uniek en exact aanwezig
  const allPairPlayers = pairs.flatMap(pair => pair.players.map(p => p.id));
  const playerIds = players.map(p => p.id);
  const uniqueIds = new Set(allPairPlayers);
  if (uniqueIds.size !== 6 || !playerIds.every(id => uniqueIds.has(id))) return false;

  // Volgorde van gezamenlijke PH
  const sums = pairs.map(pair => pair.sumPH());
  if (!(sums[0] <= sums[1] && sums[1] <= sums[2])) return false;

  // Bepaal de laagste twee spelers
  const sortedPlayers = [...players].sort((a, b) => a.playingHandicap - b.playingHandicap);
  const lowestPH = sortedPlayers[0].playingHandicap;
  const candidates = sortedPlayers.filter(p => p.playingHandicap === lowestPH);
  
  let lowestPairs = [];
  if (candidates.length >= 2) {
    // alle combinaties van 2 laagste
    for (let i = 0; i < candidates.length; i++) {
      for (let j = i + 1; j < candidates.length; j++) {
        lowestPairs.push([candidates[i], candidates[j]]);
      }
    }
  } else {
    // laagste + volgende laagste
    lowestPairs.push([sortedPlayers[0], sortedPlayers[1]]);
  }

  // Controleer de NGF restrictie: A/B niet in pair3
  for (const [A, B] of lowestPairs) {
    if (!pairs[2].players.some(p => p.id === A.id || p.id === B.id)) {
      return true; // geldig voor deze keuze
    }
  }

  return false;
}
*/

// -------------------------
// 3. Pairings generator
// -------------------------

function combinations(arr, k) {
  const result = [];
  if (k === 0) return [[]];
  arr.forEach((el, idx) => {
    const rest = arr.slice(idx + 1);
    for (const c of combinations(rest, k - 1)) {
      result.push([el, ...c]);
    }
  });
  return result;
}

function generateAllGreensomePairings(players) {
  const allPairs = combinations(players, 2).map(pair => new Pair(pair[0], pair[1]));
  const validSets = [];

  // Kies sets van 3 unieke paren zonder overlap
  for (let i = 0; i < allPairs.length; i++) {
    const p1 = allPairs[i];
    for (let j = i + 1; j < allPairs.length; j++) {
      const p2 = allPairs[j];
      if (p1.players.some(p => p2.players.includes(p))) continue;
      for (let k = j + 1; k < allPairs.length; k++) {
        const p3 = allPairs[k];
        if (p1.players.some(p => p3.players.includes(p)) || p2.players.some(p => p3.players.includes(p)))
          continue;
        validSets.push([p1, p2, p3]);
      }
    }
  }

  // Genereer alle 3! = 6 permutaties van de 3 paren
  const allOpstellingen = [];
  for (const set of validSets) {
    const [a, b, c] = set;
    const perms = [
      [a, b, c],
      [a, c, b],
      [b, a, c],
      [b, c, a],
      [c, a, b],
      [c, b, a]
    ];
    allOpstellingen.push(...perms);
  }

  return allOpstellingen;
}

// -------------------------
// 4. Singles-volgorde afleiden
// -------------------------

function deriveSinglesOrder(pairs) {
  const singles = [];
  const captainChoices = [];

  pairs.forEach((pair, idx) => {
    const orders = pair.singlesOrders();
    if (orders.length === 1) {
      singles.push(...orders[0]);
    } else {
      // PH gelijk, captain kan kiezen
      captainChoices.push({ pairIndex: idx, options: orders });
      singles.push(...orders[0]); // standaard keuze (kan UI laten wijzigen)
    }
  });

  return { singles, captainChoices };
}

/*
// -------------------------
// 5. Pipeline voorbeeld
// -------------------------

// voorbeeldteam
const players = [
  new Player("A", "A", 6),
  new Player("B", "B", 8),
  new Player("C", "C", 8),
  new Player("D", "D", 12),
  new Player("E", "E", 13),
  new Player("F", "F", 15),
];

const allPairings = generateAllGreensomePairings(players);
const validPairings = allPairings.filter(pairs => isValidGreensomeSetup(players, pairs));

console.log("Aantal geldige opstellingen:", validPairings.length);

validPairings.forEach((pairs, idx) => {
  const { singles, captainChoices } = deriveSinglesOrder(pairs);
  console.log(`Opstelling ${idx + 1}:`);
  console.log(pairs.map(p => p.players.map(pl => pl.name)));
  console.log("Singles:", singles.map(p => p.name));
  if (captainChoices.length) {
    console.log("Captain kan kiezen bij gelijke PH:", captainChoices);
  }
});
