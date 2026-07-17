import { Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { RecipeService } from '../../services/recipe';

@Component({
  selector: 'app-loading',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './loading.html',
  styleUrl: './loading.scss',
})
export class Loading implements OnInit {
  private readonly router = inject(Router);
  protected readonly recipeService = inject(RecipeService);
  protected readonly showInsufficientIngredientsDialog = signal(false);

  /** Kicks off recipe generation as soon as this page loads. */
  ngOnInit(): void {
    void this.generateRecipes();
  }

  /** Retries generation after the user dismisses the insufficient-ingredients dialog. */
  async retry(): Promise<void> {
    this.showInsufficientIngredientsDialog.set(false);
    await this.generateRecipes();
  }

  /** Hides the insufficient-ingredients dialog without retrying. */
  closeInsufficientIngredientsDialog(): void {
    this.showInsufficientIngredientsDialog.set(false);
  }

  /** True when there are no ingredients, or not enough of them, to generate from. */
  private ingredientsAreInsufficient(): boolean {
    return this.recipeService.ingredients().length === 0
      || this.recipeService.hasInsufficientIngredientsForOverlay();
  }

  /** Calls n8n for recipes and navigates to Results, or shows the insufficient-ingredients dialog. */
  private async generateRecipes(): Promise<void> {
    if (this.ingredientsAreInsufficient()) {
      this.showInsufficientIngredientsDialog.set(true);
      return;
    }

    await this.recipeService.generate();

    if (this.recipeService.results().length > 0) {
      await this.router.navigate(['/results']);
    }
  }
}
