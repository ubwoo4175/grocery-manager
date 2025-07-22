"use client";

import React, { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getUserRecipe, upsertRecipe, checkRecipeNameExists } from "@/lib/actions/recipe.actions";
import { Quantity, Recipe } from "@/lib/types";
import { useUser } from "@clerk/nextjs";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon } from "lucide-react";
import RecipeSidebar from "@/components/RecipeSidebar";

// Zod schema for a single ingredient
const IngredientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Ingredient name cannot be empty."),
  quantity: z
    .number({ message: "Quantity must be a number." })
    .min(0, "Quantity must be non-negative.")
    .refine((val) => /^\d+(\.\d{1})?$/.test(String(val)), {
      message: "Max one decimal place.",
    }),
  unit: z.string().min(1, "Unit cannot be empty."),
});

// Base schema for the main form's structure and types
const RecipeFormSchema = z.object({
  recipe_name: z.string().min(1, "Recipe name is required."),
  ingredients: z.array(IngredientSchema).min(1, "Ingredient is required."),
  newIngredientName: z.string().optional(),
  newIngredientQuantity: z.number().optional(),
  newIngredientUnit: z.string().optional(),
});

// Separate schema for validating just the new ingredient fields
const NewIngredientSubSchema = z.object({
  name: z.string().min(1, "Name is required."),
  quantity: z
    .number({ message: "Must be a number." })
    .min(0)
    .refine((val) => /^\d+(\.\d{1})?$/.test(String(val)), { message: "Max one decimal." }),
  unit: z.string().min(1, "Unit is required."),
});

// Zod schema with async validation for submission
const createRecipeFormSchemaForSubmit = (recipeId: string | null) =>
  RecipeFormSchema.superRefine(async (data, ctx) => {
    const ingredientNames = new Set<string>();
    data.ingredients.forEach((ingredient, index) => {
      const normalizedName = ingredient.name.trim().toLowerCase();
      if (ingredientNames.has(normalizedName)) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "Ingredient names must be unique.",
          path: [`ingredients`, index, `name`],
        });
      }
      ingredientNames.add(normalizedName);
    });

    const recipeNameExists = await checkRecipeNameExists(data.recipe_name, recipeId);
    if (recipeNameExists) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "A recipe with this name already exists.",
        path: ["recipe_name"],
      });
    }
  });

type RecipeFormValues = z.infer<typeof RecipeFormSchema>;

