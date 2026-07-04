import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface CuisineCard {
  name: string;
  emoji: string;
  image: string;
}

interface PopularRecipe {
  id: string;
  title: string;
  cookingTime: number;
  likes: number;
}

@Component({
  selector: 'app-cookbook',
  imports: [RouterLink],
  templateUrl: './cookbook.html',
  styleUrl: './cookbook.scss',
})
export class Cookbook {
  readonly popularRecipes: PopularRecipe[] = [
    {
      id: 'pasta-spinach-tomatoes',
      title: 'Pasta with spinach and cherry tomatoes',
      cookingTime: 20,
      likes: 66,
    },
    {
      id: 'vegan-paleo-bars',
      title: 'Low Carb Vegan No-Bake Paleo Bars',
      cookingTime: 35,
      likes: 57,
    },
    {
      id: 'schnitzel-potato-salad',
      title: 'Schnitzel with warm potato salad',
      cookingTime: 45,
      likes: 49,
    },
  ];

  readonly cuisines: CuisineCard[] = [
    { name: 'Italian cuisine', emoji: '🍕', image: '/imgs/Italien.svg' },
    { name: 'German cuisine', emoji: '🥨', image: '/imgs/German.svg' },
    { name: 'Japanese cuisine', emoji: '🥢', image: '/imgs/Japanese.svg' },
    { name: 'Gourmet cuisine', emoji: '✨', image: '/imgs/Gourmet.svg' },
    { name: 'Indian cuisine', emoji: '🍛', image: '/imgs/Indian.svg' },
    { name: 'Fusion cuisine', emoji: '🍢', image: '/imgs/Fusion.svg' },
  ];
}
