"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserRecipe, deleteUserRecipe } from "@/lib/actions/recipe.actions";
import { Recipe } from "@/lib/types";
import { useUser } from "@clerk/nextjs";
import RecipeForm from "@/components/RecipeForm";
import RecipeSidebar from "@/components/RecipeSidebar";
import { Button } from "@/components/ui/button";

const EditRecipePage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!isUserLoaded) return;
      if (!user) {
        router.push("/sign-in");
        return;
      }

      try {
        const fetchedRecipe = await getUserRecipe(id);
        if (!fetchedRecipe) {
          router.push("/recipes");
          return;
        }
        setRecipe(fetchedRecipe);
      } catch (error) {
        console.error("Failed to fetch recipe:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, user, isUserLoaded, router]);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this recipe?")) {
      try {
        await deleteUserRecipe(id);
        alert("Recipe deleted successfully!");
        router.push("/recipes");
      } catch (error) {
        console.error("Error deleting recipe:", error);
        alert("Failed to delete recipe. See console for details.");
      }
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-lg">Loading recipe...</div>;
  }

  return (
    <div className="flex bg-gray-50 text-gray-800 min-h-screen">
      <RecipeSidebar />
      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-3xl">
          <header className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900">{recipe?.recipe_name}</h1>
            <div className="flex justify-end mb-4">
              <Button variant="destructive" onClick={handleDelete}>
                Delete Recipe
              </Button>
            </div>
          </header>
          <RecipeForm recipe={recipe} id={id} />
        </div>
      </main>
    </div>
  );
};

export default EditRecipePage;
