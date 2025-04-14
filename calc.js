
// calc.js – beräkningar (ABV, IBU, EBC, mash ratio)

const maltColorMap = {
  "Pilsner": 3,
  "Vienna": 6,
  "Caramel": 20,
  "Chocolate": 800
};

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
