"use client";

import React, { useState, useEffect } from "react";
import Fridge from "../components/Fridge";
import { Quantity, Recipe, ShoppingListItem, ShoppingListType, AggregatedIngredient, AggregatedIngredients } from "@/lib/types";
import { getUserFridge, getUserRecipes } from "@/lib/actions/recipe.actions";

// --- DATABASE (Embedded for prototype) ---
// This data now conforms to the types defined above.

// Fridge mock data (copied from Fridge.tsx)
// const initialFridgeContents: { [ingredientId: string]: Quantity } = {
//     'olive_oil' : {'bottle' : 1},
//     'soy_sauce' : {'bottle' : 1},
//     'salt' : {'shaker' : 1},
//     'black_pepper' : {'grinder' : 1},
//     'onion' : {'whole' : 2},
//     'garlic_clove' : {'clove' : 5},
//     'chicken_breast' : {'breast' : 1}
// };

// --- Helper Icons ---
const ShoppingCartIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="inline-block h-6 w-6 mr-2"
  >
    <circle cx="9" cy="21" r="1"></circle>
    <circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const CheckSquareIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="inline-block h-6 w-6 mr-2"
  >
    <polyline points="9 11 12 14 22 4"></polyline>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
  </svg>
);

const PlusIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="inline-block h-5 w-5 mr-2"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const EditIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="inline-block h-5 w-5"
  >
    <path d="M12 20h9" />
    <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 2 21l1.5-5L16.5 3.5z" />
  </svg>
);

const ExpandIcon: React.FC = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="inline-block h-5 w-5"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="16"></line>
    <line x1="8" y1="12" x2="16" y2="12"></line>
  </svg>
);

const recipes: Recipe[] = [
  {
    id: "recipe-1",
    recipe_name: "Spaghetti Bolognese",
    ingredients: {
      ground_beef: { g: 500 },
      onion: { whole: 1 },
      garlic_clove: { cloves: 3 },
    },
  },
];
// --- Child Components ---