const RecipePage = ({ params }: { params: Promise<{ id: string }> }) => {
  const { id } = use(params);
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const newIngredientNameRef = useRef<HTMLInputElement>(null);
  const [loading, setLoading] = useState(true);

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(createRecipeFormSchemaForSubmit(id)),
    defaultValues: {
      recipe_name: "",
      ingredients: [],
      newIngredientName: "",
      newIngredientQuantity: undefined,
      newIngredientUnit: "",
    },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

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

        const displayIngredients = Object.entries(fetchedRecipe.ingredients || {}).map(([name, quantityObj]) => ({
          id: name + Date.now() + Math.random(),
          name: name,
          quantity: Object.values(quantityObj as Record<string, number>)[0],
          unit: Object.keys(quantityObj as Record<string, number>)[0],
        }));

        form.reset({
          recipe_name: fetchedRecipe.recipe_name,
          ingredients: displayIngredients,
        });
      } catch (error) {
        console.error("Failed to fetch recipe:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecipe();
  }, [id, user, isUserLoaded, router, form]);

  const handleAddIngredient = () => {
    const newIngData = {
      name: form.getValues("newIngredientName") || "",
      quantity: form.getValues("newIngredientQuantity"),
      unit: form.getValues("newIngredientUnit") || "",
    };

    const validationResult = NewIngredientSubSchema.safeParse(newIngData);

    if (validationResult.success) {
      const existingNames = new Set(form.getValues("ingredients").map((i) => i.name.trim().toLowerCase()));
      if (existingNames.has(validationResult.data.name.trim().toLowerCase())) {
        form.setError("newIngredientName", { type: "manual", message: "Ingredient must be unique." });
        return;
      }

      append({
        id: validationResult.data.name + Date.now() + Math.random(),
        ...validationResult.data,
      });
      form.setValue("newIngredientName", "");
      form.setValue("newIngredientQuantity", undefined);
      form.setValue("newIngredientUnit", "");
      form.clearErrors(["newIngredientName", "newIngredientQuantity", "newIngredientUnit"]);
      setTimeout(() => {
        newIngredientNameRef.current?.focus();
      }, 0);
    } else {
      validationResult.error.issues.forEach((err) => {
        form.setError(`newIngredient${err.path[0].toString().charAt(0).toUpperCase() + err.path[0].toString().slice(1)}` as keyof RecipeFormValues, {
          type: "manual",
          message: err.message,
        });
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent the default form submission
      handleAddIngredient();
    }
  };

  const onSubmit = async (data: RecipeFormValues) => {
    if (!recipe) return; // This is an editing page, there is always an original recipe.

    const ingredientsForSave: { [ingredientId: string]: Quantity } = {};
    data.ingredients.forEach((ing) => {
      const normalizedName = ing.name.trim().toLowerCase().replace(/\s+/g, "_");
      ingredientsForSave[normalizedName] = { [ing.unit.trim().toLowerCase()]: ing.quantity };
    });

    const updatedRecipeData = {
      id: recipe.id,
      recipe_name: data.recipe_name.trim(),
      ingredients: ingredientsForSave,
    };

    try {
      await upsertRecipe(updatedRecipeData);
      alert("Recipe saved successfully!");
      router.refresh();
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Failed to save recipe. See console for details.");
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
            <h1 className="text-4xl font-bold text-gray-900">Edit Recipe</h1>
          </header>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-md space-y-8">
              {/* 1. Editable Recipe Name Field */}
              <FormField
                control={form.control}
                name="recipe_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-lg font-medium">Recipe Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Classic Lasagna" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div>
                <h2 className="text-lg font-medium text-gray-700 mb-4">Ingredients</h2>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="col-span-5">
                            <FormControl>
                              {/* 2. Ingredient Name Normalization on Blur */}
                              <Input
                                placeholder="Ingredient Name"
                                {...field}
                                onBlur={(e) => {
                                  const normalizedValue = e.target.value.trim().toLowerCase().replace(/\s+/g, "_");
                                  form.setValue(`ingredients.${index}.name`, normalizedValue);
                                  field.onBlur(); // Important to trigger validation
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="col-span-3">
                            <FormControl>
                              <Input
                                type="number"
                                step="0.1"
                                placeholder="Qty"
                                {...field}
                                onChange={(e) => field.onChange(e.target.value === "" ? "" : parseFloat(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.unit`}
                        render={({ field }) => (
                          <FormItem className="col-span-3">
                            <FormControl>
                              <Input placeholder="Unit" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="col-span-1 flex items-center h-10">
                        <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)}>
                          <TrashIcon className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Ingredient Section */}
              <div className="pt-6 border-t">
                <h3 className="text-lg font-medium text-gray-700 mb-4">Add Ingredient</h3>
                <div className="grid grid-cols-12 gap-2 items-start">
                  <FormField
                    control={form.control}
                    name="newIngredientName"
                    render={({ field }) => (
                      <FormItem className="col-span-5">
                        <FormControl>
                          <Input {...field} placeholder="New Ingredient Name" onKeyDown={handleKeyDown} ref={newIngredientNameRef} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newIngredientQuantity"
                    render={({ field }) => (
                      <FormItem className="col-span-3">
                        <FormControl>
                          <Input
                            type="number"
                            step="0.1"
                            placeholder="Qty"
                            value={field.value ?? ""}
                            onChange={(e) => field.onChange(e.target.value === "" ? undefined : parseFloat(e.target.value))}
                            onKeyDown={handleKeyDown}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="newIngredientUnit"
                    render={({ field }) => (
                      <FormItem className="col-span-3">
                        <FormControl>
                          <Input placeholder="Unit" {...field} onKeyDown={handleKeyDown} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="col-span-1 flex items-center h-10">
                    <Button type="button" onClick={handleAddIngredient} size="icon">
                      <PlusIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-6 border-t space-x-4">
                <Button type="button" variant="outline" onClick={() => window.location.reload()}>
                  Reload
                </Button>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? "Saving..." : "Save Recipe"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </main>
    </div>
  );
};

export default RecipePage;
