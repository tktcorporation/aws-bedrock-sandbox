import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Ingredient, NewIngredient, IngredientSchema } from '../schemas/fridge';

interface FridgeStore {
  ingredients: Ingredient[];
  addIngredient: (ingredient: NewIngredient) => void;
  removeIngredient: (id: string) => void;
  updateIngredient: (id: string, ingredient: Partial<Ingredient>) => void;
  clearAllIngredients: () => void;
}

export const useFridgeStore = create<FridgeStore>()(
  persist(
    (set) => ({
      ingredients: [],

      addIngredient: (ingredient) =>
        set((state) => {
          const newIngredient: Ingredient = {
            ...ingredient,
            id: Date.now().toString(),
            addedDate: new Date().toISOString(),
          };

          // バリデーション
          try {
            IngredientSchema.parse(newIngredient);
          } catch (error) {
            console.error('Invalid ingredient data:', error);
            return state; // バリデーションエラーの場合は追加しない
          }

          return {
            ingredients: [...state.ingredients, newIngredient],
          };
        }),

      removeIngredient: (id) =>
        set((state) => ({
          ingredients: state.ingredients.filter((item) => item.id !== id),
        })),

      updateIngredient: (id, updatedIngredient) =>
        set((state) => {
          const updatedIngredients = state.ingredients.map((item) => {
            if (item.id === id) {
              const updated = { ...item, ...updatedIngredient };
              // バリデーション
              try {
                IngredientSchema.parse(updated);
                return updated;
              } catch (error) {
                console.error('Invalid update data:', error);
                return item; // バリデーションエラーの場合は元のまま
              }
            }
            return item;
          });

          return { ingredients: updatedIngredients };
        }),

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
