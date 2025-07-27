'use client';

import { useState, useEffect } from 'react';
import axios from 'axios'; // API 통신을 위한 라이브러리
import type { Product, CartItem } from '@repo/types';

// 백엔드 API의 기본 주소
const API_URL = 'http://localhost:4000/api';

export default function Home() {
  // 1. 임시 데이터를 비우고, 빈 배열로 시작합니다.
  const [products, setProducts] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [isLoading, setIsLoading] = useState(true); // 로딩 상태 추가

  // 2. 페이지가 처음 렌더링될 때 백엔드에서 상품 목록을 가져옵니다.
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const response = await axios.get(`${API_URL}/products`);
        setProducts(response.data); // 서버에서 받은 데이터로 상태를 업데이트합니다.
      } catch (error) {
        console.error('상품 목록을 불러오는 데 실패했습니다:', error);
        alert('상품 목록을 불러오는 데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []); // []를 비워두면 컴포넌트가 처음 마운트될 때 한 번만 실행됩니다.

  // 3. 장바구니 상태가 바뀔 때마다 총액을 다시 계산합니다.
  useEffect(() => {
    const newTotalPrice = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);
    setTotalPrice(newTotalPrice);
  }, [cart]);

  // 4. 장바구니에 상품을 추가하는 함수
  const handleAddToCart = (product: Product) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(item => item._id === product._id);
      if (existingItem) {
        // 이미 카트에 있으면 수량만 1 증가
        return prevCart.map(item =>
          item._id === product._id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      // 카트에 없으면 새로 추가
      return [...prevCart, { ...product, quantity: 1 }];
    });
  };

  // 5. 주문하기 함수
  const handleOrder = async () => {
    if (cart.length === 0) {
      alert('장바구니가 비어있습니다.');
      return;
    }
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
      alert('주문이 성공적으로 완료되었습니다!');
      setCart([]); // 주문 후 장바구니 비우기
    } catch (error) {
      console.error('주문 처리 중 오류가 발생했습니다:', error);
      alert('주문 처리 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="container mx-auto p-4 flex font-sans bg-gray-50 min-h-screen">
      {/* 왼쪽: 메뉴 목록 */}
      <div className="w-2/3 pr-4">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">☕ Maid Kiosk</h1>
        {isLoading ? (
          <p className="text-center text-gray-500">메뉴를 불러오는 중...</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {products.map(product => (
              <div
                key={product._id}
                className="border rounded-xl p-4 flex flex-col items-center cursor-pointer hover:shadow-xl hover:-translate-y-1 transition-all bg-white"
                onClick={() => handleAddToCart(product)}
              >
                <img src={product.imageUrl} alt={product.name} className="w-32 h-32 object-cover mb-4 rounded-lg" />
                <div className="text-center">
                  <h3 className="text-lg font-semibold text-gray-700">{product.name}</h3>
                  <p className="text-gray-600 mt-1">{product.price.toLocaleString()}원</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 오른쪽: 장바구니 및 주문 */}
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
