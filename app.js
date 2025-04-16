const API_URL = "https://script.google.com/macros/s/AKfycbwPz9hOHN-4xzmnMslb7ZQRkZCD6k6z6cpCjIu2tRtJ3huaYtOlRttNnecw78-o4MoG/exec";

let allRecipeNames = [];
let loadedRecipeIndex = null;
let availableMalts = [];
let availableHops = [];
let maltColorMap = {};
let hopAlphaMap = {};
let styleReferenceMap = {};

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
/*
document.addEventListener("DOMContentLoaded", () => {
  fetchRecipes();
  calculateABV();
  calculateIBU();
  calculateEBC();
  calculateMashRatio();
  updateMaltPercentages();
  addMalt();
  addHop();
  addYeast();
  addAddIn();
});
*/

document.addEventListener("DOMContentLoaded", async () => {
  await fetchRecipes(); // vänta på att all data laddas
  await loadStyles();

  calculateABV();
  calculateIBU();
  calculateEBC();
  calculateMashRatio();
  updateMaltPercentages();

  addMalt();
  addHop();
  addYeast();
  addAddIn();
});

document.getElementById("og").addEventListener("input", () => {
  calculateABV();
  calculateIBU();
});
document.getElementById("fg").addEventListener("input", calculateABV);
document.getElementById("preBoilVol").addEventListener("input", () => {
  calculateEBC();
  calculateIBU();
});
document.getElementById("mashVol").addEventListener("input", calculateMashRatio);

// ─────────────────────────────────────────────
// HÄMTA & VISA RECEPT
// ─────────────────────────────────────────────

/*
async function fetchRecipes() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (data.status === "success") {
      allRecipeNames = data.recipes.map(r => r["Beer Name"]);
      renderRecipeList(data.recipes);
    } else {
      console.error("❌ Fel från server:", data.message);
    }
  } catch (err) {
    console.error("❌ Fel vid hämtning:", err.message);
  }
}
*/

async function fetchRecipes() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (data.status !== "success") {
      console.error("❌ Fel från server:", data.message);
      return;
    }

    if (data.malts) {
      availableMalts = data.malts; // [{ name: ..., ebc: ... }]
      maltColorMap = Object.fromEntries(data.malts.map(m => [m.name, m.ebc]));
    }

    if (data.hops) {
      availableHops = data.hops; // [{ name: ..., aa: ... }]
      hopAlphaMap = Object.fromEntries(data.hops.map(h => [h.name, h.aa]));
    }

    // Receptdata
    allRecipeNames = data.recipes.map(r => r["Beer Name"]);
    renderRecipeList(data.recipes);

  } catch (err) {
    console.error("❌ Fel vid hämtning:", err.message);
  }
}

function renderRecipeList(recipes) {
  const listContainer = document.getElementById("recipeList");
  listContainer.innerHTML = "";

  if (!recipes.length) {
    listContainer.innerHTML = "<p>Inga recept sparade ännu.</p>";
    return;
  }

  recipes.forEach((r, index) => {
    function formatDateLocal(dateString) {
      const date = new Date(dateString);
      if (isNaN(date)) return "–";
      const offset = date.getTimezoneOffset();
      return new Date(date.getTime() - offset * 60000).toISOString().split("T")[0];
    }
    const div = document.createElement("div");
    div.className = "recipe-card";
    div.innerHTML = `
      <strong>${r["Beer Name"] || "Namn saknas"}</strong> (${r["Beer Style"] || "Stil saknas"})<br>
      <em>Brewed by: ${r["Brew Master"] || "–"}</em><br>
      <small>ABV: ${r["ABV"] || "–"}, Brewed on: ${formatDateLocal(r["Brew Date"])}</small>
      <button onclick="loadRecipe(${index})">Ladda</button>
      <button onclick="deleteRecipe(${index})">Ta bort</button>
    `;
    listContainer.appendChild(div);
  });
}

