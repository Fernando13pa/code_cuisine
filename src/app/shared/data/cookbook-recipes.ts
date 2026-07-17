import { Ingredient } from '../interfaces/ingredient';
import { NutritionalInfo, Recipe, RecipeStep } from '../interfaces/recipe';

type Input = {
  id: string; title: string; cuisine: string; time: number; tags: string[]; likes: number;
  kcal: number; ingredients: Array<[string, number, string]>; steps: string[];
};

/** Curated demo steps only carry a description string; derive a short title heuristically. */
const deriveStepTitle = (description: string): string => {
  const words = description.replace(/\.$/, '').split(' ');
  return words.length <= 5 ? words.join(' ') : `${words.slice(0, 5).join(' ')}…`;
};

/** Fakes a plausible macro breakdown from a single kcal figure. */
const deriveNutritionalInfo = (kcal: number): NutritionalInfo => ({
  energyPerPortion: kcal, proteinPerPortion: Math.round(kcal / 18),
  fatPerPortion: Math.round(kcal / 28), carbsPerPortion: Math.round(kcal / 9),
  energyTotal: kcal * 2, proteinTotal: Math.round(kcal / 9),
  fatTotal: Math.round(kcal / 14), carbsTotal: Math.round(kcal / 4.5),
});

/** Turns the compact `[name, amount, unit]` tuples into full Ingredient objects. */
const toDemoIngredients = (id: string, ingredients: Input['ingredients']): Ingredient[] =>
  ingredients.map(([name, amount, unit], i) => ({ id: `${id}-${i}`, name, amount, unit }));

/** Turns plain step descriptions into RecipeSteps, alternating chef 1/2. */
const toDemoSteps = (descriptions: string[]): RecipeStep[] =>
  descriptions.map((description, i) => ({
    number: i + 1,
    title: deriveStepTitle(description),
    description,
    chef: i % 2 === 0 ? 1 : 2,
    isParallel: false,
  }));

/** Builds a full Recipe from the compact curated/filler recipe shorthand. */
const makeRecipe = (r: Input): Recipe => ({
  id: r.id, title: r.title, cuisine: r.cuisine, cookingTime: r.time, tags: r.tags, likes: r.likes,
  missingIngredientsNote: '',
  nutritionalInfo: deriveNutritionalInfo(r.kcal),
  ingredients: toDemoIngredients(r.id, r.ingredients),
  extraIngredients: [],
  steps: toDemoSteps(r.steps),
});

