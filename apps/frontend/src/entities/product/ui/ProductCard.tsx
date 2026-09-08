// @owner: ai
import toast from 'react-hot-toast';
import type { Product } from '@repo/types';

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product) => void;
}

// 카테고리를 관리자가 자유롭게 추가/삭제할 수 있어 카테고리별 고정 색상
// 대신 카드 전체에 하나의 통일된 스타일을 씁니다.
const CARD_STYLE = { bg: 'bg-pink-50', paw: 'text-pink-400' };

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const handleClick = () => {
    if (product.isSoldOut) {
      toast.error('품절된 메뉴입니다.');
      return;
    }
    onAddToCart(product);
  };

  return (
    <div
      className={`group relative overflow-hidden rounded-2xl border border-pink-100 bg-white shadow-sm transition-all duration-300 ${
        product.isSoldOut ? 'cursor-not-allowed opacity-60' : 'cursor-pointer hover:-translate-y-1 hover:shadow-lg'
      }`}
      onClick={handleClick}
    >
      {product.isSoldOut && (
        <span className="absolute left-3 top-3 z-10 rounded-full bg-gray-700/90 px-3 py-1 text-xs font-bold text-white">
          품절
        </span>
      )}
      <div className={`${CARD_STYLE.bg} p-3`}>
        <img
          src={product.imageUrl}
          alt={product.name}
          className={`aspect-[3/4] w-full rounded-lg object-cover transition-transform duration-300 ${
            product.isSoldOut ? 'grayscale' : 'group-hover:scale-105' // ✅ 마우스 올렸을 때 이미지 확대 효과(품절 시에는 비활성)
          }`}
        />
      </div>
      <div className="relative p-3 sm:p-4">
        <h3 className="flex items-center gap-1 text-base font-semibold text-gray-800 sm:text-lg">
          {product.name}
          <span className="text-pink-400">♥</span>
        </h3>
        <p className="mt-1 font-bold text-pink-600">{product.price.toLocaleString()}원</p>
        <span className={`absolute bottom-3 right-3 ${CARD_STYLE.paw}`}>🐾</span>
      </div>
    </div>
  );
}
