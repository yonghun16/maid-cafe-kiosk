import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';
import type { Product } from '@repo/types';

const API_URL = 'http://localhost:4000/api';

// 상품 관리 스토어의 타입 정의
interface ProductState {
  products: Product[];
  isLoading: boolean;
  fetchProducts: () => Promise<void>;
  addProduct: (newProductData: Omit<Product, '_id'>) => Promise<void>;
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
      const response = await axios.get(`${API_URL}/products`);
      set({ products: response.data, isLoading: false });
    } catch (error) {
      toast.error('상품 목록을 불러오는 데 실패했습니다.');
      set({ isLoading: false });
    }
  },

  addProduct: async (newProductData) => {
    try {
      await axios.post(`${API_URL}/products`, newProductData);
      toast.success('새로운 상품을 추가했습니다!');
      // 성공 시, 상품 목록을 다시 불러와서 화면을 갱신합니다.
      get().fetchProducts();
    } catch (error) {
      toast.error('상품 추가에 실패했습니다.');
    }
  },

  deleteProduct: async (productId) => {
    if (!window.confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      return;
    }
    try {
      await axios.delete(`${API_URL}/products/${productId}`);
      toast.success('상품을 삭제했습니다.');
      // 성공 시, 상품 목록을 다시 불러와서 화면을 갱신합니다.
      get().fetchProducts();
    } catch (error) {
      toast.error('상품 삭제에 실패했습니다.');
    }
  },
}));
