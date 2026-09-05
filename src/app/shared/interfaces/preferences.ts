export type CookingTime = 'Quick' | 'Medium' | 'Complex';
export type CuisineType = 'German' | 'Italian' | 'Indian' | 'Japanese' | 'Gourmet' | 'Fusion';
export type DietType = 'Vegetarian' | 'Vegan' | 'Keto' | 'No preferences';
export type MealType = 'Breakfast' | 'Lunch' | 'Snack';
/** Ob das Gericht warm oder kalt gegessen werden soll (z. B. Kita-Frühstück/-Mittag). */
export type ServingTemperature = 'Hot' | 'Cold';

export interface Preferences {
  portions: number;
  cooks: number;
  cookingTime: CookingTime | null;
  cuisine: CuisineType | null;
  diet: DietType | null;
  meal: MealType | null;
  temperature: ServingTemperature | null;
}
