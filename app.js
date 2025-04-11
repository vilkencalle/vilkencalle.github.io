const availableMalts = ["Pilsner", "Vienna", "Caramel", "Chocolate"];
const availableHops = ["Cascade", "Saaz", "Citra", "Simcoe"];
const API_URL = "https://script.google.com/macros/s/AKfycbx-jBb4ANFQcnmtha6D1dHe8AdAklhlJM-bnmEDqGvrXnOYj6FTxQ0HfXwsE5poidar/exec"; // din faktiska URL

const maltColorMap = {
  "Pilsner": 3,
  "Vienna": 6,
  "Caramel": 20,
  "Chocolate": 800
};

// 👉 Event listeners för statiska fält
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

async function fetchRecipes() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (data.status === "success") {
      console.log("✅ Hämtade recept:", data.recipes);
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

let loadedRecipes = []; // Sparas när vi hämtar dem

function loadRecipe(index) {
  const r = loadedRecipes[index];
  if (!r) return alert("Kunde inte ladda recept!");

  document.getElementById("beerName").value = r["Beer Name"] || "";
  document.getElementById("beerStyle").value = r["Beer Style"] || "";
  document.getElementById("brewMaster").value = r["Brew Master"] || "";
  document.getElementById("brewDate").value = r["Brew Date"] || "";
  document.getElementById("preBoilVol").value = r["Pre-Boil Vol"] || "";
  document.getElementById("og").value = r["OG"] || "";
  document.getElementById("fg").value = r["FG"] || "";
  document.getElementById("mashTemp").value = r["Mash Temp"] || "";
  document.getElementById("fermTemp").value = r["Ferm Temp"] || "";
  document.getElementById("mashVol").value = r["Mash Vol"] || "";
  document.getElementById("mashTime").value = r["Mash Time"] || "";
  document.getElementById("boilTime").value = r["Boil Time"] || "";
  document.getElementById("notes").value = r["Notes"] || "";

  // Visuella värden
  calculateABV();
  calculateIBU();
  calculateEBC();
  calculateMashRatio();

  // Töm dynamiska fält
  document.getElementById("malts").innerHTML = "";
  document.getElementById("hops").innerHTML = "";
  document.getElementById("yeastList").innerHTML = "";
  document.getElementById("addInsList").innerHTML = "";

  try {
    JSON.parse(r["Malts"] || "[]").forEach(m => addMalt(m.name, m.weight));
    JSON.parse(r["Hops"] || "[]").forEach(h => addHop(h.name, h.weight, h.alpha, h.time));
    JSON.parse(r["Yeast"] || "[]").forEach(y => addYeast(y));
    JSON.parse(r["AddIns"] || "[]").forEach(a => addAddIn(a));
  } catch (e) {
    console.warn("Kunde inte parsa receptets ingredienser:", e);
  }
}

function deleteRecipe(index) {
  if (!confirm("Ta bort detta recept?")) return;

  // Bypassar CORS genom att sätta mode: "no-cors"
  fetch(API_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ action: "delete", index })
  });

  // 💡 Vi får ingen respons, men vi kan ladda om listan ändå:
  setTimeout(fetchRecipes, 200); // Liten delay för att vänta in API:et
}


/*async function fetchRecipes() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    console.log("Hämtade recept:", data.recipes); // 👈 detta är en array
    renderRecipeList(data.recipes); // 👈 skicka bara arrayen vidare
  } catch (err) {
    console.error("Fel vid hämtning:", err.message);
  }
}

function renderRecipeList(recipes) {
  const listContainer = document.getElementById("recipeList");
  listContainer.innerHTML = "";

  recipes.forEach((r, index) => {
    const div = document.createElement("div");
    div.className = "recipe-card";
    div.innerHTML = `
      <strong>${r["Beer Name"]}</strong> (${r["Beer Style"]})<br>
      <em>Brewed by: ${r["Brew Master"]}</em><br>
      <button onclick="loadRecipe(${index})">Ladda</button>
      <button onclick="deleteRecipe(${index})">Ta bort</button>
    `;
    listContainer.appendChild(div);
  });
}*/

