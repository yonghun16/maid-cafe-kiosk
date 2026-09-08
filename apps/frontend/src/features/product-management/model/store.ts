// @owner: ai
import { create } from 'zustand';
import toast from 'react-hot-toast';
import type { Product, ProductInput } from '@repo/types';
import {
  getProducts,
  createProduct,
  updateProduct,
  updateSoldOutStatus,
  deleteProductById,
  reorderProducts,
} from '../../../entities/product';

/**
 * `categoryIds`로 지정된 카테고리에 속한 상품들만, `productId`가 같은
 * 카테고리 안에서 `toIndex` 위치로 옮겨진 새 배열을 반환합니다. 옮길 게
 * 없으면 null. 순서는 카테고리 안에서만 의미가 있어, 다른 카테고리
 * 상품 사이에는 끼워 넣지 않습니다.
 */
function reorderWithinCategory(
  products: Product[],
  productId: string,
  toIndex: number,
): Product[] | null {
  const moved = products.find((p) => p._id === productId);
  if (!moved) return null;

  const sameCategory = products.filter((p) => p.category === moved.category);
  const fromIndex = sameCategory.findIndex((p) => p._id === productId);
  if (fromIndex === -1 || toIndex < 0 || toIndex >= sameCategory.length || fromIndex === toIndex) {
    return null;
  }

  const reorderedCategory = [...sameCategory];
  reorderedCategory.splice(fromIndex, 1);
  reorderedCategory.splice(toIndex, 0, moved);

  // 원래 배열에서 이 카테고리에 속한 자리만 새 순서로 갈아 끼웁니다.
  let cursor = 0;
  return products.map((p) => (p.category === moved.category ? reorderedCategory[cursor++]! : p));
}

// 상품 관리 스토어의 타입 정의
interface ProductState {
  products: Product[];
  isLoading: boolean;
  fetchProducts: () => Promise<void>;
  addProduct: (newProductData: ProductInput) => Promise<boolean>;
  editProduct: (productId: string, updatedData: ProductInput) => Promise<boolean>;
  toggleSoldOut: (productId: string, isSoldOut: boolean) => Promise<void>;
  deleteProduct: (productId: string) => Promise<void>;
  /** ◀▶ 버튼 등으로 같은 카테고리 안에서 앞/뒤 상품과 순서를 바꿉니다. */
  moveProduct: (productId: string, direction: 'up' | 'down') => Promise<void>;
  /**
   * 서버 호출 없이 화면 상태만 즉시 재배치합니다(같은 카테고리 안에서만).
   * 포인터 기반 드래그 중 프레임마다 불러도 API가 매번 나가지 않도록
   * 분리했고, 실제 저장은 `commitProductOrder`가 드롭 시점에 한 번만
   * 합니다.
   */
  reorderLocally: (productId: string, toIndex: number) => void;
  /**
   * `reorderLocally`로 바뀐 현재 화면 순서를 서버에 저장합니다.
   * @param category - 저장할 카테고리. 이 카테고리에 속한 상품들의
   *   현재 화면 순서만 전송합니다(다른 카테고리는 순서가 독립적이라
   *   함께 보낼 필요가 없음).
   */
  commitProductOrder: (category: string) => Promise<void>;
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

  moveProduct: async (productId, direction) => {
    const { products } = get();
    const moved = products.find((p) => p._id === productId);
    if (!moved) return;
    const sameCategory = products.filter((p) => p.category === moved.category);
    const index = sameCategory.findIndex((p) => p._id === productId);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    const reordered = reorderWithinCategory(products, productId, targetIndex);
    if (!reordered) return;

    // 낙관적 업데이트: 서버 응답을 기다리지 않고 화면부터 바꿔서 버튼에
    // 바로 반응하게 합니다. 실패하면 원래 목록을 다시 불러옵니다.
    set({ products: reordered });
    try {
      const sameCategoryIds = reordered.filter((p) => p.category === moved.category).map((p) => p._id);
      await reorderProducts(sameCategoryIds);
    } catch (error) {
      console.error('상품 순서 변경 중 오류가 발생했습니다:', error);
      toast.error('상품 순서 변경에 실패했습니다.');
      get().fetchProducts();
    }
  },

  reorderLocally: (productId, toIndex) => {
    const reordered = reorderWithinCategory(get().products, productId, toIndex);
    if (!reordered) return;
    set({ products: reordered });
  },

  commitProductOrder: async (category) => {
    const { products } = get();
    const sameCategoryIds = products.filter((p) => p.category === category).map((p) => p._id);
    if (sameCategoryIds.length === 0) return;
    try {
      await reorderProducts(sameCategoryIds);
    } catch (error) {
      console.error('상품 순서 저장 중 오류가 발생했습니다:', error);
      toast.error('상품 순서 변경에 실패했습니다.');
      get().fetchProducts();
    }
  },
}));