const CURATED_RECIPES: Recipe[] = [
  makeRecipe({ id: 'italian-spinach-tomato-pasta', title: 'Pasta with spinach and cherry tomatoes', cuisine: 'Italian', time: 20, tags: ['Vegetarian', 'Quick'], likes: 66, kcal: 510,
    ingredients: [['spaghetti', 200, 'gram'], ['baby spinach', 120, 'gram'], ['cherry tomatoes', 250, 'gram'], ['parmesan', 40, 'gram']],
    steps: ['Cook the spaghetti in salted water until al dente.', 'Sauté halved tomatoes with garlic and olive oil for 4 minutes.', 'Add the spinach and a splash of pasta water.', 'Toss with the spaghetti and finish with parmesan.'] }),
  makeRecipe({ id: 'italian-garlic-shrimp-pasta', title: 'Creamy garlic shrimp pasta', cuisine: 'Italian', time: 22, tags: ['Quick'], likes: 32, kcal: 620,
    ingredients: [['linguine', 200, 'gram'], ['peeled shrimp', 250, 'gram'], ['cooking cream', 180, 'ml'], ['garlic cloves', 3, 'piece']],
    steps: ['Cook the linguine until al dente.', 'Sear the shrimp for 2 minutes per side and set aside.', 'Gently cook garlic, add cream and simmer until smooth.', 'Return shrimp and pasta to the pan and toss until coated.'] }),
  makeRecipe({ id: 'italian-funghi-salami-pizza', title: 'Funghi salami pizza', cuisine: 'Italian', time: 30, tags: ['Traditional'], likes: 42, kcal: 740,
    ingredients: [['pizza dough', 400, 'gram'], ['tomato passata', 150, 'ml'], ['mozzarella', 180, 'gram'], ['mushrooms and salami', 250, 'gram']],
    steps: ['Heat the oven and a baking tray to 240°C.', 'Stretch the dough and spread it with passata.', 'Top with mozzarella, sliced mushrooms and salami.', 'Bake for 10–12 minutes until crisp and bubbling.'] }),
  makeRecipe({ id: 'italian-margherita-pizza', title: 'Classic margherita pizza', cuisine: 'Italian', time: 18, tags: ['Vegetarian', 'Quick'], likes: 71, kcal: 680,
    ingredients: [['pizza dough', 400, 'gram'], ['tomato passata', 150, 'ml'], ['mozzarella', 200, 'gram'], ['fresh basil', 15, 'gram']],
    steps: ['Heat the oven and a baking tray to 240°C.', 'Stretch the dough and spread it with passata.', 'Top with torn mozzarella.', 'Bake for 10 minutes, then finish with fresh basil.'] }),
  makeRecipe({ id: 'italian-pesto-gnocchi', title: 'Basil pesto gnocchi', cuisine: 'Italian', time: 15, tags: ['Vegetarian', 'Quick'], likes: 45, kcal: 590,
    ingredients: [['potato gnocchi', 500, 'gram'], ['fresh basil', 50, 'gram'], ['pine nuts', 30, 'gram'], ['parmesan', 50, 'gram']],
    steps: ['Bring a pot of salted water to the boil.', 'Blend basil, pine nuts, parmesan and olive oil into a pesto.', 'Cook the gnocchi until they float, about 2 minutes.', 'Toss the gnocchi with the pesto and a splash of cooking water.'] }),
  makeRecipe({ id: 'italian-caprese-chicken', title: 'Caprese chicken skillet', cuisine: 'Italian', time: 25, tags: ['Quick'], likes: 39, kcal: 520,
    ingredients: [['chicken breast', 2, 'piece'], ['cherry tomatoes', 200, 'gram'], ['mozzarella', 150, 'gram'], ['balsamic glaze', 2, 'tbsp']],
    steps: ['Season and pan-fry the chicken until golden and cooked through.', 'Add the halved cherry tomatoes and cook for 2 minutes.', 'Top the chicken with mozzarella and let it melt.', 'Drizzle with balsamic glaze and fresh basil before serving.'] }),

  makeRecipe({ id: 'german-schnitzel-potato-salad', title: 'Schnitzel with warm potato salad', cuisine: 'German', time: 45, tags: ['Traditional'], likes: 49, kcal: 690,
    ingredients: [['pork cutlets', 2, 'piece'], ['potatoes', 500, 'gram'], ['breadcrumbs', 100, 'gram'], ['vegetable stock', 120, 'ml']],
    steps: ['Boil, peel and slice the potatoes.', 'Dress them with warm stock, vinegar and mustard.', 'Flatten and coat the cutlets in flour, egg and breadcrumbs.', 'Shallow-fry until golden and serve with the salad.'] }),
  makeRecipe({ id: 'german-mushroom-spaetzle', title: 'Creamy mushroom spaetzle', cuisine: 'German', time: 35, tags: ['Vegetarian'], likes: 38, kcal: 570,
    ingredients: [['spaetzle', 350, 'gram'], ['mixed mushrooms', 300, 'gram'], ['cooking cream', 180, 'ml'], ['onion', 1, 'piece']],
    steps: ['Cook the spaetzle and drain.', 'Brown the mushrooms, then soften the diced onion.', 'Add cream and a little stock and simmer until thick.', 'Fold through the spaetzle and finish with parsley.'] }),
  makeRecipe({ id: 'german-rustic-lentil-stew', title: 'Rustic lentil stew', cuisine: 'German', time: 40, tags: ['Vegan'], likes: 44, kcal: 430,
    ingredients: [['brown lentils', 220, 'gram'], ['potatoes', 300, 'gram'], ['carrots', 2, 'piece'], ['vegetable stock', 900, 'ml']],
    steps: ['Rinse the lentils and dice the vegetables.', 'Sauté the carrots and leek until softened.', 'Add lentils, potatoes and stock and simmer for 30 minutes.', 'Season with mustard, salt and pepper.'] }),
  makeRecipe({ id: 'german-bratwurst-sauerkraut', title: 'Bratwurst with sauerkraut', cuisine: 'German', time: 25, tags: ['Traditional', 'Quick'], likes: 53, kcal: 640,
    ingredients: [['bratwurst', 4, 'piece'], ['sauerkraut', 400, 'gram'], ['potatoes', 400, 'gram'], ['mustard', 2, 'tbsp']],
    steps: ['Boil the potatoes until tender.', 'Pan-fry the bratwurst until browned on all sides.', 'Warm the sauerkraut in a pan with a splash of stock.', 'Serve the bratwurst with sauerkraut, potatoes and mustard.'] }),
  makeRecipe({ id: 'german-potato-leek-soup', title: 'Potato leek soup', cuisine: 'German', time: 30, tags: ['Vegetarian'], likes: 34, kcal: 380,
    ingredients: [['potatoes', 500, 'gram'], ['leek', 2, 'piece'], ['vegetable stock', 800, 'ml'], ['cream', 100, 'ml']],
    steps: ['Soften the sliced leek in butter.', 'Add diced potatoes and stock and simmer for 20 minutes.', 'Blend until smooth.', 'Stir in the cream and season to taste.'] }),
  makeRecipe({ id: 'german-apple-red-cabbage', title: 'Apple red cabbage skillet', cuisine: 'German', time: 35, tags: ['Vegan'], likes: 29, kcal: 340,
    ingredients: [['red cabbage', 600, 'gram'], ['apples', 2, 'piece'], ['red wine vinegar', 30, 'ml'], ['onion', 1, 'piece']],
    steps: ['Sauté the diced onion until soft.', 'Add the shredded cabbage and cook for 5 minutes.', 'Add diced apples, vinegar and a splash of water.', 'Cover and simmer for 25 minutes, stirring occasionally.'] }),

  makeRecipe({ id: 'japanese-salmon-sushi-bowl', title: 'Salmon avocado sushi bowl', cuisine: 'Japanese', time: 25, tags: ['Quick'], likes: 58, kcal: 590,
    ingredients: [['sushi rice', 180, 'gram'], ['salmon fillet', 240, 'gram'], ['avocado', 1, 'piece'], ['cucumber', 1, 'piece']],
    steps: ['Cook the sushi rice and season with rice vinegar.', 'Cut the salmon, avocado and cucumber into pieces.', 'Divide the rice between two bowls.', 'Arrange the toppings and drizzle with soy sauce.'] }),
  makeRecipe({ id: 'japanese-vegetable-miso-ramen', title: 'Miso ramen with vegetables', cuisine: 'Japanese', time: 35, tags: ['Vegetarian'], likes: 52, kcal: 480,
    ingredients: [['ramen noodles', 200, 'gram'], ['vegetable stock', 900, 'ml'], ['miso paste', 3, 'tbsp'], ['shiitake and pak choi', 300, 'gram']],
    steps: ['Simmer the shiitake in the stock for 8 minutes.', 'Whisk miso with warm stock and return it to the pot.', 'Add pak choi and cook the noodles separately.', 'Divide noodles into bowls and ladle over the broth.'] }),
  makeRecipe({ id: 'japanese-teriyaki-tofu-donburi', title: 'Teriyaki tofu donburi', cuisine: 'Japanese', time: 30, tags: ['Vegan'], likes: 47, kcal: 520,
    ingredients: [['firm tofu', 300, 'gram'], ['jasmine rice', 180, 'gram'], ['broccoli', 250, 'gram'], ['soy sauce', 3, 'tbsp']],
    steps: ['Cook the rice and steam the broccoli.', 'Cube and pan-fry the tofu until crisp.', 'Add soy sauce, ginger and maple syrup and reduce until glossy.', 'Serve the teriyaki tofu over rice with broccoli.'] }),
  makeRecipe({ id: 'japanese-chicken-katsu-curry', title: 'Chicken katsu curry', cuisine: 'Japanese', time: 35, tags: ['Quick'], likes: 60, kcal: 710,
    ingredients: [['chicken breast', 2, 'piece'], ['panko breadcrumbs', 100, 'gram'], ['curry roux', 100, 'gram'], ['jasmine rice', 180, 'gram']],
    steps: ['Cook the rice.', 'Coat the chicken in flour, egg and panko, then fry until golden.', 'Simmer the curry roux with stock until thickened.', 'Slice the katsu and serve over rice with curry sauce.'] }),
  makeRecipe({ id: 'japanese-vegetable-yakisoba', title: 'Vegetable yakisoba', cuisine: 'Japanese', time: 20, tags: ['Vegetarian', 'Quick'], likes: 41, kcal: 460,
    ingredients: [['yakisoba noodles', 300, 'gram'], ['cabbage', 200, 'gram'], ['carrot', 1, 'piece'], ['yakisoba sauce', 60, 'ml']],
    steps: ['Blanch the noodles briefly and drain.', 'Stir-fry the cabbage and carrot until just tender.', 'Add the noodles and sauce and toss over high heat.', 'Serve hot, topped with pickled ginger.'] }),
  makeRecipe({ id: 'japanese-miso-eggplant', title: 'Miso glazed eggplant', cuisine: 'Japanese', time: 25, tags: ['Vegan'], likes: 37, kcal: 320,
    ingredients: [['eggplant', 2, 'piece'], ['white miso paste', 2, 'tbsp'], ['mirin', 2, 'tbsp'], ['sesame seeds', 10, 'gram']],
    steps: ['Halve the eggplants and score the flesh.', 'Pan-fry cut-side down until golden.', 'Whisk miso, mirin and a little sugar into a glaze.', 'Brush with the glaze and grill until caramelized.'] }),

  makeRecipe({ id: 'gourmet-herb-crusted-salmon', title: 'Herb-crusted salmon with purée', cuisine: 'Gourmet', time: 50, tags: ['Gourmet'], likes: 61, kcal: 650,
    ingredients: [['salmon fillets', 2, 'piece'], ['potatoes', 450, 'gram'], ['fresh herbs', 30, 'gram'], ['breadcrumbs', 60, 'gram']],
    steps: ['Boil the potatoes and mash them with butter until silky.', 'Combine chopped herbs, breadcrumbs and softened butter.', 'Press the crust onto the salmon and bake for 15 minutes.', 'Plate the salmon with the purée and seasonal greens.'] }),
  makeRecipe({ id: 'gourmet-wild-mushroom-risotto', title: 'Wild mushroom risotto', cuisine: 'Gourmet', time: 45, tags: ['Vegetarian'], likes: 55, kcal: 590,
    ingredients: [['arborio rice', 200, 'gram'], ['wild mushrooms', 300, 'gram'], ['vegetable stock', 800, 'ml'], ['parmesan', 60, 'gram']],
    steps: ['Keep the stock at a gentle simmer and brown the mushrooms.', 'Toast the rice with a softened shallot.', 'Add stock one ladle at a time while stirring.', 'Fold in mushrooms and parmesan when the rice is al dente.'] }),
  makeRecipe({ id: 'gourmet-beef-red-wine', title: 'Beef medallions with red wine sauce', cuisine: 'Gourmet', time: 60, tags: ['Gourmet'], likes: 69, kcal: 710,
    ingredients: [['beef medallions', 2, 'piece'], ['red wine', 250, 'ml'], ['beef stock', 200, 'ml'], ['potatoes', 400, 'gram']],
    steps: ['Roast seasoned potato wedges until golden.', 'Sear the beef to your preferred doneness and rest it.', 'Deglaze the pan with wine, add stock and reduce by half.', 'Whisk butter into the sauce and serve with the beef.'] }),
  makeRecipe({ id: 'gourmet-duck-cherry-sauce', title: 'Duck breast with cherry sauce', cuisine: 'Gourmet', time: 40, tags: ['Gourmet'], likes: 58, kcal: 680,
    ingredients: [['duck breast', 2, 'piece'], ['cherries', 200, 'gram'], ['red wine', 150, 'ml'], ['thyme', 1, 'piece']],
    steps: ['Score the duck skin and sear skin-side down until crisp.', 'Finish in the oven to your preferred doneness.', 'Deglaze the pan with wine and add the cherries.', 'Simmer the sauce until glossy and serve with the duck.'] }),
  makeRecipe({ id: 'gourmet-lobster-bisque', title: 'Lobster bisque', cuisine: 'Gourmet', time: 55, tags: ['Gourmet'], likes: 63, kcal: 420,
    ingredients: [['lobster shells', 400, 'gram'], ['tomato paste', 2, 'tbsp'], ['cream', 150, 'ml'], ['brandy', 30, 'ml']],
    steps: ['Roast the shells until fragrant.', 'Sauté with tomato paste, then deglaze with brandy.', 'Add stock and simmer for 30 minutes, then strain.', 'Stir in the cream and season to taste.'] }),
  makeRecipe({ id: 'gourmet-truffle-tagliatelle', title: 'Truffle tagliatelle', cuisine: 'Gourmet', time: 25, tags: ['Vegetarian', 'Gourmet'], likes: 66, kcal: 610,
    ingredients: [['tagliatelle', 220, 'gram'], ['truffle butter', 40, 'gram'], ['parmesan', 60, 'gram'], ['egg yolk', 2, 'piece']],
    steps: ['Cook the tagliatelle until al dente, reserving pasta water.', 'Melt the truffle butter with a splash of pasta water.', 'Toss the pasta with the butter, parmesan and egg yolk off the heat.', 'Finish with shaved truffle or extra parmesan.'] }),

  makeRecipe({ id: 'indian-chickpea-tikka-masala', title: 'Creamy chickpea tikka masala', cuisine: 'Indian', time: 35, tags: ['Vegetarian'], likes: 64, kcal: 540,
    ingredients: [['cooked chickpeas', 480, 'gram'], ['chopped tomatoes', 400, 'gram'], ['coconut milk', 250, 'ml'], ['basmati rice', 160, 'gram']],
    steps: ['Cook the basmati rice.', 'Soften onion and toast the tikka masala spices.', 'Add tomatoes and chickpeas and simmer for 15 minutes.', 'Stir in coconut milk and serve with rice.'] }),
  makeRecipe({ id: 'indian-vegetable-biryani', title: 'Fragrant vegetable biryani', cuisine: 'Indian', time: 45, tags: ['Vegan'], likes: 51, kcal: 490,
    ingredients: [['basmati rice', 200, 'gram'], ['cauliflower', 250, 'gram'], ['carrots and peas', 300, 'gram'], ['vegetable stock', 450, 'ml']],
    steps: ['Rinse and soak the rice for 15 minutes.', 'Brown the vegetables with biryani spices.', 'Add rice and stock, cover and cook on low for 18 minutes.', 'Rest for 8 minutes, then fluff gently.'] }),
  makeRecipe({ id: 'indian-red-lentil-dal', title: 'Red lentil dal with naan', cuisine: 'Indian', time: 30, tags: ['Vegan', 'Quick'], likes: 59, kcal: 510,
    ingredients: [['red lentils', 220, 'gram'], ['chopped tomatoes', 300, 'gram'], ['coconut milk', 200, 'ml'], ['naan breads', 2, 'piece']],
    steps: ['Rinse the lentils until the water runs clear.', 'Toast garam masala, then add tomatoes.', 'Add lentils and stock and simmer for 18 minutes.', 'Stir in coconut milk and serve with warm naan.'] }),
  makeRecipe({ id: 'indian-butter-chicken', title: 'Butter chicken', cuisine: 'Indian', time: 40, tags: ['Quick'], likes: 72, kcal: 640,
    ingredients: [['chicken thigh', 500, 'gram'], ['tomato passata', 300, 'ml'], ['cream', 120, 'ml'], ['basmati rice', 180, 'gram']],
    steps: ['Cook the basmati rice.', 'Marinate and pan-fry the chicken until browned.', 'Simmer with passata and butter chicken spices for 10 minutes.', 'Stir in the cream and serve over rice.'] }),
  makeRecipe({ id: 'indian-palak-paneer', title: 'Palak paneer', cuisine: 'Indian', time: 30, tags: ['Vegetarian'], likes: 55, kcal: 480,
    ingredients: [['paneer', 250, 'gram'], ['spinach', 400, 'gram'], ['onion', 1, 'piece'], ['cream', 60, 'ml']],
    steps: ['Blanch the spinach and blend until smooth.', 'Pan-fry the paneer cubes until lightly golden.', 'Sauté onion and spices, then add the spinach purée.', 'Fold in the paneer and cream and simmer briefly.'] }),
  makeRecipe({ id: 'indian-chana-masala', title: 'Chana masala', cuisine: 'Indian', time: 30, tags: ['Vegan', 'Quick'], likes: 50, kcal: 460,
    ingredients: [['cooked chickpeas', 480, 'gram'], ['chopped tomatoes', 300, 'gram'], ['onion', 1, 'piece'], ['basmati rice', 160, 'gram']],
    steps: ['Cook the basmati rice.', 'Sauté the onion until golden, then add the spices.', 'Add tomatoes and chickpeas and simmer for 15 minutes.', 'Serve hot with rice or naan.'] }),

  makeRecipe({ id: 'fusion-spicy-salmon-sushi-tacos', title: 'Sushi tacos with spicy salmon', cuisine: 'Fusion', time: 30, tags: ['Fusion'], likes: 56, kcal: 560,
    ingredients: [['salmon fillet', 240, 'gram'], ['small tortillas', 6, 'piece'], ['sushi rice', 160, 'gram'], ['avocado', 1, 'piece']],
    steps: ['Cook and season the sushi rice.', 'Dice salmon and mix with mayonnaise and sriracha.', 'Toast the tortillas and fold them into taco shapes.', 'Fill with rice, spicy salmon and avocado.'] }),
  makeRecipe({ id: 'fusion-korean-barbecue-burrito', title: 'Korean barbecue burrito', cuisine: 'Fusion', time: 40, tags: ['Fusion'], likes: 62, kcal: 730,
    ingredients: [['beef strips', 300, 'gram'], ['large tortillas', 2, 'piece'], ['cooked rice', 300, 'gram'], ['kimchi', 150, 'gram']],
    steps: ['Marinate the beef with soy sauce and sesame oil.', 'Sear the beef over high heat until browned.', 'Layer warm tortillas with rice, kimchi and beef.', 'Roll tightly and toast seam-side down.'] }),
  makeRecipe({ id: 'fusion-miso-pesto-pasta', title: 'Miso pesto pasta', cuisine: 'Fusion', time: 25, tags: ['Vegetarian', 'Quick'], likes: 48, kcal: 600,
    ingredients: [['pasta', 220, 'gram'], ['fresh basil', 40, 'gram'], ['white miso paste', 1, 'tbsp'], ['parmesan', 50, 'gram']],
    steps: ['Cook the pasta and reserve some cooking water.', 'Blend basil, miso, parmesan, cashews and olive oil.', 'Toss the pasta with pesto and enough water to make it glossy.', 'Taste, season carefully and finish with basil.'] }),
  makeRecipe({ id: 'fusion-kimchi-quesadilla', title: 'Kimchi cheese quesadilla', cuisine: 'Fusion', time: 15, tags: ['Vegetarian', 'Quick'], likes: 44, kcal: 540,
    ingredients: [['tortillas', 4, 'piece'], ['kimchi', 150, 'gram'], ['mozzarella', 180, 'gram'], ['spring onion', 2, 'piece']],
    steps: ['Chop the kimchi and slice the spring onion.', 'Scatter cheese, kimchi and spring onion over half of each tortilla.', 'Fold and pan-fry until golden and the cheese melts.', 'Slice into wedges and serve warm.'] }),
  makeRecipe({ id: 'fusion-curry-ramen-burger', title: 'Curry ramen burger', cuisine: 'Fusion', time: 30, tags: ['Fusion'], likes: 40, kcal: 690,
    ingredients: [['ramen noodles', 200, 'gram'], ['beef patties', 2, 'piece'], ['curry mayo', 3, 'tbsp'], ['cabbage slaw', 100, 'gram']],
    steps: ['Cook the ramen noodles, drain well and press into patty shapes, then chill.', 'Pan-fry the noodle patties until crisp on both sides.', 'Cook the beef patties to your liking.', 'Stack beef, slaw and curry mayo between the noodle buns.'] }),
  makeRecipe({ id: 'fusion-thai-basil-pasta', title: 'Thai basil pasta', cuisine: 'Fusion', time: 20, tags: ['Quick'], likes: 46, kcal: 570,
    ingredients: [['pasta', 220, 'gram'], ['ground chicken', 250, 'gram'], ['thai basil', 30, 'gram'], ['soy sauce', 2, 'tbsp']],
    steps: ['Cook the pasta until al dente.', 'Stir-fry the ground chicken with garlic and chili until browned.', 'Add soy sauce, fish sauce and a splash of pasta water.', 'Toss with the pasta and finish with torn Thai basil.'] }),
];

