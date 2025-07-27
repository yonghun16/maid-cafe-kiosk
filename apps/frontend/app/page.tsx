import { ProductList } from '../widgets/product-list/ui/ProductList';
import { OrderSummary } from '../widgets/order-summary/ui/OrderSummary';

export default function Home() {
  return (
    <div className="min-h-screen bg-pink-50 font-sans text-gray-700">
      <div className="container mx-auto flex flex-col gap-8 p-4 lg:flex-row lg:p-8">
        <ProductList />
        <OrderSummary />
      </div>
    </div>
  );
}
