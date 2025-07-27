// 파일: apps/frontend/app/page.tsx (수정)
// 역할: 전체 레이아웃을 2단으로 변경하고 반응형으로 만듭니다.

'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import type { Product, CartItem } from '@repo/types';
import ProductCard from '../components/ProductCard';

const API_URL = 'http://localhost:4000/api';
const CATEGORIES = ['all', 'coffee', 'ade', 'dessert'] as const;
type Category = typeof CATEGORIES[number];

export default function Home() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<Category>('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/products`);
        setAllProducts(response.data);
        setFilteredProducts(response.data);
      } catch (error) {
        console.error('상품 목록을 불러오는 데 실패했습니다:', error);
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

  useEffect(() => {
    const newTotalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotalPrice(newTotalPrice);
  }, [cart]);

  const handleAddToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === product._id);
      if (existingItem) {
        return prevCart.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...product, quantity: 1 }];
    });
    toast.success(`${product.name}을(를) 장바구니에 담았습니다!`);
  };

  const handleOrder = async () => {
    if (cart.length === 0) {
      toast.error('장바구니가 비어있습니다.');
      return;
    }
    const loadingToast = toast.loading('주문을 처리 중입니다...');
    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item._id, name: item.name, price: item.price, quantity: item.quantity,
        })),
        totalPrice: totalPrice,
      };
      await axios.post(`${API_URL}/orders`, orderData);
      toast.dismiss(loadingToast);
      toast.success('주문이 성공적으로 완료되었습니다!');
      setCart([]);
    } catch (error) {
      console.error('주문 처리 중 오류가 발생했습니다:', error);
      toast.dismiss(loadingToast);
      toast.error('주문 처리 중 오류가 발생했습니다.');
    }
  };
  
  const getCategoryName = (category: Category) => {
    switch (category) {
      case 'all': return '🎀 전체';
      case 'coffee': return '☕ 커피';
      case 'ade': return '🍹 에이드';
      case 'dessert': return '🍰 디저트';
      default: return '';
    }
  }


  // ✅ 이 return 부분이 핵심입니다.
  return (
    <div className="min-h-screen bg-pink-50 font-sans text-gray-700">
      {/* ✅ 레이아웃을 제어하는 컨테이너입니다.
        - flex: 자식 요소들을 가로 또는 세로로 정렬합니다.
        - flex-col: 기본적으로 세로로 정렬합니다 (모바일).
        - lg:flex-row: 화면이 넓어지면(lg) 가로로 정렬합니다 (데스크탑).
      */}
      <div className="container mx-auto flex flex-col lg:flex-row gap-8 p-4 lg:p-8">
        
        {/* ✅ 왼쪽: 메뉴 목록
          - w-full: 기본적으로 전체 너비를 차지합니다 (모바일).
          - lg:w-2/3: 화면이 넓어지면(lg) 너비의 2/3를 차지합니다.
        */}
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
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-200
                  ${selectedCategory === category 
                    ? 'bg-pink-500 text-white shadow-md' 
                    : 'bg-white text-gray-500 hover:bg-pink-100 hover:text-pink-600'
                  }`}
              >
                {getCategoryName(category)}
              </button>
            ))}
          </div>

          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <p className="text-pink-500">메뉴를 불러오는 중...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
              {filteredProducts.map(product => (
                <ProductCard 
                  key={product._id} 
                  product={product} 
                  onAddToCart={handleAddToCart} 
                />
              ))}
            </div>
          )}
        </main>

        {/* ✅ 오른쪽: 장바구니 및 주문
          - w-full: 기본적으로 전체 너비를 차지합니다 (모바일).
          - lg:w-1/3: 화면이 넓어지면(lg) 너비의 1/3을 차지합니다.
        */}
        <aside className="w-full lg:w-1/3">
          <div className="sticky top-8 rounded-xl bg-white p-6 shadow-lg">
            <h2 className="text-2xl font-bold text-pink-500">🛒 주문 목록</h2>
            <div className="mt-4 space-y-3 min-h-[200px] rounded-lg bg-pink-50 p-4">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-gray-400">
                  <p>장바구니가 비어있어요</p>
                  <p className="mt-1 text-sm">상품을 클릭해서 추가해주세요!</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item._id} className="flex items-center justify-between rounded-md bg-white p-3 shadow-sm">
                    <div>
                      <p className="font-semibold">{item.name}</p>
                      <p className="text-sm text-gray-500">{item.price.toLocaleString()}원 x {item.quantity}</p>
                    </div>
                    <p className="font-bold text-pink-500">{(item.price * item.quantity).toLocaleString()}원</p>
                  </div>
                ))
              )}
            </div>
            <div className="mt-6 border-t border-gray-200 pt-4">
              <div className="flex justify-between text-xl font-bold">
                <span>총 금액:</span>
                <span className="text-pink-600">{totalPrice.toLocaleString()}원</span>
              </div>
              <button
                onClick={handleOrder}
                className="mt-4 w-full rounded-lg bg-pink-500 py-3 text-lg font-bold text-white shadow-md transition-all hover:bg-pink-600 disabled:bg-gray-300 disabled:shadow-none"
                disabled={cart.length === 0}
              >
                주문하기
              </button>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
