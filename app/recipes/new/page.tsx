'use client'

import React, { useState } from 'react';

// --- TYPE DEFINITIONS ---
interface NewIngredient {
    id: number; // for unique key prop
    name: string;
    quantity: string; // Use string to handle empty form inputs
    unit: string;
    type: 'consumable' | 'reusable';
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
    const [ingredients, setIngredients] = useState<NewIngredient[]>([
        { id: 1, name: '', quantity: '', unit: '', type: 'consumable' }
    ]);

    const handleIngredientChange = (index: number, field: keyof Omit<NewIngredient, 'id'>, value: string) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = { ...newIngredients[index], [field]: value };
        setIngredients(newIngredients);
    };

    const addIngredientRow = () => {
        setIngredients([
            ...ingredients,
            { id: Date.now(), name: '', quantity: '', unit: '', type: 'consumable' } // Use timestamp for unique id
        ]);
    };

    const removeIngredientRow = (id: number) => {
        setIngredients(ingredients.filter(ing => ing.id !== id));
    };

    const handleSubmit = (event: React.FormEvent) => {
        event.preventDefault();
        // In a real app, you would send this data to your backend/Supabase.
        // For now, we just log it to the console.
        console.log({
            recipeName,
            ingredients
        });
        alert('Recipe data logged to the console! (Check your browser dev tools)');
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
                        {ingredients.map((ingredient, index) => (
                            <div key={ingredient.id} className="grid grid-cols-1 md:grid-cols-12 gap-2 items-center">
                                <input
                                    type="text"
                                    value={ingredient.name}
                                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                                    className="md:col-span-4 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Ingredient Name"
                                    required
                                />
                                <input
                                    type="text" // text to allow for fractions e.g. "0.5"
                                    value={ingredient.quantity}
                                    onChange={(e) => handleIngredientChange(index, 'quantity', e.target.value)}
                                    className="md:col-span-2 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Qty"
                                    required
                                />
                                <input
                                    type="text"
                                    value={ingredient.unit}
                                    onChange={(e) => handleIngredientChange(index, 'unit', e.target.value)}
                                    className="md:col-span-2 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                    placeholder="Unit"
                                />
                                <select
                                    value={ingredient.type}
                                    onChange={(e) => handleIngredientChange(index, 'type', e.target.value)}
                                    className="md:col-span-3 mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                                >
                                    <option value="consumable">Consumable</option>
                                    <option value="reusable">Reusable</option>
                                </select>
                                <button
                                    type="button"
                                    onClick={() => removeIngredientRow(ingredient.id)}
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
