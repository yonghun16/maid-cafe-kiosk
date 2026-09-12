// @owner: ai
import { create } from 'zustand';
import type { Category } from '@repo/types';
import { getCategories } from '../api/categoryApi';

interface CategoryFilterState {
  categories: Category[];
  selectedCategory: string;
  isLoading: boolean;
  // ✅ 카테고리 탭이 제자리(ProductList)에서 스크롤에 밀려 상단 고정
  // 헤더 밑으로 넘어가려는 순간, 헤더 쪽 사본이 대신 나타나 "탭이
  // 헤더 안으로 들어가는" 것처럼 보이게 합니다. 이 값은 ProductList의
  // IntersectionObserver가 갱신하고, HomePage의 헤더가 구독해서
  // 자기 사본을 펼칠지 말지 정합니다.
  isHeaderDocked: boolean;
  fetchCategories: () => Promise<void>;
  setSelectedCategory: (name: string) => void;
  setHeaderDocked: (docked: boolean) => void;
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
  isLoading: false,
  isHeaderDocked: false,
  // ✅ 이 컴포넌트가 두 곳(ProductList, HomePage 헤더)에서 동시에
  // 렌더링되면서 마운트 시점에 둘 다 이 함수를 호출합니다. isLoading을
  // 함께 확인해서 이미 요청이 진행 중이면 중복 호출하지 않습니다.
  fetchCategories: async () => {
    if (get().isLoading || get().categories.length > 0) return;
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
  setHeaderDocked: (docked) => set({ isHeaderDocked: docked }),
}));
