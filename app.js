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
