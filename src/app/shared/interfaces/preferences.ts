export type CookingTime = 'Quick' | 'Medium' | 'Complex';
export type CuisineType = 'German' | 'Italian' | 'Indian' | 'Japanese' | 'Gourmet' | 'Fusion';
export type DietType = 'Vegetarian' | 'Vegan' | 'Keto' | 'No preferences';

export interface Preferences {
  portions: number;
  cooks: number;
  cookingTime: CookingTime | null;
  cuisine: CuisineType | null;
  diet: DietType | null;
}
