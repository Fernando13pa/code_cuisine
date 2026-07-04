import { Component, inject } from '@angular/core';
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
}
