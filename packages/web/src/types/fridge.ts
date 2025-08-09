export interface Ingredient {
  id: string;
  name: string;
  quantity?: string;
  category:
    | 'vegetable'
    | 'meat'
    | 'seafood'
    | 'dairy'
    | 'grain'
    | 'seasoning'
    | 'other';
  addedDate: string;
}

export interface RecipeSuggestion {
  title: string;
  ingredients: string[];
  instructions: string[];
  cookingTime?: string;
  difficulty?: 'easy' | 'medium' | 'hard';
}
