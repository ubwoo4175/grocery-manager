'use server'

import {auth} from "@clerk/nextjs/server";
import { createSupabaseClient } from "@/lib/supabase";
import { CreateRecipe, UpsertFridge } from "@/lib/types";
import { revalidatePath } from "next/cache";

export const createRecipe = async (formData: CreateRecipe) => {
    const { userId: user_id } = await auth();
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from('Recipes')
        .insert({...formData, user_id })
        .select();

    if(error || !data) throw new Error(error?.message || 'Failed to create a companion');

    console.log(data)
    return data[0];
}

export const getUserRecipes = async () => {
    const { userId: user_id } = await auth();
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from('Recipes')
        .select('id, recipe_name, ingredients')
        .eq('user_id', user_id);

    if(error) {
        console.error("Error fetching user recipes:", error);
        return []; // Return an empty array on error
    }

    console.log("Fetched recipes:", data);
    return data;
}

export const upsertFridge = async (formData: UpsertFridge) => {
    const { userId: user_id } = await auth();
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from('Fridge')
        .upsert({...formData, user_id }, { onConflict: 'user_id' })
        .select();

    if(error || !data) throw new Error(error?.message || 'Failed to upsert fridge');

    console.log(data)
    revalidatePath('/');
    return data[0];
}


export const getUserFridge = async () => {
    const { userId: user_id } = await auth();
    const supabase = createSupabaseClient();

    const { data, error } = await supabase
        .from('Fridge')
        .select('id, ingredients')
        .eq('user_id', user_id);

    if(error) {
        console.error("Error fetching user fridge:", error);
        return []; // Return an empty array on error
    }

    console.log("Fetched fridge contents:", data);
    return data;
}

