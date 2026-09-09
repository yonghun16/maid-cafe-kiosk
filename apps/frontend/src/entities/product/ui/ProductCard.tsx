// @owner: ai
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Product } from '@repo/types';
import { Modal } from '../../../shared/ui';
import { EXTRA_SHOT_PRICE } from '../model/optionConstants';

interface ProductOptions {
  hasExtraShot: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: (product: Product, options: ProductOptions) => void;
}

// 카테고리를 관리자가 자유롭게 추가/삭제할 수 있어 카테고리별 고정 색상
// 대신 카드 전체에 하나의 통일된 스타일을 씁니다.
const CARD_STYLE = { bg: 'bg-pink-50', paw: 'text-pink-400' };

export default function ProductCard({ product, onAddToCart }: ProductCardProps) {
  // ✅ 카드를 클릭하면 바로 담기지 않고, 옵션(샷 추가)을 고를 수 있는
  // 모달이 먼저 뜹니다([[상품옵션선택]] 참고).
  const [isOptionModalOpen, setIsOptionModalOpen] = useState(false);
  const [hasExtraShot, setHasExtraShot] = useState(false);

  const handleClick = () => {
    if (product.isSoldOut) {
      toast.error('품절된 메뉴입니다.');
      return;
    }
    setHasExtraShot(false);
    setIsOptionModalOpen(true);
  };

  const handleAdd = () => {
    onAddToCart(product, { hasExtraShot });
    setIsOptionModalOpen(false);
  };

  const totalPrice = product.price + (hasExtraShot ? EXTRA_SHOT_PRICE : 0);

  return (
    <>
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

      <Modal isOpen={isOptionModalOpen} onClose={() => setIsOptionModalOpen(false)} title={product.name}>
        <div className="space-y-4">
          <img src={product.imageUrl} alt={product.name} className="h-40 w-full rounded-lg object-cover" />
          <label className="flex cursor-pointer items-center justify-between rounded-lg border border-pink-100 px-4 py-3">
            <span className="font-semibold text-gray-700">샷 추가</span>
            <span className="flex items-center gap-2">
              <span className="text-sm text-gray-500">+{EXTRA_SHOT_PRICE.toLocaleString()}원</span>
              <input
                type="checkbox"
                checked={hasExtraShot}
                onChange={(e) => setHasExtraShot(e.target.checked)}
                className="h-5 w-5 accent-pink-500"
              />
            </span>
          </label>
          <p className="text-right text-lg font-bold text-pink-600">{totalPrice.toLocaleString()}원</p>
          <button
            type="button"
            onClick={handleAdd}
            className="w-full rounded-md bg-pink-500 py-3 text-base font-bold text-white transition-colors hover:bg-pink-600"
          >
            담기
          </button>
        </div>
      </Modal>
    </>
  );
}
