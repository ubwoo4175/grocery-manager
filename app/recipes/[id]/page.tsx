"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUserRecipe, upsertRecipe } from "@/lib/actions/recipe.actions";
import { Quantity, Recipe } from "@/lib/types";
import { useUser } from "@clerk/nextjs";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Local client-side representation of an ingredient with a stable ID
interface IngredientDisplayItem {
  id: string; // A unique client-side ID for stable rendering
  name: string;
  quantity: number;
  unit: string;
}

// Zod schema for a single ingredient item
const IngredientSchema = z.object({
  id: z.string(), // Client-side stable ID
  name: z
    .string()
    .min(1, "Ingredient name is required.")
    .transform((name) => name.trim().toLowerCase().replace(/\s+/g, "_")),
  quantity: z.number().min(0, "Quantity must be a positive number.").or(z.literal(0)),
  unit: z.string().min(1, "Unit is required."),
});

// Zod schema for the entire recipe form
const RecipeFormSchema = z.object({
  recipe_name: z.string().min(1, "Recipe name is required."),
  ingredients: z.array(IngredientSchema),
  // .min(1, "At least one ingredient is required.")
  // .superRefine((ingredients, ctx) => {
  //   const uniqueNames = new Set<string>();
  //   ingredients.forEach((ingredient, index) => {
  //     if (uniqueNames.has(ingredient.name)) {
  //       ctx.addIssue({
  //         code: z.ZodIssueCode.custom,
  //         message: "Duplicate ingredient name.",
  //         path: [`ingredients`, index, `name`],
  //       });
  //     } else {
  //       uniqueNames.add(ingredient.name);
  //     }
  //   });
  // }),
  // Temporarily added fields for adding new ingredients (not part of the saved recipe data)
  newIngredientName: z.string().optional(),
  newIngredientQty: z.string().optional(),
  newIngredientUnit: z.string().optional(),
});

type RecipeFormValues = z.infer<typeof RecipeFormSchema>;