// ---------------------------------------------------------------------------
// Filler recipes: combinatorial variations (protein × sauce × carb) used to
// give the Cookbook a realistic, paginatable length per cuisine. These are
// placeholder browsing content, not AI-generated — kept apart from the
// hand-written CURATED_RECIPES above.
// ---------------------------------------------------------------------------

interface CuisineComponents {
  cuisine: string;
  proteins: string[];
  vegetarianProteins: Set<string>;
  carbs: string[];
  vegetables: string[];
  sauces: string[];
  pantryItem: string;
}

const capitalize = (word: string): string => word.charAt(0).toUpperCase() + word.slice(1);

interface FillerPick { protein: string; sauce: string; carb: string; vegetable: string; }
interface FillerStats { time: number; likes: number; kcal: number; }

/** Cycles through a cuisine's protein/sauce/carb/vegetable pools for filler recipe #i. */
function pickFillerIngredients(components: CuisineComponents, i: number): FillerPick {
  const { proteins, sauces, carbs, vegetables } = components;
  return {
    protein: proteins[i % proteins.length],
    sauce: sauces[Math.floor(i / proteins.length) % sauces.length],
    carb: carbs[Math.floor(i / (proteins.length * sauces.length)) % carbs.length],
    vegetable: vegetables[i % vegetables.length],
  };
}

