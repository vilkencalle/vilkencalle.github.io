
// ingredients.js – hanterar malts, hops, yeast, add-ins

const availableMalts = ["Pilsner", "Vienna", "Caramel", "Chocolate"];
const availableHops = ["Cascade", "Saaz", "Citra", "Simcoe"];

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
  select.onchange = calculateEBC;

  row.append(select, input, percent, remove);
  document.getElementById("malts").appendChild(row);
  updateMaltPercentages();
}

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
    percentSpan.textContent = (!isNaN(weight) && total > 0)
      ? `(${((weight / total) * 100).toFixed(1)}%)`
      : "";
  });
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
  aa.value = alpha;

  const boil = document.createElement("input");
  boil.type = "number";
  boil.placeholder = "min";
  boil.value = time;

  const remove = document.createElement("button");
  remove.className = "remove-btn";
  remove.innerHTML = "🗑️";
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
  input.placeholder = "Jäst";
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
  input.placeholder = "Add-in";
  input.value = value;

  const remove = document.createElement("button");
  remove.className = "remove-btn";
  remove.innerHTML = "🗑️";
  remove.onclick = () => row.remove();

  row.append(input, remove);
  document.getElementById("addInsList").appendChild(row);
}
