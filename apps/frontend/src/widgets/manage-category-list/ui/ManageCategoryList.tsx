// @owner: ai
//  역할: 카테고리를 추가/수정/삭제합니다. 카테고리를 삭제하면 그
//  카테고리에 속한 메뉴도 서버에서 함께 삭제됩니다.
'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { useCategoryStore } from '../../../features/category-management';

export function ManageCategoryList() {
  const categories = useCategoryStore((state) => state.categories);
  const isLoading = useCategoryStore((state) => state.isLoading);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);
  const addCategory = useCategoryStore((state) => state.addCategory);
  const editCategory = useCategoryStore((state) => state.editCategory);
  const deleteCategory = useCategoryStore((state) => state.deleteCategory);
  const moveCategory = useCategoryStore((state) => state.moveCategory);

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
    }
  };

  const startEditing = (id: string, currentName: string) => {
    setEditingId(id);
    setEditingName(currentName);
  };

  const handleEditSubmit = async (categoryId: string) => {
    const trimmed = editingName.trim();
    if (!trimmed) {
      toast.error('카테고리 이름을 입력해주세요.');
      return;
    }
    const success = await editCategory(categoryId, trimmed);
    if (success) {
      setEditingId(null);
    }
  };

  return (
    <div className="mx-auto max-w-2xl bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-3xl font-bold text-gray-700 mb-5">카테고리 관리</h2>

      <form onSubmit={handleAdd} className="mb-6 flex gap-2">
        <input
          type="text"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="새 카테고리 이름"
          className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-pink-500"
        />
        <button
          type="submit"
          className="rounded-md bg-pink-500 px-5 py-2 font-bold text-white transition-colors hover:bg-pink-600"
        >
          추가
        </button>
      </form>

      {isLoading ? (
        <p>로딩 중...</p>
      ) : categories.length === 0 ? (
        <p className="text-gray-400">아직 카테고리가 없습니다. 위에서 먼저 추가해주세요.</p>
      ) : (
        <div className="space-y-3">
          {categories.map((category, index) =>
            editingId === category._id ? (
              <form
                key={category._id}
                onSubmit={(e) => {
                  e.preventDefault();
                  handleEditSubmit(category._id);
                }}
                className="flex gap-2"
              >
                <input
                  type="text"
                  value={editingName}
                  onChange={(e) => setEditingName(e.target.value)}
                  autoFocus
                  className="flex-1 rounded-md border border-gray-300 bg-white px-3 py-2 shadow-sm focus:border-pink-500 focus:outline-none focus:ring-pink-500"
                />
                <button
                  type="submit"
                  className="rounded-md bg-pink-500 px-4 py-2 font-semibold text-white hover:bg-pink-600"
                >
                  저장
                </button>
                <button
                  type="button"
                  onClick={() => setEditingId(null)}
                  className="rounded-md border border-gray-300 px-4 py-2 font-semibold text-gray-600 hover:bg-gray-100"
                >
                  취소
                </button>
              </form>
            ) : (
              <div
                key={category._id}
                className="flex items-center justify-between rounded-lg bg-gray-50 p-4"
              >
                <div className="flex items-center gap-2">
                  <div className="flex flex-col">
                    <button
                      onClick={() => moveCategory(category._id, 'up')}
                      disabled={index === 0}
                      aria-label="위로 이동"
                      className="leading-none text-gray-400 hover:text-pink-500 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      ▲
                    </button>
                    <button
                      onClick={() => moveCategory(category._id, 'down')}
                      disabled={index === categories.length - 1}
                      aria-label="아래로 이동"
                      className="leading-none text-gray-400 hover:text-pink-500 disabled:cursor-not-allowed disabled:opacity-30"
                    >
                      ▼
                    </button>
                  </div>
                  <span className="text-lg font-semibold text-gray-800">{category.name}</span>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => startEditing(category._id, category.name)}
                    className="font-semibold text-pink-500 hover:text-pink-700"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => deleteCategory(category._id)}
                    className="font-semibold text-red-500 hover:text-red-700"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ),
          )}
        </div>
      )}
    </div>
  );
}
