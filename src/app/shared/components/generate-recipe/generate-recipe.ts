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

  readonly units: Unit[] = ['gram', 'kg', 'ml', 'piece'];

  private readonly unitAbbr: Partial<Record<string, string>> = {
    gram: 'g',
    kg: 'kg',
    ml: 'ml',
    piece: '',
  };

  name = '';
  amount: number | null = null;
  unit: Unit = 'gram';
  unitDropdownOpen = false;
  editUnitDropdownOpen = false;

  editingId: string | null = null;
  editName = '';
  editAmount = 100;
  editUnit: Unit = 'gram';

  readonly ingredients = signal<Ingredient[]>(this.recipeService.ingredients());
  readonly canContinue = computed(() => this.ingredients().length > 0);

  /** True when the new-ingredient form fields hold a valid entry. */
  get isIngredientValid(): boolean {
    return this.name.trim().length > 0 && this.isValidAmount(this.amount);
  }

  /** True when the in-place edit form fields hold a valid entry. */
  get isEditValid(): boolean {
    return this.editName.trim().length > 0 && this.isValidAmount(this.editAmount);
  }

  /** Formats an ingredient's amount with its unit abbreviation, e.g. "100g". */
  formatAmount(item: Ingredient): string {
    const abbr = this.unitAbbr[item.unit];
    return abbr ? `${item.amount}${abbr}` : `${item.amount}`;
  }

  /** Adds the current form entry to the ingredient list and resets the form. */
  addIngredient(): void {
    if (!this.isIngredientValid) return;
    const amount = Number(this.amount);
    this.ingredients.update(list => [
      { id: crypto.randomUUID(), name: this.name.trim(), amount, unit: this.unit },
      ...list,
    ]);
    this.resetIngredientForm();
  }

  /** Clears the new-ingredient form back to its default values. */
  private resetIngredientForm(): void {
    this.name = '';
    this.amount = null;
    this.unit = 'gram';
  }

  /** Loads an existing ingredient into the edit form. */
  startEdit(item: Ingredient): void {
    this.editingId = item.id;
    this.editName = item.name;
    this.editAmount = item.amount;
    this.editUnit = item.unit as Unit;
  }

  /** Applies the edit form's values to the ingredient being edited. */
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

  /** Closes the edit form without saving changes. */
  cancelEdit(): void {
    this.editingId = null;
  }

  /** Removes an ingredient from the list. */
  removeIngredient(id: string): void {
    this.ingredients.update(list => list.filter(i => i.id !== id));
  }

  /** Saves the ingredient list and navigates to the Preferences step. */
  next(): void {
    if (!this.canContinue()) return;
    this.recipeService.setIngredients(this.ingredients());
    this.router.navigate(['/preferences']);
  }

  /** True for finite, positive amounts. */
  private isValidAmount(value: number | null): boolean {
    return value !== null && Number.isFinite(value) && value > 0;
  }
}
