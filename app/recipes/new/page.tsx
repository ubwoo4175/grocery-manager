"use client";

import React from "react";
import RecipeForm from "@/components/RecipeForm";
import RecipeSidebar from "@/components/RecipeSidebar";

const NewRecipePage = () => {
  return (
    <div className="flex bg-gray-50 text-gray-800 min-h-screen">
      <RecipeSidebar />
      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-3xl">
          <header className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900">Add New Recipe</h1>
          </header>
          <RecipeForm id={null} />
        </div>
      </main>
    </div>
  );
};

export default NewRecipePage;
