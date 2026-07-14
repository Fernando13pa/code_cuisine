import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { RecipeService } from '../../services/recipe';
import { ChefNumber } from '../../interfaces/recipe';
import { Ingredient } from '../../interfaces/ingredient';

function timeCategoryLabel(minutes: number): string {
  if (minutes <= 20) return 'Quick';
  if (minutes <= 45) return 'Medium';
  return 'Complex';
}

const CHEF_ICONS: Partial<Record<ChefNumber, string>> = {
  1: '/assets/icon-chef-1.svg',
  2: '/assets/icon-chef-2.svg',
};

@Component({
  selector: 'app-recipe-detail',
  imports: [RouterLink],
  templateUrl: './recipe-detail.html',
  styleUrl: './recipe-detail.scss',
})
export class RecipeDetail {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly recipeService = inject(RecipeService);

  private readonly recipeId = this.route.snapshot.paramMap.get('id');

  readonly recipe = computed(
    () => this.recipeService.getRecipeById(this.recipeId),
  );

  readonly isCookbookRecipe = computed(() =>
    this.recipeService.cookbookRecipes().some(item => item.id === this.recipe()?.id),
  );

  readonly backLink = computed(() =>
    this.isCookbookRecipe() ? ['/cookbook', this.recipe()!.cuisine.toLowerCase()] : ['/results'],
  );

  readonly backLabel = computed(() =>
    this.isCookbookRecipe() ? `${this.recipe()!.cuisine} recipes` : 'Recipe results',
  );

  /** Nur anzeigen, wenn die KI nicht schon einen gleichwertigen Tag geliefert hat (z. B. "quick"). */
  readonly timeCategory = computed(() => {
    const recipe = this.recipe();
    if (!recipe) return '';
    const label = timeCategoryLabel(recipe.cookingTime);
    const alreadyTagged = recipe.tags.some(tag => tag.toLowerCase() === label.toLowerCase());
    return alreadyTagged ? '' : label;
  });

  /** The summary design shows only dietary tags; descriptive Firebase tags stay out of the header. */
  readonly dietaryTags = computed(() => {
    const labels: Record<string, string> = {
      vegetarian: 'Vegetarian',
      vegetarisch: 'Vegetarian',
      vegan: 'Vegan',
      keto: 'Keto',
    };

    return this.recipe()
      ? this.recipe()!.tags
          .map(tag => labels[tag.toLowerCase()])
          .filter((tag): tag is string => Boolean(tag))
          .slice(0, 1)
      : [];
  });

  /** Kochnummern, die tatsächlich in den Schritten vorkommen — bestimmt One-Cook- vs. Two/Three-Chef-Ansicht. */
  readonly participatingChefs = computed(() => {
    const recipe = this.recipe();
    if (!recipe) return [];
    return [...new Set(recipe.steps.map(step => step.chef))].sort((a, b) => a - b);
  });

  readonly hasMultipleChefs = computed(() => this.participatingChefs().length > 1);

  /** Lokaler Favoriten-Zustand. TODO: sobald Firebase angebunden ist, hier persistieren. */
  readonly isFavorited = signal(false);
  readonly ingredientsOpen = signal(false);
  readonly directionsOpen = signal(false);

  constructor() {
    if (!this.recipeId || !this.recipe()) {
      void this.router.navigate(['/results']);
    }
  }

  chefIcon(chef: ChefNumber): string | null {
    return CHEF_ICONS[chef] ?? null;
  }

  formatIngredientAmount(ingredient: Ingredient): string {
    const compactUnits: Record<string, string> = {
      gram: 'g',
      grams: 'g',
      kilogram: 'kg',
      kilograms: 'kg',
      ml: 'ml',
      l: 'l',
    };
    const compactUnit = compactUnits[ingredient.unit.toLowerCase()];
    return compactUnit
      ? `${ingredient.amount}${compactUnit}`
      : `${ingredient.amount} ${ingredient.unit}`;
  }

  toggleFavorite(): void {
    const recipe = this.recipe();
    if (!recipe) return;

    const delta = this.isFavorited() ? -1 : 1;
    this.isFavorited.update(favorited => !favorited);
    this.recipeService.updateLikes(recipe.id, delta);
  }

  toggleIngredients(): void {
    this.ingredientsOpen.update(open => !open);
  }

  toggleDirections(): void {
    this.directionsOpen.update(open => !open);
  }
}
