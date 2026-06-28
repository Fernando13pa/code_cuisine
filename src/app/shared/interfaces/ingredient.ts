export type Unit = 'gram' | 'kg' | 'ml' | 'l' | 'piece' | 'tbsp' | 'tsp';

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  unit: Unit;
}
