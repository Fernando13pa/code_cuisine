import { Component, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { RecipeService } from '../../services/recipe';

@Component({
  selector: 'app-results',
  imports: [RouterLink],
  templateUrl: './results.html',
  styleUrl: './results.scss',
})
export class Results {
  protected readonly recipeService = inject(RecipeService);

  /** Recipe ids whose AI image failed to load — their card falls back to the text-only layout. */
  private readonly brokenImages = signal(new Set<string>());

  /** True while a recipe has a usable image URL that hasn't errored out. */
  protected showsImage(recipeId: string, imageUrl: string | undefined): boolean {
    return !!imageUrl && !this.brokenImages().has(recipeId);
  }

  /** Drops a recipe's image after a load error so the card stays clean instead of showing a broken icon. */
  protected onImageError(recipeId: string): void {
    this.brokenImages.update(ids => new Set(ids).add(recipeId));
  }

  /** The selected cuisine, falling back to the first generated recipe's cuisine. */
  protected readonly cuisineLabel = computed(
    () => this.recipeService.preferences().cuisine ?? this.recipeService.results()[0]?.cuisine,
  );

  /** The selected cooking time, or one derived from the first recipe's actual duration. */
  protected readonly timeLabel = computed(() => {
    const selected = this.recipeService.preferences().cookingTime;
    if (selected) return selected;

    const minutes = this.recipeService.results()[0]?.cookingTime;
    if (!minutes) return null;
    if (minutes <= 20) return 'Quick';
    if (minutes <= 45) return 'Medium';
    return 'Complex';
  });
}
