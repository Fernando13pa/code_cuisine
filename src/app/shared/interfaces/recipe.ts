import { Ingredient } from './ingredient';

export interface NutritionalInfo {
  energy: number;
  protein: number;
  fat: number;
  carbs: number;
}

export type ChefNumber = 1 | 2;

export interface RecipeStep {
  number: number;
  description: string;
  chef: ChefNumber;
}

export interface Recipe {
  id: string;
  title: string;
  cookingTime: number;
  cuisine: string;
  tags: string[];
  likes: number;
  nutritionalInfo: NutritionalInfo;
  ingredients: Ingredient[];
  extraIngredients: Ingredient[];
  steps: RecipeStep[];
}
