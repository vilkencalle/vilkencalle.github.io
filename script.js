let hopAdditions = [];
let grainAdditions = [];
let recipes = JSON.parse(localStorage.getItem('recipes')) || [];

document.querySelector('#grams_of_hops').addEventListener('input', calculateOG);
document.querySelector('#alpha_acid').addEventListener('input', calculateOG);
document.querySelector('#boil_time').addEventListener('input', calculateOG);
document.querySelector('#hop_form').addEventListener('change', calculateOG);
document.querySelector('#gravity').addEventListener('change', () => {
  calculateIBU();
  calculateABV();
});
document.querySelector('#liters_of_wort').addEventListener('input', calculateOG);
document.querySelector('#fg').addEventListener('input', calculateABV);

document.querySelector('#malt').addEventListener('input', calculateOG);
document.querySelector('#ppg').addEventListener('change', calculateOG);
document.querySelector('#efficiency').addEventListener('input', calculateOG);
document.querySelector('#water').addEventListener('input', calculateOG);

function updateAlphaAcid() {
  const hopVariety = document.querySelector('#hop_variety');
  const selectedOption = hopVariety.options[hopVariety.selectedIndex];
  const alphaAcid = selectedOption.getAttribute('data-alpha');
  document.querySelector('#alpha_acid').value = alphaAcid;
}

function addGrainAddition() {
  const malt = parseFloat(document.querySelector('#malt').value);
  const ppg = parseFloat(document.querySelector('#ppg').value);
  const efficiency = parseFloat(document.querySelector('#efficiency').value);
  const grainName = document.querySelector('#ppg').options[document.querySelector('#ppg').selectedIndex].text;

  grainAdditions.push({
    malt,
    ppg,
    efficiency,
    grainName
  });

  renderGrainAdditions();
  calculateOG();
}

function renderGrainAdditions() {
  document.querySelector('#grain_additions').innerHTML = grainAdditions.map((addition, index) => {
    return `<p>Grain Addition ${index + 1}: ${addition.malt}kg of ${addition.grainName} (${addition.ppg} PPG) with ${addition.efficiency}% efficiency <button onclick="deleteGrainAddition(${index})">Delete</button></p>`;
  }).join('');
}

function deleteGrainAddition(index) {
  grainAdditions.splice(index, 1);
  renderGrainAdditions();
  calculateOG();
}
/*
function calculateOG() {
   const water = Number(document.getElementById("water").value);
   const waterGal = water * 0.264172;
   let totalExtract = 0;

   grainAdditions.forEach(addition => {
     const maltLb = addition.malt * 2.20462;
     totalExtract += maltLb * addition.ppg * (addition.efficiency / 100);
   });

   const boilTime = Number(document.getElementById("wort_boil_time").value) / 60; // Assuming a standard one-hour boil time
   const boilOff = waterGal * (0.047 * boilTime); // Adjusted for boil time
   const volumeAfterBoilOff = waterGal - boilOff;
   const volumeAfterCoolingShrinkage = volumeAfterBoilOff * 0.96; // Adjusted for cooling shrinkage
   const og = ((totalExtract / volumeAfterCoolingShrinkage) / 1000) + 1;
   const fg = parseFloat(document.querySelector("#fg").value);
   const litersOfWort = parseFloat(document.querySelector("#liters_of_wort").value);

   const abv = ((og - fg) * 131.25).toFixed(2);

   if (og < 1.000 || og > 1.099) {
     document.querySelector("#result").innerHTML = "Error: Wort gravity must be between 1.000 and 1.099";
     return;
   }

   let totalIBU = 0;
   hopAdditions.forEach(addition => {
     const alphaAcid = addition.alphaAcidPercentage / 100;
     let utilizationFactor = (1.65 * (0.000125 ** (og - 1))) * (1 - Math.exp(-0.04 * addition.boilTime)) / 4.15;

     if (addition.hopForm === "pellets") {
       utilizationFactor *= 1.15;
     }

     const IBU = (addition.gramsOfHops * alphaAcid * utilizationFactor * 1000) / litersOfWort;

     totalIBU += IBU;
   });

   document.querySelector("#ibu_result").value = totalIBU.toFixed(1);
   document.querySelector("#abv_result").value = abv;
   document.getElementById("og_result").innerHTML = `OG: ${og.toFixed(3)}`;
   
   // Update wort gravity and liters of wort based on calculated OG and volume after boil-off
   document.getElementById("gravity").value = og.toFixed(3);
   document.getElementById("liters_of_wort").value = (volumeAfterBoilOff / 0.264172).toFixed(2); // Convert back to liters
   document.getElementById("post_boil").value = (volumeAfterBoilOff / 0.264172).toFixed(2); // Update post-boil volume
}
*/