/** Deterministic, varied-looking stats for filler recipe #i. */
function fillerStats(i: number): FillerStats {
  return {
    time: 15 + ((i * 7) % 40),
    likes: 20 + ((i * 13) % 70),
    kcal: 350 + ((i * 37) % 400),
  };
}

/** Tags derived from the picked protein and the cooking time. */
function fillerTags(pick: FillerPick, time: number, vegetarianProteins: Set<string>): string[] {
  const tags: string[] = [];
  if (vegetarianProteins.has(pick.protein)) tags.push('Vegetarian');
  if (time <= 20) tags.push('Quick');
  return tags;
}

/** The four-ingredient shorthand list for a filler recipe. */
function fillerIngredients(pick: FillerPick, pantryItem: string): Input['ingredients'] {
  const { carb, protein, vegetable } = pick;
  return [[carb, 250, 'gram'], [protein, 200, 'gram'], [vegetable, 150, 'gram'], [pantryItem, 2, 'tbsp']];
}

/** The four generic prep steps for a filler recipe. */
function fillerSteps(pick: FillerPick): string[] {
  const { carb, protein, vegetable, sauce } = pick;
  return [
    `Prepare the ${carb} according to the package instructions.`,
    `Cook the ${protein} until done, then season well.`,
    `Add the ${vegetable} and cook briefly until tender.`,
    `Stir through the ${sauce} sauce and serve warm.`,
  ];
}

