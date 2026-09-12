// @owner: ai
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { Product } from '@repo/types';
import { ProductCard, getProducts } from '../../../entities/product';
import { useCategoryFilterStore } from '../../../entities/category';
import { useCartStore } from '../../../features/cart';

export function ProductList() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // ✅ 카테고리 탭은 상단 고정 헤더(CategoryFilterBar)로 옮겨갔지만,
  // 선택 상태는 entities/category의 공유 스토어를 통해 그대로 받아옵니다.
  const selectedCategory = useCategoryFilterStore((state) => state.selectedCategory);

  // ✅ Zustand 스토어에서 장바구니에 담는 함수만 가져옵니다.
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const products = await getProducts();
        setAllProducts(products);
      } catch (error) {
        console.error('메뉴 목록을 불러오는 중 오류가 발생했습니다:', error);
        toast.error('메뉴 목록을 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setFilteredProducts(allProducts);
    } else {
      const filtered = allProducts.filter(product => product.category === selectedCategory);
      setFilteredProducts(filtered);
    }
  }, [selectedCategory, allProducts]);

  return (
    <main className="w-full pb-36 md:w-3/5 md:pb-0 lg:w-2/3">
      {/* ✅ 모바일에서 장바구니 요약 카드가 화면 맨 아래에 고정되므로
          (OrderSummary 참고), 마지막 상품들이 그 뒤에 가려지지 않도록
          바닥 여백을 넉넉히 둡니다. */}
      <header className="mb-6 text-center md:text-left">
        <div className="relative flex items-center justify-center gap-2 md:justify-start">
          <span className="absolute -top-3 left-6 text-sm md:left-2">✨</span>
          <span className="text-2xl">🎀</span>
          <h1 className="font-script text-5xl font-bold text-pink-500 md:text-6xl">Maid Kiosk</h1>
          <span className="text-2xl">🎀</span>
          <span className="absolute -top-2 right-6 text-sm md:right-0">💕</span>
        </div>
        <div className="mt-3 flex justify-center md:justify-start">
          <p className="rounded-full bg-pink-400 px-5 py-1.5 text-sm font-semibold text-white shadow-sm">
            주인님, 무엇을 주문하시겠어요?
          </p>
        </div>
      </header>

      <div className="mb-6 flex items-center gap-3">
        <div className="h-px flex-1 bg-pink-200" />
        <span className="text-sm">🎀</span>
        <div className="h-px flex-1 bg-pink-200" />
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center"><p className="text-pink-500">메뉴를 불러오는 중...</p></div>
      ) : (
        <div className="grid grid-cols-2 gap-4 md:gap-6 xl:grid-cols-3">
          {filteredProducts.map(product => (
            <ProductCard
              key={product._id}
              product={product}
              onAddToCart={addToCart} // ✅ 스토어의 함수를 직접 전달
            />
          ))}
        </div>
      )}
    </main>
  );
}
