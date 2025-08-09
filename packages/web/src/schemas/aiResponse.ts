import { z } from 'zod';

// AIストリーミングレスポンスの各チャンクのスキーマ
export const AIStreamChunkSchema = z.object({
  text: z.string(),
  stopReason: z.enum(['end_turn', 'max_tokens', 'stop_sequence']).optional(),
  metadata: z
    .object({
      usage: z.object({
        inputTokens: z.number().int().nonnegative(),
        outputTokens: z.number().int().nonnegative(),
        totalTokens: z.number().int().nonnegative(),
      }),
    })
    .optional(),
});

// カテゴリー判定レスポンスのスキーマ
export const CategoryResponseSchema = z.enum([
  'vegetable',
  'meat',
  'seafood',
  'dairy',
  'grain',
  'seasoning',
  'other',
]);

// 一括カテゴリー判定レスポンスのスキーマ
export const BulkCategoryResponseSchema = z.record(
  z.string(), // 食材名をキー
  CategoryResponseSchema // カテゴリーを値
);

// レシピ提案レスポンスのスキーマ
export const RecipeResponseSchema = z.object({
  recipes: z.array(
    z.object({
      title: z.string(),
      ingredients: z.array(z.string()),
      instructions: z.array(z.string()),
      cookingTime: z.string().optional(),
      difficulty: z.enum(['easy', 'medium', 'hard']).optional(),
      tips: z.string().optional(),
    })
  ),
});

// エラーレスポンスのスキーマ
export const AIErrorResponseSchema = z.object({
  error: z.string(),
  code: z.string().optional(),
  details: z.unknown().optional(),
});

// AIレスポンスのバリデーション関数
export function validateAIStreamChunk(data: unknown): AIStreamChunk | null {
  try {
    return AIStreamChunkSchema.parse(data);
  } catch (error) {
    console.error('Invalid AI stream chunk:', error);
    return null;
  }
}

// カテゴリーレスポンスのバリデーション関数
export function validateCategoryResponse(
  text: string
): z.infer<typeof CategoryResponseSchema> | null {
  const trimmed = text.trim().toLowerCase();
  try {
    return CategoryResponseSchema.parse(trimmed);
  } catch (error) {
    console.error('Invalid category response:', trimmed, error);
    return null;
  }
}

// 一括カテゴリーレスポンスのバリデーション関数
export function validateBulkCategoryResponse(
  jsonString: string
): z.infer<typeof BulkCategoryResponseSchema> | null {
  try {
    const parsed = JSON.parse(jsonString);
    return BulkCategoryResponseSchema.parse(parsed);
  } catch (error) {
    console.error('Invalid bulk category response:', error);
    return null;
  }
}

// 型のエクスポート
export type AIStreamChunk = z.infer<typeof AIStreamChunkSchema>;
export type CategoryResponse = z.infer<typeof CategoryResponseSchema>;
export type BulkCategoryResponse = z.infer<typeof BulkCategoryResponseSchema>;
export type RecipeResponse = z.infer<typeof RecipeResponseSchema>;
export type AIErrorResponse = z.infer<typeof AIErrorResponseSchema>;
