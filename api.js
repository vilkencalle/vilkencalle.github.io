
// api.js – hanterar API-anrop (GET, POST, DELETE)

const API_URL = "https://script.google.com/macros/s/AKfycbwPz9hOHN-4xzmnMslb7ZQRkZCD6k6z6cpCjIu2tRtJ3huaYtOlRttNnecw78-o4MoG/exec";

let allRecipeNames = [];
let loadedRecipeIndex = null;

async function fetchRecipes() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    if (data.status === "success") {
      console.log("✅ Hämtade recept:", data.recipes);
      allRecipeNames = data.recipes.map(r => r["Beer Name"]);
      renderRecipeList(data.recipes);
    } else {
      console.error("❌ Fel från server:", data.message);
    }
  } catch (err) {
    console.error("❌ Fel vid hämtning:", err.message);
  }
}

function submitRecipe(recipe, mode = "new") {
  recipe.action = mode;
  if (mode === "update") {
    recipe.index = loadedRecipeIndex;
  }

  fetch(API_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(recipe)
  });

  setTimeout(() => {
    fetchRecipes();
    alert(`🍻 Receptet har sparats!`);
  }, 300);
}

function deleteRecipe(index) {
  if (!confirm("Ta bort detta recept?")) return;

  fetch(API_URL, {
    method: "POST",
    mode: "no-cors",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ action: "delete", index })
  });

  setTimeout(fetchRecipes, 200);
}
