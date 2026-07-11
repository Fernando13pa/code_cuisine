export type Unit = 'gram' | 'kg' | 'ml' | 'piece';

export interface Ingredient {
  id: string;
  name: string;
  amount: number;
  /** String statt `Unit`: KI-generierte Rezepte liefern Freitext-Einheiten (z. B. "zehen", "prise"). */
  unit: string;
}
