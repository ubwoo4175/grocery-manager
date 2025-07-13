'use client'

import React, { useState, useEffect } from 'react';
import Fridge from './components/Fridge';

// --- TYPE DEFINITIONS ---
interface IngredientInfo {
    name: string;
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
    inFridge: ShoppingListItem[];
    notInFridge: ShoppingListItem[];
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
    "ground_beef": { "name": "Ground Beef" },
    "onion": { "name": "Onion" },
    "garlic_clove": { "name": "Garlic Clove" },
    "canned_tomatoes": { "name": "Canned Tomatoes" },
    "spaghetti_pasta": { "name": "Spaghetti Pasta" },
    "chicken_breast": { "name": "Chicken Breast" },
    "broccoli_head": { "name": "Broccoli Head" },
    "white_rice": { "name": "White Rice" },
    "lentils": { "name": "Dried Lentils" },
    "carrot": { "name": "Carrot" },
    "celery_stalk": { "name": "Celery Stalk" },
    "vegetable_broth": { "name": "Vegetable Broth" },
    "olive_oil": { "name": "Olive Oil" },
    "oregano": { "name": "Dried Oregano" },
    "soy_sauce": { "name": "Soy Sauce" },
    "ginger": { "name": "Ginger" },
    "cumin": { "name": "Cumin Powder" },
    "salt": { "name": "Salt" },
    "black_pepper": { "name": "Black Pepper" }
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

// Fridge mock data (copied from Fridge.tsx)
const initialFridgeContents = [
    { id: 1, name: 'Olive Oil', quantity: 1, unit: 'bottle' },
    { id: 2, name: 'Soy Sauce', quantity: 1, unit: 'bottle' },
    { id: 3, name: 'Salt', quantity: 1, unit: 'shaker' },
    { id: 4, name: 'Black Pepper', quantity: 1, unit: 'grinder' },
    { id: 5, name: 'Onion', quantity: 2, unit: 'whole' },
    { id: 6, name: 'Garlic Clove', quantity: 5, unit: 'cloves' },
    { id: 7, name: 'Chicken Breast', quantity: 1, unit: 'breasts' },
];

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

const ExpandIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block h-5 w-5">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="16"></line>
        <line x1="8" y1="12" x2="16" y2="12"></line>
    </svg>
);

const EditIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block h-5 w-5">
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19.5 2 21l1.5-5L16.5 3.5z" />
    </svg>
);

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, isSelected, onToggle }) => {
    const [showIngredients, setShowIngredients] = useState(false);

    // Close the floating box when clicking outside
    useEffect(() => {
        if (!showIngredients) return;
        const handler = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (!target.closest(`#expand-box-${recipe.id}`) && !target.closest(`#expand-btn-${recipe.id}`)) {
                setShowIngredients(false);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, [showIngredients, recipe.id]);

    return (
        <div className={`relative flex items-center p-4 border rounded-lg transition-all ${isSelected ? 'bg-blue-50 border-blue-400' : 'hover:bg-gray-100'}`}> 
            <input 
                type="checkbox" 
                id={recipe.id} 
                checked={isSelected}
                onChange={() => onToggle(recipe.id)}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 mr-4"
            />
            <button
                type="button"
                className="font-medium text-lg text-gray-800 flex-1 text-left focus:outline-none bg-transparent border-0 cursor-pointer"
                style={{background: 'none', boxShadow: 'none'}} // Remove button styles
                onClick={() => onToggle(recipe.id)}
                aria-pressed={isSelected}
            >
                {recipe.name}
            </button>
            <button
                id={`expand-btn-${recipe.id}`}
                type="button"
                className="ml-2 p-1 rounded hover:bg-gray-200"
                aria-label="Show ingredients"
                onClick={() => setShowIngredients(v => !v)}
            >
                <ExpandIcon />
            </button>
            <a
                href={`/recipes/${recipe.id}`}
                className="ml-2 p-1 rounded hover:bg-gray-200"
                aria-label="Edit recipe"
            >
                <EditIcon />
            </a>
            {showIngredients && (
                <div
                    id={`expand-box-${recipe.id}`}
                    className="absolute z-20 left-1/2 top-full mt-2 -translate-x-1/2 bg-white border border-gray-300 rounded-lg shadow-lg p-4 min-w-[220px] max-w-xs"
                >
                    <div className="font-semibold mb-2 text-gray-900">Ingredients</div>
                    <ul className="list-disc pl-5 text-gray-800 text-sm">
                        {recipe.ingredients.map(ing => (
                            <li key={ing.id}>
                                {database.ingredients_info[ing.id]?.name || ing.id}: {ing.quantity} {ing.unit}
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

interface ShoppingListProps {
    list: ShoppingListType | null;
}

const ShoppingList: React.FC<ShoppingListProps> = ({ list }) => {
    if (!list || (list.inFridge.length === 0 && list.notInFridge.length === 0)) {
        return (
            <div className="text-center py-8 text-gray-500">
                <p>Select recipes to see your ingredients.</p>
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8">
            {list.notInFridge.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-3 text-blue-800 flex items-center"><ShoppingCartIcon /> Not in Fridge (To Buy)</h3>
                    <ul className="space-y-2 pl-2">
                        {list.notInFridge.map(item => (
                            <li key={item.name} className="flex items-start">
                                <span className="text-gray-800">{item.name}: <strong className="ml-1 font-medium">{item.amountStr}</strong></span>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
            {list.inFridge.length > 0 && (
                <div>
                    <h3 className="text-xl font-semibold mb-3 text-green-800 flex items-center"><CheckSquareIcon /> Already in Fridge</h3>
                    <ul className="space-y-2 pl-2">
                        {list.inFridge.map(item => (
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
    const [fridgeItems, setFridgeItems] = useState(initialFridgeContents);

    // Compute aggregated usage for selected recipes
    const [aggregatedUsage, setAggregatedUsage] = useState<AggregatedIngredients>({});

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

    useEffect(() => {
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
        setAggregatedUsage(aggregated);
        const inFridge: ShoppingListItem[] = [];
        const notInFridge: ShoppingListItem[] = [];
        for (const ingId in aggregated) {
            const info = database.ingredients_info[ingId];
            if (!info) continue;
            const amounts = aggregated[ingId];
            console.log(amounts)
            const amountStr = Object.entries(amounts).map(([unit, qty]) => `${qty} ${unit}`).join(', ');
            const itemDetails: ShoppingListItem = { name: info.name, amountStr };
            // Check if in fridge (case-insensitive match)
            const inFridgeMatch = fridgeItems.some(f => f.name.toLowerCase() === info.name.toLowerCase());
            if (inFridgeMatch) {
                console.log(inFridgeMatch)
                inFridge.push(itemDetails);
                //여기 수정해야함함
            } else {
                notInFridge.push(itemDetails);
            }
        }
        setShoppingList({ inFridge, notInFridge });
    }, [selectedRecipeIds, fridgeItems]);

    return (
        <div className="bg-gray-50 text-gray-800 min-h-screen">
            <div className="container mx-auto p-4 md:p-8 max-w-8xl">
                <header className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900">Grocery Manager</h1>
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

                        <div className="bg-white p-6 rounded-xl shadow-md">
                            <h2 className="text-2xl font-semibold mb-4 border-b pb-2">2. Your Consolidated Shopping List</h2>
                            <ShoppingList list={shoppingList} />
                        </div>
                    </div>

                    {/* Right side, Fridge */}
                    <div>
                        <div className="mt-8 lg:mt-0">
                            <Fridge items={fridgeItems} setItems={setFridgeItems} aggregatedUsage={aggregatedUsage} database={database} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default App;
