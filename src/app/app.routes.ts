import { Routes } from '@angular/router';

import { Home } from './shared/components/home/home';
import { GenerateRecipe } from './shared/components/generate-recipe/generate-recipe';
import { Preferences } from './shared/components/preferences/preferences';

export const routes: Routes = [
  {
    path: '',
    component: Home,
  },
  {
    path: 'generate',
    component: GenerateRecipe,
  },
  {
    path: 'preferences',
    component: Preferences,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
