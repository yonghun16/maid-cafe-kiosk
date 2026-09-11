// @owner: ai
import { create } from 'zustand';
import Toast from 'react-native-toast-message';
import type { CartItem, Order, OrderType, PaymentMethod, Product, ProductOption } from '@repo/types';
import { submitOrder as submitOrderRequest } from '../api/orderApi';

interface AddToCartOptions {
  temperature?: 'HOT' | 'ICE';
  iceAmount?: '적게' | '적당' | '많이';
  magicSpell?: string;
  selectedOptions?: ProductOption[];
}

interface CartState {
  items: CartItem[];
  totalPrice: number;
  // 방금 성공적으로 제출한 주문. 주문완료화면에서 주문번호를 보여주는
  // 용도로만 쓰이고, 그 화면을 닫으면 다시 null로 비웁니다.
  lastCompletedOrder: Order | null;
  addToCart: (product: Product, options?: AddToCartOptions) => void;
  increaseQuantity: (cartItemId: string) => void;
  decreaseQuantity: (cartItemId: string) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  clearLastCompletedOrder: () => void;
  submitOrder: (orderType: OrderType, paymentMethod: PaymentMethod) => Promise<boolean>;
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
  items: [],
  totalPrice: 0,
  lastCompletedOrder: null,

  addToCart: (product, options) => {
    const temperature = options?.temperature;
    const iceAmount = options?.iceAmount;
    const magicSpell = options?.magicSpell;
    const selectedOptions = options?.selectedOptions;
    const cartItemId = makeCartItemId(product._id, temperature, iceAmount, magicSpell, selectedOptions);

    const { items } = get();
    const existingItem = items.find((item) => item.cartItemId === cartItemId);

    let updatedItems: CartItem[];
    if (existingItem) {
      updatedItems = items.map((item) =>
        item.cartItemId === cartItemId ? { ...item, quantity: item.quantity + 1 } : item,
      );
    } else {
      // 메뉴별 커스텀 옵션의 추가금은 여기서 가격에 미리 더해둡니다.
      // 온도/마법의 주문은 가격에 영향 없는 옵션입니다.
      const selectedOptionsPrice = (selectedOptions ?? []).reduce((sum, o) => sum + o.price, 0);
      const price = product.price + selectedOptionsPrice;
      updatedItems = [
        ...items,
        { ...product, price, quantity: 1, cartItemId, temperature, iceAmount, magicSpell, selectedOptions },
      ];
    }

    set({ items: updatedItems, totalPrice: calculateTotalPrice(updatedItems) });

    const optionLabel = [
      temperature,
      iceAmount && `얼음 ${iceAmount}`,
      magicSpell,
      ...(selectedOptions ?? []).map((o) => o.name),
    ]
      .filter(Boolean)
      .join(', ');
    Toast.show({
      type: 'success',
      text1: `${product.name}${optionLabel ? ` (${optionLabel})` : ''}을(를) 장바구니에 담았습니다!`,
    });
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
      .map((item) => (item.cartItemId === cartItemId ? { ...item, quantity: item.quantity - 1 } : item))
      .filter((item) => item.quantity > 0);
    set({ items: updatedItems, totalPrice: calculateTotalPrice(updatedItems) });
  },

  removeFromCart: (cartItemId) => {
    const { items } = get();
    const updatedItems = items.filter((item) => item.cartItemId !== cartItemId);
    set({ items: updatedItems, totalPrice: calculateTotalPrice(updatedItems) });
  },

  clearCart: () => {
    set({ items: [], totalPrice: 0 });
  },

  clearLastCompletedOrder: () => {
    set({ lastCompletedOrder: null });
  },

  submitOrder: async (orderType, paymentMethod) => {
    const { items, totalPrice } = get();
    if (items.length === 0) {
      Toast.show({ type: 'error', text1: '장바구니가 비어있습니다.' });
      return false;
    }

    try {
      const createdOrder = await submitOrderRequest({
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
        paymentMethod,
      });

      // 주문 완료 후 장바구니 비우고, 생성된 주문을 주문완료화면에서
      // 쓸 수 있게 남겨둡니다(주문번호 안내용).
      set({ items: [], totalPrice: 0, lastCompletedOrder: createdOrder });
      return true;
    } catch (error) {
      console.error('주문 처리 중 오류가 발생했습니다:', error);
      Toast.show({ type: 'error', text1: '주문 처리 중 오류가 발생했습니다.' });
      return false;
    }
  },
}));