/** Builds the makeRecipe() input for one filler recipe from its picks/stats/tags. */
function fillerRecipeInput(
  components: CuisineComponents, pick: FillerPick, stats: FillerStats, tags: string[], idPrefix: string, i: number,
): Input {
  const { cuisine, pantryItem } = components;
  return {
    id: `${idPrefix}-gen-${i + 1}`,
    title: `${capitalize(pick.sauce)} ${capitalize(pick.protein)} with ${capitalize(pick.carb)}`,
    cuisine, time: stats.time, tags, likes: stats.likes, kcal: stats.kcal,
    ingredients: fillerIngredients(pick, pantryItem),
    steps: fillerSteps(pick),
  };
}

/** Generates `count` synthetic filler recipes for a cuisine using its ingredient pools. */
function generateFillerRecipes(components: CuisineComponents, count: number, idPrefix: string): Recipe[] {
  return Array.from({ length: count }, (_, i) => {
    const pick = pickFillerIngredients(components, i);
    const stats = fillerStats(i);
    const tags = fillerTags(pick, stats.time, components.vegetarianProteins);
    return makeRecipe(fillerRecipeInput(components, pick, stats, tags, idPrefix, i));
  });
}

const ITALIAN_COMPONENTS: CuisineComponents = {
  cuisine: 'Italian',
  proteins: ['chicken', 'shrimp', 'mushroom', 'eggplant', 'sausage', 'tuna', 'pancetta', 'ricotta'],
  vegetarianProteins: new Set(['mushroom', 'eggplant', 'ricotta']),
  carbs: ['spaghetti', 'penne', 'risotto rice', 'gnocchi', 'polenta', 'tagliatelle', 'orecchiette', 'farfalle'],
  vegetables: ['spinach', 'cherry tomatoes', 'zucchini', 'artichokes', 'bell peppers', 'peas', 'asparagus', 'kale'],
  sauces: ['garlic butter', 'tomato basil', 'creamy parmesan', 'pesto', 'lemon caper', 'arrabbiata', 'white wine', 'gorgonzola'],
  pantryItem: 'olive oil',
};

