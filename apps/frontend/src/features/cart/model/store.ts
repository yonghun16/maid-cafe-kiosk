// @owner: ai
import { create } from 'zustand';
import toast from 'react-hot-toast';
import type { Product, CartItem } from '@repo/types';
import { submitOrder as submitOrderRequest } from '../api/orderApi';

// 장바구니 스토어의 상태와 액션에 대한 타입 정의
interface CartState {
  items: CartItem[];
  totalPrice: number;
  addToCart: (product: Product) => void;
  increaseQuantity: (productId: string) => void;
  decreaseQuantity: (productId: string) => void;
  removeFromCart: (productId: string) => void;
  submitOrder: () => Promise<void>;
}

function calculateTotalPrice(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
}

export const useCartStore = create<CartState>((set, get) => ({
  // 1. 상태 (데이터)
  items: [],
  totalPrice: 0,

  // 2. 액션 (상태를 변경하는 함수)
  addToCart: (product) => {
    const { items } = get(); // 현재 장바구니 상태 가져오기
    const existingItem = items.find((item) => item._id === product._id);

    let updatedItems: CartItem[];
    if (existingItem) {
      // 이미 있으면 수량만 1 증가
      updatedItems = items.map((item) =>
        item._id === product._id
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );
    } else {
      // 없으면 새로 추가
      updatedItems = [...items, { ...product, quantity: 1 }];
    }

    // 상태 업데이트
    set({ items: updatedItems, totalPrice: calculateTotalPrice(updatedItems) });

    toast.success(`${product.name}을(를) 장바구니에 담았습니다!`);
  },

  increaseQuantity: (productId) => {
    const { items } = get();
    const updatedItems = items.map((item) =>
      item._id === productId ? { ...item, quantity: item.quantity + 1 } : item,
    );
    set({ items: updatedItems, totalPrice: calculateTotalPrice(updatedItems) });
  },

  decreaseQuantity: (productId) => {
    const { items } = get();
    const updatedItems = items
      .map((item) =>
        item._id === productId ? { ...item, quantity: item.quantity - 1 } : item,
      )
      .filter((item) => item.quantity > 0);
    set({ items: updatedItems, totalPrice: calculateTotalPrice(updatedItems) });
  },

  removeFromCart: (productId) => {
    const { items } = get();
    const updatedItems = items.filter((item) => item._id !== productId);
    set({ items: updatedItems, totalPrice: calculateTotalPrice(updatedItems) });
  },

  submitOrder: async () => {
    const { items, totalPrice } = get();
    if (items.length === 0) {
      toast.error('장바구니가 비어있습니다.');
      return;
    }

    const loadingToast = toast.loading('주문을 처리 중입니다...');
    try {
      await submitOrderRequest({
        items: items.map((item) => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalPrice,
      });

      toast.dismiss(loadingToast);
      toast.success('주문이 성공적으로 완료되었습니다!');

      // 주문 완료 후 장바구니 비우기
      set({ items: [], totalPrice: 0 });
    } catch (error) {
      console.error('주문 처리 중 오류가 발생했습니다:', error);
      toast.dismiss(loadingToast);
      toast.error('주문 처리 중 오류가 발생했습니다.');
    }
  },
}));
