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
  readonly cookingTime = signal<CookingTime | null>(null);
  readonly cuisine = signal<CuisineType | null>(null);
  readonly diet = signal<DietType | null>(null);

  incrementPortions(): void {
    if (this.portions() < 10) this.portions.update(v => v + 1);
  }

  decrementPortions(): void {
    if (this.portions() > 1) this.portions.update(v => v - 1);
  }

  incrementCooks(): void {
    if (this.cooks() < 6) this.cooks.update(v => v + 1);
  }

  decrementCooks(): void {
    if (this.cooks() > 1) this.cooks.update(v => v - 1);
  }

  selectCookingTime(value: CookingTime): void {
    this.cookingTime.set(this.cookingTime() === value ? null : value);
  }

  selectCuisine(value: CuisineType): void {
    this.cuisine.set(this.cuisine() === value ? null : value);
  }

  selectDiet(value: DietType): void {
    this.diet.set(this.diet() === value ? null : value);
  }

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
