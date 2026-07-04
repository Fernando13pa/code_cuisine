import { Routes } from '@angular/router';

import { Home } from './shared/components/home/home';
import { GenerateRecipe } from './shared/components/generate-recipe/generate-recipe';
import { Preferences } from './shared/components/preferences/preferences';
import { Loading } from './shared/components/loading/loading';
import { Results } from './shared/components/results/results';
import { RecipeDetail } from './shared/components/recipe-detail/recipe-detail';
import { Cookbook } from './shared/components/cookbook/cookbook';

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
    path: 'recipe/:id',
    component: RecipeDetail,
  },
  {
    path: 'cookbook',
    component: Cookbook,
  },
  {
    path: '**',
    redirectTo: '',
  },
];
