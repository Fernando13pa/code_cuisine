import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';

import { RecipeService } from '../../services/recipe';
import { ChefNumber } from '../../interfaces/recipe';

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
    () => this.recipeService.results().find(r => r.id === this.recipeId) ?? null,
  );

  readonly timeCategory = computed(() => {
    const recipe = this.recipe();
    return recipe ? timeCategoryLabel(recipe.cookingTime) : '';
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

  constructor() {
    if (!this.recipeId || !this.recipe()) {
      void this.router.navigate(['/results']);
    }
  }

  chefIcon(chef: ChefNumber): string | null {
    return CHEF_ICONS[chef] ?? null;
  }

  toggleFavorite(): void {
    const recipe = this.recipe();
    if (!recipe) return;

    const delta = this.isFavorited() ? -1 : 1;
    this.isFavorited.update(favorited => !favorited);
    this.recipeService.results.update(list =>
      list.map(r => (r.id === recipe.id ? { ...r, likes: r.likes + delta } : r)),
    );
  }
}
