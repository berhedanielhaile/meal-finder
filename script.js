const searchInputEl = document.querySelector(".search-input");
const searchbtn = document.querySelector(".search-btn");
const randombtn = document.querySelector(".random-btn");
const showSearchResult = document.querySelector(".show-search-result");
const showMealEl = document.querySelector(".show-meal");

let mealMap = new Map();

const resetView = () => {
  showSearchResult.innerHTML = "";
  showMealEl.innerHTML = "";
  showSearchResult.style.display = "none";
  showMealEl.style.display = "none";
};

const createMealInfo = (meal) => ({
  id: meal.idMeal,
  name: meal.strMeal,
  category: meal.strCategory,
  instructions: meal.strInstructions,
  thumb: meal.strMealThumb,
  youtube: meal.strYoutube,
  tags: meal.strTags,
  area: meal.strArea,
  ingredients: Array.from({ length: 20 }, (_, i) => ({
    ingredient: meal[`strIngredient${i + 1}`],
    measure: meal[`strMeasure${i + 1}`],
  })).filter((item) => item.ingredient && item.ingredient.trim()),
});

const renderMealCard = (mealInfo) => {
  const mealContainer = document.createElement("div");
  mealContainer.classList.add("meal-container");
  mealContainer.dataset.mealid = mealInfo.id;

  mealContainer.innerHTML = `
    <img src="${mealInfo.thumb}" class="meal-img" width="100%" alt="${mealInfo.name}" />
    <div class='meal-description'>
      <h2>${mealInfo.name}</h2>
       <h3>Instruction:</h3>
      <p>${mealInfo.instructions.slice(0, 150)}...</p>
      <button class="show-detail">show full description</button>
    </div>
  `;

  showSearchResult.appendChild(mealContainer);
};

const showDetail = (mealInfo) => {
  showSearchResult.style.display = "none";
  showMealEl.style.display = "flex";

  showMealEl.innerHTML = `
  <div class="card">
  <img src="${mealInfo.thumb}" class="card-img" width="100%" alt="${mealInfo.name}" />
  <div class="card-description">
  <h2>${mealInfo.name}</h2>
  <p><strong>Category:</strong> ${mealInfo.category || "N/A"}</p>
  <p><strong>Area:</strong> ${mealInfo.area || "N/A"}</p>
  <h3>Ingredients:</h3>
  <ul class="list-ing">
  ${mealInfo.ingredients.map((ing) => `<li class="ing">${ing.ingredient} : ${ing.measure}</li>`).join("")}
  </ul>
  <h3>Instructions:</h3>
  <div class="meal-instruction">${mealInfo.instructions}</div>
  <button class="back-to-results">Back to results</button>
  </div>
  </div>
  `;

  showMealEl.querySelector(".back-to-results").addEventListener("click", () => {
    showMealEl.style.display = "none";
    showSearchResult.style.display = "flex";
  });
};

const fetchMeals = async (query) => {
  try {
    const res = await fetch(
      `https://www.themealdb.com/api/json/v1/1/search.php?s=${encodeURIComponent(query)}`,
    );
    if (!res.ok) throw new Error("Failed to load meals");

    const data = await res.json();
    if (!data.meals) return [];

    const meals = data.meals.map(createMealInfo);
    mealMap.clear();
    meals.forEach((m) => mealMap.set(m.id, m));

    return meals;
  } catch (err) {
    console.error(err);
    return [];
  }
};

const multiMeal = async () => {
  resetView();
  const query = searchInputEl.value.trim();
  if (!query) return;

  const meals = await fetchMeals(query);
  if (!meals.length) {
    showSearchResult.style.display = "block";
    showSearchResult.innerHTML = "<p>No results found.</p>";
    return;
  }

  showSearchResult.style.display = "flex";
  meals.forEach(renderMealCard);
};

const randomMeal = async () => {
  resetView();
  try {
    const res = await fetch(
      "https://www.themealdb.com/api/json/v1/1/random.php",
    );
    if (!res.ok) throw new Error("Failed to fetch random meal");

    const data = await res.json();
    const mealInfo = createMealInfo(data.meals[0]);
    showDetail(mealInfo);
  } catch (err) {
    console.error(err);
  }
};

searchbtn.addEventListener("click", multiMeal);

searchInputEl.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    e.preventDefault();
    multiMeal();
    searchInputEl.value = "";
  }
});
randombtn.addEventListener("click", randomMeal);

showSearchResult.addEventListener("click", (e) => {
  if (!e.target.matches(".show-detail")) return;

  const card = e.target.closest(".meal-container");
  if (!card || !card.dataset.mealid) return;

  const mealInfo = mealMap.get(card.dataset.mealid);
  if (!mealInfo) return;

  showDetail(mealInfo);
});
