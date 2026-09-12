// @owner: ai
'use client';

import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import type { Product } from '@repo/types';
import { ProductCard, getProducts } from '../../../entities/product';
import { useCategoryFilterStore } from '../../../entities/category';
import { useCartStore } from '../../../features/cart';
import { CategoryFilterBar } from './CategoryFilterBar';

// ✅ 상단 고정 헤더의 실제 높이(약 56px)만큼 뷰포트 상단을 당겨서,
// 이 지점 아래에서 카테고리 탭이 헤더 바로 밑에 닿기 직전에
// docked 상태로 전환되게 합니다.
const HEADER_HEIGHT_PX = 56;

export function ProductList() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // ✅ 카테고리 탭(CategoryFilterBar)은 이 컴포넌트 안에서 렌더링하되
  // entities/category의 공유 스토어를 통해 선택 상태를 받아옵니다.
  const selectedCategory = useCategoryFilterStore((state) => state.selectedCategory);
  const isHeaderDocked = useCategoryFilterStore((state) => state.isHeaderDocked);
  const setHeaderDocked = useCategoryFilterStore((state) => state.setHeaderDocked);
  const categoryRowRef = useRef<HTMLDivElement>(null);

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

  // ✅ 카테고리 탭이 원래 자리(제목 바로 아래)에서 스크롤에 밀려 상단
  // 고정 헤더 밑으로 넘어가려는 순간을 감지해서, 헤더 쪽 사본이 대신
  // 나타나 "탭이 헤더 안으로 들어가는" 것처럼 보이게 합니다. 실제로
  // 두 벌이 같은 스토어를 보고 있다가 하나는 숨고 하나는 나타나는
  // 방식이라 클릭 가능한 사본은 항상 하나뿐입니다(숨은 쪽은
  // pointer-events-none).
  useEffect(() => {
    const target = categoryRowRef.current;
    if (!target) return;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry) setHeaderDocked(!entry.isIntersecting);
      },
      { rootMargin: `-${HEADER_HEIGHT_PX}px 0px 0px 0px`, threshold: 0 },
    );
    observer.observe(target);
    return () => observer.disconnect();
  }, [setHeaderDocked]);

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

      {/* ✅ 평소엔 이 자리(제목 바로 아래)에 그대로 있다가, 스크롤해서
          상단 고정 헤더 밑으로 넘어가려는 순간 투명해지면서(자리는
          그대로 차지) 헤더 쪽 사본이 대신 나타납니다 — "탭이 헤더 안
          으로 들어가는" 효과. 자리를 계속 차지하게 두는 이유는, 이
          위치 자체가 IntersectionObserver의 관찰 대상이라 높이가
          바뀌면 스크롤 위치와 감지 결과가 서로 영향을 주는 문제가
          생기기 때문입니다. */}
      <div
        ref={categoryRowRef}
        className={`mb-6 transition-opacity duration-150 ${isHeaderDocked ? 'pointer-events-none opacity-0' : 'opacity-100'}`}
      >
        <CategoryFilterBar />

        <div className="mt-4 flex items-center gap-3">
          <div className="h-px flex-1 bg-pink-200" />
          <span className="text-sm">🎀</span>
          <div className="h-px flex-1 bg-pink-200" />
        </div>
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
