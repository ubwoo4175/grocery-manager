"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Quantity, Recipe } from '@/lib/types';

// --- Mock database (copied from homepage) ---
const recipes: Recipe[] = [
  {
    id: "recipe-1",
    recipe_name: "Spaghetti Bolognese",
    ingredients: {
      "ground_beef": { "g": 500 },
      "onion": { "whole": 1 },
      "garlic_clove": { "cloves": 3 },
      "canned_tomatoes": { "g": 800 },
      "spaghetti_pasta": { "g": 400 },
      "olive_oil": { "tbsp": 2 },
      "oregano": { "tsp": 1 },
    },
  },
  {
    id: "recipe-2",
    recipe_name: "Chicken Stir-Fry",
    ingredients: {
      "chicken_breast": { "breasts": 2 },
      "broccoli_head": { "head": 1 },
      "onion": { "whole": 1 },
      "garlic_clove": { "cloves": 2 },
      "soy_sauce": { "tbsp": 4 },
      "ginger": { "inch piece": 1 },
      "white_rice": { "g": 300 },
      "olive_oil": { "tbsp": 1 },
    },
  },
  {
    id: "recipe-3",
    recipe_name: "Hearty Lentil Soup",
    ingredients: {
      "lentils": { "g": 500 },
      "carrot": { "whole": 2 },
      "celery_stalk": { "stalks": 2 },
      "onion": { "whole": 1 },
      "garlic_clove": { "cloves": 4 },
      "vegetable_broth": { "ml": 1500 },
      "cumin": { "tsp": 2 },
      "olive_oil": { "tbsp": 2 },
    },
  },
  {
    id: "recipe-4",
    recipe_name: "Simple Chicken and Rice",
    ingredients: {
      "chicken_breast": { "breasts": 2 },
      "white_rice": { "g": 300 },
      "salt": { "to taste": "" },
      "black_pepper": { "to taste": "" },
    },
  },
];

const NewRecipePage: React.FC = () => {
  const router = useRouter();
  // @ts-ignore
  const params = useParams();
  const recipeId = params?.id as string;

  const recipe = recipes.find((r) => r.id === recipeId);

  const [ingredients, setIngredients] = useState<{[ingredientId: string]: Quantity}>(
    recipe ? { ...recipe.ingredients } : {}
  );

  const handleIngredientChange = (
    ingId: string,
    unit: string,
    value: string
  ) => {
    setIngredients((prevIngs) => {
      const newIngs = { ...prevIngs };
      if (newIngs[ingId]) {
        newIngs[ingId] = { ...newIngs[ingId], [unit]: value };
      } else {
        newIngs[ingId] = { [unit]: value };
      }
      return newIngs;
    });
  };

  const addIngredientRow = () => {
    setIngredients((prevIngs) => ({
      ...prevIngs,
      [`new_ingredient_${Date.now()}`]: { "unit": "" }, // Unique ID for new ingredient
    }));
  };

  const removeIngredientRow = (ingIdToRemove: string) => {
    setIngredients((prevIngs) => {
      const newIngs = { ...prevIngs };
      delete newIngs[ingIdToRemove];
      return newIngs;
    });
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, update the backend here
    console.log({
      id: recipeId,
      name: recipe?.recipe_name,
      ingredients,
    });
    alert("Recipe changes logged to the console! (Check your browser dev tools)");
    router.push("/");
  };

  if (!recipe) {
    return (
      <div className="p-8 text-center text-red-600">Recipe not found.</div>
    );
  }

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <div className="container mx-auto p-4 md:p-8 max-w-2xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Edit Recipe</h1>
          <p className="text-lg text-gray-600 mt-2">{recipe.recipe_name}</p>
        </header>
        <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-xl shadow-md space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-700 border-b pb-2">Ingredients</h2>
            {Object.entries(ingredients).map(([ingId, quantityMap]) => {
              const firstEntry = Object.entries(quantityMap)[0];
              const unit = firstEntry ? firstEntry[0] : ''; // Default to empty string if no unit
              const quantity = firstEntry ? firstEntry[1] : ''; // Default to empty string if no quantity
              return (
                <div key={ingId} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                  <input
                    type="text"
                    value={ingId.replace(/_/g, ' ')}
                    onChange={(e) => {
                      // For simplicity, we are not allowing direct editing of ingId (key) here.
                      // A more robust solution would involve adding a new ingredient and deleting the old one.
                    }}
                    className="md:col-span-4 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Ingredient Name"
                    readOnly // Make it read-only for now as changing key is complex
                  />
                  <input
                    type="text"
                    value={String(quantity)}
                    onChange={(e) => handleIngredientChange(ingId, unit, e.target.value)}
                    className="md:col-span-3 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Qty"
                    required
                  />
                  <input
                    type="text"
                    value={unit}
                    onChange={(e) => handleIngredientChange(ingId, e.target.value, String(quantity))}
                    className="md:col-span-3 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                    placeholder="Unit"
                  />
                  <button
                    type="button"
                    onClick={() => removeIngredientRow(ingId)}
                    className="md:col-span-2 text-red-500 hover:text-red-700 flex justify-center items-center p-2 rounded-md hover:bg-red-100 transition-colors"
                    aria-label="Remove ingredient"
                  >
                    Remove
                  </button>
                </div>
              );
            })}
            <button
              type="button"
              onClick={addIngredientRow}
              className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Ingredient
            </button>
          </div>
          <div className="flex justify-end pt-4 border-t space-x-4">
            <button
              type="button"
              onClick={() => router.push("/")}
              className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all"
            >
              Save Recipe
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default NewRecipePage;
