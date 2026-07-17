import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { RecipeService } from '../../services/recipe';
import { ChefNumber } from '../../interfaces/recipe';
import { Ingredient } from '../../interfaces/ingredient';

/** Buckets a cooking duration into the app's three time categories. */
function timeCategoryLabel(minutes: number): string {
  if (minutes <= 20) return 'Quick';
  if (minutes <= 45) return 'Medium';
  return 'Complex';
}

const CHEF_ICONS: Partial<Record<ChefNumber, string>> = {
  1: 'assets/icon-chef-1.svg',
  2: 'assets/icon-chef-2.svg',
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

  /** The recipe being viewed, looked up by the route's id param. */
  readonly recipe = computed(
    () => this.recipeService.getRecipeById(this.recipeId),
  );

  /** Route to go back to. */
  readonly backLink = computed(() => ['/results']);

  /** Label for the back link. */
  readonly backLabel = computed(() => 'Recipe results');

  /** Only shown when the AI hasn't already supplied an equivalent tag (e.g. "quick"). */
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

  /** Chef numbers that actually appear in the steps — determines the one-chef vs. two/three-chef view. */
  readonly participatingChefs = computed(() => {
    const recipe = this.recipe();
    if (!recipe) return [];
    return [...new Set(recipe.steps.map(step => step.chef))].sort((a, b) => a - b);
  });

  /** True when more than one chef is involved in this recipe's steps. */
  readonly hasMultipleChefs = computed(() => this.participatingChefs().length > 1);

  /** Local favorite state. TODO: persist here once Firebase is connected. */
  readonly isFavorited = signal(false);
  readonly ingredientsOpen = signal(false);
  readonly directionsOpen = signal(false);

  /** Redirects back to Results if this recipe id doesn't exist. */
  constructor() {
    if (!this.recipeId || !this.recipe()) {
      void this.router.navigate(['/results']);
    }
  }

  /** Icon for a given chef number, or null when there's none (e.g. chef 3). */
  chefIcon(chef: ChefNumber): string | null {
    return CHEF_ICONS[chef] ?? null;
  }

  /** Formats an ingredient's amount with a compact unit, e.g. "200g". */
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

  /** Toggles the favorite state and updates the recipe's like count accordingly. */
  toggleFavorite(): void {
    const recipe = this.recipe();
    if (!recipe) return;

    const delta = this.isFavorited() ? -1 : 1;
    this.isFavorited.update(favorited => !favorited);
    this.recipeService.updateLikes(recipe.id, delta);
  }

  /** Expands or collapses the ingredients section. */
  toggleIngredients(): void {
    this.ingredientsOpen.update(open => !open);
  }

  /** Expands or collapses the directions section. */
  toggleDirections(): void {
    this.directionsOpen.update(open => !open);
  }
}
