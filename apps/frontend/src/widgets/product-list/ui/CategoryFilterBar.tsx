// @owner: ai
'use client';

import { useEffect } from 'react';
import { useCategoryFilterStore } from '../../../entities/category';

interface CategoryFilterBarProps {
  // ✅ 'wrap'(기본값): ProductList 안 원래 자리에서 쓰는 모드 — 폭이
  // 모자라면 여러 줄로 줄바꿈합니다. 'scroll': 상단 헤더에 도킹됐을
  // 때 쓰는 모드 — 좁은 화면(특히 모바일)에서 카테고리가 5개 넘게
  // 있으면 줄바꿈되며 헤더 바 전체가 두꺼워지는 문제가 있어서, 한 줄로
  // 고정하고 대신 가로로 스크롤되게 합니다.
  variant?: 'wrap' | 'scroll';
}

/**
 * 카테고리 탭 목록입니다. 두 곳(`ProductList`의 제목 바로 아래 자리,
 * `HomePage`의 상단 고정 헤더)에서 동시에 렌더링되고, 둘 다 같은
 * `entities/category` 공유 스토어를 보고 있습니다. 평소엔 `ProductList`
 * 쪽만 보이고 헤더 쪽은 접혀 있다가, 원래 자리가 스크롤에 밀려 헤더
 * 밑으로 넘어가려는 순간(`isHeaderDocked`) 서로 자리를 바꿔서 "탭이
 * 헤더 안으로 들어가는" 효과를 냅니다 — 실제로 두 벌이 항상 DOM에
 * 있고 보이는 쪽만 바뀌는 방식이라, 클릭 가능한 사본은 항상 하나뿐
 * 입니다(숨은 쪽은 `pointer-events-none`/`max-h-0`로 막힘).
 */
export function CategoryFilterBar({ variant = 'wrap' }: CategoryFilterBarProps) {
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
    <div
      className={
        variant === 'scroll'
          ? 'flex flex-nowrap gap-2 overflow-x-auto [scrollbar-width:none] md:gap-3 [&::-webkit-scrollbar]:hidden'
          : 'flex flex-wrap justify-center gap-2 md:justify-start md:gap-3'
      }
    >
      {categories.map((category) => (
        <button
          key={category._id}
          onClick={() => handleSelectCategory(category.name)}
          className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-200 md:px-7 md:py-3 md:text-base ${
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
