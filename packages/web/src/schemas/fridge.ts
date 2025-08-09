import { z } from 'zod';

// 食材カテゴリーのスキーマ
export const IngredientCategorySchema = z.enum([
  'vegetable',
  'meat',
  'seafood',
  'dairy',
  'grain',
  'seasoning',
  'other',
]);

// 食材のスキーマ
export const IngredientSchema = z.object({
  id: z.string().min(1, '食材IDは必須です'),
  name: z
    .string()
    .min(1, '食材名は必須です')
    .max(100, '食材名は100文字以内で入力してください'),
  quantity: z.string().max(50, '数量は50文字以内で入力してください').optional(),
  category: IngredientCategorySchema,
  addedDate: z
    .string()
    .datetime({ message: '有効な日時形式で入力してください' }),
});

// 新規食材追加用のスキーマ（id, addedDateは自動生成）
export const NewIngredientSchema = IngredientSchema.omit({
  id: true,
  addedDate: true,
});

// レシピ提案のスキーマ
export const RecipeSuggestionSchema = z.object({
  title: z.string().min(1, 'レシピ名は必須です'),
  ingredients: z.array(z.string()).min(1, '材料は最低1つ必要です'),
  instructions: z.array(z.string()).min(1, '手順は最低1つ必要です'),
  cookingTime: z.string().optional(),
  difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
});

// ユーザー設定のスキーマ
export const RecipePreferencesSchema = z.object({
  cuisine: z.enum([
    'japanese',
    'chinese',
    'western',
    'italian',
    'korean',
    'any',
  ]),
  servings: z.string().regex(/^\d+$/, '人数は数字で入力してください'),
  time: z.string().regex(/^\d+$/, '調理時間は数字で入力してください'),
  difficulty: z.enum(['easy', 'medium', 'hard']),
});

// カテゴリーラベルの定義
export const CATEGORY_LABELS = {
  vegetable: '野菜',
  meat: '肉類',
  seafood: '魚介類',
  dairy: '乳製品',
  grain: '穀物',
  seasoning: '調味料',
  other: 'その他',
} as const satisfies Record<z.infer<typeof IngredientCategorySchema>, string>;

// カテゴリーカラーの定義
export const CATEGORY_COLORS = {
  vegetable: 'bg-green-100 text-green-800',
  meat: 'bg-red-100 text-red-800',
  seafood: 'bg-blue-100 text-blue-800',
  dairy: 'bg-yellow-100 text-yellow-800',
  grain: 'bg-amber-100 text-amber-800',
  seasoning: 'bg-purple-100 text-purple-800',
  other: 'bg-gray-100 text-gray-800',
} as const satisfies Record<z.infer<typeof IngredientCategorySchema>, string>;

// 料理ジャンルラベルの定義
export const CUISINE_TYPES = {
  japanese: '和食',
  chinese: '中華',
  western: '洋食',
  italian: 'イタリアン',
  korean: '韓国料理',
  any: 'なんでも',
} as const;

// 型のエクスポート
export type IngredientCategory = z.infer<typeof IngredientCategorySchema>;
export type Ingredient = z.infer<typeof IngredientSchema>;
export type NewIngredient = z.infer<typeof NewIngredientSchema>;
export type RecipeSuggestion = z.infer<typeof RecipeSuggestionSchema>;
export type RecipePreferences = z.infer<typeof RecipePreferencesSchema>;
