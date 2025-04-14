const availableMalts = ["Pilsner", "Vienna", "Caramel", "Chocolate"];
const availableHops = ["Cascade", "Saaz", "Citra", "Simcoe"];
const API_URL = "https://script.google.com/macros/s/AKfycbwPz9hOHN-4xzmnMslb7ZQRkZCD6k6z6cpCjIu2tRtJ3huaYtOlRttNnecw78-o4MoG/exec";

const maltColorMap = {
  "Pilsner": 3,
  "Vienna": 6,
  "Caramel": 20,
  "Chocolate": 800
};

let allRecipeNames = [];
let loadedRecipeIndex = null;

// ─────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────
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

function renderRecipeList(recipes) {
  const listContainer = document.getElementById("recipeList");
  listContainer.innerHTML = "";

  if (!recipes.length) {
    listContainer.innerHTML = "<p>Inga recept sparade ännu.</p>";
    return;
  }

  recipes.forEach((r, index) => {
    const div = document.createElement("div");
    div.className = "recipe-card";
    div.innerHTML = `
      <strong>${r["Beer Name"] || "Namn saknas"}</strong> (${r["Beer Style"] || "Stil saknas"})<br>
      <em>Brewed by: ${r["Brew Master"] || "–"}</em><br>
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
      document.getElementById("brewMaster").value = recipe["Brew Master"] || "";
      document.getElementById("brewDate").value = recipe["Brew Date"] ? formatDateLocal(recipe["Brew Date"]) : "";
      document.getElementById("og").value = recipe["OG"] || "";
      document.getElementById("fg").value = recipe["FG"] || "";
      document.getElementById("abvDisplay").value = recipe["ABV"] || "";
      document.getElementById("ibuDisplay").value = recipe["IBU"] || "";
      document.getElementById("ebcDisplay").value = recipe["EBC"] || "";
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
  document.getElementById("abvDisplay").value = "";
  document.getElementById("ibuDisplay").value = "";
  document.getElementById("ebcDisplay").value = "";

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
    opt.value = m;
    opt.textContent = m;
    if (m === name) opt.selected = true;
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
  remove.textContent = "🗑️";
  remove.onclick = () => {
    row.remove();
    updateMaltPercentages();
    calculateEBC();
    calculateMashRatio();
  };

  input.oninput = () => {
    updateMaltPercentages();
    calculateEBC();
    calculateMashRatio();
  };
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
    opt.value = h;
    opt.textContent = h;
    if (h === name) opt.selected = true;
    select.appendChild(opt);
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
  remove.textContent = "🗑️";
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
  remove.textContent = "🗑️";
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
  remove.textContent = "🗑️";
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
  el.value = (!isNaN(og) && !isNaN(fg)) ? `${((og - fg) * 131.25).toFixed(2)}%` : "–";
}

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
  document.getElementById("ibuDisplay").value = isNaN(ibu) ? "–" : Math.round(ibu);
}

function calculateMashRatio() {
  const mashVol = parseFloat(document.getElementById("mashVol").value);
  const maltRows = document.querySelectorAll("#malts .ingredient-row");
  let total = 0;
  maltRows.forEach(row => {
    const g = parseFloat(row.children[1].value);
    if (!isNaN(g)) total += g;
  });
  const ratio = total > 0 ? mashVol / (total / 1000) : 0;
  document.getElementById("mashRatio").textContent = ratio ? `${ratio.toFixed(2)}:1` : "–";
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
    abv: document.getElementById("abvDisplay").value,
    ibu: document.getElementById("ibuDisplay").value,
    ebc: document.getElementById("ebcDisplay").value,
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
