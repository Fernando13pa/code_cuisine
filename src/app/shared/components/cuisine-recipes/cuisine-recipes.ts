import { Component, computed, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { RecipeService } from '../../services/recipe';

interface CuisineDefinition {
  name: string;
  illustration: string;
  mobileIllustration: string;
}

const CUISINES: Record<string, CuisineDefinition> = {
  italian: { name: 'Italian cuisine', illustration: 'imgs/illus-hero-italian.svg', mobileIllustration: 'imgs/illus-hero-italian-mobile.svg' },
  german: { name: 'German cuisine', illustration: 'imgs/illus-hero-german.svg', mobileIllustration: 'imgs/illus-hero-german-mobile.svg' },
  japanese: { name: 'Japanese cuisine', illustration: 'imgs/illus-hero-japanese.svg', mobileIllustration: 'imgs/illus-hero-japanese-mobile.svg' },
  gourmet: { name: 'Gourmet cuisine', illustration: 'imgs/illus-hero-gourmet.svg', mobileIllustration: 'imgs/illus-hero-gourmet-mobile.svg' },
  indian: { name: 'Indian cuisine', illustration: 'imgs/illus-hero-indian.svg', mobileIllustration: 'imgs/illus-hero-indian-mobile.svg' },
  fusion: { name: 'Fusion cuisine', illustration: 'imgs/illus-hero-fusion.svg', mobileIllustration: 'imgs/illus-hero-fusion-mobile.svg' },
};

const PAGE_SIZE = 15;

@Component({
  selector: 'app-cuisine-recipes',
  imports: [RouterLink],
  templateUrl: './cuisine-recipes.html',
  styleUrl: './cuisine-recipes.scss',
})
export class CuisineRecipes {
  private readonly route = inject(ActivatedRoute);
  private readonly recipeService = inject(RecipeService);
  protected readonly slug = this.route.snapshot.paramMap.get('cuisine') ?? 'italian';

  protected readonly cuisine = CUISINES[this.slug] ?? CUISINES['italian'];
  protected readonly recipes = this.recipeService.getCookbookRecipes(this.slug);

  protected readonly currentPage = signal(1);

  /** Total number of pages needed to show all of this cuisine's recipes. */
  protected readonly totalPages = computed(() => Math.max(1, Math.ceil(this.recipes.length / PAGE_SIZE)));

  /** The slice of recipes to show for the current page. */
  protected readonly pagedRecipes = computed(() => {
    const start = (this.currentPage() - 1) * PAGE_SIZE;
    return this.recipes.slice(start, start + PAGE_SIZE);
  });

  /** Compact page list with "…" gaps, e.g. [1,2,3,'…',8] — mirrors the Figma pagination reference. */
  protected readonly pageNumbers = computed<(number | '…')[]>(() => {
    const total = this.totalPages();
    const current = this.currentPage();
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);

    const pages = new Set([1, 2, 3, current - 1, current, current + 1, total]);
    const sorted = [...pages].filter(page => page >= 1 && page <= total).sort((a, b) => a - b);

    const result: (number | '…')[] = [];
    sorted.forEach((page, i) => {
      if (i > 0 && page - sorted[i - 1] > 1) result.push('…');
      result.push(page);
    });
    return result;
  });

  /** Moves to a page, clamped to the valid page range. */
  goToPage(page: number): void {
    this.currentPage.set(Math.min(Math.max(page, 1), this.totalPages()));
  }

  /** Moves to the previous page, if any. */
  previousPage(): void {
    this.goToPage(this.currentPage() - 1);
  }

  /** Moves to the next page, if any. */
  nextPage(): void {
    this.goToPage(this.currentPage() + 1);
  }
}
