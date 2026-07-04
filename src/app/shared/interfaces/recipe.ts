import { Ingredient } from './ingredient';
import { CuisineType } from './preferences';

export interface NutritionalInfo {
  energyPerPortion: number;
  proteinPerPortion: number;
  fatPerPortion: number;
  carbsPerPortion: number;
  energyTotal: number;
  proteinTotal: number;
  fatTotal: number;
  carbsTotal: number;
}

export type ChefNumber = 1 | 2 | 3;

export interface RecipeStep {
  number: number;
  description: string;
  chef: ChefNumber;
  /** Kann parallel zum vorherigen Schritt von einem anderen Chef ausgeführt werden. */
  isParallel: boolean;
}

export interface Recipe {
  id: string;
  title: string;
  cookingTime: number;
  cuisine: CuisineType;
  tags: string[];
  /** Wird nicht von n8n geliefert, sondern lokal/Firebase verwaltet (Favoriten). */
  likes: number;
  /** Hinweistext von der KI, falls Zutaten im Rezept fehlen. Leerstring, wenn keine fehlen. */
  missingIngredientsNote: string;
  nutritionalInfo: NutritionalInfo;
  ingredients: Ingredient[];
  extraIngredients: Ingredient[];
  steps: RecipeStep[];
}
