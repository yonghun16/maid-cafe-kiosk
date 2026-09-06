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
      <footer className="mt-8 flex items-center justify-between bg-pink-500 px-6 py-3 text-sm font-medium text-white">
        <span>🐾 환영합니다 주인님!</span>
        <span className="hidden sm:inline">오늘도 귀여운 하루 되세요, 주인님! ✨</span>
        <span>💗</span>
      </footer>
    </div>
  );
}
