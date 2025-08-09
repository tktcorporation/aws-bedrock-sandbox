import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Ingredient } from '../types/fridge';

interface FridgeStore {
  ingredients: Ingredient[];
  addIngredient: (ingredient: Omit<Ingredient, 'id' | 'addedDate'>) => void;
  removeIngredient: (id: string) => void;
  updateIngredient: (id: string, ingredient: Partial<Ingredient>) => void;
  clearAllIngredients: () => void;
}

export const useFridgeStore = create<FridgeStore>()(
  persist(
    (set) => ({
      ingredients: [],

      addIngredient: (ingredient) =>
        set((state) => ({
          ingredients: [
            ...state.ingredients,
            {
              ...ingredient,
              id: Date.now().toString(),
              addedDate: new Date().toISOString(),
            },
          ],
        })),

      removeIngredient: (id) =>
        set((state) => ({
          ingredients: state.ingredients.filter((item) => item.id !== id),
        })),

      updateIngredient: (id, updatedIngredient) =>
        set((state) => ({
          ingredients: state.ingredients.map((item) =>
            item.id === id ? { ...item, ...updatedIngredient } : item
          ),
        })),

      clearAllIngredients: () =>
        set(() => ({
          ingredients: [],
        })),
    }),
    {
      name: 'fridge-storage',
    }
  )
);
