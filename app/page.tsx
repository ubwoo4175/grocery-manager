"use client";

import React, { useState, useEffect } from "react";
import { Quantity, Recipe, ShoppingListItem, ShoppingListType, AggregatedIngredients, Fridge } from "@/lib/types";
import { getUserFridges, getUserRecipes } from "@/lib/actions/recipe.actions";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

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

const UnitToNum: { [key: string]: number } = {
  알: 1,
  개: 1,
  조각: 1,
  
  ml: 1,
  스푼: 15,
  컵: 180,
  병: 750,
  L: 1000,

  g: 1,
  kg: 1000,

  봉지: 500, // ex) 들깨가루 1 봉지,
  꼬집: 1,
  줌: 30,
  대: 5, // ex) 대파 1대
};

const SimilarName: { [key: string]: string } ={
  계란노른자: "계란",
}
const haveEnough = () => {
  return true;
};
// --- Child Components ---

interface RecipeCardProps {
  recipe: Recipe;
  isSelected: boolean;
  onToggle: (recipeId: string) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, isSelected, onToggle }) => {
  const router = useRouter();

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
        style={{ background: "none", boxShadow: "none" }}
        onClick={() => onToggle(recipe.id)}
        aria-pressed={isSelected}
      >
        {recipe.recipe_name}
      </button>
      <button type="button" className="ml-2 p-1 rounded hover:bg-gray-200" aria-label="Edit recipe" onClick={() => router.push(`/recipes/${recipe.id}`)}>
        <PlusIcon />
      </button>
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
            <ShoppingCartIcon /> To Buy
          </h3>
          <ul className="space-y-2 pl-2  border rounded-lg border-blue-800">
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
            <CheckSquareIcon /> In Fridge
          </h3>
          <ul className="space-y-2 pl-2">
            {list.inFridge.map((item) => (
              <li key={item.name} className="flex items-start">
                <span className="text-green-800">
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

interface FridgeDisplayProps {
  fridge: Fridge | null;
  neededIngredients: AggregatedIngredients;
}

const FridgeDisplay: React.FC<FridgeDisplayProps> = ({ fridge, neededIngredients }) => {
  if (!fridge) {
    return <div className="text-center py-8 text-gray-500">Select a fridge to see its contents.</div>;
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4 border-b pb-2">{fridge.fridge_name}</h2>
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2">Ingredient</th>
            <th className="text-left py-2">Quantity</th>
            <th className="text-left py-2">You Need</th>
          </tr>
        </thead>
        <tbody>
          {Object.entries(fridge.ingredients).map(([ingredientId, quantityObj]) => {
            const needed = neededIngredients[ingredientId];
            const neededAmount = needed ? `${Object.values(needed)[0]} ${Object.keys(needed)[0]}` : "";

            return (
              <tr key={ingredientId} className="border-b">
                <td className="py-2">{ingredientId.replace(/_/g, " ")}</td>
                <td className="py-2 text-green-800">{`${Object.values(quantityObj)[0]} ${Object.keys(quantityObj)[0]}`}</td>
                {needed ? (
                  <td
                    className={cn(
                      "py-2",
                      Object.values(quantityObj)[0] * UnitToNum[Object.keys(quantityObj)[0]] >= Object.values(needed)[0] * UnitToNum[Object.keys(needed)[0]]
                        ? ""
                        : "text-red-500"
                    )}
                  >
                    {neededAmount}
                  </td>
                ) : (
                  <td></td>
                )}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

// --- Main App Component ---

const App = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [fridges, setFridges] = useState<Fridge[]>([]);
  const [selectedFridgeIndex, setSelectedFridgeIndex] = useState<number>(0);
  const [fridgeItems, setFridgeItems] = useState<{ [ingredientId: string]: Quantity }>({});
  const [loading, setLoading] = useState(true);
  const [selectedRecipeIds, setSelectedRecipeIds] = useState<Set<string>>(new Set());
  const [shoppingList, setShoppingList] = useState<ShoppingListType | null>(null);
  const [neededIngredients, setNeededIngredients] = useState<AggregatedIngredients>({});

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const [fetchedRecipes, fetchedFridges] = await Promise.all([getUserRecipes(), getUserFridges()]);

      if (fetchedRecipes) {
        setRecipes(fetchedRecipes as Recipe[]);
      }

      if (fetchedFridges && fetchedFridges.length > 0) {
        setFridges(fetchedFridges as Fridge[]);
        setFridgeItems(fetchedFridges[0].ingredients || {});
      } else {
        setFridges([]);
      }
      setLoading(false);
    };

    fetchData();
  }, []);

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
          if (!aggregated[ingId][unit]) aggregated[ingId][unit] = 0;
          (aggregated[ingId][unit] as number) += quantityMap[unit];
        }
      }
    });
    setNeededIngredients(aggregated);

    const inFridge: ShoppingListItem[] = [];
    const notInFridge: ShoppingListItem[] = [];

    for (const ingId in aggregated) {
      const neededAmount = Object.values(aggregated[ingId])[0];
      const neededUnit = Object.keys(aggregated[ingId])[0];

      let fridgeItem = fridgeItems[ingId];
      if(!fridgeItem && SimilarName[ingId]) {
        fridgeItem = fridgeItems[SimilarName[ingId]];
      }

      //--------------------------------------------------------------------------------------------------------------
      if (fridgeItem) {
        const availableAmount = Object.values(fridgeItem)[0];
        const availableUnit = Object.keys(fridgeItem)[0];

        if (neededUnit.toLowerCase() === availableUnit.toLowerCase()) {
          if (availableAmount >= neededAmount) {
            inFridge.push({ name: ingId.replace(/_/g, " "), amountStr: `${neededAmount} ${neededUnit}` });
          } else {
            notInFridge.push({ name: ingId.replace(/_/g, " "), amountStr: `${neededAmount - availableAmount} ${neededUnit}` });
            inFridge.push({ name: ingId.replace(/_/g, " "), amountStr: `${availableAmount} ${availableUnit}` });
          }
        } else {
          // Units are different, add to both lists to be safe
          if (availableAmount * UnitToNum[availableUnit] >= neededAmount * UnitToNum[neededUnit]) {
            inFridge.push({ name: ingId.replace(/_/g, " "), amountStr: `${neededAmount} ${neededUnit}` });
          } else {
            notInFridge.push({ name: ingId.replace(/_/g, " "), amountStr: `${neededAmount} ${neededUnit} (냉장고에 ${availableAmount} ${availableUnit})` });
            inFridge.push({ name: ingId.replace(/_/g, " "), amountStr: `${availableAmount} ${availableUnit}` });
          }
        }
      } else {
        notInFridge.push({ name: ingId.replace(/_/g, " "), amountStr: `${neededAmount} ${neededUnit}` });
      }
    }

    setShoppingList({ inFridge, notInFridge });
  }, [selectedRecipeIds, fridgeItems, recipes]);

  useEffect(() => {
    if (fridges.length > 0) {
      setFridgeItems(fridges[selectedFridgeIndex].ingredients || {});
    }
  }, [selectedFridgeIndex, fridges]);

  if (loading) {
    return <div className="p-8 text-center text-lg">Loading your kitchen...</div>;
  }

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <div className="container mx-auto p-4 md:p-8 max-w-8xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Grocery Manager</h1>
          <p className="text-lg text-gray-600 mt-2">Select meals, and we'll generate your shopping list.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-2 lg:gap-8">
          <div>
            <div className="bg-white p-6 rounded-xl shadow-md mb-8">
              <h2 className="text-2xl font-semibold mb-4 border-b pb-2">1. Choose Your Recipes</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {recipes.map((recipe) => (
                  <RecipeCard key={recipe.id} recipe={recipe} isSelected={selectedRecipeIds.has(recipe.id)} onToggle={handleToggleRecipe} />
                ))}
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <h2 className="text-2xl font-semibold mb-4 border-b pb-2">2. Your Shopping List</h2>
              <ShoppingList list={shoppingList} />
            </div>
          </div>

          <div>
            <div className="mt-8 lg:mt-0">
              <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                <h2 className="text-2xl font-semibold mb-4 border-b pb-2">3. Select Your Fridge</h2>
                <select
                  value={selectedFridgeIndex}
                  onChange={(e) => setSelectedFridgeIndex(parseInt(e.target.value, 10))}
                  className="w-full p-2 border rounded-md"
                >
                  {fridges.map((fridge, index) => (
                    <option key={fridge.id} value={index}>
                      {fridge.fridge_name}
                    </option>
                  ))}
                </select>
              </div>
              <FridgeDisplay fridge={fridges[selectedFridgeIndex]} neededIngredients={neededIngredients} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
