"use client";

import React, { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Quantity, Recipe } from "@/lib/types";
import { upsertRecipe, getOtherRecipeNames } from "@/lib/actions/recipe.actions";
import { callRecipeExtractApi } from "@/lib/actions/callRecipeExtractApi";
import { useUser } from "@clerk/nextjs";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon } from "lucide-react";
import { Textarea } from "@/components/ui/textarea"; // Assuming you have a Textarea component, otherwise use a standard <textarea>

const IngredientSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Ingredient name cannot be empty."),
  quantity: z
    .number({ message: "Quantity must be a number." })
    .gt(0, "Quantity must be greater than 0.")
    .refine((val) => (val * 10) % 1 === 0, {
      message: "Max one decimal place.",
    }),
  unit: z.string().min(1, "Unit cannot be empty."),
});

const createRecipeFormSchema = (otherRecipeNames: string[]) =>
  z
    .object({
      recipe_name: z.string().min(1, "Recipe name is required."),
      ingredients: z.array(IngredientSchema).min(1, "Ingredient is required."),
      newIngredientName: z.string().optional(),
      newIngredientQuantity: z
        .number({ message: "Quantity must be a number." })
        .gt(0, "Quantity must be greater than 0.")
        .refine((val) => (val * 10) % 1 === 0, {
          message: "Max one decimal place.",
        })
        .optional(),
      newIngredientUnit: z.string().optional(),
    })
    .refine(
      (data) => {
        if (!data.newIngredientName || data.newIngredientName.trim() === "") {
          return true;
        }
        const existingNames = new Set(data.ingredients.map((i) => i.name.trim().toLowerCase()));
        return !existingNames.has(data.newIngredientName.trim().toLowerCase());
      },
      {
        message: "Ingredient must be unique.",
        path: ["newIngredientName"],
      }
    )
    .refine(
      (data) => {
        const lowerCaseRecipeNames = otherRecipeNames.map((name) => name.toLowerCase());
        return !lowerCaseRecipeNames.includes(data.recipe_name.toLowerCase());
      },
      {
        message: "A recipe with this name already exists.",
        path: ["recipe_name"],
      }
    )
    .superRefine((data, ctx) => {
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
    });

type RecipeFormValues = z.infer<ReturnType<typeof createRecipeFormSchema>>;

interface RecipeFormProps {
  recipe?: Recipe | null;
  id: string | null;
}

const RecipeForm: React.FC<RecipeFormProps> = ({ recipe, id }) => {
  const { user, isLoaded: isUserLoaded } = useUser();
  const router = useRouter();
  const newIngredientNameRef = useRef<HTMLInputElement>(null);
  const [otherRecipeNames, setOtherRecipeNames] = useState<string[]>([]);
  const [aiInputText, setAiInputText] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const fetchOtherNames = async () => {
      const names = await getOtherRecipeNames(id);
      setOtherRecipeNames(names);
    };
    fetchOtherNames();
  }, [id]);

  const form = useForm<RecipeFormValues>({
    resolver: zodResolver(createRecipeFormSchema(otherRecipeNames)),
    defaultValues: {
      recipe_name: recipe?.recipe_name || "",
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
    if (recipe) {
      const displayIngredients = Object.entries(recipe.ingredients || {}).map(([name, quantityObj]) => ({
        id: name + Date.now() + Math.random(),
        name: name,
        quantity: Object.values(quantityObj as Record<string, number>)[0],
        unit: Object.keys(quantityObj as Record<string, number>)[0],
      }));

      form.reset({
        recipe_name: recipe.recipe_name,
        ingredients: displayIngredients,
      });
    }
  }, [recipe, form]);

  if (isUserLoaded && !user) {
    router.push("/sign-in");
  }

  const handleAddIngredient = () => {
    const name = form.getValues("newIngredientName");
    const quantity = form.getValues("newIngredientQuantity");
    const unit = form.getValues("newIngredientUnit");

    if (!name || !quantity || !unit) {
      if (!name) form.setError("newIngredientName", { type: "manual", message: "Name is required." });
      if (!quantity) form.setError("newIngredientQuantity", { type: "manual", message: "Must be a number." });
      if (!unit) form.setError("newIngredientUnit", { type: "manual", message: "Unit is required." });
      return;
    }

    append({
      id: name + Date.now() + Math.random(),
      name,
      quantity,
      unit,
    });

    form.setValue("newIngredientName", "");
    form.setValue("newIngredientQuantity", undefined);
    form.setValue("newIngredientUnit", "");
    form.clearErrors(["newIngredientName", "newIngredientQuantity", "newIngredientUnit"]);
    setTimeout(() => {
      newIngredientNameRef.current?.focus();
    }, 0);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault(); // Prevent the default form submission
      handleAddIngredient();
    }
  };

  const onSubmit = async (data: RecipeFormValues) => {
    if (Object.keys(data.ingredients).length === 0) {
      console.log("No ingredients!");
      return;
    }

    const ingredientsForSave: { [ingredientId: string]: Quantity } = {};
    data.ingredients.forEach((ing) => {
      const normalizedName = ing.name.trim().toLowerCase().replace(/\s+/g, "");
      ingredientsForSave[normalizedName] = { [ing.unit.trim().toLowerCase()]: ing.quantity };
    });

    const updatedRecipeData = {
      id: recipe?.id,
      recipe_name: data.recipe_name.trim(),
      ingredients: ingredientsForSave,
    };

    try {
      await upsertRecipe(updatedRecipeData);
      alert("Recipe saved successfully!");
      if (id) {
        router.refresh();
      } else {
        window.location.reload();
      }
    } catch (error) {
      console.error("Error saving recipe:", error);
      alert("Failed to save recipe. See console for details.");
    }
  };
  
  // --- AI Assistant Functions ---
  const handleGenerateRecipe = async () => {
    setIsGenerating(true);
    try {
        const aiData = await callRecipeExtractApi(aiInputText);
        
        form.setValue("recipe_name", aiData.recipe_name);
        remove(); // Clear existing ingredients
        aiData.ingredients.forEach(ing => {
            append({
                id: ing.name + Date.now() + Math.random(),
                name: ing.name,
                quantity: ing.quantity,
                unit: ing.unit,
            });
        });

    } catch (error) {
        console.error("Error generating recipe with AI:", error);
        if (error instanceof Error) {
            alert(`Failed to generate recipe: ${error.message}`);
        } else {
            alert("An unknown error occurred while generating the recipe.");
        }
    } finally {
        setIsGenerating(false);
    }
  };


  return (
    <div className="grid lg:grid-cols-2 gap-12">
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
                              const normalizedValue = e.target.value.trim().toLowerCase().replace(/\s+/g, "");
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
      
      {/* AI Assistant Section */}
      <div className="bg-white p-8 rounded-xl shadow-md space-y-4">
        <h2 className="text-lg font-medium">✨ AI Recipe Assistant</h2>
        <p className="text-sm text-gray-600">
          Paste a recipe from a website, text, or anywhere else, and the AI will automatically fill out the form for you.
          (레시피를 웹사이트, 텍스트 등 어디에서든 붙여넣기하면 AI가 자동으로 양식을 작성해줍니다.)
        </p>
        <Textarea
          placeholder="Paste your recipe here... (여기에 레시피를 붙여넣으세요...)"
          className="min-h-[200px]"
          value={aiInputText}
          onChange={(e) => setAiInputText(e.target.value)}
        />
        <Button onClick={handleGenerateRecipe} disabled={isGenerating || !aiInputText}>
          {isGenerating ? "Generating..." : "Generate Recipe"}
        </Button>
      </div>
    </div>
  );
};

export default RecipeForm;