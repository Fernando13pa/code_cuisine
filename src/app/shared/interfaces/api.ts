import { NutritionalInfo } from './recipe';
import { CuisineType } from './preferences';

export type TimeCategory = 'quick' | 'medium' | 'elaborate';
export type Diet = 'vegetarian' | 'vegan' | 'keto' | 'none';

/**
 * Body que Angular envía al webhook de n8n.
 * `cuisine` gehört bewusst nicht dazu: das aktuelle n8n-Workflow liest sie nicht,
 * die KI bestimmt die Cuisine selbst und liefert sie nur in der Antwort zurück.
 */
export interface RecipeGenerationRequest {
  /** Zutatennamen kommagetrennt, z. B. "Reis, Hähnchen, Paprika". */
  ingredients: string;
  portions: number;
  timeCategory: TimeCategory;
  cuisine: CuisineType;
  diet: Diet;
  numberOfChefs: number;
}

/** Zutat, wie n8n sie liefert: ohne eigene `id`. */
export interface RawIngredient {
  name: string;
  amount: number;
  unit: string;
}

/** Schritt, wie n8n ihn liefert: `chef` kommt als String (Gemini-API-Limit). */
export interface RawRecipeStep {
  number: number;
  title: string;
  description: string;
  chef: '1' | '2' | '3';
  isParallel: boolean;
}

/**
 * Rezept, wie n8n es liefert, bevor es in das interne `Recipe`-Modell normalisiert wird.
 * `nutritionalInfo` ist bereits im finalen Format, nur `ingredients`/`steps` brauchen Normalisierung.
 */
export interface RawRecipe {
  id: string;
  title: string;
  cookingTime: number;
  cuisine: CuisineType;
  tags: string[];
  missingIngredientsNote: string;
  nutritionalInfo: NutritionalInfo;
  ingredients: RawIngredient[];
  extraIngredients: RawIngredient[];
  steps: RawRecipeStep[];
}

/** Respuesta exitosa de n8n: siempre exactamente 3 recetas, envueltas en `output`. */
export interface RecipeGenerationResponse {
  output: {
    recipes: RawRecipe[];
  };
}

/** Respuesta de n8n al superar la quota diaria (HTTP 429). */
export interface QuotaExceededResponse {
  error: true;
  message: string;
}

/**
 * Códigos de error que el frontend distingue. Solo `QUOTA_EXCEEDED` y `TIMEOUT`
 * vienen de una respuesta real de n8n; el resto son fallos de red/HTTP genéricos.
 */
export type ApiErrorCode = 'QUOTA_EXCEEDED' | 'TIMEOUT' | 'NETWORK_ERROR' | 'UNKNOWN_ERROR';

/** Error normalizado que el frontend usa para mostrar mensajes al usuario. */
export interface ApiErrorResponse {
  code: ApiErrorCode;
  message: string;
}
