// @owner: ai
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { Category, Product } from '@repo/types';
import { ProductCard, getProducts } from '../../../entities/product';
import { getCategories } from '../../../entities/category';
import { useCartStore } from '../../../features/cart';

export function ProductList() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  // ✅ 손님은 "전체보기"에서 메뉴를 고르지 않고 항상 카테고리를 먼저
  // 골라 담기 때문에, "전체" 옵션 없이 첫 카테고리를 기본 선택으로 둡니다.
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  // ✅ Zustand 스토어에서 장바구니에 담는 함수만 가져옵니다.
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        setIsLoading(true);
        const [products, categoryList] = await Promise.all([getProducts(), getCategories()]);
        setAllProducts(products);
        setCategories(categoryList);
        setSelectedCategory(categoryList[0]?.name ?? '');
      } catch (error) {
        console.error('메뉴 목록을 불러오는 중 오류가 발생했습니다:', error);
        toast.error('메뉴 목록을 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (!selectedCategory) {
      setFilteredProducts(allProducts);
    } else {
      const filtered = allProducts.filter(product => product.category === selectedCategory);
      setFilteredProducts(filtered);
    }
  }, [selectedCategory, allProducts]);

  // ✅ 카테고리를 바꾸면 이전 카테고리에서 스크롤해둔 위치가 그대로
  // 남아있어 새 목록의 중간부터 보이는 문제가 있어서, 카테고리를 누를
  // 때마다 페이지를 맨 위로 되돌립니다.
  const handleSelectCategory = (categoryName: string) => {
    setSelectedCategory(categoryName);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

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

      {/* ✅ 스크롤해도 카테고리 탭은 계속 보이도록 고정하고 메뉴 목록만
          그 아래에서 스크롤되게 합니다. 상단 고정 헤더(HomePage,
          높이 약 56px) 바로 아래에 붙도록 top-14로 오프셋을 맞췄습니다. */}
      <div className="sticky top-14 z-20 -mt-2 mb-6 bg-white/95 pb-4 pt-2 shadow-sm backdrop-blur-sm">
        <div className="flex flex-wrap justify-center gap-2 md:justify-start">
          {categories.map(category => (
            <button
              key={category._id}
              onClick={() => handleSelectCategory(category.name)}
              className={`rounded-full px-4 py-2 text-sm font-semibold shadow-sm transition-all duration-200 ${selectedCategory === category.name ? 'bg-pink-500 text-white shadow-md' : 'border border-pink-100 bg-white text-gray-600 hover:bg-pink-100 hover:text-pink-600'}`}
            >
              {category.name}
            </button>
          ))}
        </div>

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
