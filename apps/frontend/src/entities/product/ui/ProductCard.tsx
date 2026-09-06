// @owner: ai
import type { Product } from '@repo/types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

const CATEGORY_STYLES: Record<Product['category'], { bg: string; paw: string }> = {
  coffee: { bg: 'bg-amber-50', paw: 'text-amber-400' },
  ade: { bg: 'bg-green-50', paw: 'text-green-400' },
  dessert: { bg: 'bg-pink-50', paw: 'text-pink-400' },
};

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const style = CATEGORY_STYLES[product.category];

  return (
    <div
      className="group relative cursor-pointer overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      onClick={() => onAddToCart(product)}
    >
      <div className={`${style.bg} p-3`}>
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-28 w-full rounded-lg object-cover transition-transform duration-300 group-hover:scale-105 sm:h-36" // ✅ 마우스 올렸을 때 이미지 확대 효과
        />
      </div>
      <div className="relative p-3 sm:p-4">
        <h3 className="flex items-center gap-1 text-base font-semibold text-gray-800 sm:text-lg">
          {product.name}
          <span className="text-pink-400">♥</span>
        </h3>
        <p className="mt-1 font-bold text-pink-600">{product.price.toLocaleString()}원</p>
        <span className={`absolute bottom-3 right-3 ${style.paw}`}>🐾</span>
      </div>
    </div>
  );
}
