// @owner: ai
import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';
import type { Category } from '@repo/types';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategoryById,
  reorderCategories,
} from '../../../entities/category';

/**
 * 서버가 응답에 실어 보낸 에러 메시지를 꺼냅니다. 없으면 기본 메시지를
 * 씁니다. "이미 있는 카테고리" 같은 뭉뚱그린 추측 대신, 실제로 무엇이
 * 잘못됐는지(예: "관리자 인증이 필요합니다.") 그대로 보여주기 위함입니다.
 */
function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && typeof error.response?.data?.message === 'string') {
    return error.response.data.message;
  }
  return fallback;
}

/** `categoryId`를 `toIndex` 위치로 옮긴 새 배열을 반환합니다. 옮길 게 없으면 null. */
function reorderArray(categories: Category[], categoryId: string, toIndex: number): Category[] | null {
  const fromIndex = categories.findIndex((c) => c._id === categoryId);
  if (fromIndex === -1 || toIndex < 0 || toIndex >= categories.length || fromIndex === toIndex) {
    return null;
  }
  const reordered = [...categories];
  const moved = reordered[fromIndex];
  if (!moved) return null;
  reordered.splice(fromIndex, 1);
  reordered.splice(toIndex, 0, moved);
  return reordered;
}

// 카테고리 관리 스토어의 타입 정의
interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  fetchCategories: () => Promise<void>;
  addCategory: (name: string) => Promise<boolean>;
  editCategory: (categoryId: string, name: string) => Promise<boolean>;
  deleteCategory: (categoryId: string) => Promise<boolean>;
  /**
   * 서버 호출 없이 화면 상태만 즉시 재배치합니다. 포인터 기반 드래그 중
   * 프레임마다 불러도 API가 매번 나가지 않도록 분리했고, 실제 저장은
   * `commitCategoryOrder`가 드롭 시점에 한 번만 합니다.
   */
  reorderLocally: (categoryId: string, toIndex: number) => void;
  /** `reorderLocally`로 바뀐 현재 화면 순서를 서버에 저장합니다. */
  commitCategoryOrder: () => Promise<void>;
}

export const useCategoryStore = create<CategoryState>((set, get) => ({
  // 상태 (데이터)
  categories: [],
  isLoading: true,

  // 액션 (상태를 변경하는 함수)
  fetchCategories: async () => {
    set({ isLoading: true });
    try {
      const categories = await getCategories();
      set({ categories, isLoading: false });
    } catch (error) {
      console.error('카테고리 목록을 불러오는 중 오류가 발생했습니다:', error);
      toast.error('카테고리 목록을 불러오는 데 실패했습니다.');
      set({ isLoading: false });
    }
  },

  addCategory: async (name) => {
    try {
      await createCategory(name);
      toast.success('새 카테고리를 추가했습니다!');
      get().fetchCategories();
      return true;
    } catch (error) {
      console.error('카테고리 추가 중 오류가 발생했습니다:', error);
      toast.error(getErrorMessage(error, '카테고리 추가에 실패했습니다.'));
      return false;
    }
  },

  editCategory: async (categoryId, name) => {
    try {
      await updateCategory(categoryId, name);
      toast.success('카테고리 이름을 수정했습니다!');
      get().fetchCategories();
      return true;
    } catch (error) {
      console.error('카테고리 수정 중 오류가 발생했습니다:', error);
      toast.error(getErrorMessage(error, '카테고리 수정에 실패했습니다.'));
      return false;
    }
  },

  deleteCategory: async (categoryId) => {
    if (!window.confirm('이 카테고리를 삭제하면 여기 속한 메뉴도 전부 함께 삭제됩니다. 정말 삭제하시겠습니까?')) {
      return false;
    }
    try {
      await deleteCategoryById(categoryId);
      toast.success('카테고리와 소속 메뉴를 삭제했습니다.');
      get().fetchCategories();
      return true;
    } catch (error) {
      console.error('카테고리 삭제 중 오류가 발생했습니다:', error);
      toast.error(getErrorMessage(error, '카테고리 삭제에 실패했습니다.'));
      return false;
    }
  },

  reorderLocally: (categoryId, toIndex) => {
    const reordered = reorderArray(get().categories, categoryId, toIndex);
    if (!reordered) return;
    set({ categories: reordered });
  },

  commitCategoryOrder: async () => {
    const { categories } = get();
    try {
      await reorderCategories(categories.map((c) => c._id));
    } catch (error) {
      console.error('카테고리 순서 저장 중 오류가 발생했습니다:', error);
      toast.error(getErrorMessage(error, '카테고리 순서 변경에 실패했습니다.'));
      get().fetchCategories();
    }
  },
}));
