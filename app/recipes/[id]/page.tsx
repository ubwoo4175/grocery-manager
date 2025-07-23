"use client";

import React, { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserRecipe } from "@/lib/actions/recipe.actions";
import { Recipe } from "@/lib/types";
import { useUser } from "@clerk/nextjs";
import RecipeForm from "@/components/RecipeForm";
import RecipeSidebar from "@/components/RecipeSidebar";

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

  if (loading) {
    return <div className="p-8 text-center text-lg">Loading recipe...</div>;
  }

  return (
    <div className="flex bg-gray-50 text-gray-800 min-h-screen">
      <RecipeSidebar />
      <main className="flex-1 py-12">
        <div className="container mx-auto max-w-3xl">
          <header className="text-center mb-10">
            <h1 className="text-4xl font-bold text-gray-900">Edit Recipe</h1>
          </header>
          <RecipeForm recipe={recipe} id={id} />
        </div>
      </main>
    </div>
  );
};

export default EditRecipePage;
