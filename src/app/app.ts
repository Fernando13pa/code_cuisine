import { Component, HostBinding, inject } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';

import { Header } from './layout/header/header';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Header],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  protected readonly router = inject(Router);

  @HostBinding('class.app-root--generate')
  protected get isGenerateRoot(): boolean {
    return this.isGeneratePage;
  }

  @HostBinding('class.app-root--preferences')
  protected get isPreferencesRoot(): boolean {
    return this.isPreferencesPage;
  }

  @HostBinding('class.app-root--loading')
  protected get isLoadingRoot(): boolean {
    return this.isLoadingPage;
  }

  @HostBinding('class.app-root--recipe-detail')
  protected get isRecipeDetailRoot(): boolean {
    return this.isRecipeDetailPage;
  }

  @HostBinding('class.app-root--cuisine-recipes')
  protected get isCuisineRecipesRoot(): boolean {
    return this.isCuisineRecipesPage;
  }

  @HostBinding('class.app-root--results')
  protected get isResultsRoot(): boolean {
    return this.router.url === '/results';
  }

  /** Indicates whether the full-screen landing page is currently active. */
  protected get isHomePage(): boolean {
    return this.router.url === '/';
  }

  /** Standard header pages need their content area to subtract the header height. */
  protected get isGeneratePage(): boolean {
    return this.router.url === '/generate';
  }

  /** Preferences also uses a natural-height standard page layout. */
  protected get isPreferencesPage(): boolean {
    return this.router.url === '/preferences';
  }

  /** Loading keeps the immersive background but uses adjusted header spacing. */
  protected get isLoadingPage(): boolean {
    return this.router.url === '/loading';
  }

  /** Recipe Detail uses its own header spacing regardless of which recipe is shown. */
  protected get isRecipeDetailPage(): boolean {
    return this.router.url.startsWith('/recipe/');
  }

  /** Matches any /cookbook/:cuisine page, but not the /cookbook index itself. */
  protected get isCuisineRecipesPage(): boolean {
    return /^\/cookbook\/[^/]+/.test(this.router.url);
  }

  /** Full-bleed green pages render underneath the transparent cream header. */
  protected get isImmersivePage(): boolean {
    return this.isHomePage || this.isLoadingPage || this.router.url === '/results';
  }
}
