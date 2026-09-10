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
          orderType만 다시 고르게 됩니다. */}
      <div className="container mx-auto px-4 pt-4 md:px-8 md:pt-6">
        <button
          type="button"
          onClick={resetOrderType}
          className="inline-flex items-center gap-1.5 rounded-full bg-white/80 px-3 py-1.5 text-xs font-semibold text-gray-500 shadow-sm transition-colors hover:bg-white hover:text-pink-500"
        >
          <span>↩ 처음으로</span>
          <span className="text-gray-300">|</span>
          <span>{orderType === 'dine-in' ? '🍽️ 매장' : '🥡 포장'}</span>
        </button>
      </div>
      <div className="container mx-auto flex flex-col gap-6 p-4 md:flex-row md:gap-8 md:p-8">
        <ProductList />
        <OrderSummary />
      </div>
    </div>
  );
}
