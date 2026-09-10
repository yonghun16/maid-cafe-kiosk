// @owner: ai
import { create } from 'zustand';
import toast from 'react-hot-toast';
import type { OrderType, Product, CartItem, ProductOption } from '@repo/types';
import { submitOrder as submitOrderRequest } from '../api/orderApi';

interface AddToCartOptions {
  temperature?: 'HOT' | 'ICE';
  iceAmount?: '적게' | '적당' | '많이';
  magicSpell?: string;
  selectedOptions?: ProductOption[];
}

// 장바구니 스토어의 상태와 액션에 대한 타입 정의
interface CartState {
  items: CartItem[];
  totalPrice: number;
  addToCart: (product: Product, options?: AddToCartOptions) => void;
  increaseQuantity: (cartItemId: string) => void;
  decreaseQuantity: (cartItemId: string) => void;
  removeFromCart: (cartItemId: string) => void;
  submitOrder: (orderType: OrderType) => Promise<boolean>;
}

function calculateTotalPrice(items: CartItem[]): number {
  return items.reduce((acc, item) => acc + item.price * item.quantity, 0);
}

/**
 * 상품 id + 선택한 옵션으로 장바구니 줄의 고유 id를 만듭니다. 같은
 * 상품이라도 옵션 조합이 다르면 다른 줄로 취급해야 하기 때문입니다.
 */
function makeCartItemId(
  productId: string,
  temperature?: 'HOT' | 'ICE',
  iceAmount?: '적게' | '적당' | '많이',
  magicSpell?: string,
  selectedOptions?: ProductOption[],
): string {
  const parts = [productId];
  if (temperature) parts.push(`temp:${temperature}`);
  if (iceAmount) parts.push(`ice:${iceAmount}`);
  if (magicSpell) parts.push(`spell:${magicSpell}`);
  if (selectedOptions && selectedOptions.length > 0) {
    parts.push(`opts:${selectedOptions.map((o) => o.name).join(',')}`);
  }
  return parts.join(':');
}

export const useCartStore = create<CartState>((set, get) => ({
  // 1. 상태 (데이터)
  items: [],
  totalPrice: 0,

  // 2. 액션 (상태를 변경하는 함수)
  addToCart: (product, options) => {
    const temperature = options?.temperature;
    const iceAmount = options?.iceAmount;
    const magicSpell = options?.magicSpell;
    const selectedOptions = options?.selectedOptions;
    const cartItemId = makeCartItemId(product._id, temperature, iceAmount, magicSpell, selectedOptions);

    const { items } = get(); // 현재 장바구니 상태 가져오기
    const existingItem = items.find((item) => item.cartItemId === cartItemId);

    let updatedItems: CartItem[];
    if (existingItem) {
      // 이미 같은 옵션으로 담겨 있으면 수량만 1 증가
      updatedItems = items.map((item) =>
        item.cartItemId === cartItemId
          ? { ...item, quantity: item.quantity + 1 }
          : item,
      );
    } else {
      // 없으면 새로 추가. 메뉴별 커스텀 옵션의 추가금은 여기서 가격에
      // 미리 더해둡니다. 온도/마법의 주문은 가격에 영향 없는 옵션입니다.
      const selectedOptionsPrice = (selectedOptions ?? []).reduce((sum, o) => sum + o.price, 0);
      const price = product.price + selectedOptionsPrice;
      updatedItems = [
        ...items,
        { ...product, price, quantity: 1, cartItemId, temperature, iceAmount, magicSpell, selectedOptions },
      ];
    }

    // 상태 업데이트
    set({ items: updatedItems, totalPrice: calculateTotalPrice(updatedItems) });

    const optionLabel = [
      temperature,
      iceAmount && `얼음 ${iceAmount}`,
      magicSpell,
      ...(selectedOptions ?? []).map((o) => o.name),
    ]
      .filter(Boolean)
      .join(', ');
    toast.success(`${product.name}${optionLabel ? ` (${optionLabel})` : ''}을(를) 장바구니에 담았습니다!`);
  },

  increaseQuantity: (cartItemId) => {
    const { items } = get();
    const updatedItems = items.map((item) =>
      item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item,
    );
    set({ items: updatedItems, totalPrice: calculateTotalPrice(updatedItems) });
  },

  decreaseQuantity: (cartItemId) => {
    const { items } = get();
    const updatedItems = items
      .map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: item.quantity - 1 } : item,
      )
      .filter((item) => item.quantity > 0);
    set({ items: updatedItems, totalPrice: calculateTotalPrice(updatedItems) });
  },

  removeFromCart: (cartItemId) => {
    const { items } = get();
    const updatedItems = items.filter((item) => item.cartItemId !== cartItemId);
    set({ items: updatedItems, totalPrice: calculateTotalPrice(updatedItems) });
  },

  submitOrder: async (orderType) => {
    const { items, totalPrice } = get();
    if (items.length === 0) {
      toast.error('장바구니가 비어있습니다.');
      return false;
    }

    const loadingToast = toast.loading('주문을 처리 중입니다...');
    try {
      await submitOrderRequest({
        items: items.map((item) => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          imageUrl: item.imageUrl,
          quantity: item.quantity,
          temperature: item.temperature,
          iceAmount: item.iceAmount,
          magicSpell: item.magicSpell,
          selectedOptions: item.selectedOptions,
        })),
        totalPrice,
        orderType,
      });

      toast.dismiss(loadingToast);
      toast.success('주문이 성공적으로 완료되었습니다!');

      // 주문 완료 후 장바구니 비우기
      set({ items: [], totalPrice: 0 });
      return true;
    } catch (error) {
      console.error('주문 처리 중 오류가 발생했습니다:', error);
      toast.dismiss(loadingToast);
      toast.error('주문 처리 중 오류가 발생했습니다.');
      return false;
    }
  },
}));
