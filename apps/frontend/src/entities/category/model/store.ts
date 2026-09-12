// @owner: ai
import { create } from 'zustand';
import type { Category } from '@repo/types';
import { getCategories } from '../api/categoryApi';

interface CategoryFilterState {
  categories: Category[];
  selectedCategory: string;
  isLoading: boolean;
  fetchCategories: () => Promise<void>;
  setSelectedCategory: (name: string) => void;
}

/**
 * 고객 화면의 카테고리 목록과 현재 선택된 카테고리를 공유하는
 * 스토어입니다. 카테고리 탭(상단 고정 헤더)과 메뉴 그리드(필터링)가
 * 서로 다른 컴포넌트에 있으면서도 같은 선택 상태를 봐야 해서
 * `widgets/product-list` 안에 두지 않고 `entities/category`로 올렸습니다.
 * ✅ 손님은 "전체보기"에서 메뉴를 고르지 않고 항상 카테고리를 먼저
 * 골라 담기 때문에, "전체" 옵션 없이 첫 카테고리를 기본 선택으로 둡니다.
 */
export const useCategoryFilterStore = create<CategoryFilterState>((set, get) => ({
  categories: [],
  selectedCategory: '',
  isLoading: true,
  fetchCategories: async () => {
    if (get().categories.length > 0) return;
    try {
      set({ isLoading: true });
      const categories = await getCategories();
      set({ categories, selectedCategory: categories[0]?.name ?? '', isLoading: false });
    } catch (error) {
      console.error('카테고리 목록을 불러오는 중 오류가 발생했습니다:', error);
      set({ isLoading: false });
    }
  },
  setSelectedCategory: (name) => set({ selectedCategory: name }),
}));