/*function addMalt(name = "", weight = "") {
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
  input.placeholder = "gram";
  input.value = weight;

  const percentSpan = document.createElement("span");
  percentSpan.className = "percent";
  percentSpan.textContent = "";

  input.oninput = () => {
    calculateEBC();
    calculateMashRatio();
    updateMaltPercentages();
  };

  select.onchange = () => {
    calculateEBC();
  };

  row.appendChild(select);
  row.appendChild(input);
  row.appendChild(percentSpan);
  document.getElementById("malts").appendChild(row);

  updateMaltPercentages(); // Direkt efter tillägg
}*/

function updateMaltPercentages() {
  const rows = document.querySelectorAll("#malts .ingredient-row");
  let total = 0;

  rows.forEach(row => {
    const weight = parseFloat(row.children[1].value);
    if (!isNaN(weight)) total += weight;
  });

  rows.forEach(row => {
    let percentSpan = row.querySelector(".percent");
    if (!percentSpan) {
      percentSpan = document.createElement("span");
      percentSpan.className = "percent";
      row.appendChild(percentSpan);
    }

    const weight = parseFloat(row.children[1].value);
    if (!isNaN(weight) && total > 0) {
      percentSpan.textContent = `(${((weight / total) * 100).toFixed(1)}%)`;
    } else {
      percentSpan.textContent = "";
    }
  });
}

/*function addHop(name = "", weight = "", aa = "", boilTime = "") {
  const row = document.createElement("div");
  row.className = "ingredient-row";

  const select = document.createElement("select");
  availableHops.forEach(h => {
    const opt = document.createElement("option");
    opt.value = h;
    opt.textContent = h;
    select.appendChild(opt);
  });

  const g = document.createElement("input");
  g.type = "number";
  g.placeholder = "g";
  g.value = weight;

  const alpha = document.createElement("input");
  alpha.type = "number";
  alpha.placeholder = "AA%";
  alpha.step = "0.1";
  alpha.value = aa;

  const time = document.createElement("input");
  time.type = "number";
  time.placeholder = "min";
  time.value = boilTime;

  [g, alpha, time, select].forEach(el => el.addEventListener("input", calculateIBU));

  row.appendChild(select);
  row.appendChild(g);
  row.appendChild(alpha);
  row.appendChild(time);
  document.getElementById("hops").appendChild(row);
}*/

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
  percent.textContent = "";

  const remove = document.createElement("button");
  remove.className = "remove-btn";
  remove.innerHTML = "🗑️";
  remove.onclick = () => {
    row.remove();
    updateMaltPercentages();
    calculateEBC();
    calculateMashRatio();
  };

  input.oninput = () => {
    calculateEBC();
    calculateMashRatio();
    updateMaltPercentages();
  };
  select.onchange = () => {
    calculateEBC();
  };

  row.append(select, input, percent, remove);
  document.getElementById("malts").appendChild(row);
  updateMaltPercentages(); // se till att allt uppdateras
}


/*function addMalt(name = "", weight = "") {
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

  const remove = document.createElement("button");
  remove.className = "remove-btn";
  remove.innerHTML = "🗑️";
  remove.onclick = () => row.remove();

  input.oninput = () => {
    calculateEBC();
    calculateMashRatio();
  };
  select.onchange = calculateEBC;

  row.append(select, input, remove);
  document.getElementById("malts").appendChild(row);
}*/

function addHop(name = "", weight = "", aa = "", boilTime = "") {
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

  const alpha = document.createElement("input");
  alpha.type = "number";
  alpha.placeholder = "AA%";
  alpha.step = "0.1";
  alpha.value = aa;

  const time = document.createElement("input");
  time.type = "number";
  time.placeholder = "minutes";
  time.value = boilTime;

  const remove = document.createElement("button");
  remove.className = "remove-btn";
  remove.innerHTML = "🗑️";
  remove.onclick = () => row.remove();

  [g, alpha, time, select].forEach(el => el.addEventListener("input", calculateIBU));

  row.append(select, g, alpha, time, remove);
  document.getElementById("hops").appendChild(row);
}

