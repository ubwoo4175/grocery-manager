"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { getUserRecipes } from "@/lib/actions/recipe.actions";
import { Recipe } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Plus } from "lucide-react";

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
    className="inline-block h-5 w-5 pointer-events-none"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="16"></line>
    <line x1="8" y1="12" x2="16" y2="12"></line>
  </svg>
);

const RecipeSidebar = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedRecipeId, setExpandedRecipeId] = useState<string | null>(null);
  const pathname = usePathname();
  const sidebarRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const fetchRecipes = async () => {
      try {
        const userRecipes = await getUserRecipes();
        const formattedRecipes = userRecipes.map((r: any) => ({
          id: r.id,
          recipe_name: r.recipe_name,
          ingredients: r.ingredients || {},
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

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target as Node)) {
        setExpandedRecipeId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleToggleExpand = (e: React.MouseEvent, recipeId: string) => {
    e.stopPropagation();
    e.preventDefault();
    setExpandedRecipeId((prev) => (prev === recipeId ? null : recipeId));
  };

  if (loading) {
    return (
      <aside className="w-64 p-4 border-r flex-shrink-0">
        <h2 className="text-xl font-semibold mb-4">Recipes</h2>
        <div>Loading recipes...</div>
      </aside>
    );
  }

  return (
    <aside ref={sidebarRef} className="w-64 p-4 border-r bg-gray-100 h-screen sticky top-0 flex-shrink-0">
      <h2 className="text-xl font-semibold mb-4 text-gray-800">Recipes</h2>
      <nav className="space-y-2">
        {recipes.map((recipe) => (
          <div key={recipe.id} className="relative">
            <div className="flex items-center rounded-lg transition-colors">
              <Link
                href={`/recipes/${recipe.id}`}
                className={cn(
                  "flex-grow px-3 py-2 rounded-l-md text-sm font-medium transition-colors",
                  pathname === `/recipes/${recipe.id}`
                    ? "bg-blue-100 text-blue-700"
                    : "text-gray-600 hover:bg-gray-200 hover:text-gray-900"
                )}
              >
                <span className="truncate">{recipe.recipe_name}</span>
              </Link>
              <button
                type="button"
                className={cn(
                  "p-2 rounded-r-md",
                  pathname === `/recipes/${recipe.id}` ? "bg-blue-100 hover:bg-blue-200" : "hover:bg-gray-200"
                )}
                aria-label="Show ingredients"
                onClick={(e) => handleToggleExpand(e, recipe.id)}
              >
                <ExpandIcon />
              </button>
            </div>
            {expandedRecipeId === recipe.id && (
              <div className="absolute z-20 left-full top-0 ml-2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-[220px] max-w-xs">
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
          className="flex items-center px-3 py-2 text-sm font-medium text-green-600 hover:text-green-800"
        >
          <Plus className="h-4 w-4 mr-2" /> Add New Recipe
        </Link>
      </nav>
    </aside>
  );
};

export default RecipeSidebar;
