'use client'

import React, { useState } from 'react';
import Fridge from './components/Fridge';

// --- TYPE DEFINITIONS ---
interface IngredientInfo {
    name: string;
    type: 'consumable' | 'reusable';
}

interface Ingredient {
    id: string;
    quantity: number | string;
    unit: string;
}

interface Recipe {
    id: string;
    name: string;
    ingredients: Ingredient[];
}

interface ShoppingListItem {
    name: string;
    amountStr: string;
}

interface ShoppingListType {
    consumables: ShoppingListItem[];
    reusables: ShoppingListItem[];
}

interface AggregatedIngredient {
    [unit: string]: number | string;
}

interface AggregatedIngredients {
    [ingredientId: string]: AggregatedIngredient;
}


// --- DATABASE (Embedded for prototype) ---
// This data now conforms to the types defined above.
const database: {
    ingredients_info: { [key: string]: IngredientInfo };
    recipes: Recipe[];
} = {
  "ingredients_info": {
    "ground_beef": { "name": "Ground Beef", "type": "consumable" },
    "onion": { "name": "Onion", "type": "consumable" },
    "garlic_clove": { "name": "Garlic Clove", "type": "consumable" },
    "canned_tomatoes": { "name": "Canned Tomatoes", "type": "consumable" },
    "spaghetti_pasta": { "name": "Spaghetti Pasta", "type": "consumable" },
    "chicken_breast": { "name": "Chicken Breast", "type": "consumable" },
    "broccoli_head": { "name": "Broccoli Head", "type": "consumable" },
    "white_rice": { "name": "White Rice", "type": "consumable" },
    "lentils": { "name": "Dried Lentils", "type": "consumable" },
    "carrot": { "name": "Carrot", "type": "consumable" },
    "celery_stalk": { "name": "Celery Stalk", "type": "consumable" },
    "vegetable_broth": { "name": "Vegetable Broth", "type": "consumable" },
    "olive_oil": { "name": "Olive Oil", "type": "reusable" },
    "oregano": { "name": "Dried Oregano", "type": "reusable" },
    "soy_sauce": { "name": "Soy Sauce", "type": "reusable" },
    "ginger": { "name": "Ginger", "type": "reusable" },
    "cumin": { "name": "Cumin Powder", "type": "reusable" },
    "salt": { "name": "Salt", "type": "reusable" },
    "black_pepper": { "name": "Black Pepper", "type": "reusable" }
  },
  "recipes": [
    { "id": "recipe-1", "name": "Spaghetti Bolognese", "ingredients": [
        { "id": "ground_beef", "quantity": 500, "unit": "g" }, { "id": "onion", "quantity": 1, "unit": "whole" }, { "id": "garlic_clove", "quantity": 3, "unit": "cloves" }, { "id": "canned_tomatoes", "quantity": 800, "unit": "g" }, { "id": "spaghetti_pasta", "quantity": 400, "unit": "g" }, { "id": "olive_oil", "quantity": 2, "unit": "tbsp" }, { "id": "oregano", "quantity": 1, "unit": "tsp" }
    ]},
    { "id": "recipe-2", "name": "Chicken Stir-Fry", "ingredients": [
        { "id": "chicken_breast", "quantity": 2, "unit": "breasts" }, { "id": "broccoli_head", "quantity": 1, "unit": "head" }, { "id": "onion", "quantity": 1, "unit": "whole" }, { "id": "garlic_clove", "quantity": 2, "unit": "cloves" }, { "id": "soy_sauce", "quantity": 4, "unit": "tbsp" }, { "id": "ginger", "quantity": 1, "unit": "inch piece" }, { "id": "white_rice", "quantity": 300, "unit": "g" }, { "id": "olive_oil", "quantity": 1, "unit": "tbsp" }
    ]},
    { "id": "recipe-3", "name": "Hearty Lentil Soup", "ingredients": [
        { "id": "lentils", "quantity": 500, "unit": "g" }, { "id": "carrot", "quantity": 2, "unit": "whole" }, { "id": "celery_stalk", "quantity": 2, "unit": "stalks" }, { "id": "onion", "quantity": 1, "unit": "whole" }, { "id": "garlic_clove", "quantity": 4, "unit": "cloves" }, { "id": "vegetable_broth", "quantity": 1500, "unit": "ml" }, { "id": "cumin", "quantity": 2, "unit": "tsp" }, { "id": "olive_oil", "quantity": 2, "unit": "tbsp" }
    ]},
    { "id": "recipe-4", "name": "Simple Chicken and Rice", "ingredients": [
        { "id": "chicken_breast", "quantity": 2, "unit": "breasts" }, { "id": "white_rice", "quantity": 300, "unit": "g" }, { "id": "salt", "quantity": "to taste", "unit": "" }, { "id": "black_pepper", "quantity": "to taste", "unit": "" }
    ]}
  ]
};

// --- Helper Icons ---
const ShoppingCartIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block h-6 w-6 mr-2">
    <circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle>
    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
  </svg>
);

const CheckSquareIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block h-6 w-6 mr-2">
        <polyline points="9 11 12 14 22 4"></polyline><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
    </svg>
);

const PlusIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block h-5 w-5 mr-2">
        <line x1="12" y1="5" x2="12" y2="19"></line><line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);



