// @owner: ai
'use client';

import { useEffect } from 'react';
import { useCategoryFilterStore } from '../../../entities/category';

/**
 * 카테고리 탭 목록입니다. 상단 고정 헤더(`views/home/ui/HomePage.tsx`)
 * 안에서 렌더링되어, 스크롤해도 항상 같은 흰 바 위에 붙어 있습니다 —
 * 예전에는 이 탭들이 메뉴 그리드 위에서 자체적으로 sticky 처리돼
 * 있었는데, 페이지 배경과 구분이 안 가는 문제가 있어서 이미 항상
 * 고정돼 있는 헤더 바에 그대로 편입시켰습니다.
 */
export function CategoryFilterBar() {
  const categories = useCategoryFilterStore((state) => state.categories);
  const selectedCategory = useCategoryFilterStore((state) => state.selectedCategory);
  const setSelectedCategory = useCategoryFilterStore((state) => state.setSelectedCategory);
  const fetchCategories = useCategoryFilterStore((state) => state.fetchCategories);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ✅ 카테고리를 바꾸면 이전 카테고리에서 스크롤해둔 위치가 그대로
  // 남아있어 새 목록의 중간부터 보이는 문제가 있어서, 카테고리를 누를
  // 때마다 페이지를 맨 위로 되돌립니다.
  const handleSelectCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (categories.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2 md:gap-3">
      {categories.map((category) => (
        <button
          key={category._id}
          onClick={() => handleSelectCategory(category.name)}
          className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-200 md:px-7 md:py-3 md:text-base ${
            selectedCategory === category.name
              ? 'bg-pink-500 text-white shadow-md'
              : 'border border-pink-100 bg-white text-gray-600 hover:bg-pink-100 hover:text-pink-600'
          }`}
        >
          {category.name}
        </button>
      ))}
    </div>
  );
}