function calculateOG() {
   const water = Number(document.getElementById("water").value);
   const waterGal = water * 0.264172;
   let totalExtract = 0;

   grainAdditions.forEach(addition => {
     const maltLb = addition.malt * 2.20462;
     totalExtract += maltLb * addition.ppg * (addition.efficiency / 100);
   });

   const boilTime = Number(document.getElementById("wort_boil_time").value) / 60; // Assuming a standard one-hour boil time
   const boilOff = waterGal * (0.047 * boilTime); // Adjusted for boil time
   const volumeAfterBoilOff = waterGal - boilOff;
   const volumeAfterCoolingShrinkage = volumeAfterBoilOff * 0.96; // Adjusted for cooling shrinkage
   const og = ((totalExtract / volumeAfterCoolingShrinkage) / 1000) + 1;
   const fg = parseFloat(document.querySelector("#fg").value);
   const litersOfWort = parseFloat(document.querySelector("#liters_of_wort").value);

   const abv = ((og - fg) * 131.25).toFixed(2);

   if (og < 1.000 || og > 1.099) {
     document.querySelector("#result").innerHTML = "Error: Wort gravity must be between 1.000 and 1.099";
     return;
   }

   let totalIBU = 0;
   hopAdditions.forEach(addition => {
     const alphaAcid = addition.alphaAcidPercentage / 100;
     let utilizationFactor = (1.65 * (0.000125 ** (og - 1))) * (1 - Math.exp(-0.04 * addition.boilTime)) / 4.15;

     if (addition.hopForm === "pellets") {
       utilizationFactor *= 1.15;
     }

     const IBU = (addition.gramsOfHops * alphaAcid * utilizationFactor * 1000) / litersOfWort;

     totalIBU += IBU;
   });

   document.querySelector("#result").value = totalIBU.toFixed(1);
   document.querySelector("#abv_result").value = abv;
   document.querySelector("#gravity").value = og.toFixed(3);
   //document.getElementById("og_result").innerHTML = `OG: ${og.toFixed(3)}`;
   
   // Update wort gravity and liters of wort based on calculated OG and volume after boil-off
   document.getElementById("gravity").value = og.toFixed(3);
   document.getElementById("liters_of_wort").value = (volumeAfterBoilOff / 0.264172).toFixed(2); // Convert back to liters
   document.getElementById("post_boil").value = (volumeAfterBoilOff / 0.264172).toFixed(2); // Update post-boil volume
}

function addHopAddition() {
  const hopVariety = document.querySelector('#hop_variety').value;
  const gramsOfHops = parseFloat(document.querySelector('#grams_of_hops').value);
  const alphaAcidPercentage = parseFloat(document.querySelector('#alpha_acid').value);
  const boilTime = parseFloat(document.querySelector('#boil_time').value);
  const hopForm = document.querySelector('#hop_form').value;

  hopAdditions.push({
    hopVariety,
    gramsOfHops,
    alphaAcidPercentage,
    boilTime,
    hopForm
  });

  hopAdditions.sort((a, b) => b.boilTime - a.boilTime);

  renderHopAdditions();
  calculateIBU();
}

function modifyHopAddition(index) {
  const hopVariety = prompt('Enter the new hop variety');
  const gramsOfHops = parseFloat(prompt('Enter the new weight of hops (in grams)'));
  const alphaAcidPercentage = parseFloat(prompt('Enter the new alpha acid percentage'));
  const boilTime = parseFloat(prompt('Enter the new boil time (in minutes)'));
  const hopForm = prompt('Enter the new hop form (whole or pellets)');

  hopAdditions[index] = {
    hopVariety,
    gramsOfHops,
    alphaAcidPercentage,
    boilTime,
    hopForm
  };

  hopAdditions.sort((a, b) => b.boilTime - a.boilTime);

  renderHopAdditions();
  calculateIBU();
}

function deleteHopAddition(index) {
  hopAdditions.splice(index, 1);

  renderHopAdditions();
  calculateIBU();
}