// ─────────────────────────────────────────────
// LADDA RECEPT
// ─────────────────────────────────────────────
function loadRecipe(index) {
  fetch(API_URL)
    .then(res => res.json())
    .then(data => {
      if (data.status !== "success") return;

      const recipe = data.recipes[index];
      if (!recipe) return;

      loadedRecipeIndex = index;

      // Datumfix (lokal tidszon)
      function formatDateLocal(dateString) {
        const date = new Date(dateString);
        const offset = date.getTimezoneOffset();
        return new Date(date.getTime() - offset * 60000).toISOString().split("T")[0];
      }

      // Fyll i fält
      document.getElementById("beerName").value = recipe["Beer Name"] || "";
      document.getElementById("beerStyle").value = recipe["Beer Style"] || "";
      document.getElementById("beerStyle").dispatchEvent(new Event("change"));
      document.getElementById("brewMaster").value = recipe["Brew Master"] || "";
      document.getElementById("brewDate").value = recipe["Brew Date"] ? formatDateLocal(recipe["Brew Date"]) : "";
      document.getElementById("og").value = recipe["OG"] ? parseFloat(recipe["OG"]).toFixed(3) : "";
      document.getElementById("fg").value = recipe["FG"] ? parseFloat(recipe["FG"]).toFixed(3) : "";
      document.getElementById("abvDisplay").textContent = recipe["ABV"] || "";
      document.getElementById("ibuDisplay").textContent = recipe["IBU"] || "";
      document.getElementById("ebcDisplay").textContent = recipe["EBC"] || "";
      document.getElementById("preBoilVol").value = recipe["Pre-Boil Vol"] || "";
      document.getElementById("mashTemp").value = recipe["Mash Temp"] || "";
      document.getElementById("fermTemp").value = recipe["Ferm Temp"] || "";
      document.getElementById("mashVol").value = recipe["Mash Vol"] || "";
      document.getElementById("mashRatio").textContent = recipe["Mash Ratio"] || "–";
      document.getElementById("mashTime").value = recipe["Mash Time"] || "";
      document.getElementById("boilTime").value = recipe["Boil Time"] || "";
      document.getElementById("notes").value = recipe["Notes"] || "";

      // Rensa listor
      ["malts", "hops", "yeastList", "addInsList"].forEach(id => document.getElementById(id).innerHTML = "");

      (recipe["Malts"] || []).forEach(m => addMalt(m.name, m.weight));
      (recipe["Hops"] || []).forEach(h => addHop(h.name, h.weight, h.alpha, h.time));
      (recipe["Yeast"] || []).forEach(y => addYeast(y));
      (recipe["AddIns"] || []).forEach(a => addAddIn(a));

      calculateABV();
      calculateEBC();
      calculateIBU();
      calculateMashRatio();
    });
}

async function loadStyles() {
  try {
    const res = await fetch(`${API_URL}?styles`);
    const data = await res.json();

    if (data.status === "success") {
      const select = document.getElementById("beerStyle");
      const box = document.getElementById("styleReferenceBox");

      // Nollställ först
      select.innerHTML = `<option value="">-- Choose style --</option>`;
      styleReferenceMap = {};

      // Lägg till stilar i dropdown och karta
      data.styles.forEach(style => {
        const opt = document.createElement("option");
        opt.value = style.name;
        opt.textContent = style.name;
        select.appendChild(opt);

        styleReferenceMap[style.name] = style;
      });

      // Event: visa referensruta vid val
      select.addEventListener("change", e => {
        const selected = e.target.value;
        const ref = styleReferenceMap[selected];

        if (ref) {
          box.innerHTML = `
            <strong>Style Reference — ${ref.name}</strong><br>
            IBU: ${ref.minIBU}–${ref.maxIBU}<br>
            EBC: ${ref.minEBC}–${ref.maxEBC}<br>
            ABV: ${ref.minABV}–${ref.maxABV}%
          `;
          box.classList.remove("hidden");
        } else {
          box.classList.add("hidden");
          box.innerHTML = "";
        }

        checkStyleMatch();
      });
    }
  } catch (err) {
    console.error("⚠️ Failed to load styles:", err);
  }
}

// ─────────────────────────────────────────────
// RADERA RECEPT
// ─────────────────────────────────────────────
function deleteRecipe(index) {
  if (!confirm("Ta bort detta recept?")) return;

  fetch(API_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action: "delete", index })
  });

  setTimeout(fetchRecipes, 300);
}

