const availableMalts = ["Pilsner", "Vienna", "Caramel", "Chocolate"];
const availableHops = ["Cascade", "Saaz", "Citra", "Simcoe"];

const maltColorMap = {
  "Pilsner": 3,
  "Vienna": 6,
  "Caramel": 20,
  "Chocolate": 800
};

document.getElementById("og").addEventListener("input", () => {
  calculateABV();
  calculateIBU();
});

document.getElementById("fg").addEventListener("input", calculateABV);
document.getElementById("preBoilVol").addEventListener("input", () => {
  calculateEBC();
  calculateIBU();
});

// 🔁 Lägg till malt
function addMalt(name = "", weight = "") {
  const container = document.getElementById("malts");
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
  percent.textContent = "–";

  input.oninput = () => {
    updateMaltPercentages();
    calculateEBC();
  };

  row.appendChild(select);
  row.appendChild(input);
  row.appendChild(percent);
  container.appendChild(row);
}

// 🔁 Lägg till humle
function addHop(name = "", weight = "", aa = "", boilTime = "") {
  const container = document.getElementById("hops");
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
  time.placeholder = "min";
  time.value = boilTime;

  g.oninput = calculateIBU;
  alpha.oninput = calculateIBU;
  time.oninput = calculateIBU;

  row.appendChild(select);
  row.appendChild(g);
  row.appendChild(alpha);
  row.appendChild(time);
  container.appendChild(row);
}

// 🔄 Uppdatera %-andel malt
function updateMaltPercentages() {
  const rows = document.querySelectorAll("#malts .ingredient-row");
  let total = 0;

  rows.forEach(row => {
    const weight = parseFloat(row.children[1].value);
    if (!isNaN(weight)) total += weight;
  });

  rows.forEach(row => {
    const weight = parseFloat(row.children[1].value);
    const percentSpan = row.querySelector(".percent");
    if (!isNaN(weight) && total > 0) {
      const pct = ((weight / total) * 100).toFixed(1);
      percentSpan.textContent = `${pct}%`;
    } else {
      percentSpan.textContent = "–";
    }
  });
}

function calculateABV() {
  const og = parseFloat(document.getElementById("og").value);
  const fg = parseFloat(document.getElementById("fg").value);

  const display = document.getElementById("abvDisplay");
  if (!isNaN(og) && !isNaN(fg)) {
    const abv = ((og - fg) * 131.25).toFixed(2);
    display.textContent = `ABV: ${abv}%`;
  } else {
    display.textContent = "ABV: –";
  }
}

function calculateEBC() {
  const rows = document.querySelectorAll("#malts .ingredient-row");
  const batchSize = parseFloat(document.getElementById("preBoilVol").value) || 25;

  let ebcSum = 0;

  rows.forEach(row => {
    const malt = row.children[0].value;
    const weight = parseFloat(row.children[1].value);
    const color = maltColorMap[malt] || 0;

    if (!isNaN(weight)) {
      ebcSum += (weight / 1000) * color; // gram till kg
    }
  });

  const ebc = (ebcSum / batchSize) * 10;
  document.getElementById("ebcDisplay").textContent = `EBC: ${Math.round(ebc)}`;
}

function calculateIBU() {
  const rows = document.querySelectorAll("#hops .ingredient-row");
  const batchSize = parseFloat(document.getElementById("preBoilVol").value) || 25;
  const og = parseFloat(document.getElementById("og").value) || 1.050;

  let ibuTotal = 0;

  rows.forEach(row => {
    const weight = parseFloat(row.children[1].value); // gram
    const alpha = parseFloat(row.children[2].value);  // %
    const time = parseFloat(row.children[3].value);   // min

    if (!isNaN(weight) && !isNaN(alpha) && !isNaN(time)) {
      const utilization = (1.65 * Math.pow(0.000125, og - 1) * (1 - Math.exp(-0.04 * time)) / 4.15)*1.15;
      const ibu = (weight * alpha * utilization * 10) / batchSize;
      ibuTotal += ibu;
    }
  });

  document.getElementById("ibuDisplay").textContent = `IBU: ${Math.round(ibuTotal)}`;
}

function submitRecipe() {
  const beerName = document.getElementById("beerName").value;
  const beerStyle = document.getElementById("beerStyle").value;
  const brewMaster = document.getElementById("brewMaster").value;
  const brewDate = document.getElementById("brewDate").value;
  const preBoilVol = parseFloat(document.getElementById("preBoilVol").value);
  const og = parseFloat(document.getElementById("og").value);
  const fg = parseFloat(document.getElementById("fg").value);

  // Här ska vi lägga in uträkningar av IBU/EBC/ABV i steg 3
  const abv = ((og - fg) * 131.25).toFixed(2); // t.ex.
  document.getElementById("abv").value = abv;

  alert(`🍻 Recept sparat: ${beerName} – ABV: ${abv}%`);

  // TODO: Skicka till ditt API i steg 4
}
