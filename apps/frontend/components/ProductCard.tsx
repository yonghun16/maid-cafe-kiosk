import type { Product } from '@repo/types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div
      className="group relative overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
      onClick={() => onAddToCart(product)}
    >
      <div className="cursor-pointer">
        <img 
          src={product.imageUrl} 
          alt={product.name} 
          className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105" // ✅ 마우스 올렸을 때 이미지 확대 효과
        />
        <div className="p-4">
          <h3 className="text-lg font-semibold text-gray-800">{product.name}</h3>
          <p className="mt-1 text-gray-600">{product.price.toLocaleString()}원</p>
        </div>
      </div>
    </div>
  );
}
