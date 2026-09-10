// @owner: ai
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { Product } from '@repo/types';

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
    loading: vi.fn(() => 'toast-id'),
    dismiss: vi.fn(),
  },
}));

const submitOrderMock = vi.fn();
vi.mock('../api/orderApi', () => ({
  submitOrder: (...args: unknown[]) => submitOrderMock(...args),
}));

// 모킹이 걸린 뒤에 import해야 실제 모듈 대신 모킹된 버전을 씁니다.
const { useCartStore } = await import('./store');

const product = (overrides: Partial<Product> = {}): Product => ({
  _id: 'p1',
  name: '아메리카노',
  price: 4000,
  imageUrl: 'https://example.com/a.png',
  category: '커피',
  order: 0,
  ...overrides,
});

beforeEach(() => {
  useCartStore.setState({ items: [], totalPrice: 0, lastCompletedOrder: null });
  submitOrderMock.mockReset();
});

describe('addToCart', () => {
  it('새 상품을 담으면 수량 1로 추가되고 총액이 계산된다', () => {
    useCartStore.getState().addToCart(product());
    const { items, totalPrice } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({ _id: 'p1', quantity: 1, price: 4000 });
    expect(totalPrice).toBe(4000);
  });

  it('같은 상품을 같은 옵션으로 다시 담으면 수량만 증가한다(줄은 그대로)', () => {
    useCartStore.getState().addToCart(product());
    useCartStore.getState().addToCart(product());
    const { items, totalPrice } = useCartStore.getState();
    expect(items).toHaveLength(1);
    expect(items[0]?.quantity).toBe(2);
    expect(totalPrice).toBe(8000);
  });

  it('같은 상품이라도 온도 옵션이 다르면 별도 줄로 취급한다', () => {
    useCartStore.getState().addToCart(product(), { temperature: 'HOT' });
    useCartStore.getState().addToCart(product(), { temperature: 'ICE' });
    const { items } = useCartStore.getState();
    expect(items).toHaveLength(2);
    expect(items.map((i) => i.temperature)).toEqual(['HOT', 'ICE']);
  });

  it('커스텀 옵션의 추가금이 단가에 반영된다', () => {
    useCartStore.getState().addToCart(product(), {
      selectedOptions: [{ name: '샷 추가', price: 700 }],
    });
    const { items, totalPrice } = useCartStore.getState();
    expect(items[0]?.price).toBe(4700);
    expect(totalPrice).toBe(4700);
  });

  it('온도/마법의 주문은 가격에 영향을 주지 않는다', () => {
    useCartStore.getState().addToCart(product(), { temperature: 'ICE', magicSpell: '모에모에뀽' });
    expect(useCartStore.getState().items[0]?.price).toBe(4000);
  });
});

describe('increaseQuantity / decreaseQuantity / removeFromCart', () => {
  it('수량을 늘리고 줄이면 총액도 함께 바뀐다', () => {
    useCartStore.getState().addToCart(product());
    const cartItemId = useCartStore.getState().items[0]!.cartItemId;

    useCartStore.getState().increaseQuantity(cartItemId);
    expect(useCartStore.getState().items[0]?.quantity).toBe(2);
    expect(useCartStore.getState().totalPrice).toBe(8000);

    useCartStore.getState().decreaseQuantity(cartItemId);
    expect(useCartStore.getState().items[0]?.quantity).toBe(1);
    expect(useCartStore.getState().totalPrice).toBe(4000);
  });

  it('수량이 0이 되도록 줄이면 장바구니에서 항목이 제거된다', () => {
    useCartStore.getState().addToCart(product());
    const cartItemId = useCartStore.getState().items[0]!.cartItemId;

    useCartStore.getState().decreaseQuantity(cartItemId);
    expect(useCartStore.getState().items).toHaveLength(0);
    expect(useCartStore.getState().totalPrice).toBe(0);
  });

  it('removeFromCart는 수량과 무관하게 즉시 제거한다', () => {
    useCartStore.getState().addToCart(product());
    useCartStore.getState().increaseQuantity(useCartStore.getState().items[0]!.cartItemId);

    useCartStore.getState().removeFromCart(useCartStore.getState().items[0]!.cartItemId);
    expect(useCartStore.getState().items).toHaveLength(0);
  });
});

describe('clearCart / clearLastCompletedOrder', () => {
  it('clearCart는 주문 없이 장바구니만 비운다', () => {
    useCartStore.getState().addToCart(product());
    useCartStore.getState().clearCart();
    expect(useCartStore.getState().items).toEqual([]);
    expect(useCartStore.getState().totalPrice).toBe(0);
  });
});

describe('submitOrder', () => {
  it('장바구니가 비어있으면 API를 호출하지 않고 false를 반환한다', async () => {
    const result = await useCartStore.getState().submitOrder('takeout', '신용카드');
    expect(result).toBe(false);
    expect(submitOrderMock).not.toHaveBeenCalled();
  });

  it('성공하면 장바구니를 비우고 lastCompletedOrder에 응답을 저장한다', async () => {
    useCartStore.getState().addToCart(product());
    const createdOrder = { _id: 'o1', orderNumber: 1, items: [], totalPrice: 4000, orderType: 'takeout', isCompleted: false, createdAt: new Date() };
    submitOrderMock.mockResolvedValueOnce(createdOrder);

    const result = await useCartStore.getState().submitOrder('takeout', '신용카드');

    expect(result).toBe(true);
    expect(useCartStore.getState().items).toEqual([]);
    expect(useCartStore.getState().totalPrice).toBe(0);
    expect(useCartStore.getState().lastCompletedOrder).toEqual(createdOrder);
  });

  it('실패하면 장바구니를 그대로 유지하고 false를 반환한다', async () => {
    useCartStore.getState().addToCart(product());
    submitOrderMock.mockRejectedValueOnce(new Error('네트워크 오류'));

    const result = await useCartStore.getState().submitOrder('dine-in', 'NPay');

    expect(result).toBe(false);
    expect(useCartStore.getState().items).toHaveLength(1);
    expect(useCartStore.getState().lastCompletedOrder).toBeNull();
  });

  it('clearLastCompletedOrder는 lastCompletedOrder만 지운다', async () => {
    useCartStore.getState().addToCart(product());
    submitOrderMock.mockResolvedValueOnce({ _id: 'o1', orderNumber: 1, items: [], totalPrice: 4000, orderType: 'takeout', isCompleted: false, createdAt: new Date() });
    await useCartStore.getState().submitOrder('takeout', '신용카드');

    useCartStore.getState().clearLastCompletedOrder();
    expect(useCartStore.getState().lastCompletedOrder).toBeNull();
  });
});
