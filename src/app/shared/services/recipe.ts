import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TimeoutError, firstValueFrom, timeout } from 'rxjs';

import { environment } from '../../../environments/environment';
import { Ingredient } from '../interfaces/ingredient';
import { Preferences } from '../interfaces/preferences';
import { ChefNumber, Recipe, RecipeStep } from '../interfaces/recipe';
import { COOKBOOK_RECIPES } from '../data/cookbook-recipes';
import {
  ApiErrorResponse,
  Diet,
  QuotaExceededResponse,
  RawIngredient,
  RawRecipe,
  RawRecipeStep,
  RecipeGenerationRequest,
  RecipeGenerationResponse,
  TimeCategory,
} from '../interfaces/api';

// La generación tarda 20-90s (Gemini + reintentos posibles).
const REQUEST_TIMEOUT_MS = 120_000;
const MIN_RECIPE_INGREDIENTS = 2;
const MIN_AMOUNT_UNITS_PER_PORTION = 80;
const PIECE_TO_AMOUNT_UNITS = 80;

// Likes and user-generated cookbook recipes live in localStorage, not Firebase,
// so they survive a reload without needing a backend round-trip.
const LIKES_STORAGE_KEY = 'code-cuisine:likes';
const FAVORITES_STORAGE_KEY = 'code-cuisine:favorites';
const SAVED_RECIPES_STORAGE_KEY = 'code-cuisine:saved-recipes';

/** Reads and parses a JSON value from localStorage, falling back on any failure. */
function readJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Writes a value to localStorage as JSON; silently no-ops if storage is unavailable. */
function writeJson(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full/disabled: likes or saved recipes just won't persist this time.
  }
}

/** Converts an ingredient's amount to a common unit so different units can be compared. */
function toComparableAmountUnits(ingredient: Ingredient): number {
  const unit = ingredient.unit.toLowerCase();

  if (unit === 'kg') return ingredient.amount * 1000;
  if (unit === 'gram') return ingredient.amount;
  if (unit === 'ml') return ingredient.amount;
  if (unit === 'piece') return ingredient.amount * PIECE_TO_AMOUNT_UNITS;

  return ingredient.amount * PIECE_TO_AMOUNT_UNITS;
}

// ---------------------------------------------------------------------------
// Mappers: app types → API contract
// ---------------------------------------------------------------------------

const TIME_MAP: Record<string, TimeCategory> = {
  Quick: 'quick',
  Medium: 'medium',
  Complex: 'elaborate',
};

const DIET_MAP: Record<string, Diet> = {
  Vegetarian: 'vegetarian',
  Vegan: 'vegan',
  Keto: 'keto',
  'No preferences': 'none',
};

// ---------------------------------------------------------------------------
// Normalizers: raw n8n response → internal Recipe model
// ---------------------------------------------------------------------------

/** Adds a client-side id to an ingredient coming from n8n. */
function normalizeIngredient(raw: RawIngredient): Ingredient {
  return {
    id: crypto.randomUUID(),
    name: raw.name,
    amount: raw.amount,
    unit: raw.unit,
  };
}

/** Converts a raw n8n step (string `chef`) into the app's typed RecipeStep. */
function normalizeStep(step: RawRecipeStep): RecipeStep {
  return {
    number: step.number,
    title: step.title,
    description: step.description,
    chef: Number(step.chef) as ChefNumber,
    isParallel: step.isParallel,
  };
}

/** Converts a raw n8n recipe into the app's internal Recipe model. */
function normalizeRecipe(raw: RawRecipe): Recipe {
  return {
    id: raw.id,
    title: raw.title,
    cookingTime: raw.cookingTime,
    cuisine: raw.cuisine,
    tags: raw.tags ?? [], likes: 0,
    missingIngredientsNote: raw.missingIngredientsNote,
    nutritionalInfo: raw.nutritionalInfo,
    ingredients: (raw.ingredients ?? []).map(normalizeIngredient),
    extraIngredients: (raw.extraIngredients ?? []).map(normalizeIngredient),
    steps: (raw.steps ?? []).map(normalizeStep),
  };
}

