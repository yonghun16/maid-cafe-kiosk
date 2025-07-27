// 파일: apps/frontend/components/ProductCard.tsx
// 역할: 상품 카드 하나의 UI와 기능을 담당하는 독립된 컴포넌트입니다.

import type { Product } from '@repo/types';

// 이 컴포넌트가 어떤 props를 받을지 정의합니다.
interface ProductCardProps {
  product: Product; // 표시할 상품의 데이터
  onAddToCart: (product: Product) => void; // 클릭했을 때 실행될 함수
}

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  return (
    <div
      className="border rounded-xl p-4 flex flex-col items-center cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all bg-white"
      onClick={() => onAddToCart(product)} // 클릭 시 부모로부터 받은 함수를 실행합니다.
    >
      <img 
        src={product.imageUrl} 
        alt={product.name} 
        className="w-32 h-32 object-cover mb-4 rounded-lg" 
      />
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-700">{product.name}</h3>
        <p className="text-gray-600 mt-1">{product.price.toLocaleString()}원</p>
      </div>
    </div>
  );
}