function calculateABV() {
  const og = parseFloat(document.getElementById("og").value);
  const fg = parseFloat(document.getElementById("fg").value);
  const el = document.getElementById("abvDisplay");

  if (!isNaN(og) && !isNaN(fg)) {
    const abv = ((og - fg) * 131.25).toFixed(2);
    el.value = `${abv}%`;
  } else {
    el.value = "0";
  }
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
      const utilization = (1.65 * Math.pow(0.000125, og - 1) * (1 - Math.exp(-0.04 * time)) / 4.15) * 1.15;
      ibu += (weight * alpha * utilization * 10) / volume;
    }
  });

  document.getElementById("ibuDisplay").value = isNaN(ibu) ? "–" : Math.round(ibu);
}

// ratio = mashVol / totalMaltWeight (kg)
function calculateMashRatio() {
  const mashVol = parseFloat(document.getElementById("mashVol").value);
  const maltRows = document.querySelectorAll("#malts .ingredient-row");
  let totalGrams = 0;

  maltRows.forEach(row => {
    const g = parseFloat(row.children[1].value);
    if (!isNaN(g)) totalGrams += g;
  });

  const ratio = totalGrams > 0 ? mashVol / (totalGrams / 1000) : 0;
  document.getElementById("mashRatio").textContent = ratio ? `${ratio.toFixed(2)}:1` : "–";
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
  remove.innerHTML = "🗑️";
  remove.onclick = () => row.remove();

  row.append(input, remove);
  document.getElementById("yeastList").appendChild(row);
}

function addAddIn(value = "") {
  const row = document.createElement("div");
  row.className = "ingredient-row";

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = "Ex: apelsinskal, koriander...";
  input.value = value;

  const remove = document.createElement("button");
  remove.className = "remove-btn";
  remove.innerHTML = "🗑️";
  remove.onclick = () => row.remove();

  row.append(input, remove);
  document.getElementById("addInsList").appendChild(row);
}

function submitRecipe() {
  const recipe = {
    beerName: document.getElementById("beerName").value,
    beerStyle: document.getElementById("beerStyle").value,
    brewMaster: document.getElementById("brewMaster").value,
    brewDate: document.getElementById("brewDate").value,
    preBoilVol: parseFloat(document.getElementById("preBoilVol").value),
    og: parseFloat(document.getElementById("og").value),
    fg: parseFloat(document.getElementById("fg").value),
    abv: document.getElementById("abvDisplay").value,
    ibu: document.getElementById("ibuDisplay").value,
    ebc: document.getElementById("ebcDisplay").value,
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

  // Samla malter
  document.querySelectorAll("#malts .ingredient-row").forEach(row => {
    recipe.malts.push({
      name: row.children[0].value,
      weight: parseFloat(row.children[1].value)
    });
  });

  // Samla humle
  document.querySelectorAll("#hops .ingredient-row").forEach(row => {
    recipe.hops.push({
      name: row.children[0].value,
      weight: parseFloat(row.children[1].value),
      alpha: parseFloat(row.children[2].value),
      time: parseFloat(row.children[3].value)
    });
  });

  // Samla jäst
  document.querySelectorAll("#yeastList .ingredient-row").forEach(row => {
    recipe.yeast.push(row.children[0].value);
  });

  // Samla add-ins
  document.querySelectorAll("#addInsList .ingredient-row").forEach(row => {
    recipe.addIns.push(row.children[0].value);
  });

  fetch(API_URL, {
  method: "POST",
  mode: "no-cors", // 👈 lägg till detta!
  headers: {
    "Content-Type": "application/json"
  },
  body: JSON.stringify(recipe)
  })
  .then(() => {
    alert("🍻 Receptet har sparats!");
  })
  .catch(err => {
    console.error("Fetch error:", err);
    alert("Något gick fel!");
  });

  /*fetch('https://script.google.com/macros/s/YOUR_DEPLOYED_URL/exec', {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(recipe)
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      alert("🍻 Receptet har sparats!");
    } else {
      alert("Fel vid sparande: " + data.message);
    }
  })
  .catch(err => {
    console.error("Fetch error:", err);
    alert("Något gick fel vid anslutning till API");
  });*/

  /*fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(recipe)
  })
  .then(response => response.json())
  .then(data => {
    if (data.status === "success") {
      alert("✅ Receptet har sparats!");
    } else {
      alert("❌ Fel: " + data.message);
      console.error(data);
    }
  })
  .catch(err => {
    alert("💥 Nätverksfel: " + err.message);
    console.error(err);
  });*/
}

