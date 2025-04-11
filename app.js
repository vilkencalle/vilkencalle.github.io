const availableMalts = ["Pilsner", "Vienna", "Caramel", "Chocolate"];
const availableHops = ["Cascade", "Saaz", "Citra", "Simcoe"];

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

  // Malts
  document.querySelectorAll("#malts .ingredient-row").forEach(row => {
    recipe.malts.push({
      name: row.children[0].value,
      weight: parseFloat(row.children[1].value)
    });
  });

  // Hops
  document.querySelectorAll("#hops .ingredient-row").forEach(row => {
    recipe.hops.push({
      name: row.children[0].value,
      weight: parseFloat(row.children[1].value),
      alpha: parseFloat(row.children[2].value),
      time: parseFloat(row.children[3].value)
    });
  });

  // Yeast
  document.querySelectorAll("#yeastList .ingredient-row").forEach(row => {
    recipe.yeast.push(row.querySelector("input").value);
  });

  // Add-ins
  document.querySelectorAll("#addInsList .ingredient-row").forEach(row => {
    recipe.addIns.push(row.querySelector("input").value);
  });

  // 💾 Skicka till Google Sheets via Apps Script API

  // ✅ Ersätt detta med din egen Web App URL från Apps Script deployment:
  const API_URL = "https://script.google.com/macros/s/AKfycbwWGjwnzUGLx0HA5q4AEGXXDI0OW38LRW3Lf3_k12-GBBqB4lyN0CbPr3kSSxaZivfC/exec";

  // 🔁 Skicka till Google Sheets via API
  fetch(API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(recipe)
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      alert(`🍺 Receptet "${recipe.beerName}" har sparats till Google Sheets!`);
    } else {
      alert("❌ Fel vid sparande: " + data.message);
      console.error(data);
    }
  })
  .catch(err => {
    alert("🚨 Ett nätverksfel inträffade!");
    console.error(err);
  });
/*
  fetch("https://script.google.com/macros/s/AKfycbwWGjwnzUGLx0HA5q4AEGXXDI0OW38LRW3Lf3_k12-GBBqB4lyN0CbPr3kSSxaZivfC/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recipe)
  })
  .then(res => res.text())
  .then(msg => {
    console.log("Svar från Sheets:", msg);
    alert("🍺 Receptet har skickats till Google Sheets!");
  })
  .catch(err => {
    console.error("Något gick fel:", err);
    alert("⚠️ Kunde inte skicka till Sheets.");
  });
}*/

/*function submitRecipe() {
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
    yeast: [],
    addIns: [],
    malts: [],
    hops: [],
    notes: document.getElementById("notes").value
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
    recipe.yeast.push(row.querySelector("input").value);
  });

  // Samla add-ins
  document.querySelectorAll("#addInsList .ingredient-row").forEach(row => {
    recipe.addIns.push(row.querySelector("input").value);
  });

  console.log("Sparat recept:", recipe);
  alert(`🍻 Receptet "${recipe.beerName}" har sparats!`);

  fetch("https://script.google.com/macros/s/AKfycbxxAa4GHiBzGBdRWuO5dCuLWpy0eao-_IvhkTkDWkMQGug_5WZH6VRcSV74mV8M_UGQ/exec", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(recipe)
  })
  .then(res => res.json())
  .then(data => {
    if (data.status === "success") {
      alert("✅ Recept sparat!");
    } else {
      alert("🚨 Fel vid sparande: " + data.message);
    }
  })
  .catch(err => {
    alert("⚠️ Nätverksfel: " + err.message);
  });
}*/