/** Maps a failed HTTP response from n8n to the app's normalized error shape. */
function mapHttpError(err: HttpErrorResponse): ApiErrorResponse {
  if (err.status === 429) {
    const body = err.error as QuotaExceededResponse | null;
    return { code: 'QUOTA_EXCEEDED', message: body?.message ?? "You've reached today's limit." };
  }
  if (err.status === 0) {
    return { code: 'NETWORK_ERROR', message: 'Could not reach the server. Check your connection.' };
  }
  return { code: 'UNKNOWN_ERROR', message: 'Something went wrong. Please try again later.' };
}

/** Converts any error thrown while generating recipes into the app's normalized error shape. */
function toApiError(err: unknown): ApiErrorResponse {
  if (err instanceof TimeoutError) {
    return { code: 'TIMEOUT', message: 'The recipe generation took too long. Please try again.' };
  }
  if (err instanceof HttpErrorResponse) return mapHttpError(err);
  return { code: 'UNKNOWN_ERROR', message: 'Something went wrong. Please try again later.' };
}

// ---------------------------------------------------------------------------
// Service
// ---------------------------------------------------------------------------

@Injectable({ providedIn: 'root' })
export class RecipeService {
  private readonly http = inject(HttpClient);

  readonly ingredients = signal<Ingredient[]>([]);
  readonly preferences = signal<Preferences>({
    portions: 2,
    cooks: 1,
    cookingTime: null,
    cuisine: null,
    diet: null,
  });
  readonly results = signal<Recipe[]>([]);
  readonly cookbookRecipes = signal<Recipe[]>(this.buildInitialCookbookRecipes());
  readonly isLoading = signal(false);
  readonly error = signal<ApiErrorResponse | null>(null);

  /** Stores the ingredients entered on the Generate page. */
  setIngredients(list: Ingredient[]): void {
    this.ingredients.set(list);
  }

  /** Stores the preferences selected on the Preferences page. */
  setPreferences(prefs: Preferences): void {
    this.preferences.set(prefs);
  }

  /** Looks up a recipe by id among the freshly generated and cookbook recipes. */
  getRecipeById(id: string | null): Recipe | null {
    if (!id) return null;
    return this.results().find(recipe => recipe.id === id)
      ?? this.cookbookRecipes().find(recipe => recipe.id === id)
      ?? null;
  }

  /** Returns the static cookbook recipes belonging to one cuisine. */
  getCookbookRecipes(cuisine: string): Recipe[] {
    return this.cookbookRecipes().filter(
      recipe => recipe.cuisine.toLowerCase() === cuisine.toLowerCase(),
    );
  }

  /** Adjusts a recipe's like count in both the results and cookbook lists. */
  updateLikes(id: string, delta: number): void {
    const update = (list: Recipe[]) =>
      list.map(recipe => recipe.id === id ? { ...recipe, likes: recipe.likes + delta } : recipe);
    this.results.update(update);
    this.cookbookRecipes.update(update);
    this.persistLikeChange(id);
  }

  /** True when this browser has already favorited this recipe. */
  isFavorited(id: string): boolean {
    return readJson<string[]>(FAVORITES_STORAGE_KEY, []).includes(id);
  }

  /** Toggles a recipe's favorite state, keeping its like count and the saved choice in sync. */
  toggleFavorite(id: string): void {
    const favorites = readJson<string[]>(FAVORITES_STORAGE_KEY, []);
    const wasFavorited = favorites.includes(id);
    const nextFavorites = wasFavorited ? favorites.filter(f => f !== id) : [...favorites, id];
    writeJson(FAVORITES_STORAGE_KEY, nextFavorites);
    this.updateLikes(id, wasFavorited ? -1 : 1);
  }

  /** Builds the cookbook list: static recipes plus any the user has generated and saved, with likes restored. */
  private buildInitialCookbookRecipes(): Recipe[] {
    const merged = [...this.loadSavedRecipes(), ...COOKBOOK_RECIPES];
    return this.applyLikeOverrides(merged, readJson(LIKES_STORAGE_KEY, {}));
  }

  /** Overlays persisted like counts onto a recipe list. */
  private applyLikeOverrides(recipes: Recipe[], overrides: Record<string, number>): Recipe[] {
    return recipes.map(r => (r.id in overrides ? { ...r, likes: overrides[r.id] } : r));
  }