// ─────────────────────────────────────────────
// SPARA RECEPT (ny eller uppdatera)
// ─────────────────────────────────────────────
function submitRecipe(mode = "new") {
  const recipe = collectRecipeData();
  recipe.action = mode;

  if (mode === "update") {
    recipe.index = loadedRecipeIndex;
  }

  fetch(API_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recipe)
  });

  setTimeout(() => {
    fetchRecipes();
    alert(`🍻 Receptet har sparats!`);
  }, 300);
}

function saveNewRecipe() {
  const beerName = document.getElementById("beerName").value.trim();

  if (!beerName) return alert("❗ Ange ett namn för ölet.");
  if (allRecipeNames.includes(beerName)) {
    return alert(`⚠️ Ett recept med namnet "${beerName}" finns redan.`);
  }

  submitRecipe("new");
}

function updateRecipe() {
  if (loadedRecipeIndex == null) return alert("⚠️ Inget recept är laddat.");
  submitRecipe("update");
}

// ─────────────────────────────────────────────
// RENSNING
// ─────────────────────────────────────────────
function clearForm() {
  loadedRecipeIndex = null;

  document.querySelectorAll("input, select, textarea").forEach(el => {
    if (el.type === "select-one") el.selectedIndex = 0;
    else el.value = "";
  });

  ["malts", "hops", "yeastList", "addInsList"].forEach(id => document.getElementById(id).innerHTML = "");

  document.getElementById("mashRatio").textContent = "–";
  document.getElementById("abvDisplay").textContent = "";
  document.getElementById("ibuDisplay").textContent = "";
  document.getElementById("ebcDisplay").textContent = "";

  addMalt();
  addHop();
  addYeast();
  addAddIn();
}

// ─────────────────────────────────────────────
// INGREDIENS-FUNKTIONER
// ─────────────────────────────────────────────
function addMalt(name = "", weight = "") {
  const row = document.createElement("div");
  row.className = "ingredient-row";

  const select = document.createElement("select");
  availableMalts.forEach(m => {
    const opt = document.createElement("option");
    opt.value = m.name;
    opt.textContent = `${m.name} (${m.ebc} EBC)`;
    //if (m === name) opt.selected = true;
    if (m.name === name) opt.selected = true;
    select.appendChild(opt);
  });

  const input = document.createElement("input");
  input.type = "number";
  input.placeholder = "g";
  input.value = weight;

  const percent = document.createElement("span");
  percent.className = "percent";

  const remove = document.createElement("button");
  remove.className = "remove-btn";
  remove.textContent = "－";
  remove.onclick = () => {
    row.remove();
    updateMaltPercentages();
    calculateEBC();
    calculateMashRatio();
  };

  input.addEventListener("input", () => {
    updateMaltPercentages();
    calculateEBC();
    calculateMashRatio();
  });

  select.onchange = calculateEBC;

  row.append(select, input, percent, remove);
  document.getElementById("malts").appendChild(row);
  updateMaltPercentages();
}

function addHop(name = "", weight = "", alpha = "", time = "") {
  const row = document.createElement("div");
  row.className = "ingredient-row";

  const select = document.createElement("select");
  availableHops.forEach(h => {
    const opt = document.createElement("option");
    opt.value = h.name;
    opt.textContent = `${h.name} (${h.aa}% AA)`;
    //if (h === name) opt.selected = true;
    if (h.name === name) opt.selected = true;
    select.appendChild(opt);
    // Auto-fyll AA% vid val av humle
    select.addEventListener("change", () => {
      const selectedName = select.value;
      if (hopAlphaMap[selectedName]) {
        aa.value = hopAlphaMap[selectedName];
        calculateIBU(); // uppdatera IBU direkt
      }
    });
  });

  const g = document.createElement("input");
  g.type = "number";
  g.placeholder = "g";
  g.value = weight;

  const aa = document.createElement("input");
  aa.type = "number";
  aa.placeholder = "AA%";
  aa.step = "0.1";
  aa.value = alpha;

  const boil = document.createElement("input");
  boil.type = "number";
  boil.placeholder = "min";
  boil.value = time;

  const remove = document.createElement("button");
  remove.className = "remove-btn";
  remove.textContent = "－";
  remove.onclick = () => row.remove();

  [g, aa, boil, select].forEach(el => el.addEventListener("input", calculateIBU));
  row.append(select, g, aa, boil, remove);
  document.getElementById("hops").appendChild(row);
}

