import React, { useState } from 'react';
import { PiPlus, PiTrash, PiSparkle } from 'react-icons/pi';
import { useFridgeStore } from '../../stores/fridgeStore';
import {
  Ingredient,
  IngredientCategory,
  NewIngredientSchema,
  CATEGORY_LABELS,
  CATEGORY_COLORS,
} from '../../schemas/fridge';
import { useAICategorizor } from '../../hooks/useAICategorizor';
import { z } from 'zod';

// カテゴリー関連の定数はschemas/fridge.tsから使用

export const IngredientManager: React.FC = () => {
  const { ingredients, addIngredient, removeIngredient, clearAllIngredients } =
    useFridgeStore();
  const { categorizeIngredient, categorizeMultipleIngredients } =
    useAICategorizor();
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: '',
    category: 'vegetable' as IngredientCategory,
  });
  const [useAI, setUseAI] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [bulkInput, setBulkInput] = useState('');
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  const handleAdd = async () => {
    const trimmedName = newIngredient.name.trim();
    if (!trimmedName) return;

    setIsAdding(true);

    try {
      let category = newIngredient.category;

      // AIによるカテゴリー判定を使用する場合
      if (useAI) {
        try {
          category = await categorizeIngredient(trimmedName);
        } catch (error) {
          console.error('AI categorization failed:', error);
        }
      }

      // バリデーション
      const newIngredientData = {
        name: trimmedName,
        quantity: newIngredient.quantity.trim() || undefined,
        category: category,
      };

      const validatedData = NewIngredientSchema.parse(newIngredientData);
      addIngredient(validatedData);

      setNewIngredient({ name: '', quantity: '', category: 'vegetable' });
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error('Validation error:', error.errors);
        alert(`入力エラー: ${error.errors.map((e) => e.message).join(', ')}`);
      } else {
        console.error('Error adding ingredient:', error);
      }
    } finally {
      setIsAdding(false);
    }
  };

  const handleBulkAdd = async () => {
    if (!bulkInput.trim()) return;

    setIsBulkProcessing(true);

    // 改行やカンマで分割して食材リストを作成
    const items = bulkInput
      .split(/[,、\n]/)
      .map((item) => item.trim())
      .filter((item) => item.length > 0);

    if (items.length === 0) {
      setIsBulkProcessing(false);
      return;
    }

    try {
      const categories = await categorizeMultipleIngredients(items);

      // 食材を追加（バリデーション付き）
      for (const itemName of items) {
        const category = categories[itemName] || 'other';
        try {
          const validatedData = NewIngredientSchema.parse({
            name: itemName,
            quantity: undefined,
            category: category,
          });
          addIngredient(validatedData);
        } catch (error) {
          console.error(`Failed to add ${itemName}:`, error);
        }
      }

      setBulkInput('');
      setIsBulkMode(false);
    } catch (error) {
      console.error('Bulk categorization failed:', error);
      // エラー時は全てotherとして追加（バリデーション付き）
      for (const itemName of items) {
        try {
          const validatedData = NewIngredientSchema.parse({
            name: itemName,
            quantity: undefined,
            category: 'other',
          });
          addIngredient(validatedData);
        } catch (error) {
          console.error(`Failed to add ${itemName}:`, error);
        }
      }
    } finally {
      setIsBulkProcessing(false);
    }
  };

  const groupedIngredients = ingredients.reduce(
    (acc: Record<IngredientCategory, Ingredient[]>, ingredient: Ingredient) => {
      if (!acc[ingredient.category]) {
        acc[ingredient.category] = [];
      }
      acc[ingredient.category].push(ingredient);
      return acc;
    },
    {} as Record<IngredientCategory, Ingredient[]>
  );

  return (
    <div className="mx-auto w-full max-w-4xl p-6">
      <div className="rounded-lg bg-white p-6 shadow-lg">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold">冷蔵庫の食材管理</h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsBulkMode(!isBulkMode)}
              className="rounded-md bg-gray-200 px-3 py-1 text-sm hover:bg-gray-300">
              {isBulkMode ? '個別入力' : '一括入力'}
            </button>
            {!isBulkMode && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={useAI}
                  onChange={(e) => setUseAI(e.target.checked)}
                  className="rounded"
                />
                <span className="flex items-center gap-1">
                  <PiSparkle className="text-purple-500" />
                  AIで自動分類
                </span>
              </label>
            )}
          </div>
        </div>

        {isBulkMode ? (
          <div className="mb-6">
            <p className="mb-2 text-sm text-gray-600">
              複数の食材をまとめて入力できます（改行またはカンマ区切り）
            </p>
            <textarea
              value={bulkInput}
              onChange={(e) => setBulkInput(e.target.value)}
              placeholder="例：&#10;にんじん&#10;じゃがいも&#10;豚肉&#10;醤油"
              className="mb-3 h-32 w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              onClick={handleBulkAdd}
              disabled={isBulkProcessing || !bulkInput.trim()}
              className="flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50">
              {isBulkProcessing ? (
                <>
                  <PiSparkle className="h-5 w-5 animate-pulse" />
                  AIで分類中...
                </>
              ) : (
                <>
                  <PiPlus className="h-5 w-5" />
                  一括追加
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="mb-6">
            <div className="flex flex-col gap-2 md:flex-row">
              <input
                type="text"
                placeholder="食材名"
                value={newIngredient.name}
                onChange={(e) =>
                  setNewIngredient({ ...newIngredient, name: e.target.value })
                }
                onKeyPress={(e) =>
                  e.key === 'Enter' && !isAdding && handleAdd()
                }
                className="flex-1 rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                disabled={isAdding}
              />
              <input
                type="text"
                placeholder="数量（任意）"
                value={newIngredient.quantity}
                onChange={(e) =>
                  setNewIngredient({
                    ...newIngredient,
                    quantity: e.target.value,
                  })
                }
                onKeyPress={(e) =>
                  e.key === 'Enter' && !isAdding && handleAdd()
                }
                className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 md:w-32"
                disabled={isAdding}
              />
              {!useAI && (
                <select
                  value={newIngredient.category}
                  onChange={(e) =>
                    setNewIngredient({
                      ...newIngredient,
                      category: e.target.value as IngredientCategory,
                    })
                  }
                  className="rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 md:w-32"
                  disabled={isAdding}>
                  {Object.entries(CATEGORY_LABELS).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </select>
              )}
              <button
                onClick={handleAdd}
                disabled={isAdding || !newIngredient.name.trim()}
                className="flex items-center gap-2 rounded-md bg-blue-500 px-4 py-2 text-white hover:bg-blue-600 disabled:opacity-50">
                {isAdding ? (
                  <>
                    <PiSparkle className="h-5 w-5 animate-pulse" />
                    {useAI ? '分類中...' : '追加中...'}
                  </>
                ) : (
                  <>
                    <PiPlus className="h-5 w-5" />
                    追加
                  </>
                )}
              </button>
            </div>
            {useAI && (
              <p className="mt-2 text-xs text-gray-500">
                AIが食材のカテゴリーを自動で判定します
              </p>
            )}
          </div>
        )}

        <div className="space-y-4">
          {Object.entries(groupedIngredients).map(([category, items]) => (
            <div key={category} className="rounded-lg border p-4">
              <h3
                className={`mb-3 inline-block rounded-full px-3 py-1 text-sm font-semibold ${CATEGORY_COLORS[category as IngredientCategory]}`}>
                {CATEGORY_LABELS[category as IngredientCategory]}
              </h3>
              <div className="flex flex-wrap gap-2">
                {(items as Ingredient[]).map((ingredient: Ingredient) => (
                  <div
                    key={ingredient.id}
                    className="flex items-center gap-2 rounded-md bg-gray-50 px-3 py-2">
                    <span className="font-medium">{ingredient.name}</span>
                    {ingredient.quantity && (
                      <span className="text-gray-600">
                        ({ingredient.quantity})
                      </span>
                    )}
                    <button
                      onClick={() => removeIngredient(ingredient.id)}
                      className="text-red-500 hover:text-red-700">
                      <PiTrash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {ingredients.length > 0 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              合計: {ingredients.length} 個の食材
            </div>
            <button
              onClick={clearAllIngredients}
              className="rounded-md bg-red-500 px-4 py-2 text-white hover:bg-red-600">
              すべてクリア
            </button>
          </div>
        )}

        {ingredients.length === 0 && (
          <div className="py-8 text-center text-gray-500">
            食材が登録されていません。上のフォームから追加してください。
          </div>
        )}
      </div>
    </div>
  );
};
