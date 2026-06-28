import { Component, inject } from '@angular/core';
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

  /** Indicates whether the full-screen landing page is currently active. */
  protected get isHomePage(): boolean {
    return this.router.url === '/';
  }
}