function addYeast(value = "") {
  const row = document.createElement("div");
  row.className = "ingredient-row";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Ex: Safale S-04";
  input.value = value;

  const remove = document.createElement("button");
  remove.className = "remove-btn";
  remove.textContent = "－";
  remove.onclick = () => row.remove();

  row.append(input, remove);
  document.getElementById("yeastList").appendChild(row);
}

function addAddIn(value = "") {
  const row = document.createElement("div");
  row.className = "ingredient-row";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Ex: koriander, apelsinskal...";
  input.value = value;

  const remove = document.createElement("button");
  remove.className = "remove-btn";
  remove.textContent = "－";
  remove.onclick = () => row.remove();

  row.append(input, remove);
  document.getElementById("addInsList").appendChild(row);
}

// ─────────────────────────────────────────────
// BEREKNINGAR
// ─────────────────────────────────────────────
function updateMaltPercentages() {
  const rows = document.querySelectorAll("#malts .ingredient-row");
  let total = 0;
  rows.forEach(row => {
    const g = parseFloat(row.children[1].value);
    if (!isNaN(g)) total += g;
  });

  rows.forEach(row => {
    const g = parseFloat(row.children[1].value);
    const span = row.querySelector(".percent");
    if (!isNaN(g) && total > 0) {
      span.textContent = `(${((g / total) * 100).toFixed(1)}%)`;
    } else {
      span.textContent = "";
    }
  });
}

function calculateABV() {
  const og = parseFloat(document.getElementById("og").value);
  const fg = parseFloat(document.getElementById("fg").value);
  const el = document.getElementById("abvDisplay");
  el.textContent = (!isNaN(og) && !isNaN(fg)) ? `${((og - fg) * 131.25).toFixed(2)}%` : "–";
  checkStyleMatch();
}

function calculateEBC() {
  const rows = document.querySelectorAll("#malts .ingredient-row");
  const volume = parseFloat(document.getElementById("preBoilVol").value) || 25;

  let totalColorUnits = 0; // malt EBC * vikt i kg
  rows.forEach(row => {
    const malt = row.children[0].value;
    const weight = parseFloat(row.children[1].value); // gram
    const color = maltColorMap[malt] || 0;

    if (!isNaN(weight)) {
      const kg = weight / 1000;
      totalColorUnits += kg * color;
    }
  });

  let result = "–";
  if (volume > 0) {
    const mcu = totalColorUnits / volume;
    const adjusted = 1.4922 * Math.pow(mcu, 0.6859) * 1.97;
    result = Math.round(adjusted);
  }

  document.getElementById("ebcDisplay").textContent = result;

  const indicator = document.getElementById("ebcIndicator");
  if (indicator && result !== "–") {
    // EBC range: 0 - 80 (justera efter behov)
    const ebcValue = Math.min(Math.max(result, 0), 80);
    const percent = (ebcValue / 80) * 100;
    indicator.style.left = `${percent}%`;
  }
checkStyleMatch();
}

/*
function calculateEBC() {
  const rows = document.querySelectorAll("#malts .ingredient-row");
  const volume = parseFloat(document.getElementById("preBoilVol").value) || 25;
  let ebc = 0;
  rows.forEach(row => {
    const malt = row.children[0].value;
    const weight = parseFloat(row.children[1].value);
    const color = maltColorMap[malt] || 0;
    if (!isNaN(weight)) ebc += (weight / 1000) * color;
  });
  const result = volume > 0 ? (ebc / volume) * 10 : 0;
  document.getElementById("ebcDisplay").value = isNaN(result) ? "–" : Math.round(result);
}
*/

function calculateIBU() {
  const rows = document.querySelectorAll("#hops .ingredient-row");
  const volume = parseFloat(document.getElementById("preBoilVol").value) || 25;
  const og = parseFloat(document.getElementById("og").value) || 1.050;
  let ibu = 0;
  rows.forEach(row => {
    const weight = parseFloat(row.children[1].value);
    const alpha = parseFloat(row.children[2].value);
    const time = parseFloat(row.children[3].value);
    if (!isNaN(weight) && !isNaN(alpha) && !isNaN(time)) {
      const util = (1.65 * Math.pow(0.000125, og - 1) * (1 - Math.exp(-0.04 * time)) / 4.15) * 1.15;
      ibu += (weight * alpha * util * 10) / volume;
    }
  });
  document.getElementById("ibuDisplay").textContent = isNaN(ibu) ? "–" : Math.round(ibu);
  checkStyleMatch();
}

