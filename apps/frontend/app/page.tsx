'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import type { Product, CartItem } from '@repo/types';
import ProductCard from '../components/ProductCard';

const API_URL = 'http://localhost:4000/api';

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/products`);
        setProducts(response.data);
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
    const loadingToast = toast.loading('주문을 처리 중입니다...'); // 로딩 중 토스트
    try {
      const orderData = {
        items: cart.map(item => ({
          productId: item._id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
        totalPrice: totalPrice,
      };
      await axios.post(`${API_URL}/orders`, orderData);
      
      toast.dismiss(loadingToast); // 로딩 중 토스트를 닫고
      toast.success('주문이 성공적으로 완료되었습니다!'); // 성공 토스트를 띄웁니다.
      
      setCart([]);
    } catch (error) {
      console.error('주문 처리 중 오류가 발생했습니다:', error);
      toast.dismiss(loadingToast); // 로딩 중 토스트를 닫고
      toast.error('주문 처리 중 오류가 발생했습니다.'); // 실패 토스트를 띄웁니다.
    }
  };

  // ... (return 부분의 JSX 코드는 이전과 동일합니다) ...
  return (
    <div className="container mx-auto p-4 flex font-sans bg-gray-50 min-h-screen">
      <div className="w-2/3 pr-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">☕ Maid Kiosk</h1>
        {isLoading ? (
          <p className="text-center text-gray-500">메뉴를 불러오는 중...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <ProductCard 
                key={product._id} 
                product={product} 
                onAddToCart={handleAddToCart} 
              />
            ))}
          </div>
        )}
      </div>

      <div className="w-1/3 border-l-2 border-gray-100 pl-6">
        <div className="sticky top-4">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">🛒 주문 목록</h2>
          <div className="space-y-3 mb-4 min-h-[200px] bg-white p-3 rounded-lg border">
            {cart.length === 0 ? (
              <p className="text-gray-400 text-center pt-20">장바구니가 비어있습니다.</p>
            ) : (
              cart.map(item => (
                <div key={item._id} className="flex justify-between items-center bg-pink-50 p-2 rounded-md">
                  <span className="font-medium">{item.name} x{item.quantity}</span>
                  <span className="font-semibold">{(item.price * item.quantity).toLocaleString()}원</span>
                </div>
              ))
            )}
          </div>
          <hr className="my-4" />
          <div className="mt-4">
            <div className="flex justify-between text-xl font-bold text-gray-800">
              <span>총 금액:</span>
              <span>{totalPrice.toLocaleString()}원</span>
            </div>
            <button
              onClick={handleOrder}
              className="w-full bg-pink-500 text-white p-3 rounded-lg mt-4 font-bold hover:bg-pink-600 transition-colors disabled:bg-gray-400"
              disabled={cart.length === 0}
            >
              주문하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
