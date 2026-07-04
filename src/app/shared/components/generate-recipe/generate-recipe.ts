import { Component, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

import { Ingredient, Unit } from '../../interfaces/ingredient';
import { RecipeService } from '../../services/recipe';

@Component({
  selector: 'app-generate-recipe',
  imports: [FormsModule],
  templateUrl: './generate-recipe.html',
  styleUrl: './generate-recipe.scss',
})
export class GenerateRecipe {
  private readonly router = inject(Router);
  private readonly recipeService = inject(RecipeService);

  readonly units: Unit[] = ['gram', 'kg', 'ml', 'l', 'piece', 'tbsp', 'tsp'];

  private readonly unitAbbr: Record<Unit, string> = {
    gram: 'g',
    kg: 'kg',
    ml: 'ml',
    l: 'l',
    piece: '',
    tbsp: 'tbsp',
    tsp: 'tsp',
  };

  name = '';
  amount = 100;
  unit: Unit = 'gram';

  editingId: string | null = null;
  editName = '';
  editAmount = 100;
  editUnit: Unit = 'gram';

  readonly ingredients = signal<Ingredient[]>(this.recipeService.ingredients());
  readonly canContinue = computed(() => this.ingredients().length > 0);

  get isIngredientValid(): boolean {
    return this.name.trim().length > 0 && this.isValidAmount(this.amount);
  }

  get isEditValid(): boolean {
    return this.editName.trim().length > 0 && this.isValidAmount(this.editAmount);
  }

  formatAmount(item: Ingredient): string {
    const abbr = this.unitAbbr[item.unit];
    return abbr ? `${item.amount}${abbr}` : `${item.amount}`;
  }

  addIngredient(): void {
    if (!this.isIngredientValid) return;
    this.ingredients.update(list => [
      ...list,
      {
        id: crypto.randomUUID(),
        name: this.name.trim(),
        amount: this.amount,
        unit: this.unit,
      },
    ]);
    this.name = '';
    this.amount = 100;
    this.unit = 'gram';
  }

  startEdit(item: Ingredient): void {
    this.editingId = item.id;
    this.editName = item.name;
    this.editAmount = item.amount;
    this.editUnit = item.unit;
  }

  confirmEdit(id: string): void {
    if (!this.isEditValid) return;
    this.ingredients.update(list =>
      list.map(i =>
        i.id === id
          ? { ...i, name: this.editName.trim(), amount: this.editAmount, unit: this.editUnit }
          : i,
      ),
    );
    this.editingId = null;
  }

  cancelEdit(): void {
    this.editingId = null;
  }

  removeIngredient(id: string): void {
    this.ingredients.update(list => list.filter(i => i.id !== id));
  }

  next(): void {
    if (!this.canContinue()) return;
    this.recipeService.setIngredients(this.ingredients());
    this.router.navigate(['/preferences']);
  }

  private isValidAmount(value: number): boolean {
    return Number.isFinite(value) && value > 0;
  }
}