function calculateMashRatio() {
  const mashVol = parseFloat(document.getElementById("mashVol").value);
  const maltRows = document.querySelectorAll("#malts .ingredient-row");

  let totalGrams = 0;
  maltRows.forEach(row => {
    const input = row.children[1]; // input för vikt
    const grams = parseFloat(input.value);
    if (!isNaN(grams)) totalGrams += grams;
  });

  const totalKg = totalGrams / 1000;
  const ratio = totalKg > 0 && !isNaN(mashVol) ? mashVol / totalKg : 0;

  const display = document.getElementById("mashRatio");
  display.value = ratio ? `${ratio.toFixed(2)}:1` : "–";
}

function checkStyleMatch() {
  const style = document.getElementById("beerStyle").value;
  const ref = styleReferenceMap[style];
  if (!ref) return;

  const stats = [
    { key: "ibu", val: parseFloat(document.getElementById("ibuDisplay").textContent) },
    { key: "ebc", val: parseFloat(document.getElementById("ebcDisplay").textContent) },
    { key: "abv", val: parseFloat(document.getElementById("abvDisplay").textContent) }
  ];

  stats.forEach(({ key, val }) => {
    const block = document.getElementById(`${key}Display`).parentElement;
    block.classList.remove("stat-ok", "stat-warn", "stat-bad");

    const min = ref[`min${key.toUpperCase()}`];
    const max = ref[`max${key.toUpperCase()}`];

    if (isNaN(val)) return;

    if (val >= min && val <= max) {
      block.classList.add("stat-ok");
    } else if (val >= min * 0.9 && val <= max * 1.1) {
      block.classList.add("stat-warn");
    } else {
      block.classList.add("stat-bad");
    }
  });
}

// ─────────────────────────────────────────────
// GEMENSAM DATASAMLING
// ─────────────────────────────────────────────
function collectRecipeData() {
  const recipe = {
    beerName: document.getElementById("beerName").value,
    beerStyle: document.getElementById("beerStyle").value,
    brewMaster: document.getElementById("brewMaster").value,
    brewDate: document.getElementById("brewDate").value,
    og: parseFloat(document.getElementById("og").value),
    fg: parseFloat(document.getElementById("fg").value),
    abv: document.getElementById("abvDisplay").textContent,
    ibu: document.getElementById("ibuDisplay").textContent,
    ebc: document.getElementById("ebcDisplay").textContent,
    preBoilVol: parseFloat(document.getElementById("preBoilVol").value),
    mashTemp: parseFloat(document.getElementById("mashTemp").value),
    fermTemp: parseFloat(document.getElementById("fermTemp").value),
    mashVol: parseFloat(document.getElementById("mashVol").value),
    mashRatio: document.getElementById("mashRatio").textContent,
    mashTime: parseInt(document.getElementById("mashTime").value),
    boilTime: parseInt(document.getElementById("boilTime").value),
    notes: document.getElementById("notes").value,
    malts: [],
    hops: [],
    yeast: [],
    addIns: []
  };

  document.querySelectorAll("#malts .ingredient-row").forEach(row => {
    recipe.malts.push({
      name: row.children[0].value,
      weight: parseFloat(row.children[1].value)
    });
  });

  document.querySelectorAll("#hops .ingredient-row").forEach(row => {
    recipe.hops.push({
      name: row.children[0].value,
      weight: parseFloat(row.children[1].value),
      alpha: parseFloat(row.children[2].value),
      time: parseFloat(row.children[3].value)
    });
  });

  document.querySelectorAll("#yeastList .ingredient-row").forEach(row => {
    recipe.yeast.push(row.children[0].value);
  });

  document.querySelectorAll("#addInsList .ingredient-row").forEach(row => {
    recipe.addIns.push(row.children[0].value);
  });

  return recipe;
}
