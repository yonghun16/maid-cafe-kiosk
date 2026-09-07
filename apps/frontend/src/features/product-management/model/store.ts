// @owner: ai
import { create } from 'zustand';
import toast from 'react-hot-toast';
import type { Product } from '@repo/types';
import {
  getProducts,
  createProduct,
  updateProduct,
  updateSoldOutStatus,
  deleteProductById,
} from '../../../entities/product';

// 상품 관리 스토어의 타입 정의
interface ProductState {
  products: Product[];
  isLoading: boolean;
  fetchProducts: () => Promise<void>;
  addProduct: (newProductData: Omit<Product, '_id'>) => Promise<boolean>;
  editProduct: (productId: string, updatedData: Omit<Product, '_id'>) => Promise<boolean>;
  toggleSoldOut: (productId: string, isSoldOut: boolean) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
}

export const useProductStore = create<ProductState>((set, get) => ({
  // 상태 (데이터)
  products: [],
  isLoading: true,

  // 액션 (상태를 변경하는 함수)
  fetchProducts: async () => {
    set({ isLoading: true });
    try {
      const products = await getProducts();
      set({ products, isLoading: false });
    } catch (error) {
      console.error('상품 목록을 불러오는 중 오류가 발생했습니다:', error);
      toast.error('상품 목록을 불러오는 데 실패했습니다.');
      set({ isLoading: false });
    }
  },

  addProduct: async (newProductData) => {
    try {
      await createProduct(newProductData);
      toast.success('새로운 상품을 추가했습니다!');
      // 성공 시, 상품 목록을 다시 불러와서 화면을 갱신합니다.
      get().fetchProducts();
      return true;
    } catch (error) {
      console.error('상품 추가 중 오류가 발생했습니다:', error);
      toast.error('상품 추가에 실패했습니다.');
      return false;
    }
  },

  editProduct: async (productId, updatedData) => {
    try {
      await updateProduct(productId, updatedData);
      toast.success('상품 정보를 수정했습니다!');
      // 성공 시, 상품 목록을 다시 불러와서 화면을 갱신합니다.
      get().fetchProducts();
      return true;
    } catch (error) {
      console.error('상품 수정 중 오류가 발생했습니다:', error);
      toast.error('상품 수정에 실패했습니다.');
      return false;
    }
  },

  toggleSoldOut: async (productId, isSoldOut) => {
    try {
      await updateSoldOutStatus(productId, isSoldOut);
      toast.success(isSoldOut ? '품절로 표시했습니다.' : '판매중으로 표시했습니다.');
      // 성공 시, 상품 목록을 다시 불러와서 화면을 갱신합니다.
      get().fetchProducts();
    } catch (error) {
      console.error('품절 상태 변경 중 오류가 발생했습니다:', error);
      toast.error('품절 상태 변경에 실패했습니다.');
    }
  },

  deleteProduct: async (productId) => {
    if (!window.confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      return;
    }
    try {
      await deleteProductById(productId);
      toast.success('상품을 삭제했습니다.');
      // 성공 시, 상품 목록을 다시 불러와서 화면을 갱신합니다.
      get().fetchProducts();
    } catch (error) {
      console.error('상품 삭제 중 오류가 발생했습니다:', error);
      toast.error('상품 삭제에 실패했습니다.');
    }
  },
}));
