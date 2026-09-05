// @owner: ai
import { ProductList } from '../../../widgets/product-list';
import { OrderSummary } from '../../../widgets/order-summary';

export function HomePage() {
  return (
    <div className="min-h-screen bg-pink-50 font-sans text-gray-700">
      <div className="container mx-auto flex flex-col gap-8 p-4 lg:flex-row lg:p-8">
        <ProductList />
        <OrderSummary />
      </div>
    </div>
  );
}
