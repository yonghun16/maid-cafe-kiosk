// @owner: ai
'use client';

import { useCartStore } from '../../../features/cart';

export function OrderSummary() {
  // ✅ Zustand 스토어에서 필요한 상태와 함수를 모두 가져옵니다.
  const { items, totalPrice, submitOrder } = useCartStore();

  return (
    <aside className="w-full lg:w-1/3">
      <div className="sticky top-8 rounded-xl bg-white p-6 shadow-lg">
        <h2 className="text-2xl font-bold text-pink-500">🛒 주문 목록</h2>
        <div className="mt-4 space-y-3 min-h-[200px] rounded-lg bg-pink-50 p-4">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-gray-400">
              <p>장바구니가 비어있어요</p>
              <p className="mt-1 text-sm">상품을 클릭해서 추가해주세요!</p>
            </div>
          ) : (
            items.map(item => (
              <div key={item._id} className="flex items-center justify-between rounded-md bg-white p-3 shadow-sm">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-500">{item.price.toLocaleString()}원 x {item.quantity}</p>
                </div>
                <p className="font-bold text-pink-500">{(item.price * item.quantity).toLocaleString()}원</p>
              </div>
            ))
          )}
        </div>
        <div className="mt-6 border-t border-gray-200 pt-4">
          <div className="flex justify-between text-xl font-bold">
            <span>총 금액:</span>
            <span className="text-pink-600">{totalPrice.toLocaleString()}원</span>
          </div>
          <button
            onClick={submitOrder} // ✅ 스토어의 함수를 직접 연결
            className="mt-4 w-full rounded-lg bg-pink-500 py-3 text-lg font-bold text-white shadow-md transition-all hover:bg-pink-600 disabled:bg-gray-300 disabled:shadow-none"
            disabled={items.length === 0}
          >
            주문하기
          </button>
        </div>
      </div>
    </aside>
  );
}
