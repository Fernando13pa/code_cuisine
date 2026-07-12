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

  ngOnInit(): void {
    void this.generateRecipes();
  }

  async retry(): Promise<void> {
    this.showInsufficientIngredientsDialog.set(false);
    await this.generateRecipes();
  }

  closeInsufficientIngredientsDialog(): void {
    this.showInsufficientIngredientsDialog.set(false);
  }

  private async generateRecipes(): Promise<void> {
    if (
      this.recipeService.ingredients().length === 0
      || this.recipeService.hasInsufficientIngredientsForOverlay()
    ) {
      this.showInsufficientIngredientsDialog.set(true);
      return;
    }

    await this.recipeService.generate();

    if (this.recipeService.results().length > 0) {
      await this.router.navigate(['/results']);
    }
  }
}
