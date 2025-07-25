export interface Quantity {
  [unit: string]: number;
}

export interface Recipe {
  id: string;
  recipe_name: string;
  ingredients: { [ingredientId: string]: Quantity };
}

export interface Fridge {
  id: string;
  fridge_name: string;
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
  [unit: string]: number;
}

export interface AggregatedIngredients {
  [ingredientId: string]: AggregatedIngredient;
}

export interface UpsertRecipe {
  recipe_name: string;
  ingredients: { [ingredientId: string]: Quantity };
}

export interface UpsertFridge {
  fridge_name: string;
  ingredients: { [ingredientId: string]: Quantity };
}
