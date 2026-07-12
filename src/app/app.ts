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

  /** Full-bleed green pages render underneath the transparent cream header. */
  protected get isImmersivePage(): boolean {
    return this.isHomePage || this.isLoadingPage || this.router.url === '/results';
  }
}