const GERMAN_COMPONENTS: CuisineComponents = {
  cuisine: 'German',
  proteins: ['pork', 'beef', 'sausage', 'trout', 'lentil', 'chickpea', 'turkey', 'mushroom'],
  vegetarianProteins: new Set(['lentil', 'chickpea', 'mushroom']),
  carbs: ['potatoes', 'spaetzle', 'dumplings', 'rye bread', 'barley', 'noodles', 'pretzel bites', 'rice'],
  vegetables: ['red cabbage', 'sauerkraut', 'carrots', 'leek', 'cucumber salad', 'green beans', 'beetroot', 'onion'],
  sauces: ['mustard cream', 'dark beer gravy', 'herb butter', 'horseradish', 'caraway', 'apple', 'paprika', 'vinegar'],
  pantryItem: 'butter',
};

const JAPANESE_COMPONENTS: CuisineComponents = {
  cuisine: 'Japanese',
  proteins: ['salmon', 'tofu', 'chicken', 'shrimp', 'beef', 'pork belly', 'tuna', 'egg'],
  vegetarianProteins: new Set(['tofu', 'egg']),
  carbs: ['sushi rice', 'udon noodles', 'ramen noodles', 'soba noodles', 'jasmine rice', 'rice bowl', 'tempura batter', 'onigiri rice'],
  vegetables: ['edamame', 'pak choi', 'shiitake mushrooms', 'cucumber', 'daikon', 'seaweed', 'carrot', 'spinach'],
  sauces: ['soy ginger', 'miso glaze', 'teriyaki', 'sesame', 'wasabi mayo', 'ponzu', 'curry', 'spicy mayo'],
  pantryItem: 'soy sauce',
};

