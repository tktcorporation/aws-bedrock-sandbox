import React, { useState } from 'react';
import { IngredientManager } from '../components/fridge/IngredientManager';
import { RecipeSuggester } from '../components/fridge/RecipeSuggester';
import { useEffect } from 'react';
import usePageTitle from '../hooks/usePageTitle';

export const FridgeApp: React.FC = () => {
  const { setPageTitle } = usePageTitle();

  useEffect(() => {
    setPageTitle('冷蔵庫管理 & 献立提案');
  }, [setPageTitle]);
  const [activeTab, setActiveTab] = useState<'ingredients' | 'recipes'>(
    'ingredients'
  );

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-3xl font-bold text-gray-900">
              🍽️ 冷蔵庫管理 & 献立提案アプリ
            </h1>
            <p className="mt-2 text-gray-600">
              冷蔵庫の食材を記録して、AIに今日の晩御飯を提案してもらいましょう
            </p>
          </div>

          <div className="flex space-x-1 border-t pt-4">
            <button
              onClick={() => setActiveTab('ingredients')}
              className={`rounded-t-lg px-4 py-2 font-medium transition-colors ${
                activeTab === 'ingredients'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}>
              📦 食材管理
            </button>
            <button
              onClick={() => setActiveTab('recipes')}
              className={`rounded-t-lg px-4 py-2 font-medium transition-colors ${
                activeTab === 'recipes'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}>
              🍳 献立提案
            </button>
          </div>
        </div>
      </div>

      <div className="py-8">
        {activeTab === 'ingredients' ? (
          <IngredientManager />
        ) : (
          <RecipeSuggester />
        )}
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
          <h3 className="mb-2 font-semibold text-blue-900">使い方:</h3>
          <ol className="list-inside list-decimal space-y-1 text-blue-800">
            <li>「食材管理」タブで冷蔵庫にある食材を登録します</li>
            <li>食材名、数量（任意）、カテゴリーを選んで追加できます</li>
            <li>「献立提案」タブに移動して、好みの条件を設定します</li>
            <li>「レシピを提案してもらう」ボタンでAIが献立を考えてくれます</li>
            <li>データはブラウザのローカルストレージに保存されます</li>
          </ol>
        </div>
      </div>
    </div>
  );
};
