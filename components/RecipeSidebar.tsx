'use client'

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUserRecipes } from "@/lib/actions/recipe.actions";
import { Recipe } from "@/lib/types";
import { cn } from "@/lib/utils";

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

const RecipeSidebar = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIngredients, setShowIngredients] = useState(false);

  const pathname = usePathname();

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const userRecipes = await getUserRecipes();
        // The action returns an array of objects with id and recipe_name
        const formattedRecipes = userRecipes.map((r: any) => ({
          id: r.id,
          recipe_name: r.recipe_name,
          ingredients: r.ingredients || {}, // Ensure ingredients is not undefined
        }));
        setRecipes(formattedRecipes);
      } catch (error) {
        console.error("Failed to fetch recipes for sidebar:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipes();
  }, []);

  if (loading) {
    return (
      <aside className="w-64 p-4 border-r">
        <h2 className="text-xl font-semibold mb-4">Recipes</h2>
        <div>Loading recipes...</div>
      </aside>
    );
  }

  return (
    <aside className="w-64 p-4 border-r bg-gray-50 h-full">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Recipes</h2>
      <nav className="space-y-2">
        {recipes.map((recipe) => (
          <div className="relative flex items-center p-1 border rounded-lg transition-all">
            <Link
                key={recipe.id}
                href={`/recipes/${recipe.id}`}
                className={cn(
                "block px-3 py-2 rounded-md text-sm font-medium transition-colors",
                pathname === `/recipes/${recipe.id}`
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                )}
            >
                {recipe.recipe_name}
            </Link>
            <button
                id={`expand-btn-${recipe.id}`}
                type="button"
                className="flex-end ml-2 p-1 rounded hover:bg-gray-200"
                aria-label="Show ingredients"
                onClick={() => setShowIngredients((v) => !v)}
            >
                <ExpandIcon />
            </button>
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
          
        ))}
         <Link
            href="/recipes/new"
            className="block px-3 py-2 text-sm font-medium text-green-600 hover:text-green-800"
          >
            + Add New Recipe
          </Link>
      </nav>
    </aside>
  );
};

export default RecipeSidebar;