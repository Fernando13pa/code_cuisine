import { Component, computed, inject } from '@angular/core';
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

  protected readonly cuisineLabel = computed(
    () => this.recipeService.preferences().cuisine ?? this.recipeService.results()[0]?.cuisine,
  );

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