  /** Saves a recipe's current like count to localStorage so it survives a reload. */
  private persistLikeChange(id: string): void {
    const recipe = this.cookbookRecipes().find(r => r.id === id) ?? this.results().find(r => r.id === id);
    if (!recipe) return;
    const overrides = readJson<Record<string, number>>(LIKES_STORAGE_KEY, {});
    writeJson(LIKES_STORAGE_KEY, { ...overrides, [id]: recipe.likes });
  }

  /** Reads previously saved user-generated recipes from localStorage. */
  private loadSavedRecipes(): Recipe[] {
    return readJson<Recipe[]>(SAVED_RECIPES_STORAGE_KEY, []);
  }

  /** Files newly generated recipes under the chosen cuisine, saved first, ahead of the existing ones. */
  private saveGeneratedRecipesToCookbook(recipes: Recipe[]): void {
    const cuisine = this.preferences().cuisine;
    if (!cuisine) return;

    const tagged = recipes.map(r => ({ ...r, cuisine }));
    const ids = new Set(tagged.map(r => r.id));
    writeJson(SAVED_RECIPES_STORAGE_KEY, [...tagged, ...this.loadSavedRecipes().filter(r => !ids.has(r.id))]);
    this.cookbookRecipes.update(list => [...tagged, ...list.filter(r => !ids.has(r.id))]);
  }

  /** Ingredients with a usable name and a positive numeric amount. */
  private usableIngredients(): Ingredient[] {
    return this.ingredients().filter(
      i => i.name.trim().length > 0 && Number.isFinite(i.amount) && i.amount > 0,
    );
  }

  /** True when there aren't enough usable ingredients/quantity for the selected portions. */
  hasInsufficientIngredientsForOverlay(): boolean {
    const usable = this.usableIngredients();
    if (usable.length < MIN_RECIPE_INGREDIENTS) return true;

    const requiredAmountUnits = this.preferences().portions * MIN_AMOUNT_UNITS_PER_PORTION;
    const availableAmountUnits = usable.reduce(
      (total, i) => total + toComparableAmountUnits(i), 0,
    );
    return availableAmountUnits < requiredAmountUnits;
  }

  /** Genera 3 recetas a partir de los ingredientes y preferencias actuales via n8n. */
  async generate(): Promise<void> {
    this.error.set(null);
    this.isLoading.set(true);

    try {
      const recipes = await this.generateWithN8n();
      const normalized = recipes.map(normalizeRecipe);
      this.results.set(normalized);
      this.saveGeneratedRecipesToCookbook(normalized);
    } catch (err) {
      this.error.set(toApiError(err));
    } finally {
      this.isLoading.set(false);
    }
  }

  /** Calls the n8n webhook and returns the raw recipes from its response. */
  private async generateWithN8n(): Promise<RawRecipe[]> {
    const response = await firstValueFrom(
      this.http
        .post<RecipeGenerationResponse>(environment.n8nWebhookUrl, this.buildRequest())
        .pipe(timeout(REQUEST_TIMEOUT_MS)),
    );
    return this.extractRecipes(response);
  }

  /** n8n's current workflow double-wraps the payload (`output.output.recipes`); unwrap either shape. */
  private extractRecipes(response: RecipeGenerationResponse): RawRecipe[] {
    const output = response.output as { recipes?: RawRecipe[]; output?: { recipes: RawRecipe[] } };
    const recipes = output.recipes ?? output.output?.recipes;
    if (!recipes) throw new Error('n8n response did not include any recipes.');
    return recipes;
  }

  /** Construye el request body según el contrato Angular ↔ n8n. */
  buildRequest(): RecipeGenerationRequest {
    const prefs = this.preferences();
    return {
      ingredients: this.ingredients().map(i => i.name).join(', '),
      portions: prefs.portions,
      timeCategory: TIME_MAP[prefs.cookingTime ?? 'Quick'],
      diet: DIET_MAP[prefs.diet ?? 'No preferences'],
      numberOfChefs: prefs.cooks,
    };
  }
}
