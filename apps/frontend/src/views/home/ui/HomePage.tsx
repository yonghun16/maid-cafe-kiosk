// @owner: ai
'use client';

import { useOrderTypeStore } from '../../../features/order-type';
import { OrderTypeSelect } from '../../../widgets/order-type-select';
import { ProductList } from '../../../widgets/product-list';
import { OrderSummary } from '../../../widgets/order-summary';

export function HomePage() {
  const orderType = useOrderTypeStore((state) => state.orderType);
  const resetOrderType = useOrderTypeStore((state) => state.resetOrderType);

  if (!orderType) {
    return <OrderTypeSelect />;
  }

  return (
    <div className="min-h-screen bg-kiosk-pattern font-sans text-gray-700">
      {/* ✅ 매장/포장은 중간에 바꿀 수도 있어서, 처음 선택 화면으로 바로
          돌아갈 수 있는 버튼을 둡니다. 장바구니는 그대로 유지된 채
          orderType만 다시 고르게 됩니다. 키오스크에서 메뉴를 스크롤해
          내려가도 버튼이 화면 밖으로 사라지지 않도록 상단 고정 바로
          만들고, 터치하기 쉽게 크고 또렷한 버튼으로 키웠습니다. */}
      <div className="fixed inset-x-0 top-0 z-40 bg-white/95 shadow-sm backdrop-blur-sm">
        <div className="container mx-auto flex items-center justify-between px-4 py-3 md:px-8">
          <span className="text-sm font-semibold text-gray-400 md:text-base">
            {orderType === 'dine-in' ? '🍽️ 매장에서 주문 중' : '🥡 포장 주문 중'}
          </span>
          <button
            type="button"
            onClick={resetOrderType}
            className="inline-flex items-center gap-1.5 rounded-full bg-pink-500 px-4 py-2 text-sm font-bold text-white shadow-sm transition-colors hover:bg-pink-600 md:px-5 md:py-2.5 md:text-base"
          >
            ↩ 처음으로
          </button>
        </div>
      </div>
      <div className="container mx-auto flex flex-col gap-6 p-4 pt-20 md:flex-row md:gap-8 md:p-8 md:pt-24">
        <ProductList />
        <OrderSummary />
      </div>
    </div>
  );
}
