// @owner: ai
import { create } from 'zustand';
import toast from 'react-hot-toast';
import type { Category } from '@repo/types';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategoryById,
} from '../../../entities/category';

// 카테고리 관리 스토어의 타입 정의
interface CategoryState {
  categories: Category[];
  isLoading: boolean;
  fetchCategories: () => Promise<void>;
  addCategory: (name: string) => Promise<boolean>;
  editCategory: (categoryId: string, name: string) => Promise<boolean>;
  deleteCategory: (categoryId: string) => Promise<void>;
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
      toast.error('이미 있는 카테고리이거나 추가에 실패했습니다.');
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
      toast.error('이미 있는 카테고리이거나 수정에 실패했습니다.');
      return false;
    }
  },

  deleteCategory: async (categoryId) => {
    if (!window.confirm('이 카테고리를 삭제하면 여기 속한 메뉴도 전부 함께 삭제됩니다. 정말 삭제하시겠습니까?')) {
      return;
    }
    try {
      await deleteCategoryById(categoryId);
      toast.success('카테고리와 소속 메뉴를 삭제했습니다.');
      get().fetchCategories();
    } catch (error) {
      console.error('카테고리 삭제 중 오류가 발생했습니다:', error);
      toast.error('카테고리 삭제에 실패했습니다.');
    }
  },
}));
