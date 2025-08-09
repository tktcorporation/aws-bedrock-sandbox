import { useState } from 'react';
import { IngredientCategory } from '../schemas/fridge';
import {
  validateCategoryResponse,
  validateBulkCategoryResponse,
} from '../schemas/aiResponse';
import useChatApi from './useChatApi';
import { Model } from 'generative-ai-use-cases';

export const useAICategorizor = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const { predictStream } = useChatApi();

  const categorizeIngredient = async (
    ingredientName: string
  ): Promise<IngredientCategory> => {
    const prompt = `以下の食材のカテゴリーを判定してください。
食材名: ${ingredientName}

以下のカテゴリーから1つだけ選んで、カテゴリー名のみを返してください：
- vegetable (野菜類)
- meat (肉類)
- seafood (魚介類・海産物)
- dairy (乳製品・卵)
- grain (穀物・パン・麺類)
- seasoning (調味料・スパイス)
- other (その他)

重要: カテゴリー名のみを英語で返してください。説明は不要です。`;

    try {
      console.log('カテゴリー判定中:', ingredientName);

      const model: Model = {
        modelId: 'us.anthropic.claude-3-5-haiku-20241022-v1:0',
        type: 'bedrock',
      };

      let fullText = '';

      // AsyncGeneratorから結果を取得
      const generator = predictStream({
        id: Date.now().toString(),
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      for await (const chunk of generator) {
        // ストリーミングレスポンスをパース
        const lines = chunk.split('\n').filter((line) => line.trim());
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.text) {
              fullText += data.text;
            }
          } catch (e) {
            // JSON解析エラーは無視
          }
        }
      }

      const cleanResponse = fullText.trim();
      console.log('AI response:', cleanResponse);

      const validatedCategory = validateCategoryResponse(cleanResponse);
      if (validatedCategory) {
        console.log('カテゴリー判定成功:', validatedCategory);
        return validatedCategory;
      }

      console.log('カテゴリー判定失敗: デフォルトのotherを返す');
      return 'other';
    } catch (error) {
      console.error('カテゴリー判定エラー:', error);
      return 'other';
    }
  };

  const categorizeMultipleIngredients = async (
    ingredientNames: string[]
  ): Promise<Record<string, IngredientCategory>> => {
    setIsProcessing(true);

    const prompt = `以下の食材それぞれのカテゴリーを判定してください。

食材リスト:
${ingredientNames.map((name, i) => `${i + 1}. ${name}`).join('\n')}

以下のカテゴリーから選んでください：
- vegetable (野菜類)
- meat (肉類)
- seafood (魚介類・海産物)
- dairy (乳製品・卵)
- grain (穀物・パン・麺類)
- seasoning (調味料・スパイス)
- other (その他)

JSONフォーマットで返してください。例:
{"にんじん": "vegetable", "豚肉": "meat", "醤油": "seasoning"}`;

    try {
      console.log('一括カテゴリー判定中:', ingredientNames);

      const model: Model = {
        modelId: 'us.anthropic.claude-3-5-haiku-20241022-v1:0',
        type: 'bedrock',
      };

      let fullText = '';

      // AsyncGeneratorから結果を取得
      const generator = predictStream({
        id: Date.now().toString(),
        model: model,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      });

      for await (const chunk of generator) {
        // ストリーミングレスポンスをパース
        const lines = chunk.split('\n').filter((line) => line.trim());
        for (const line of lines) {
          try {
            const data = JSON.parse(line);
            if (data.text) {
              fullText += data.text;
            }
          } catch (e) {
            // JSON解析エラーは無視
          }
        }
      }

      const categories: Record<string, IngredientCategory> = {};

      try {
        // JSONの部分を抽出
        const jsonMatch = fullText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const validatedCategories = validateBulkCategoryResponse(
            jsonMatch[0]
          );
          if (validatedCategories) {
            console.log(
              'Parsed and validated categories:',
              validatedCategories
            );
            Object.assign(categories, validatedCategories);
          }
        }
      } catch (e) {
        console.error('カテゴリー解析エラー:', e);
      }

      // 結果が返ってこなかった食材はotherにする
      for (const name of ingredientNames) {
        if (!categories[name]) {
          categories[name] = 'other';
        }
      }

      console.log('カテゴリー判定結果:', categories);
      return categories;
    } catch (error) {
      console.error('カテゴリー判定エラー:', error);
      // エラー時は全てotherで返す
      const result: Record<string, IngredientCategory> = {};
      for (const name of ingredientNames) {
        result[name] = 'other';
      }
      return result;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    categorizeIngredient,
    categorizeMultipleIngredients,
    isProcessing,
  };
};
