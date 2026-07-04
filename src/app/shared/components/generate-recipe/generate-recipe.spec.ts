import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';

import { GenerateRecipe } from './generate-recipe';

describe('GenerateRecipe', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GenerateRecipe],
      providers: [provideRouter([])],
    }).compileComponents();
  });

  it('rejects empty ingredients and non-positive amounts', () => {
    const component = TestBed.createComponent(GenerateRecipe).componentInstance;

    component.name = '   ';
    component.addIngredient();
    expect(component.ingredients()).toEqual([]);

    component.name = 'Pasta';
    component.amount = 0;
    component.addIngredient();
    expect(component.ingredients()).toEqual([]);
  });

  it('adds a trimmed ingredient and resets the form', () => {
    const component = TestBed.createComponent(GenerateRecipe).componentInstance;
    component.name = '  Pasta  ';
    component.amount = 250;
    component.unit = 'gram';

    component.addIngredient();

    expect(component.ingredients()).toEqual([
      expect.objectContaining({ name: 'Pasta', amount: 250, unit: 'gram' }),
    ]);
    expect(component.name).toBe('');
    expect(component.amount).toBe(100);
    expect(component.canContinue()).toBe(true);
  });

  it('keeps the original ingredient when an edit is invalid', () => {
    const component = TestBed.createComponent(GenerateRecipe).componentInstance;
    component.name = 'Egg';
    component.amount = 2;
    component.unit = 'piece';
    component.addIngredient();

    const item = component.ingredients()[0];
    component.startEdit(item);
    component.editAmount = 0;
    component.confirmEdit(item.id);

    expect(component.ingredients()[0]).toEqual(item);
    expect(component.editingId).toBe(item.id);
  });
});
