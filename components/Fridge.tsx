"use client";

import React, { useRef, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { upsertFridge, checkFridgeNameExists } from "@/lib/actions/recipe.actions";
import { Quantity } from "@/lib/types";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { PlusIcon, TrashIcon } from "lucide-react";

// --- ZOD SCHEMA DEFINITIONS ---
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

const FridgeFormSchema = (fridgeId: string | null) =>
  z
    .object({
      fridge_name: z.string().min(1, "Fridge name is required."),
      ingredients: z.array(IngredientSchema),
      newIngredientName: z.string().optional(),
      newIngredientQuantity: z.number().optional(),
      newIngredientUnit: z.string().optional(),
    })
    .superRefine(async (data, ctx) => {
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
      const fridgeNameExists = await checkFridgeNameExists(data.fridge_name, fridgeId);
      if (fridgeNameExists) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "A recipe with this name already exists.",
          path: ["recipe_name"],
        });
      }
    });

const NewIngredientSubSchema = z.object({
  name: z.string().min(1, "Name is required."),
  quantity: z
    .number({ message: "Must be a number." })
    .min(0)
    .refine((val) => /^\d+(\.\d{1,2})?$/.test(String(val)), { message: "Max two decimal places." }),
  unit: z.string().min(1, "Unit is required."),
});

type FridgeFormValues = z.infer<typeof FridgeFormSchema>;

// --- FRIDGE COMPONENT ---

interface FridgeProps {
  initialData: { [ingredientId: string]: Quantity };
  onSave: (newFridgeItems: { [ingredientId: string]: Quantity }) => void;
}

const Fridge: React.FC<FridgeProps> = ({ initialData, onSave }) => {
  const newIngredientNameRef = useRef<HTMLInputElement>(null);

  const form = useForm<FridgeFormValues>({
    resolver: zodResolver(FridgeFormSchema("")),
    defaultValues: {
      ingredients: [],
      newIngredientName: "",
      newIngredientQuantity: undefined,
      newIngredientUnit: "",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    form.reset({
      ingredients: Object.entries(initialData).map(([name, quantityObj]) => ({
        id: name,
        name: name,
        quantity: Object.values(quantityObj)[0],
        unit: Object.keys(quantityObj)[0],
      })),
    });
  }, [initialData, form]);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "ingredients",
  });

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
        id: validationResult.data.name.trim().toLowerCase().replace(/\s+/g, "_") + Date.now(),
        ...validationResult.data,
      });

      form.setValue("newIngredientName", "");
      form.setValue("newIngredientQuantity", undefined);
      form.setValue("newIngredientUnit", "");
      form.clearErrors(["newIngredientName", "newIngredientQuantity", "newIngredientUnit"]);
      newIngredientNameRef.current?.focus();
    } else {
      validationResult.error.issues.forEach((err) => {
        form.setError(`newIngredient${err.path[0].toString().charAt(0).toUpperCase() + err.path[0].toString().slice(1)}` as keyof FridgeFormValues, {
          type: "manual",
          message: err.message,
        });
      });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddIngredient();
    }
  };

  const onSubmit = async (data: FridgeFormValues) => {
    const ingredientsForSave: { [ingredientId: string]: Quantity } = {};
    data.ingredients.forEach((ing) => {
      const normalizedName = ing.name.trim().toLowerCase().replace(/\s+/g, "_");
      ingredientsForSave[normalizedName] = { [ing.unit.trim().toLowerCase()]: ing.quantity };
    });

    try {
      await upsertFridge({ ingredients: ingredientsForSave });
      onSave(ingredientsForSave);
      alert("Fridge saved successfully!");
    } catch (error) {
      console.error("Error saving fridge:", error);
      alert("Failed to save fridge. See console for details.");
    }
  };

  return (
    <div className="container mx-auto max-w-3xl py-12">
      <header className="text-center mb-10">
        <h1 className="text-4xl font-bold text-gray-900">My Fridge</h1>
        <p className="text-lg text-gray-600 mt-2">Manage the ingredients you have on hand.</p>
      </header>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="bg-white p-8 rounded-xl shadow-md space-y-8">
          <div>
            <h2 className="text-lg font-medium text-gray-700 mb-4">Ingredients</h2>
            <div className="space-y-4">
              {fields.map((field, index) => (
                <div key={field.id} className="grid grid-cols-12 gap-2 items-start">
                  <FormField
                    control={form.control}
                    name={`ingredients.${index}.name`}
                    render={({ field: formField }) => (
                      <FormItem className="col-span-5">
                        <FormControl>
                          <Input
                            placeholder="Ingredient Name"
                            {...formField}
                            onBlur={(e) => {
                              const normalizedValue = e.target.value.trim().toLowerCase().replace(/\s+/g, "_");
                              form.setValue(`ingredients.${index}.name`, normalizedValue);
                              formField.onBlur();
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
                            step="0.01"
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
                        step="0.01"
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

          <div className="flex justify-end pt-6 border-t space-x-4">
            <Button type="button" variant="outline" onClick={() => window.location.reload()}>
              Reload
            </Button>
            <Button type="submit" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? "Saving..." : "Save Fridge"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default Fridge;