interface RecipeCardProps {
  recipe: Recipe;
  isSelected: boolean;
  onToggle: (recipeId: string) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, isSelected, onToggle }) => {
  const [showIngredients, setShowIngredients] = useState(false);

  // Close the floating box when clicking outside
  useEffect(() => {
    if (!showIngredients) return;
    const handler = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest(`#expand-box-${recipe.id}`) && !target.closest(`#expand-btn-${recipe.id}`)) {
        setShowIngredients(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showIngredients, recipe.id]);

  return (
    <div className={`relative flex items-center p-4 border rounded-lg transition-all ${isSelected ? "bg-blue-50 border-blue-400" : "hover:bg-gray-100"}`}>
      <input
        type="checkbox"
        id={recipe.id}
        checked={isSelected}
        onChange={() => onToggle(recipe.id)}
        className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-4"
      />
      <button
        type="button"
        className="font-medium text-lg text-gray-800 flex-1 text-left focus:outline-none bg-transparent border-0 cursor-pointer"
        style={{ background: "none", boxShadow: "none" }} // Remove button styles
        onClick={() => onToggle(recipe.id)}
        aria-pressed={isSelected}
      >
        {recipe.recipe_name}
      </button>
      <button
        id={`expand-btn-${recipe.id}`}
        type="button"
        className="ml-2 p-1 rounded hover:bg-gray-200"
        aria-label="Show ingredients"
        onClick={() => setShowIngredients((v) => !v)}
      >
        <ExpandIcon />
      </button>
      <a href={`/recipes/${recipe.id}`} className="ml-2 p-1 rounded hover:bg-gray-200" aria-label="Edit recipe">
        <EditIcon />
      </a>
      {showIngredients && (
        <div
          id={`expand-box-${recipe.id}`}
          className="absolute z-20 left-1/2 top-full mt-2 -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-[220px] max-w-xs"
        >
          <div className="font-semibold mb-2 text-gray-900">Ingredients</div>
          <ul className="list-disc pl-5 text-gray-800 text-sm">
            {Object.entries(recipe.ingredients).map(([ingId, quantityMap]) => (
              <li key={ingId}>
                {ingId.replace(/_/g, " ")}:{" "}
                {Object.entries(quantityMap)
                  .map(([unit, qty]) => `${qty} ${unit}`)
                  .join(", ")}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

interface ShoppingListProps {
  list: ShoppingListType | null;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ list }) => {
  if (!list || (list.inFridge.length === 0 && list.notInFridge.length === 0)) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>Select recipes to see your ingredients.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
      {list.notInFridge.length > 0 && (
        <div className="mb-6">
          <h3 className="text-xl font-semibold mb-3 text-blue-800 flex items-center">
            <ShoppingCartIcon /> Not in Fridge (To Buy)
          </h3>
          <ul className="space-y-2 pl-2">
            {list.notInFridge.map((item) => (
              <li key={item.name} className="flex items-start">
                <span className="text-gray-800">
                  {item.name}: <strong className="ml-1 font-medium">{item.amountStr}</strong>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
      {list.inFridge.length > 0 && (
        <div>
          <h3 className="text-xl font-semibold mb-3 text-green-800 flex items-center">
            <CheckSquareIcon /> Already in Fridge
          </h3>
          <ul className="space-y-2 pl-2">
            {list.inFridge.map((item) => (
              <li key={item.name} className="flex items-start">
                <span className="text-gray-800">
                  {item.name}: <strong className="ml-1 font-medium">{item.amountStr}</strong>
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [fridgeItems, setFridgeItems] = useState<{
    [ingredientId: string]: Quantity;
  }>({});

  useEffect(() => {
    const fetchRecipes = async () => {
      const fetchedRecipes = await getUserRecipes();
      if (fetchedRecipes) {
        setRecipes(fetchedRecipes as Recipe[]);
      }
    };

    const fetchFridgeContents = async () => {
      const fetchedFridgeContents = await getUserFridge();
      if (fetchedFridgeContents) {
        const transformedFridge: { [ingredientId: string]: Quantity } = {};
        if (Array.isArray(fetchedFridgeContents)) {
          fetchedFridgeContents.forEach((fridgeEntry) => {
            if (fridgeEntry.ingredients) {
              for (const ingredientId in fridgeEntry.ingredients) {
                const quantityMap = fridgeEntry.ingredients[ingredientId];
                if (!transformedFridge[ingredientId]) {
                  transformedFridge[ingredientId] = {};
                }
                for (const unit in quantityMap) {
                  const quantity = quantityMap[unit];
                  if (!transformedFridge[ingredientId][unit]) {
                    transformedFridge[ingredientId][unit] = 0;
                  }
                  if (typeof quantity === "number" && typeof transformedFridge[ingredientId][unit] === "number") {
                    (transformedFridge[ingredientId][unit] as number) += quantity;
                  } else {
                    transformedFridge[ingredientId][unit] = quantity;
                  }
                }
              }
            }
          });
        }
        setFridgeItems(transformedFridge);
      }
    };

    fetchRecipes();
    fetchFridgeContents();
  }, []);

  const [selectedRecipeIds, setSelectedRecipeIds] = useState<Set<string>>(new Set());
  const [shoppingList, setShoppingList] = useState<ShoppingListType | null>(null);

  // Compute aggregated usage for selected recipes
  const [aggregatedUsage, setAggregatedUsage] = useState<AggregatedIngredients>({});

  const handleToggleRecipe = (recipeId: string) => {
    setSelectedRecipeIds((prevIds) => {
      const newIds = new Set(prevIds);
      if (newIds.has(recipeId)) {
        newIds.delete(recipeId);
      } else {
        newIds.add(recipeId);
      }
      return newIds;
    });
  };

  useEffect(() => {
    const recipesToMake = recipes.filter((r) => selectedRecipeIds.has(r.id));
    const aggregated: AggregatedIngredients = {};
    recipesToMake.forEach((recipe) => {
      for (const ingId in recipe.ingredients) {
        const quantityMap = recipe.ingredients[ingId];
        if (!aggregated[ingId]) aggregated[ingId] = {};
        for (const unit in quantityMap) {
          const quantity = quantityMap[unit];
          if (!aggregated[ingId][unit]) aggregated[ingId][unit] = 0;
          if (typeof quantity === "number" && typeof aggregated[ingId][unit] === "number") {
            (aggregated[ingId][unit] as number) += quantity;
          } else {
            aggregated[ingId][unit] = quantity;
          }
        }
      }
    });
    setAggregatedUsage(aggregated);
    const inFridge: ShoppingListItem[] = [];
    const notInFridge: ShoppingListItem[] = [];

    for (const ingId in aggregated) {
      const amounts = aggregated[ingId];
      console.log(amounts);
      // Check if in fridge (case-insensitive match)
      const inFridgeItem = Object.keys(fridgeItems).find((fridgeIngId) => fridgeIngId.toLowerCase() === ingId.replace(/_/g, " ").toLowerCase());
      if (inFridgeItem) {
        const needUnit = Object.keys(amounts)[0];
        const needValue = Object.values(amounts)[0];
        const haveUnit = Object.keys(fridgeItems[inFridgeItem])[0];
        const haveValue = Object.values(fridgeItems[inFridgeItem])[0];

        if (needUnit === haveUnit) {
          if (needValue <= haveValue) {
            console.log("needValue <= haveValue");
            inFridge.push({
              name: ingId,
              amountStr: `${needValue} ${haveUnit}`,
            });
          } else {
            notInFridge.push({
              name: ingId,
              amountStr: `${needValue - haveValue} ${needUnit}`,
            });
            inFridge.push({
              name: ingId,
              amountStr: `${haveValue} ${haveUnit}`,
            });
          }
        } else {
          inFridge.push({
            name: ingId,
            amountStr: `${haveValue} ${haveUnit} -> (you need) ${needValue} ${needUnit}`,
          });
        }
      } else {
        notInFridge.push({
          name: ingId,
          amountStr: Object.entries(aggregated[ingId])
            .map(([unit, qty]) => `${qty} ${unit}`)
            .join(", "),
        });
      }
    }

    setShoppingList({ inFridge, notInFridge });
  }, [selectedRecipeIds, fridgeItems]);

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <div className="container mx-auto p-4 md:p-8 max-w-8xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Grocery Manager</h1>
          <p className="text-lg text-gray-600 mt-2">Select meals, and we'll generate your shopping list.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 [auto-300px] lg:gap-8">
          <div>
            {/* Left side, recipe */}
            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
              <h2 className="text-2xl font-semibold mb-4 border-b pb-2">1. Choose Your Recipes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} isSelected={selectedRecipeIds.has(recipe.id)} onToggle={handleToggleRecipe} />
                ))}
              </div>
              <div className="mt-6 pt-6 border-t text-center">
                <a
                  href="/recipes/new"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all"
                >
                  <PlusIcon />
                  Add New Recipe
                </a>
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-semibold mb-4 border-b pb-2">2. Your Consolidated Shopping List</h2>
              <ShoppingList list={shoppingList} />
            </div>
          </div>

          {/* Right side, Fridge */}
          <div>
            <div className="mt-8 lg:mt-0">
              <Fridge items={fridgeItems} setItems={setFridgeItems} aggregatedUsage={aggregatedUsage} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
