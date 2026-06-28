import { Injectable, signal } from '@angular/core';

import { Ingredient } from '../interfaces/ingredient';
import { Preferences } from '../interfaces/preferences';
import { Recipe } from '../interfaces/recipe';

@Injectable({ providedIn: 'root' })
export class RecipeService {
  readonly ingredients = signal<Ingredient[]>([]);
  readonly preferences = signal<Preferences>({
    portions: 2,
    cooks: 1,
    cookingTime: null,
    cuisine: null,
    diet: null,
  });
  readonly results = signal<Recipe[]>([]);
  readonly isLoading = signal(false);

  setIngredients(list: Ingredient[]): void {
    this.ingredients.set(list);
  }

  setPreferences(prefs: Preferences): void {
    this.preferences.set(prefs);
  }

  // TODO: replace stub with n8n webhook call once workflow is configured
  async generate(): Promise<void> {
    this.isLoading.set(true);
    this.isLoading.set(false);
  }
}
