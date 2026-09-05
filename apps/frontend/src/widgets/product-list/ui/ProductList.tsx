// @owner: ai
'use client';

import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import type { Product } from '@repo/types';
import { ProductCard, getProducts } from '../../../entities/product';
import { useCartStore } from '../../../features/cart';

const CATEGORIES = ['all', 'coffee', 'ade', 'dessert'] as const;
type Category = typeof CATEGORIES[number];

export function ProductList() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  
  // ✅ Zustand 스토어에서 장바구니에 담는 함수만 가져옵니다.
  const addToCart = useCartStore((state) => state.addToCart);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const products = await getProducts();
        setAllProducts(products);
        setFilteredProducts(products);
      } catch (error) {
        console.error('상품 목록을 불러오는 중 오류가 발생했습니다:', error);
        toast.error('상품 목록을 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchProducts();
  }, []);

  useEffect(() => {
    if (selectedCategory === 'all') {
      setFilteredProducts(allProducts);
    } else {
      const filtered = allProducts.filter(product => product.category === selectedCategory);
      setFilteredProducts(filtered);
    }
  }, [selectedCategory, allProducts]);

  const getCategoryName = (category: Category) => {
    // ... (이전과 동일)
    switch (category) {
      case 'all': return '🎀 전체';
      case 'coffee': return '☕ 커피';
      case 'ade': return '🍹 에이드';
      case 'dessert': return '🍰 디저트';
      default: return '';
    }
  }

  return (
    <main className="w-full lg:w-2/3">
      <header className="mb-6">
        <h1 className="text-4xl font-bold text-pink-500">Maid Kiosk</h1>
        <p className="mt-1 text-gray-500">주인님, 무엇을 주문하시겠어요?</p>
      </header>
      
      <div className="mb-6 flex flex-wrap gap-2 border-b border-pink-200 pb-3">
        {CATEGORIES.map(category => (
          <button
            key={category}
            onClick={() => setSelectedCategory(category)}
            className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200 ${selectedCategory === category ? 'bg-pink-500 text-white shadow-md' : 'bg-white text-gray-500 hover:bg-pink-100 hover:text-pink-600'}`}
          >
            {getCategoryName(category)}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center"><p className="text-pink-500">메뉴를 불러오는 중...</p></div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
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
