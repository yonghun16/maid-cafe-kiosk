'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import type { Product } from '@repo/types';

const API_URL = 'http://localhost:4000/api';

export default function AdminPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // 폼 입력을 위한 상태
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState<'coffee' | 'ade' | 'dessert'>('coffee');

  // 처음 페이지 로드 시 상품 목록을 가져옵니다.
  const fetchProducts = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get(`${API_URL}/products`);
      setProducts(response.data);
    } catch (error) {
      toast.error('상품 목록을 불러오는 데 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // 새 상품 추가 핸들러
  const handleAddProduct = async (e: React.FormEvent) => {
    e.preventDefault(); // 폼 제출 시 페이지가 새로고침되는 것을 방지
    if (!name || !price || !imageUrl) {
      return toast.error('모든 필드를 입력해주세요.');
    }

    const newProduct = {
      name,
      price: Number(price),
      imageUrl,
      category,
    };

    try {
      await axios.post(`${API_URL}/products`, newProduct);
      toast.success('새로운 상품을 추가했습니다!');
      // 폼 초기화
      setName('');
      setPrice('');
      setImageUrl('');
      // 상품 목록 다시 불러오기
      fetchProducts();
    } catch (error) {
      toast.error('상품 추가에 실패했습니다.');
    }
  };

  // 상품 삭제 핸들러
  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('정말로 이 상품을 삭제하시겠습니까?')) {
      return;
    }

    try {
      await axios.delete(`${API_URL}/products/${productId}`);
      toast.success('상품을 삭제했습니다.');
      // 상품 목록 다시 불러오기
      fetchProducts();
    } catch (error) {
      toast.error('상품 삭제에 실패했습니다.');
    }
  };

  return (
    <div className="container mx-auto p-8 font-sans">
      <h1 className="text-4xl font-bold text-pink-500 mb-8">🛠️ 관리자 페이지</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 새 상품 추가 폼 */}
        <div className="lg:col-span-1">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">새 메뉴 추가</h2>
            <form onSubmit={handleAddProduct} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-600">메뉴 이름</label>
                <input type="text" id="name" value={name} onChange={(e) => setName(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" />
              </div>
              <div>
                <label htmlFor="price" className="block text-sm font-medium text-gray-600">가격</label>
                <input type="number" id="price" value={price} onChange={(e) => setPrice(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" />
              </div>
              <div>
                <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-600">이미지 URL</label>
                <input type="text" id="imageUrl" value={imageUrl} onChange={(e) => setImageUrl(e.target.value)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500" />
              </div>
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-gray-600">카테고리</label>
                <select id="category" value={category} onChange={(e) => setCategory(e.target.value as any)} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500">
                  <option value="coffee">커피</option>
                  <option value="ade">에이드</option>
                  <option value="dessert">디저트</option>
                </select>
              </div>
              <button type="submit" className="w-full bg-pink-500 text-white py-2 px-4 rounded-md font-bold hover:bg-pink-600 transition-colors">
                추가하기
              </button>
            </form>
          </div>
        </div>

        {/* 기존 상품 목록 */}
        <div className="lg:col-span-2">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h2 className="text-2xl font-bold text-gray-700 mb-4">메뉴 목록</h2>
            <div className="space-y-3">
              {isLoading ? <p>로딩 중...</p> : products.map(product => (
                <div key={product._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-4">
                    <img src={product.imageUrl} alt={product.name} className="w-12 h-12 rounded-md object-cover" />
                    <div>
                      <p className="font-semibold">{product.name}</p>
                      <p className="text-sm text-gray-500">{product.price.toLocaleString()}원</p>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteProduct(product._id)} className="text-red-500 hover:text-red-700 font-semibold">
                    삭제
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
