const availableMalts = ["Pilsner", "Vienna", "Caramel", "Chocolate"];
const availableHops = ["Cascade", "Saaz", "Citra", "Simcoe"];

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

  input.oninput = updateMaltPercentages;

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
