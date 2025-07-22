"use server";

import { auth } from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import { UpsertRecipe, UpsertFridge } from "@/lib/types";
import { revalidatePath } from "next/cache";

// ... (keep your existing functions: upsertRecipe, getUserRecipes, etc.)

export const upsertRecipe = async (formData: UpsertRecipe & { id?: string }) => {
  const { userId: user_id } = await auth();
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("Recipes")
    .upsert({ ...formData, user_id }, { onConflict: "id" })
    .select();

  if (error || !data) throw new Error(error?.message || "Failed to upsert recipe");

  console.log(data);
  revalidatePath("/recipes"); // Revalidate the recipes page
  return data[0];
};

export const getUserRecipes = async () => {
  const { userId: user_id } = await auth();
  const supabase = createSupabaseClient();

  const { data, error } = await supabase.from("Recipes").select("id, recipe_name, ingredients").eq("user_id", user_id);

  if (error) {
    console.error("Error fetching user recipes:", error);
    return []; // Return an empty array on error
  }

  console.log("Fetched recipes:", data);
  return data;
};

export const getUserRecipe = async (id: string) => {
  const { userId: user_id } = await auth();
  const supabase = createSupabaseClient();

  const { data, error } = await supabase.from("Recipes").select("id, recipe_name, ingredients").eq("user_id", user_id).eq("id", id);

  if (error) {
    console.error("Error fetching user recipes:", error);
    return null; // Return null on error
  }

  console.log("Fetched recipe:", data);
  return data[0] || null; // Return the first item or null if data is empty
};

export const getUserFridge = async () => {
  const { userId: user_id } = await auth();
  const supabase = createSupabaseClient();

  const { data, error } = await supabase.from("Fridge").select("id, ingredients").eq("user_id", user_id);

  if (error) {
    console.error("Error fetching user fridge:", error);
    return []; // Return an empty array on error
  }

  console.log("Fetched fridge contents:", data);
  return data;
};

export const upsertFridge = async (formData: UpsertFridge) => {
  const { userId: user_id } = await auth();
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("Fridge")
    .upsert({ ...formData, user_id }, { onConflict: "user_id" })
    .select();

  if (error || !data) throw new Error(error?.message || "Failed to upsert fridge");

  console.log(data);
  revalidatePath("/");
  return data[0];
};

export const checkRecipeNameExists = async (recipeName: string, recipeIdToExclude: string | null): Promise<boolean> => {
  const { userId: user_id } = await auth();
  if (!user_id) {
    throw new Error("User not authenticated.");
  }
  const supabase = createSupabaseClient();

  let query = supabase.from("Recipes").select("id").eq("user_id", user_id).ilike("recipe_name", recipeName.trim());

  if (recipeIdToExclude) {
    query = query.neq("id", recipeIdToExclude);
  }

  const { data, error } = await query.limit(1);

  if (error) {
    console.error("Error checking for recipe name:", error);
    // Decide how to handle the error, maybe return true to be safe
    return true;
  }

  return data.length > 0;
};
