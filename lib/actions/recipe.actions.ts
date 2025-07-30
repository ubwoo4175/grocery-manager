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
export const upsertFridge = async (formData: UpsertFridge & { id?: string }) => {
  const { userId: user_id } = await auth();
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("Fridges")
    .upsert({ ...formData, user_id }, { onConflict: "id" })
    .select();

  if (error || !data) throw new Error(error?.message || "Failed to upsert fridge");

  console.log(data);
  revalidatePath("/fridges"); // Revalidate the recipes page
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
export const getUserFridges = async () => {
  const { userId: user_id } = await auth();
  const supabase = createSupabaseClient();

  const { data, error } = await supabase.from("Fridges").select("id, fridge_name, ingredients").eq("user_id", user_id);

  if (error) {
    console.error("Error fetching user fridges:", error);
    return []; // Return an empty array on error
  }

  console.log("Fetched fridges:", data);
  return data;
};

export const getUserRecipe = async (id: string) => {
  const { userId: user_id } = await auth();
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("Recipes")
    .select("id, recipe_name, ingredients")
    .eq("user_id", user_id)
    .eq("id", id);

  if (error) {
    console.error("Error fetching user recipes:", error);
    return null; // Return null on error
  }

  console.log("Fetched recipe:", data);
  return data[0] || null; // Return the first item or null if data is empty
};
export const getUserFridge = async (id: string) => {
  const { userId: user_id } = await auth();
  const supabase = createSupabaseClient();

  const { data, error } = await supabase
    .from("Fridges")
    .select("id, fridge_name, ingredients")
    .eq("user_id", user_id)
    .eq("id", id);

  if (error) {
    console.error("Error fetching user fridge:", error);
    return null; // Return an empty array on error
  }

  console.log("Fetched fridge contents:", data);
  return data[0] || null;
};

export const deleteUserRecipe = async (id: string) => {
  const { userId: user_id } = await auth();
  const supabase = createSupabaseClient();

  const { error } = await supabase.from("Recipes").delete().eq("user_id", user_id).eq("id", id);

  if (error) {
    console.error("Error deleting user recipe:", error);
    throw new Error(error.message || "Failed to delete recipe");
  }

  revalidatePath("/recipes");
};
export const deleteUserFridge = async (id: string) => {
  const { userId: user_id } = await auth();
  const supabase = createSupabaseClient();

  const { error } = await supabase.from("Fridges").delete().eq("user_id", user_id).eq("id", id);

  if (error) {
    console.error("Error deleting user fridge:", error);
    throw new Error(error.message || "Failed to delete fridge");
  }

  revalidatePath("/fridges");
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

export const getOtherRecipeNames = async (recipeIdToExclude: string | null): Promise<string[]> => {
  const { userId: user_id } = await auth();
  if (!user_id) {
    throw new Error("User not authenticated.");
  }
  const supabase = createSupabaseClient();
  let query = supabase.from("Recipes").select("recipe_name").eq("user_id", user_id);
  if (recipeIdToExclude) query = query.neq("id", recipeIdToExclude);
  const { data, error } = await query;
  if (error) {
    console.error("Error fetching recipe names:", error);
    return [];
  }
  return data.map((item) => item.recipe_name);
};

export const getOtherFridgeNames = async (recipeIdToExclude: string | null): Promise<string[]> => {
  const { userId: user_id } = await auth();
  if (!user_id) {
    throw new Error("User not authenticated.");
  }
  const supabase = createSupabaseClient();
  let query = supabase.from("Fridges").select("fridge_name").eq("user_id", user_id);
  if (recipeIdToExclude) query = query.neq("id", recipeIdToExclude);
  const { data, error } = await query;
  if (error) {
    console.error("Error fetching fridge names:", error);
    return [];
  }
  return data.map((item) => item.fridge_name);
};

export const newRecipePermissions = async () => {
  const { userId: user_id, has } = await auth();
  const supabase = createSupabaseClient();

  let limit = 0;

  if (has({ feature: "unlimited_recipes" })) {
    return true;
  } else if (has({ feature: "200_recipes" })) {
    limit = 200;
  } else if (has({ feature: "30_recipes" })) {
    limit = 30;
  }

  const { data, error } = await supabase.from("Recipes").select("id", { count: "exact" }).eq("user_id", user_id);

  if (error) throw new Error(error.message);

  if (data?.length >= limit) {
    return false;
  } else {
    return true;
  }
};

export const newFridgePermissions = async () => {
  const { userId: user_id, has } = await auth();
  const supabase = createSupabaseClient();

  let limit = 0;

  if (has({ feature: "unlimited_fridges" })) {
    return true;
  } else if (has({ feature: "5_fridges" })) {
    limit = 5;
  } else if (has({ feature: "1_fridge" })) {
    limit = 1;
  }

  const { data, error } = await supabase.from("Fridges").select("id", { count: "exact" }).eq("user_id", user_id);

  if (error) throw new Error(error.message);

  if (data?.length >= limit) {
    return false;
  } else {
    return true;
  }
};

const newAICallPermission = async () => {
  const { userId: user_id, has } = await auth();
  const supabase = createSupabaseClient();

  let limit = 0;

  if (has({ feature: "unlimited_fridges" })) {
    return true;
  } else if (has({ feature: "5_fridges" })) {
    limit = 5;
  } else if (has({ feature: "1_fridge" })) {
    limit = 1;
  }

  const { data, error } = await supabase.from("Fridges").select("id", { count: "exact" }).eq("user_id", user_id);

  if (error) throw new Error(error.message);

  if (data?.length >= limit) {
    return false;
  } else {
    return true;
  }
};
