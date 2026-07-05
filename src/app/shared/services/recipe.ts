import { Injectable, inject, signal } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { TimeoutError, firstValueFrom, timeout } from 'rxjs';

import { environment } from '../../../environments/environment';
import firebaseRecipeSnapshot from '../../../../public/data/firebase-recipes.json';
import { Ingredient } from '../interfaces/ingredient';
import { Preferences } from '../interfaces/preferences';
import { ChefNumber, Recipe } from '../interfaces/recipe';
import { COOKBOOK_RECIPES } from '../data/cookbook-recipes';
import {
  ApiErrorResponse,
  Diet,
  QuotaExceededResponse,
  RawIngredient,
  RawRecipe,
  RecipeGenerationRequest,
  RecipeGenerationResponse,
  TimeCategory,
} from '../interfaces/api';

// La generación tarda 20-90s (Gemini + reintentos posibles).
const REQUEST_TIMEOUT_MS = 120_000;

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

function normalizeIngredient(raw: RawIngredient): Ingredient {
  return {
    id: crypto.randomUUID(),
    name: raw.name,
    amount: raw.amount,
    unit: raw.unit,
  };
}

function normalizeRecipe(raw: RawRecipe): Recipe {
  return {
    id: raw.id,
    title: raw.title,
    cookingTime: raw.cookingTime,
    cuisine: raw.cuisine,
    tags: raw.tags ?? [],
    likes: 0,
    missingIngredientsNote: raw.missingIngredientsNote,
    nutritionalInfo: raw.nutritionalInfo,
    ingredients: (raw.ingredients ?? []).map(normalizeIngredient),
    extraIngredients: (raw.extraIngredients ?? []).map(normalizeIngredient),
    steps: (raw.steps ?? []).map(step => ({
      number: step.number,
      description: step.description,
      chef: Number(step.chef) as ChefNumber,
      isParallel: step.isParallel,
    })),
  };
}

function toApiError(err: unknown): ApiErrorResponse {
  if (err instanceof TimeoutError) {
    return { code: 'TIMEOUT', message: 'The recipe generation took too long. Please try again.' };
  }
  if (err instanceof HttpErrorResponse) {
    if (err.status === 429) {
      const body = err.error as QuotaExceededResponse | null;
      return { code: 'QUOTA_EXCEEDED', message: body?.message ?? "You've reached today's limit." };
    }
    if (err.status === 0) {
      return { code: 'NETWORK_ERROR', message: 'Could not reach the server. Check your connection.' };
    }
  }
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
  readonly cookbookRecipes = signal<Recipe[]>(COOKBOOK_RECIPES);
  readonly isLoading = signal(false);
  readonly error = signal<ApiErrorResponse | null>(null);

  setIngredients(list: Ingredient[]): void {
    this.ingredients.set(list);
  }

  setPreferences(prefs: Preferences): void {
    this.preferences.set(prefs);
  }

  getRecipeById(id: string | null): Recipe | null {
    if (!id) return null;
    return this.results().find(recipe => recipe.id === id)
      ?? this.cookbookRecipes().find(recipe => recipe.id === id)
      ?? null;
  }

  getCookbookRecipes(cuisine: string): Recipe[] {
    return this.cookbookRecipes().filter(
      recipe => recipe.cuisine.toLowerCase() === cuisine.toLowerCase(),
    );
  }

  updateLikes(id: string, delta: number): void {
    const update = (list: Recipe[]) =>
      list.map(recipe => recipe.id === id ? { ...recipe, likes: recipe.likes + delta } : recipe);
    this.results.update(update);
    this.cookbookRecipes.update(update);
  }

  /** Genera 3 recetas a partir de los ingredientes y preferencias actuales via n8n. */
  async generate(): Promise<void> {
    this.error.set(null);
    this.isLoading.set(true);

    try {
      const recipes = environment.useLocalRecipeFixtures
        ? await this.loadLocalRecipeFixtures()
        : await this.generateWithN8n();

      this.results.set(recipes.map(normalizeRecipe));
    } catch (err) {
      this.error.set(toApiError(err));
    } finally {
      this.isLoading.set(false);
    }
  }

  /** Reads the Firebase snapshot bundled with the app; no HTTP request is made. */
  private loadLocalRecipeFixtures(): Promise<RawRecipe[]> {
    return Promise.resolve(Object.values(firebaseRecipeSnapshot) as RawRecipe[]);
  }

  /** Production path: keeps the existing Angular -> n8n -> Gemini contract intact. */
  private async generateWithN8n(): Promise<RawRecipe[]> {
    const response = await firstValueFrom(
      this.http
        .post<RecipeGenerationResponse>(environment.n8nWebhookUrl, this.buildRequest())
        .pipe(timeout(REQUEST_TIMEOUT_MS)),
    );
    return response.output.recipes;
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