// --- ICONS ---
const PlusIcon: React.FC = () => (
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
    className="inline-block h-5 w-5"
  >
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={`h-5 w-5 ${className}`}
  >
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

interface RecipePageProps {
  params: Promise<{ id: string }>;
}

const RecipePage = ({ params }: RecipePageProps) => {
  const { id } = React.use(params);
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();

  const [recipe, setRecipe] = useState<Recipe | null>(null);
  const [loading, setLoading] = useState(true);

  // State to track which field is currently in editing mode
  const [editingCell, setEditingCell] = useState<{ index: number; field: "name" | "quantity" | "unit" } | null>(null);

  // Shadcn Form setup
  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(RecipeFormSchema),
    defaultValues: {
      recipe_name: "",
      ingredients: [],
      newIngredientName: "", // Initialize temporary fields
      newIngredientQty: "",
      newIngredientUnit: "",
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

  // Local states for new ingredient inputs (managed by useState, not react-hook-form directly for new inputs)
  const [newIngredientName, setNewIngredientName] = useState("");
  const [newIngredientQty, setNewIngredientQty] = useState("");
  const [newIngredientUnit, setNewIngredientUnit] = useState("");

  useEffect(() => {
    const fetchRecipe = async () => {
      if (!isUserLoaded) return;

      if (!user) {
        router.push("/sign-in");
        return;
      }

      const fetchedRecipe = await getUserRecipe(id);
      if (!fetchedRecipe) {
        router.push("/recipes");
        return;
      }
      setRecipe(fetchedRecipe);

      const displayIngredients: IngredientDisplayItem[] = Object.entries(fetchedRecipe.ingredients || {}).map(([name, quantity]) => ({
        id: name + "_" + Date.now() + Math.random().toString(36).substring(2, 9),
        name: name,
        quantity: Object.values(quantity as Quantity)[0],
        unit: Object.keys(quantity as Quantity)[0],
      }));

      form.reset({
        recipe_name: fetchedRecipe.recipe_name,
        ingredients: displayIngredients,
        newIngredientName: "",
        newIngredientQty: "",
        newIngredientUnit: "",
      });

      setLoading(false);
    };

    fetchRecipe();
  }, [id, user, isUserLoaded, router, form]);

  const handleAddIngredient = (e: React.FormEvent) => {
    e.preventDefault();
    if (newIngredientName.trim() && newIngredientQty.trim() && newIngredientUnit.trim()) {
      const normalizedName = newIngredientName.trim().toLowerCase().replace(/\s+/g, "_");
      const newQuantity = parseFloat(newIngredientQty) || 0;
      const newUnit = newIngredientUnit.trim().toLowerCase();

      const newItem: IngredientDisplayItem = {
        id: normalizedName + "_" + Date.now() + Math.random().toString(36).substring(2, 9),
        name: normalizedName,
        quantity: newQuantity,
        unit: newUnit,
      };

      append(newItem);
      setNewIngredientName("");
      setNewIngredientQty("");
      setNewIngredientUnit("");

      // Trigger validation for duplicate name after adding (if any)
      form.trigger("ingredients");
    }
  };

  const onSubmit = async (data: RecipeFormValues) => {
    if (!recipe) return;

    // Validate all fields before saving
    const isValid = await form.trigger();
    if (!isValid) {
      console.error("Form validation failed. Please check errors.");
      return;
    }

    const ingredientsForSave: { [ingredientId: string]: Quantity } = {};
    data.ingredients.forEach((i) => {
      ingredientsForSave[i.name] = { [i.unit]: i.quantity };
    });

    const updatedRecipeData = {
      id: recipe.id,
      recipe_name: data.recipe_name,
      ingredients: ingredientsForSave,
    };

    try {
      const result = await upsertRecipe(updatedRecipeData);
      if (result) {
        alert("Recipe saved successfully!");
      } else {
        alert("Failed to save recipe.");
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Error saving recipe. Check console for details.");
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-gray-600">Loading recipe...</div>;
  }

  if (!recipe) {
    return null;
  }

  return (
    <div className="bg-gray-50 text-gray-800 min-h-screen">
      <div className="container mx-auto p-4 md:p-8 max-w-2xl">
        <header className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Edit Recipe</h1>
          <p className="text-lg text-gray-600 mt-2">{recipe.recipe_name}</p>
        </header>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white p-6 md:p-8 rounded-xl shadow-md space-y-6">
            <div className="space-y-4">
              <h2 className="text-lg font-medium text-gray-700 border-b pb-2">Recipe Name</h2>
              <FormField
                control={form.control}
                name="recipe_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Recipe Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Recipe Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <h2 className="text-lg font-medium text-gray-700 border-b pb-2">Ingredients</h2>
              <div className="grid grid-cols-12 gap-2">
                <div className="col-span-4 text-sm font-medium text-gray-600 pl-3">Ingredient</div>
                <div className="col-span-3 text-sm font-medium text-gray-600 pl-3">Quantity</div>
                <div className="col-span-3 text-sm font-medium text-gray-600 pl-3">Unit</div>
                <div className="col-span-2"></div>
              </div>

              {fields.map((ingredient, index) => {
                const isEditingName = editingCell?.index === index && editingCell?.field === "name";
                const isEditingQuantity = editingCell?.index === index && editingCell?.field === "quantity";
                const isEditingUnit = editingCell?.index === index && editingCell?.field === "unit";

                return (
                  <React.Fragment key={ingredient.id}>
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                      {/* Ingredient Name Field */}
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.name`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-4">
                            <FormControl>
                              {isEditingName ? (
                                <Input
                                  {...field}
                                  value={field.value}
                                  onChange={field.onChange}
                                  onBlur={async (e) => {
                                    // Apply normalization on blur
                                    const normalizedValue = e.target.value.trim().toLowerCase().replace(/\s+/g, "_");
                                    field.onChange(normalizedValue);
                                    setEditingCell(null);
                                    await form.trigger(`ingredients.${index}.name`);
                                  }}
                                  onKeyDown={async (e) => {
                                    if (e.key === "Enter") {
                                      // Apply normalization on Enter key
                                      const normalizedValue = e.currentTarget.value.trim().toLowerCase().replace(/\s+/g, "_");
                                      field.onChange(normalizedValue);
                                      setEditingCell(null);
                                      await form.trigger(`ingredients.${index}.name`);
                                    }
                                    if (e.key === "Escape") {
                                      setEditingCell(null);
                                      field.onChange(form.getValues(`ingredients.${index}.name`));
                                    }
                                  }}
                                  autoFocus
                                />
                              ) : (
                                <span
                                  className="block w-full px-3 py-2 text-gray-600 cursor-pointer rounded-md border border-transparent hover:border-gray-300 transition-colors"
                                  onClick={() => setEditingCell({ index, field: "name" })}
                                >
                                  {field.value}
                                </span>
                              )}
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Quantity Field */}
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.quantity`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-3">
                            <FormControl>
                              {isEditingQuantity ? (
                                <Input
                                  {...field}
                                  type="number"
                                  onBlur={async () => {
                                    setEditingCell(null);
                                    await form.trigger(`ingredients.${index}.quantity`);
                                  }}
                                  onKeyDown={async (e) => {
                                    if (e.key === "Enter") {
                                      setEditingCell(null);
                                      await form.trigger(`ingredients.${index}.quantity`);
                                    }
                                    if (e.key === "Escape") {
                                      setEditingCell(null);
                                      field.onChange(form.getValues(`ingredients.${index}.quantity`));
                                    }
                                  }}
                                  autoFocus
                                />
                              ) : (
                                <span
                                  className="block w-full px-3 py-2 text-gray-600 cursor-pointer rounded-md border border-transparent hover:border-gray-300 transition-colors"
                                  onClick={() => setEditingCell({ index, field: "quantity" })}
                                >
                                  {field.value}
                                </span>
                              )}
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* Unit Field */}
                      <FormField
                        control={form.control}
                        name={`ingredients.${index}.unit`}
                        render={({ field }) => (
                          <FormItem className="md:col-span-3">
                            <FormControl>
                              {isEditingUnit ? (
                                <Input
                                  {...field}
                                  type="text"
                                  onBlur={async () => {
                                    setEditingCell(null);
                                    await form.trigger(`ingredients.${index}.unit`);
                                  }}
                                  onKeyDown={async (e) => {
                                    if (e.key === "Enter") {
                                      setEditingCell(null);
                                      await form.trigger(`ingredients.${index}.unit`);
                                    }
                                    if (e.key === "Escape") {
                                      setEditingCell(null);
                                      field.onChange(form.getValues(`ingredients.${index}.unit`));
                                    }
                                  }}
                                  autoFocus
                                />
                              ) : (
                                <span
                                  className="block w-full px-3 py-2 text-gray-600 cursor-pointer rounded-md border border-transparent hover:border-gray-300 transition-colors"
                                  onClick={() => setEditingCell({ index, field: "unit" })}
                                >
                                  {ingredient.unit}
                                </span>
                              )}
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <Button
                        type="button"
                        onClick={() => remove(index)}
                        className="md:col-span-2 flex justify-center items-center p-2 rounded-md hover:bg-red-100 transition-colors"
                        aria-label="Remove ingredient"
                        variant="destructive"
                      >
                        <TrashIcon className="mr-1" /> Remove
                      </Button>
                    </div>
                  </React.Fragment>
                );
              })}

              {/* Add New Item fields */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center mt-4 pt-4 border-t">
                <h3 className="font-semibold text-lg mb-2 col-span-12">Add New Item</h3>
                <Input
                  type="text"
                  value={newIngredientName}
                  onChange={(e) => setNewIngredientName(e.target.value)}
                  placeholder="New Ingredient Name"
                  className="md:col-span-4 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <Input
                  type="number"
                  value={newIngredientQty}
                  onChange={(e) => setNewIngredientQty(e.target.value)}
                  placeholder="Qty"
                  className="md:col-span-3 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <Input
                  type="text"
                  value={newIngredientUnit}
                  onChange={(e) => setNewIngredientUnit(e.target.value)}
                  placeholder="Unit"
                  className="md:col-span-3 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                />
                <Button
                  type="button"
                  onClick={handleAddIngredient}
                  className="md:col-span-2 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <PlusIcon /> Add
                </Button>
              </div>
            </div>
            <div className="flex justify-end pt-4 border-t space-x-4">
              <Button type="button" variant="outline">
                Cancel
              </Button>
              <Button type="submit">Save Recipe</Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default RecipePage;
