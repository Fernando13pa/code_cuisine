import { Routes } from '@angular/router';

import { Home } from './shared/components/home/home';
import { GenerateRecipe } from './shared/components/generate-recipe/generate-recipe';
import { Preferences } from './shared/components/preferences/preferences';
import { Loading } from './shared/components/loading/loading';
import { Results } from './shared/components/results/results';

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
    path: 'loading',
    component: Loading,
  },
  {
    path: 'results',
    component: Results,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
