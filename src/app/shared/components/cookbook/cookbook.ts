import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

interface CuisineCard {
  slug: string;
  name: string;
  emoji: string;
  image: string;
  mobileImage?: string;
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
      id: 'italian-spinach-tomato-pasta',
      title: 'Pasta with spinach and cherry tomatoes',
      cookingTime: 20,
      likes: 66,
    },
    {
      id: 'gourmet-truffle-tagliatelle',
      title: 'Low Carb Vegan No-Bake Paleo Bars',
      cookingTime: 35,
      likes: 57,
    },
    {
      id: 'german-schnitzel-potato-salad',
      title: 'Schnitzel with warm potato salad',
      cookingTime: 45,
      likes: 49,
    },
  ];

  readonly cuisines: CuisineCard[] = [
    { slug: 'italian', name: 'Italian cuisine', emoji: '🍕', image: 'imgs/Italien.svg' },
    { slug: 'german', name: 'German cuisine', emoji: '🥨', image: 'imgs/German.svg' },
    { slug: 'japanese', name: 'Japanese cuisine', emoji: '🥢', image: 'imgs/Japanese.svg' },
    { slug: 'gourmet', name: 'Gourmet cuisine', emoji: '✨', image: 'imgs/Gourmet.svg' },
    { slug: 'indian', name: 'Indian cuisine', emoji: '🍛', image: 'imgs/Indian.svg' },
    { slug: 'fusion', name: 'Fusion cuisine', emoji: '🍢', image: 'imgs/Fusion.svg' },
  ];

  /** Returns the mobile-optimized hero image for a cuisine, falling back to the desktop one. */
  mobileImage(cuisine: CuisineCard): string {
    const images: Record<string, string> = {
      italian: 'imgs/italien-mobile.svg',
      german: 'imgs/German-mobile.svg',
      japanese: 'imgs/japanese-mobile.svg',
      gourmet: 'imgs/gourmet-mobile.svg',
      indian: 'imgs/indian-mobile.svg',
      fusion: 'imgs/fusion-mobile.svg',
    };
    return images[cuisine.slug] ?? cuisine.image;
  }
}
