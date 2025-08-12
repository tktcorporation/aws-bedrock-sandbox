import React, { useState } from 'react';
import { PiSparkle } from 'react-icons/pi';
import { useFridgeStore } from '../../stores/fridgeStore';
import useChat from '../../hooks/useChat';
import {
  RecipePreferencesSchema,
  CUISINE_TYPES,
  Ingredient,
} from '../../schemas/fridge';
import { z } from 'zod';

export const RecipeSuggester: React.FC = () => {
  const { ingredients } = useFridgeStore();
  const [suggestions, setSuggestions] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [preferences, setPreferences] = useState<
    z.infer<typeof RecipePreferencesSchema>
  >({
    cuisine: 'japanese',
    servings: '2',
    time: '30',
    difficulty: 'easy',
  });

  const chatId = 'fridge-recipe-' + Date.now();
  const { postChat } = useChat(chatId);

  // 料理ジャンルの定数はschemas/fridge.tsから使用

  const handleSuggest = async () => {
    if (ingredients.length === 0) {
      alert('食材を追加してください');
      return;
    }

    // プリファレンスのバリデーション
    try {
      RecipePreferencesSchema.parse(preferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Preferences validation error:', error.errors);
        alert(`設定エラー: ${error.errors.map((e) => e.message).join(', ')}`);
        return;
      }
    }

    setIsLoading(true);
    setSuggestions('');

    const ingredientList = ingredients
      .map(
        (i: Ingredient) => `${i.name}${i.quantity ? ` (${i.quantity})` : ''}`
      )
      .join(', ');

    const prompt = `現在冷蔵庫にある食材:
${ingredientList}

以下の条件で今日の晩御飯のレシピを3つ提案してください:
- 料理のジャンル: ${CUISINE_TYPES[preferences.cuisine as keyof typeof CUISINE_TYPES]}
- 人数: ${preferences.servings}人分
- 調理時間: 約${preferences.time}分以内
- 難易度: ${preferences.difficulty === 'easy' ? '簡単' : preferences.difficulty === 'medium' ? '普通' : '難しい'}

各レシピについて以下を含めてください:
1. 料理名
2. 必要な材料（分量付き）
3. 簡単な作り方（番号付きの手順）
4. 調理時間の目安
5. ポイントやコツ

なるべく現在ある食材を活用し、足りない材料は最小限にしてください。`;

    try {
      await postChat(prompt, false, undefined, (message: string) => {
        setSuggestions(message);
        return message;
      });
    } catch (error) {
      console.error('Error getting suggestions:', error);
      alert('レシピの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <h2 className="mb-6 text-2xl font-bold">今日の晩御飯を提案</h2>

        <div className="mb-6 space-y-4">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                料理のジャンル
              </label>
              <select
                value={preferences.cuisine}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    cuisine: e.target.value as z.infer<
                      typeof RecipePreferencesSchema
                    >['cuisine'],
                  })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {Object.entries(CUISINE_TYPES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                人数
              </label>
              <select
                value={preferences.servings}
                onChange={(e) =>
                  setPreferences({ ...preferences, servings: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <option key={n} value={n}>
                    {n}人分
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                調理時間
              </label>
              <select
                value={preferences.time}
                onChange={(e) =>
                  setPreferences({ ...preferences, time: e.target.value })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="15">15分以内</option>
                <option value="30">30分以内</option>
                <option value="45">45分以内</option>
                <option value="60">60分以内</option>
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                難易度
              </label>
              <select
                value={preferences.difficulty}
                onChange={(e) =>
                  setPreferences({
                    ...preferences,
                    difficulty: e.target.value as z.infer<
                      typeof RecipePreferencesSchema
                    >['difficulty'],
                  })
                }
                className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="easy">簡単</option>
                <option value="medium">普通</option>
                <option value="hard">難しい</option>
              </select>
            </div>
          </div>
        </div>

        <button
          onClick={handleSuggest}
          disabled={isLoading || ingredients.length === 0}
          className="flex w-full items-center justify-center gap-2 rounded-md bg-gradient-to-r from-blue-500 to-purple-500 px-4 py-3 text-white hover:from-blue-600 hover:to-purple-600 disabled:cursor-not-allowed disabled:opacity-50">
          <PiSparkle className="h-5 w-5" />
          {isLoading ? 'レシピを考えています...' : 'レシピを提案してもらう'}
        </button>

        {ingredients.length === 0 && (
          <div className="mt-4 rounded-md border border-yellow-200 bg-yellow-50 p-4">
            <p className="text-yellow-800">まず食材を登録してください</p>
          </div>
        )}

        {suggestions && (
          <div className="mt-6 rounded-lg bg-gray-50 p-4">
            <h3 className="mb-3 text-lg font-semibold">AIからの提案:</h3>
            <div className="whitespace-pre-wrap text-gray-700">
              {suggestions}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
