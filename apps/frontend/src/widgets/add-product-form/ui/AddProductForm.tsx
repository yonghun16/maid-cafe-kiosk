// @owner: ai
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { useProductStore } from '../../../features/product-management';

export function AddProductForm() {
  // ✅ 폼 입력값은 위젯 내부의 자체 상태로 관리합니다.
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState<'coffee' | 'ade' | 'dessert'>('coffee');
  
  // ✅ 실제 상품을 추가하는 '기능'은 스토어에서 가져옵니다.
  const addProduct = useProductStore((state) => state.addProduct);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !imageUrl) {
      toast.error('모든 필드를 입력해주세요.');
      return;
    }

    const success = await addProduct({ name, price: Number(price), imageUrl, category });

    // 성공적으로 추가되면 폼을 초기화합니다.
    if (success) {
      setName('');
      setPrice('');
      setImageUrl('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg">
      <h2 className="text-2xl font-bold text-gray-700 mb-4">새 메뉴 추가</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
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
          <select id="category" value={category} onChange={(e) => setCategory(e.target.value as 'coffee' | 'ade' | 'dessert')} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500">
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
  );
}
