import { Component, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CookingTime, CuisineType, DietType } from '../../interfaces/preferences';
import { RecipeService } from '../../services/recipe';

@Component({
  selector: 'app-preferences',
  imports: [RouterLink],
  templateUrl: './preferences.html',
  styleUrl: './preferences.scss',
})
export class Preferences {
  private readonly router = inject(Router);
  private readonly recipeService = inject(RecipeService);

  readonly cookingTimes: { value: CookingTime; label: string; hint: string }[] = [
    { value: 'Quick', label: 'Quick', hint: 'up to 20min' },
    { value: 'Medium', label: 'Medium', hint: '25-40min' },
    { value: 'Complex', label: 'Complex', hint: 'over 45min' },
  ];

  readonly cuisines: CuisineType[] = [
    'German', 'Italian', 'Indian', 'Japanese', 'Gourmet', 'Fusion',
  ];

  readonly diets: DietType[] = [
    'Vegetarian', 'Vegan', 'Keto', 'No preferences',
  ];

  readonly portions = signal(2);
  readonly cooks = signal(1);
  readonly cookingTime = signal<CookingTime>('Quick');
  readonly cuisine = signal<CuisineType>('German');
  readonly diet = signal<DietType>('No preferences');

  /** Increases the portion count, capped at 12. */
  incrementPortions(): void {
    if (this.portions() < 12) this.portions.update(v => v + 1);
  }

  /** Decreases the portion count, floored at 1. */
  decrementPortions(): void {
    if (this.portions() > 1) this.portions.update(v => v - 1);
  }

  /** Increases the number of cooks, capped at 3. */
  incrementCooks(): void {
    if (this.cooks() < 3) this.cooks.update(v => v + 1);
  }

  /** Decreases the number of cooks, floored at 1. */
  decrementCooks(): void {
    if (this.cooks() > 1) this.cooks.update(v => v - 1);
  }

  /** Selects a cooking time; exactly one must always stay selected. */
  selectCookingTime(value: CookingTime): void {
    this.cookingTime.set(value);
  }

  /** Selects a cuisine; exactly one must always stay selected. */
  selectCuisine(value: CuisineType): void {
    this.cuisine.set(value);
  }

  /** Selects a diet; exactly one must always stay selected. */
  selectDiet(value: DietType): void {
    this.diet.set(value);
  }

  /** Saves the chosen preferences and navigates to the Loading step. */
  generate(): void {
    this.recipeService.setPreferences({
      portions: this.portions(),
      cooks: this.cooks(),
      cookingTime: this.cookingTime(),
      cuisine: this.cuisine(),
      diet: this.diet(),
    });
    this.router.navigate(['/loading']);
  }
}
