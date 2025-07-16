export interface Quantity {
    [unit: string]: number | string;
}

export interface Recipe {
    id: string;
    recipe_name: string;
    ingredients: { [ingredientId: string]: Quantity };
}

export interface ShoppingListItem {
    name: string;
    amountStr: string;
}

export interface ShoppingListType {
    inFridge: ShoppingListItem[];
    notInFridge: ShoppingListItem[];
}

export interface AggregatedIngredient {
    [unit: string]: number | string;
}

export interface AggregatedIngredients {
    [ingredientId: string]: AggregatedIngredient;
} 

export interface CreateRecipe {
    recipe_name: string;
    ingredients: { [ingredientId: string]: Quantity };
}

export interface CreateFridge {
    ingredients: { [ingredientId: string]: Quantity };
}