const GOURMET_COMPONENTS: CuisineComponents = {
  cuisine: 'Gourmet',
  proteins: ['duck', 'beef tenderloin', 'lobster', 'scallop', 'venison', 'salmon', 'veal', 'foie gras'],
  vegetarianProteins: new Set(),
  carbs: ['truffle risotto', 'potato purée', 'tagliatelle', 'wild rice', 'polenta', 'gnocchi', 'brioche', 'celeriac purée'],
  vegetables: ['asparagus', 'wild mushrooms', 'baby carrots', 'fennel', 'artichoke', 'pea purée', 'heirloom tomato', 'chard'],
  sauces: ['red wine jus', 'beurre blanc', 'truffle butter', 'port reduction', 'herb velouté', 'brown butter', 'citrus glaze', 'peppercorn'],
  pantryItem: 'butter',
};

const INDIAN_COMPONENTS: CuisineComponents = {
  cuisine: 'Indian',
  proteins: ['chicken', 'paneer', 'chickpea', 'lentil', 'shrimp', 'lamb', 'cauliflower', 'egg'],
  vegetarianProteins: new Set(['paneer', 'chickpea', 'lentil', 'cauliflower', 'egg']),
  carbs: ['basmati rice', 'naan', 'biryani rice', 'roti', 'pilaf rice', 'dal', 'rice pulao', 'paratha'],
  vegetables: ['spinach', 'peas', 'potato', 'okra', 'eggplant', 'cauliflower florets', 'tomato', 'carrot'],
  sauces: ['tikka masala', 'korma', 'curry', 'tamarind', 'coconut', 'vindaloo', 'saag', 'butter masala'],
  pantryItem: 'ghee',
};

