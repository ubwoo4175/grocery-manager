import React from "react";
import RecipeForm from "@/components/RecipeForm";
import RecipeSidebar from "@/components/RecipeSidebar";
import { newRecipePermissions } from "@/lib/actions/recipe.actions";

const NewRecipePage = async () => {
  const canCreateRecipe = await newRecipePermissions();
  return (
    <div className="flex bg-gray-50 text-gray-800 min-h-screen">
      <RecipeSidebar />
      <main className="flex-1 py-12">
        {canCreateRecipe ? (
          <div className="container mx-auto max-w-8xl">
            <header className="text-center mb-10">
              <h1 className="text-4xl font-bold text-gray-900">New Recipe</h1>
            </header>
            <RecipeForm id={null} />
          </div>
        ) : (
          <article className="companion-limit">
            <div className="cta-badge">Upgrade your plan</div>
            <h1>You’ve Reached Your Limit</h1>
            <p>You’ve reached your companion limit. Upgrade to create more companions and premium features.</p>
            <a href="/subscription" className="btn-primary w-full justify-center">
              Upgrade My Plan
            </a>
          </article>
        )}
      </main>
    </div>
  );
};

export default NewRecipePage;
