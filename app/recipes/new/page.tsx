import React from "react";
import RecipeForm from "@/components/RecipeForm";
import RecipeSidebar from "@/components/RecipeSidebar";
import { newRecipePermissions } from "@/lib/actions/recipe.actions";
import Image from "next/image";

const NewRecipePage = async () => {
  const canCreateRecipe = await newRecipePermissions();
  return (
    <div className="flex bg-gray-50 text-gray-800 min-h-screen">
      <RecipeSidebar />
      <main className="flex-1 py-12 flex items-start justify-center">
        {canCreateRecipe ? (
          <div className="container mx-auto max-w-8xl">
            <header className="text-center mb-10">
              <h1 className="text-4xl font-bold text-gray-900">New Recipe</h1>
            </header>
            <RecipeForm id={null} />
          </div>
        ) : (
          <div className="text-center max-w-8xl p-8 bg-white rounded-lg shadow-lg">
            <Image
              src="/grocery_bag.jpg"
              alt="A friendly chef indicating a limit has been reached"
              width={800}
              height={800}
              className="mx-auto mb-6"
            />
            <div className="cta-badge bg-orange-100 text-orange-600 font-semibold py-1 px-3 rounded-full inline-block mb-4">
              Upgrade Your Plan
            </div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">You’ve Reached Your Recipe Limit!</h1>
            <p className="text-gray-600 mb-6">
              Looks like you're a recipe enthusiast! To add more delicious creations, please upgrade your plan for more
              capacity and premium features.
            </p>
            <a
              href="/subscription"
              className="btn-primary inline-block bg-green-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-700 transition-colors duration-300 w-full justify-center"
            >
              Upgrade My Plan
            </a>
          </div>
        )}
      </main>
    </div>
  );
};

export default NewRecipePage;