const FUSION_COMPONENTS: CuisineComponents = {
  cuisine: 'Fusion',
  proteins: ['beef', 'chicken', 'tofu', 'shrimp', 'salmon', 'pork', 'egg', 'jackfruit'],
  vegetarianProteins: new Set(['tofu', 'egg', 'jackfruit']),
  carbs: ['ramen noodles', 'tortillas', 'rice bowl', 'pasta', 'sushi rice', 'naan bread', 'flatbread', 'fried rice'],
  vegetables: ['kimchi', 'cabbage slaw', 'avocado', 'pickled radish', 'edamame', 'bell pepper', 'bok choy', 'corn'],
  sauces: ['gochujang', 'curry mayo', 'miso pesto', 'chipotle', 'sriracha lime', 'teriyaki bbq', 'peanut', 'harissa'],
  pantryItem: 'sesame oil',
};

// 114 generated + 6 curated = 120 per cuisine → 8 pages of 15, matching the Figma pagination reference.
export const COOKBOOK_RECIPES: Recipe[] = [
  ...CURATED_RECIPES,
  ...generateFillerRecipes(ITALIAN_COMPONENTS, 114, 'italian'),
  ...generateFillerRecipes(GERMAN_COMPONENTS, 114, 'german'),
  ...generateFillerRecipes(JAPANESE_COMPONENTS, 114, 'japanese'),
  ...generateFillerRecipes(GOURMET_COMPONENTS, 114, 'gourmet'),
  ...generateFillerRecipes(INDIAN_COMPONENTS, 114, 'indian'),
  ...generateFillerRecipes(FUSION_COMPONENTS, 114, 'fusion'),
];
