// @owner: ai
//  역할: 카테고리를 칩 형태로 보여주며, 클릭하면 그 카테고리로 메뉴 목록을
//  필터링합니다. 각 칩에서 순서 이동(◀▶)/이름 수정(✎)/삭제(✕)도 함께
//  처리합니다. 카테고리를 삭제하면 그 카테고리에 속한 메뉴도 서버에서
//  함께 삭제됩니다.
'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import type { Category } from '@repo/types';
import { useCategoryStore } from '../../../features/category-management';

const ALL_CATEGORY = 'all';

interface ManageCategoryListProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
}

export function ManageCategoryList({ selectedCategory, onSelectCategory }: ManageCategoryListProps) {
  const categories = useCategoryStore((state) => state.categories);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);
  const addCategory = useCategoryStore((state) => state.addCategory);
  const editCategory = useCategoryStore((state) => state.editCategory);
  const deleteCategory = useCategoryStore((state) => state.deleteCategory);
  const moveCategory = useCategoryStore((state) => state.moveCategory);

  const [isAdding, setIsAdding] = useState(false);
  const [newName, setNewName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingName, setEditingName] = useState('');

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = newName.trim();
    if (!trimmed) {
      toast.error('카테고리 이름을 입력해주세요.');
      return;
    }
    const success = await addCategory(trimmed);
    if (success) {
      setNewName('');
      setIsAdding(false);
    }
  };

  const startEditing = (category: Category) => {
    setEditingId(category._id);
    setEditingName(category.name);
  };

  const handleEditSubmit = async (category: Category) => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      toast.error('카테고리 이름을 입력해주세요.');
      return;
    }
    const success = await editCategory(category._id, trimmed);
    if (success) {
      setEditingId(null);
      // ✅ 지금 선택돼 있던 카테고리 이름이 바뀌면 필터도 새 이름으로 따라갑니다.
      if (selectedCategory === category.name) {
        onSelectCategory(trimmed);
      }
    }
  };

  const handleDelete = async (category: Category) => {
    const success = await deleteCategory(category._id);
    // ✅ 지금 선택돼 있던 카테고리가 삭제되면 "전체" 필터로 되돌립니다.
    if (success && selectedCategory === category.name) {
      onSelectCategory(ALL_CATEGORY);
    }
  };

  return (
    <div className="mb-6 rounded-xl bg-white p-4 shadow-lg">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => onSelectCategory(ALL_CATEGORY)}
          className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-all ${
            selectedCategory === ALL_CATEGORY
              ? 'bg-pink-500 text-white shadow-md'
              : 'border border-pink-100 bg-white text-gray-600 hover:bg-pink-100 hover:text-pink-600'
          }`}
        >
          🎀 전체
        </button>

        {categories.map((category, index) =>
          editingId === category._id ? (
            <form
              key={category._id}
              onSubmit={(e) => {
                e.preventDefault();
                handleEditSubmit(category);
              }}
              className="flex items-center gap-1"
            >
              <input
                type="text"
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                autoFocus
                className="w-28 rounded-full border border-pink-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-pink-500"
              />
              <button type="submit" className="text-sm font-semibold text-pink-500 hover:text-pink-700">
                저장
              </button>
              <button
                type="button"
                onClick={() => setEditingId(null)}
                className="text-sm font-semibold text-gray-400 hover:text-gray-600"
              >
                취소
              </button>
            </form>
          ) : (
            <div
              key={category._id}
              className={`flex items-center gap-0.5 rounded-full pl-4 pr-1.5 py-1.5 shadow-sm transition-all ${
                selectedCategory === category.name
                  ? 'bg-pink-500 text-white shadow-md'
                  : 'border border-pink-100 bg-white text-gray-600 hover:bg-pink-100 hover:text-pink-600'
              }`}
            >
              <button
                type="button"
                onClick={() => onSelectCategory(category.name)}
                className="pr-2 text-sm font-semibold"
              >
                {category.name}
              </button>
              <button
                type="button"
                onClick={() => moveCategory(category._id, 'up')}
                disabled={index === 0}
                aria-label="앞으로 이동"
                className="rounded px-1 text-xs disabled:opacity-30"
              >
                ◀
              </button>
              <button
                type="button"
                onClick={() => moveCategory(category._id, 'down')}
                disabled={index === categories.length - 1}
                aria-label="뒤로 이동"
                className="rounded px-1 text-xs disabled:opacity-30"
              >
                ▶
              </button>
              <button
                type="button"
                onClick={() => startEditing(category)}
                aria-label="이름 수정"
                className="rounded px-1 text-xs"
              >
                ✎
              </button>
              <button
                type="button"
                onClick={() => handleDelete(category)}
                aria-label="삭제"
                className="rounded px-1 text-xs"
              >
                ✕
              </button>
            </div>
          ),
        )}

        {isAdding ? (
          <form onSubmit={handleAdd} className="flex items-center gap-1">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="새 카테고리"
              autoFocus
              className="w-28 rounded-full border border-pink-300 bg-white px-3 py-1.5 text-sm shadow-sm focus:outline-none focus:ring-pink-500"
            />
            <button type="submit" className="text-sm font-semibold text-pink-500 hover:text-pink-700">
              추가
            </button>
            <button
              type="button"
              onClick={() => {
                setIsAdding(false);
                setNewName('');
              }}
              className="text-sm font-semibold text-gray-400 hover:text-gray-600"
            >
              취소
            </button>
          </form>
        ) : (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="rounded-full border border-dashed border-pink-300 px-4 py-2 text-sm font-semibold text-pink-500 hover:bg-pink-50"
          >
            + 카테고리 추가
          </button>
        )}
      </div>
    </div>
  );
}
