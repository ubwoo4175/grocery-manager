"use client";

import React, { useState } from "react";
import { useRouter, useParams } from "next/navigation";

// --- TYPE DEFINITIONS (copied from homepage) ---
interface Ingredient {
  id: string;
  quantity: number | string;
  unit: string;
}

interface Recipe {
  id: string;
  name: string;
  ingredients: Ingredient[];
}

// --- Mock database (copied from homepage) ---
const recipes: Recipe[] = [
  {
    id: "recipe-1",
    name: "Spaghetti Bolognese",
    ingredients: [
      { id: "ground_beef", quantity: 500, unit: "g" },
      { id: "onion", quantity: 1, unit: "whole" },
      { id: "garlic_clove", quantity: 3, unit: "cloves" },
      { id: "canned_tomatoes", quantity: 800, unit: "g" },
      { id: "spaghetti_pasta", quantity: 400, unit: "g" },
      { id: "olive_oil", quantity: 2, unit: "tbsp" },
      { id: "oregano", quantity: 1, unit: "tsp" },
    ],
  },
  {
    id: "recipe-2",
    name: "Chicken Stir-Fry",
    ingredients: [
      { id: "chicken_breast", quantity: 2, unit: "breasts" },
      { id: "broccoli_head", quantity: 1, unit: "head" },
      { id: "onion", quantity: 1, unit: "whole" },
      { id: "garlic_clove", quantity: 2, unit: "cloves" },
      { id: "soy_sauce", quantity: 4, unit: "tbsp" },
      { id: "ginger", quantity: 1, unit: "inch piece" },
      { id: "white_rice", quantity: 300, unit: "g" },
      { id: "olive_oil", quantity: 1, unit: "tbsp" },
    ],
  },
  {
    id: "recipe-3",
    name: "Hearty Lentil Soup",
    ingredients: [
      { id: "lentils", quantity: 500, unit: "g" },
      { id: "carrot", quantity: 2, unit: "whole" },
      { id: "celery_stalk", quantity: 2, unit: "stalks" },
      { id: "onion", quantity: 1, unit: "whole" },
      { id: "garlic_clove", quantity: 4, unit: "cloves" },
      { id: "vegetable_broth", quantity: 1500, unit: "ml" },
      { id: "cumin", quantity: 2, unit: "tsp" },
      { id: "olive_oil", quantity: 2, unit: "tbsp" },
    ],
  },
  {
    id: "recipe-4",
    name: "Simple Chicken and Rice",
    ingredients: [
      { id: "chicken_breast", quantity: 2, unit: "breasts" },
      { id: "white_rice", quantity: 300, unit: "g" },
      { id: "salt", quantity: "to taste", unit: "" },
      { id: "black_pepper", quantity: "to taste", unit: "" },
    ],
  },
];

const EditRecipePage: React.FC = () => {
  const router = useRouter();
  // @ts-ignore
  const params = useParams();
  const recipeId = params?.id as string;

  const recipe = recipes.find((r) => r.id === recipeId);

  const [ingredients, setIngredients] = useState<Ingredient[]>(
    recipe ? recipe.ingredients.map((ing) => ({ ...ing })) : []
  );

  const handleIngredientChange = (
    index: number,
    field: keyof Ingredient,
    value: string
  ) => {
    setIngredients((ings) => {
      const newIngs = [...ings];
      newIngs[index] = {
        ...newIngs[index],
        [field]: field === "quantity" ? value : value,
      };
      return newIngs;
    });
  };

  const addIngredientRow = () => {
    setIngredients([
      ...ingredients,
      { id: "", quantity: "", unit: "" },
    ]);
  };

  const removeIngredientRow = (index: number) => {
    setIngredients(ingredients.filter((_, i) => i !== index));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, update the backend here
    console.log({
      id: recipeId,
      name: recipe?.name,
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
          <p className="text-lg text-gray-600 mt-2">{recipe.name}</p>
        </header>
        <form onSubmit={handleSave} className="bg-white p-6 md:p-8 rounded-xl shadow-md space-y-6">
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-700 border-b pb-2">Ingredients</h2>
            {ingredients.map((ingredient, index) => (
              <div key={index} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                <input
                  type="text"
                  value={ingredient.id}
                  onChange={(e) => handleIngredientChange(index, "id", e.target.value)}
                  className="md:col-span-4 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Ingredient ID"
                  required
                />
                <input
                  type="text"
                  value={ingredient.quantity}
                  onChange={(e) => handleIngredientChange(index, "quantity", e.target.value)}
                  className="md:col-span-3 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Qty"
                  required
                />
                <input
                  type="text"
                  value={ingredient.unit}
                  onChange={(e) => handleIngredientChange(index, "unit", e.target.value)}
                  className="md:col-span-3 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Unit"
                />
                <button
                  type="button"
                  onClick={() => removeIngredientRow(index)}
                  className="md:col-span-2 text-red-500 hover:text-red-700 flex justify-center items-center p-2 rounded-md hover:bg-red-100 transition-colors"
                  aria-label="Remove ingredient"
                >
                  Remove
                </button>
              </div>
            ))}
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

export default EditRecipePage;
