'use client'

import React, { useState } from 'react';
import { Quantity, CreateRecipe } from '@/lib/types';
import { createRecipe } from '@/lib/actions/recipe.actions';
import {redirect} from "next/navigation";

// --- TYPE DEFINITIONS ---
interface NewIngredientRow {
    tempId: number; // for unique key prop in the UI
    ingredientId: string;
    quantity: string; // Use string to handle empty form inputs
    unit: string;
}

// --- ICONS ---
const PlusIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block h-5 w-5 mr-2">
        <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);

const TrashIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
        <polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line>
    </svg>
);


// --- Main Component ---
const AddNewRecipePage: React.FC = () => {
    const [recipeName, setRecipeName] = useState<string>('');
    const [ingredientsRows, setIngredientsRows] = useState<NewIngredientRow[]>([
        { tempId: 1, ingredientId: '', quantity: '', unit: '' }
    ]);

    const handleIngredientChange = (index: number, field: keyof Omit<NewIngredientRow, 'tempId'>, value: string) => {
        const newIngredientsRows = [...ingredientsRows];
        newIngredientsRows[index] = { ...newIngredientsRows[index], [field]: value };
        setIngredientsRows(newIngredientsRows);
    };

    const addIngredientRow = () => {
        setIngredientsRows([
            ...ingredientsRows,
            { tempId: Date.now(), ingredientId: '', quantity: '', unit: '' } // Use timestamp for unique id
        ]);
    };

    const removeIngredientRow = (tempId: number) => {
        setIngredientsRows(ingredientsRows.filter(ing => ing.tempId !== tempId));
    };

    const handleSubmit = async (event: React.FormEvent) => {
        event.preventDefault();

        const formattedIngredients: { [ingredientId: string]: Quantity } = {};
        ingredientsRows.forEach(row => {
            if (row.ingredientId.trim() && row.quantity.trim() && row.unit.trim()) {
                const normalizedIngredientId = row.ingredientId.trim().toLowerCase().replace(/ /g, '_');
                formattedIngredients[normalizedIngredientId] = {
                    [row.unit.trim().toLowerCase()]: parseFloat(row.quantity) // Keep string if not a valid number
                };
            }
        });
        
        alert('Recipe data logged to the console! (Check your browser dev tools)');

        const newRecipe = await createRecipe({ recipe_name: recipeName, ingredients: formattedIngredients });
        if(newRecipe) {
            alert('Recipe created successfully!');
            // Redirect or clear form as needed
            setRecipeName('');
            setIngredientsRows([{ tempId: 1, ingredientId: '', quantity: '', unit: '' }]);
        } else {
            console.error('Failed to create recipe');
            redirect('/');
        }
    };

    return (
        <div className="bg-gray-50 text-gray-800 min-h-screen">
            <div className="container mx-auto p-4 md:p-8 max-w-2xl">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Add a New Recipe</h1>
                    <p className="text-lg text-gray-600 mt-2">Fill out the details below to add a new recipe to your collection.</p>
                </header>

                <form onSubmit={handleSubmit} className="bg-white p-6 md:p-8 rounded-xl shadow-md space-y-6">
                    {/* Recipe Name Input */}
                    <div>
                        <label htmlFor="recipeName" className="block text-lg font-medium text-gray-700">Recipe Name</label>
                        <input
                            type="text"
                            id="recipeName"
                            value={recipeName}
                            onChange={(e) => setRecipeName(e.target.value)}
                            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="e.g., Classic Lasagna"
                            required
                        />
                    </div>

                    {/* Ingredients Section */}
                    <div className="space-y-4">
                        <h2 className="text-lg font-medium text-gray-700 border-b pb-2">Ingredients</h2>
                        {ingredientsRows.map((ingredientRow, index) => (
                            <div key={ingredientRow.tempId} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                                <input
                                    type="text"
                                    value={ingredientRow.ingredientId}
                                    onChange={(e) => handleIngredientChange(index, 'ingredientId', e.target.value)}
                                    className="md:col-span-4 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Ingredient ID (e.g., ground_beef)"
                                    required
                                />
                                <input
                                    type="text"
                                    value={ingredientRow.quantity}
                                    onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                                    className="md:col-span-2 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Qty (e.g., 500)"
                                    required
                                />
                                <input
                                    type="text"
                                    value={ingredientRow.unit}
                                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                                    className="md:col-span-2 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Unit (e.g., g, whole)"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => removeIngredientRow(ingredientRow.tempId)}
                                    className="md:col-span-1 text-red-500 hover:text-red-700 flex justify-center items-center p-2 rounded-md hover:bg-red-100 transition-colors"
                                    aria-label="Remove ingredient"
                                >
                                    <TrashIcon />
                                </button>
                            </div>
                        ))}
                        <button
                            type="button"
                            onClick={addIngredientRow}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        >
                            <PlusIcon />
                            Add Ingredient
                        </button>
                    </div>

                    {/* Form Actions */}
                    <div className="flex justify-end pt-4 border-t space-x-4">
                         <a href="/" className="bg-gray-200 text-gray-800 font-bold py-2 px-6 rounded-lg hover:bg-gray-300 transition-all">
                            Cancel
                        </a>
                        <button
                            type="submit"
                            className="bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all"
                        >
                            Save Recipe
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddNewRecipePage;