function renderHopAdditions() {
  document.querySelector('#hop_additions').innerHTML = hopAdditions.map((addition, index) => {
    return `<p>Hop Addition ${index + 1}: ${addition.hopVariety} - ${addition.gramsOfHops}g of ${addition.alphaAcidPercentage}% alpha acid hops boiled for ${addition.boilTime} minutes (form: ${addition.hopForm}) <button onclick="deleteHopAddition(${index})">Delete</button></p>`;
  }).join('');
}

function calculateIBU() {
   const gravity = parseFloat(document.querySelector("#gravity").value);
   const litersOfWort = parseFloat(document.querySelector("#liters_of_wort").value);

   if (gravity < 1.000 || gravity > 1.099) {
     document.querySelector("#result").innerHTML = "Error: Wort gravity must be between 1.000 and 1.099";
     return;
   }

   let totalIBU = 0;
   hopAdditions.forEach(addition => {
     const alphaAcid = addition.alphaAcidPercentage / 100;
     let utilizationFactor = (1.65 * (0.000125 ** (gravity - 1))) * (1 - Math.exp(-0.04 * addition.boilTime)) / 4.15;

     if (addition.hopForm === "pellets") {
       utilizationFactor *= 1.15;
     }

     const IBU = (addition.gramsOfHops * alphaAcid * utilizationFactor * 1000) / litersOfWort;

     totalIBU += IBU;
   });

   document.querySelector("#result").value = totalIBU.toFixed(1);
}

function calculateABV() {
   const og = parseFloat(document.querySelector("#gravity").value);
   const fg = parseFloat(document.querySelector("#fg").value);

   const abv = ((og - fg) * 131.25).toFixed(2);

   document.querySelector("#abv_result").value = abv;    
   document.querySelector("#gravity").value = og.toFixed(3);

   //document.getElementById("og_result").innerHTML = `OG: ${og.toFixed(3)}`;
}

function saveRecipe() {
  const recipe = {
    name: document.querySelector('#beer_name').value,
    style: document.querySelector('#beer_style').value,
    master: document.querySelector('#brew_master').value,
    date: document.querySelector('#brew_date').value,
    water: document.querySelector('#water').value,
    mashTemp: document.querySelector('#mash_temp').value,
    mashTime: document.querySelector('#mash_time').value,
    grainAdditions,
    hopAdditions,
    og: document.querySelector('#gravity').value,
    fg: document.querySelector('#fg').value,
    abv: document.querySelector('#abv_result').value,
    ibu: document.querySelector('#result').value
  };

  recipes.push(recipe);
  localStorage.setItem('recipes', JSON.stringify(recipes));
  renderRecipes();
}

function renderRecipes() {
  document.querySelector('#saved_recipes').innerHTML = recipes.map((recipe, index) => {
    return `<div class="recipe">
      <h3>${recipe.name} (${recipe.style})</h3>
      <p>Brew Master: ${recipe.master}</p>
      <p>Brew Date: ${recipe.date}</p>
      <p>OG: ${recipe.og}, FG: ${recipe.fg}, ABV: ${recipe.abv}, IBU: ${recipe.ibu}</p>
      <div class="button-container">
        <button onclick="viewRecipe(${index})">View</button>
        <button onclick="deleteRecipe(${index})">Delete</button>
      </div>
    </div>`;
  }).join('');
}

function viewRecipe(index) {
  const recipe = recipes[index];
  document.querySelector('#beer_name').value = recipe.name;
  document.querySelector('#beer_style').value = recipe.style;
  document.querySelector('#brew_date').value = recipe.date;
  document.querySelector('#brew_master').value = recipe.master;
  document.querySelector('#water').value = recipe.water;
  document.querySelector('#mash_temp').value = recipe.mashTemp;
  document.querySelector('#mash_time').value = recipe.mashTime;
  grainAdditions = recipe.grainAdditions;
  hopAdditions = recipe.hopAdditions;
  document.querySelector('#gravity').value = recipe.og;
  document.querySelector('#fg').value = recipe.fg;
  document.querySelector('#abv_result').innerText = recipe.abv;
  document.querySelector('#result').innerText = recipe.ibu;

  renderGrainAdditions();
  renderHopAdditions();
}

function deleteRecipe(index) {
  recipes.splice(index, 1);
  localStorage.setItem('recipes', JSON.stringify(recipes));
  renderRecipes();
}

// Initial render of saved recipes
renderRecipes();

