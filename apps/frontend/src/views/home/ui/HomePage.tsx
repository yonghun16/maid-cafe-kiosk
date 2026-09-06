// @owner: ai
import { ProductList } from '../../../widgets/product-list';
import { OrderSummary } from '../../../widgets/order-summary';

export function HomePage() {
  return (
    <div className="min-h-screen bg-kiosk-pattern font-sans text-gray-700">
      <div className="container mx-auto flex flex-col gap-6 p-4 md:flex-row md:gap-8 md:p-8">
        <ProductList />
        <OrderSummary />
      </div>
    </div>
  );
}