// --- Child Components ---

interface RecipeCardProps {
    recipe: Recipe;
    isSelected: boolean;
    onToggle: (recipeId: string) => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, isSelected, onToggle }) => (
    <label 
        htmlFor={recipe.id} 
        className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-blue-50 border-blue-400' : 'hover:bg-gray-100'}`}
    >
        <input 
            type="checkbox" 
            id={recipe.id} 
            checked={isSelected}
            onChange={() => onToggle(recipe.id)}
            className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-4"
        />
        <span className="font-medium text-lg text-gray-800">{recipe.name}</span>
    </label>
);

interface ShoppingListProps {
    list: ShoppingListType | null;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ list }) => {
    if (!list || (list.consumables.length === 0 && list.reusables.length === 0)) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>Select some recipes and click "Generate Shopping List" to see your ingredients.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {list.consumables.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3 text-blue-800 flex items-center"><ShoppingCartIcon /> Consumables to Buy</h3>
                    <ul className="space-y-2 pl-2">
                        {list.consumables.map(item => (
                            <li key={item.name} className="flex items-start">
                                <span className="text-gray-800">{item.name}: <strong className="ml-1 font-medium">{item.amountStr}</strong></span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {list.reusables.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold mb-3 text-green-800 flex items-center"><CheckSquareIcon /> Reusable Items to Check</h3>
                    <ul className="space-y-2 pl-2">
                        {list.reusables.map(item => (
                            <li key={item.name} className="flex items-start">
                                <span className="text-gray-800">{item.name}: <strong className="ml-1 font-medium">{item.amountStr}</strong></span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};


// --- Main App Component ---

const App: React.FC = () => {
    const [selectedRecipeIds, setSelectedRecipeIds] = useState<Set<string>>(new Set());
    const [shoppingList, setShoppingList] = useState<ShoppingListType | null>(null);

    const handleToggleRecipe = (recipeId: string) => {
        setSelectedRecipeIds(prevIds => {
            const newIds = new Set(prevIds);
            if (newIds.has(recipeId)) {
                newIds.delete(recipeId);
            } else {
                newIds.add(recipeId);
            }
            return newIds;
        });
    };

    const handleGenerateList = () => {
        const recipesToMake = database.recipes.filter(r => selectedRecipeIds.has(r.id));
        
        const aggregated: AggregatedIngredients = {};
        recipesToMake.forEach(recipe => {
            recipe.ingredients.forEach(ingredient => {
                const { id, quantity, unit } = ingredient;
                if (!aggregated[id]) aggregated[id] = {};
                if (!aggregated[id][unit]) aggregated[id][unit] = 0;
                
                if (typeof quantity === 'number' && typeof aggregated[id][unit] === 'number') {
                    (aggregated[id][unit] as number) += quantity;
                } else {
                    aggregated[id][unit] = quantity;
                }
            });
        });

        const consumables: ShoppingListItem[] = [];
        const reusables: ShoppingListItem[] = [];

        for (const ingId in aggregated) {
            const info = database.ingredients_info[ingId];
            if (!info) continue;

            const amounts = aggregated[ingId];
            const amountStr = Object.entries(amounts).map(([unit, qty]) => `${qty} ${unit}`).join(', ');

            const itemDetails: ShoppingListItem = { name: info.name, amountStr };

            if (info.type === 'consumable') {
                consumables.push(itemDetails);
            } else {
                reusables.push(itemDetails);
            }
        }
        
        setShoppingList({ consumables, reusables });
    };

    return (
        <div className="bg-gray-50 text-gray-800 min-h-screen">
            <div className="container mx-auto p-4 md:p-8 max-w-8xl">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Recipe Ingredient Manager</h1>
                    <p className="text-lg text-gray-600 mt-2">Select meals, and we'll generate your shopping list.</p>
                </header>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 [auto-300px] lg:gap-8">
                    <div>
                        {/* Left side, recipe */}
                        <div className="bg-white p-6 rounded-xl shadow-md mb-8">
                            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">1. Choose Your Recipes</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {database.recipes.map(recipe => (
                                    <RecipeCard 
                                        key={recipe.id}
                                        recipe={recipe}
                                        isSelected={selectedRecipeIds.has(recipe.id)}
                                        onToggle={handleToggleRecipe}
                                    />
                                ))}
                            </div>
                            <div className="mt-6 pt-6 border-t text-center">
                                <a href="/recipes/new" className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-4 focus:ring-green-300 transition-all">
                                    <PlusIcon />
                                    Add New Recipe
                                </a>
                            </div>
                        </div>

                        <div className="text-center my-8">
                            <button 
                                onClick={handleGenerateList}
                                className="bg-blue-600 text-white font-bold py-3 px-8 rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all shadow-lg hover:shadow-xl disabled:bg-gray-400 disabled:cursor-not-allowed"
                                disabled={selectedRecipeIds.size === 0}
                            >
                                Generate Shopping List
                            </button>
                        </div>

                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">2. Your Consolidated Shopping List</h2>
                            <ShoppingList list={shoppingList} />
                        </div>
                    </div>

                    {/* Right side, Fridge */}
                    <div>
                        <div className="mt-8 lg:mt-0">
                            <Fridge/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
