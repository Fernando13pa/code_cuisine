import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';

import { RecipeService } from '../../services/recipe';

@Component({
  selector: 'app-loading',
  templateUrl: './loading.html',
  styleUrl: './loading.scss',
})
export class Loading implements OnInit {
  private readonly router = inject(Router);
  protected readonly recipeService = inject(RecipeService);

  ngOnInit(): void {
    void this.generateRecipes();
  }

  async retry(): Promise<void> {
    await this.generateRecipes();
  }

  private async generateRecipes(): Promise<void> {
    await this.recipeService.generate();

    if (this.recipeService.results().length > 0) {
      await this.router.navigate(['/results']);
    }
  }
}
