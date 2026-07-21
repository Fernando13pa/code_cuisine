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

/** Normalizes ingredient names enough to compare user input with recipe output. */
function normalizeIngredientName(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\([^)]*\)/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/** True when two ingredient names are close enough to count as the same item. */
function ingredientNamesMatch(a: string, b: string): boolean {
  const first = normalizeIngredientName(a);
  const second = normalizeIngredientName(b);
  if (!first || !second) return false;
  return first === second || first.includes(second) || second.includes(first);
}

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

  /** Ingredients the user actually entered on the Generate page. */
  private readonly enteredIngredients = computed(() =>
    this.recipeService.ingredients().filter(
      ingredient =>
        ingredient.name.trim().length > 0
        && Number.isFinite(ingredient.amount)
        && ingredient.amount > 0,
    ),
  );

  /** True when this detail page can use the user's Generate-page ingredient list. */
  readonly usesEnteredIngredients = computed(() => this.enteredIngredients().length > 0);

  /** Ingredients shown under "Your ingredients". */
  readonly yourIngredients = computed(() => {
    const recipe = this.recipe();
    if (!recipe) return [];

    const entered = this.enteredIngredients();
    return this.usesEnteredIngredients() ? entered : recipe.ingredients;
  });

  /** Ingredients shown under "Extra ingredients". */
  readonly extraIngredients = computed(() => {
    const recipe = this.recipe();
    if (!recipe) return [];

    const entered = this.enteredIngredients();
    if (!this.usesEnteredIngredients()) return recipe.extraIngredients;

    const recipeExtras = recipe.ingredients.filter(
      recipeIngredient =>
        !entered.some(enteredIngredient =>
          ingredientNamesMatch(recipeIngredient.name, enteredIngredient.name),
        ),
    );

    return [...recipeExtras, ...recipe.extraIngredients];
  });

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

  /** Whether this browser already favorited the current recipe, restored from localStorage. */
  readonly isFavorited = computed(() => {
    const recipe = this.recipe();
    return recipe ? this.recipeService.isFavorited(recipe.id) : false;
  });

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
      g: 'g',
      gram: 'g',
      grams: 'g',
      gramm: 'g',
      kilogram: 'kg',
      kilograms: 'kg',
      kg: 'kg',
      ml: 'ml',
      l: 'l',
      piece: '',
      pieces: '',
      stück: '',
      stueck: '',
      cloves: '',
    };
    const unit = ingredient.unit.toLowerCase();
    const compactUnit = compactUnits[unit];

    if (Object.hasOwn(compactUnits, unit)) {
      return compactUnit
      ? `${ingredient.amount}${compactUnit}`
      : `${ingredient.amount}`;
    }

    return `${ingredient.amount} ${ingredient.unit}`;
  }

  /** Keeps the ingredient label clean for display, e.g. removes examples like "(z.B. Penne)". */
  formatIngredientName(ingredient: Ingredient): string {
    return ingredient.name
      .replace(/\((?:z\.?\s*b\.?|e\.?\s*g\.?|for example)[^)]*\)/gi, '')
      .replace(/\s+\d+\s*$/g, '')
      .replace(/\s{2,}/g, ' ')
      .trim();
  }

  /** Toggles the favorite state; the service keeps the like count and saved choice in sync. */
  toggleFavorite(): void {
    const recipe = this.recipe();
    if (!recipe) return;
    this.recipeService.toggleFavorite(recipe.id);
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
