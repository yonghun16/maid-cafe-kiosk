// @owner: ai
'use client';

import { useEffect } from 'react';
import { useCategoryFilterStore } from '../../../entities/category';

/**
 * 카테고리 탭 목록입니다. `ProductList`가 이 컴포넌트를 sticky
 * 컨테이너로 감싸서, 평소엔 제목 바로 아래 자기 자리에 있다가
 * 스크롤하면 상단 고정 헤더 밑에 붙어 계속 보이게 합니다. 카테고리
 * 선택 상태는 `entities/category`의 공유 스토어를 씁니다(메뉴 그리드
 * 필터링과 같은 상태를 봐야 하기 때문).
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
    <div className="flex flex-wrap justify-center gap-2 md:justify-start md:gap-3">
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
