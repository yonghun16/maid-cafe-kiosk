// @owner: ai
'use client';

import { useOrderTypeStore } from '../../../features/order-type';
import { OrderTypeSelect } from '../../../widgets/order-type-select';
import { ProductList } from '../../../widgets/product-list';
import { OrderSummary } from '../../../widgets/order-summary';

export function HomePage() {
  const orderType = useOrderTypeStore((state) => state.orderType);

  if (!orderType) {
    return <OrderTypeSelect />;
  }

  return (
    <div className="min-h-screen bg-kiosk-pattern font-sans text-gray-700">
      <div className="container mx-auto flex flex-col gap-6 p-4 md:flex-row md:gap-8 md:p-8">
        <ProductList />
        <OrderSummary />
      </div>
    </div>
  );
}
