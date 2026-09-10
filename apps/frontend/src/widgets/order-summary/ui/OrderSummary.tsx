// @owner: ai
'use client';

import { useState } from 'react';
import { useCartStore } from '../../../features/cart';
import { useOrderTypeStore } from '../../../features/order-type';

export function OrderSummary() {
  const items = useCartStore((state) => state.items);
  const totalPrice = useCartStore((state) => state.totalPrice);
  const submitOrder = useCartStore((state) => state.submitOrder);
  const increaseQuantity = useCartStore((state) => state.increaseQuantity);
  const decreaseQuantity = useCartStore((state) => state.decreaseQuantity);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const orderType = useOrderTypeStore((state) => state.orderType);
  const resetOrderType = useOrderTypeStore((state) => state.resetOrderType);
  const [isMobileListOpen, setIsMobileListOpen] = useState(false);

  // ✅ 주문이 성공하면 다음 손님을 위해 매장/포장 선택 화면으로 되돌립니다.
  const handleOrderSubmit = async () => {
    if (!orderType) return;
    const success = await submitOrder(orderType);
    if (success) {
      resetOrderType();
    }
  };

  const totalCount = items.reduce((sum, item) => sum + item.quantity, 0);

  const itemList = (
    <div className="space-y-3">
      {items.length === 0 ? (
        <div className="flex h-32 flex-col items-center justify-center text-gray-400">
          <p>장바구니가 비어있어요</p>
          <p className="mt-1 text-sm">상품을 클릭해서 추가해주세요!</p>
        </div>
      ) : (
        items.map((item) => (
          <div key={item.cartItemId} className="rounded-md bg-white p-3 shadow-sm">
            <div className="flex items-center gap-3">
              <img src={item.imageUrl} alt={item.name} className="h-12 w-12 shrink-0 rounded-md object-cover" />
              <div className="min-w-0 flex-1">
                {/* ✅ 이름+옵션을 하나의 truncate 문단에 넣으면 옵션이
                    화면 밖으로 밀려 통째로 가려질 수 있어서, 옵션은
                    줄바꿈되는 별도 영역으로 뺍니다. */}
                <p className="truncate font-semibold text-gray-800">{item.name}</p>
                {(item.temperature || item.magicSpell || (item.selectedOptions?.length ?? 0) > 0) && (
                  <p className="flex flex-wrap gap-x-1 text-xs font-normal text-pink-500">
                    {item.temperature && <span>({item.temperature === 'HOT' ? '🔥 HOT' : '🧊 ICE'})</span>}
                    {item.magicSpell && <span>(🪄 {item.magicSpell})</span>}
                    {item.selectedOptions?.map((option) => <span key={option.name}>({option.name})</span>)}
                  </p>
                )}
                <p className="whitespace-nowrap text-sm text-gray-500">{item.price.toLocaleString()}원</p>
              </div>
              <button
                type="button"
                onClick={() => removeFromCart(item.cartItemId)}
                aria-label="삭제"
                className="shrink-0 text-gray-300 hover:text-red-400"
              >
                🗑
              </button>
            </div>
            <div className="mt-2 flex items-center justify-end gap-1">
              <button
                type="button"
                onClick={() => decreaseQuantity(item.cartItemId)}
                aria-label="수량 감소"
                className="flex h-6 w-6 items-center justify-center rounded-full border border-pink-200 text-pink-500 hover:bg-pink-50"
              >
                −
              </button>
              <span className="w-5 text-center text-sm font-semibold">{item.quantity}</span>
              <button
                type="button"
                onClick={() => increaseQuantity(item.cartItemId)}
                aria-label="수량 증가"
                className="flex h-6 w-6 items-center justify-center rounded-full border border-pink-200 text-pink-500 hover:bg-pink-50"
              >
                +
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const divider = (
    <div className="my-3 flex items-center gap-3">
      <div className="h-px flex-1 bg-pink-200" />
      <span className="text-sm">🎀</span>
      <div className="h-px flex-1 bg-pink-200" />
    </div>
  );

  const orderButton = (
    <button
      type="button"
      onClick={handleOrderSubmit}
      disabled={items.length === 0}
      className="w-full rounded-full bg-pink-500 py-3 text-lg font-bold text-white shadow-md transition-all hover:bg-pink-600 disabled:bg-gray-300 disabled:shadow-none"
    >
      ♥ 주문하기
    </button>
  );

  return (
    <aside className="w-full md:w-2/5 lg:w-1/3">
      {/* 데스크톱/태블릿: 항상 펼쳐진 사이드바 */}
      <div className="sticky top-8 hidden rounded-2xl bg-white p-6 shadow-lg md:block">
        <h2 className="text-center text-xl font-bold text-pink-500">🎀 주문 목록 🎀</h2>
        <p className="mt-1 text-center text-sm text-gray-400">
          {orderType === 'dine-in' ? '🍽️ 매장에서' : '🥡 포장'}
        </p>
        <div className="mt-4 min-h-[160px] rounded-xl bg-pink-50 p-4">{itemList}</div>
        {divider}
        <div className="mb-3 flex justify-between text-lg font-bold">
          <span>총 금액</span>
          <span className="text-pink-600">{totalPrice.toLocaleString()}원</span>
        </div>
        {orderButton}
      </div>

      {/* 모바일: 접이식 요약 카드 */}
      <div className="rounded-2xl bg-white p-4 shadow-lg md:hidden">
        <button
          type="button"
          onClick={() => setIsMobileListOpen((prev) => !prev)}
          className="flex w-full items-center justify-between gap-2"
        >
          <span className="flex items-center gap-2">
            <span className="relative text-xl">
              🛒
              {totalCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[10px] text-white">
                  {totalCount}
                </span>
              )}
            </span>
            <span className="text-sm text-gray-500">총 {totalCount}개</span>
          </span>
          <span className="font-bold text-pink-600">{totalPrice.toLocaleString()}원</span>
          <span className={`text-gray-400 transition-transform ${isMobileListOpen ? 'rotate-90' : ''}`}>›</span>
        </button>

        {isMobileListOpen && <div className="mt-4 rounded-xl bg-pink-50 p-4">{itemList}</div>}

        <div className="mt-4">{orderButton}</div>
      </div>
    </aside>
  );
}
