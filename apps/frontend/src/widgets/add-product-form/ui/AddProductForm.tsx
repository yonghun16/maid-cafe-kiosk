// @owner: ai
'use client';

import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { uploadProductImage } from '../../../entities/product';
import { useProductStore } from '../../../features/product-management';
import { useCategoryStore } from '../../../features/category-management';

interface AddProductFormProps {
  /** 메뉴 추가에 성공하면 호출됩니다 (모달을 닫는 용도 등). */
  onSuccess?: () => void;
}

export function AddProductForm({ onSuccess }: AddProductFormProps) {
  // ✅ 폼 입력값은 위젯 내부의 자체 상태로 관리합니다.
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [category, setCategory] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // ✅ 실제 상품을 추가하는 '기능'은 스토어에서 가져옵니다.
  const addProduct = useProductStore((state) => state.addProduct);

  // ✅ 카테고리 목록은 관리자가 자유롭게 추가/수정/삭제할 수 있어 서버에서 불러옵니다.
  const categories = useCategoryStore((state) => state.categories);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // ✅ 카테고리 목록이 도착하면 첫 번째 카테고리를 기본 선택값으로 씁니다.
  useEffect(() => {
    if (!category && categories[0]) {
      setCategory(categories[0].name);
    }
  }, [categories, category]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const url = await uploadProductImage(file);
      setImageUrl(url);
    } catch (error) {
      console.error('이미지 업로드 중 오류가 발생했습니다:', error);
      toast.error('이미지 업로드에 실패했습니다.');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !price || !imageUrl || !category) {
      toast.error('모든 필드를 입력해주세요.');
      return;
    }

    const success = await addProduct({ name, price: Number(price), imageUrl, category });

    // 성공적으로 추가되면 폼을 초기화합니다.
    if (success) {
      setName('');
      setPrice('');
      setImageUrl('');
      onSuccess?.();
    }
  };

  return (
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
        <label htmlFor="image" className="block text-sm font-medium text-gray-600">메뉴 이미지</label>
        <input
          type="file"
          id="image"
          accept="image/*"
          onChange={handleImageChange}
          disabled={isUploadingImage}
          className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-pink-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-pink-600 hover:file:bg-pink-100"
        />
        {isUploadingImage && <p className="mt-1 text-sm text-gray-500">업로드 중...</p>}
        {!isUploadingImage && imageUrl && (
          <img src={imageUrl} alt="미리보기" className="mt-2 h-20 w-20 rounded-md object-cover" />
        )}
      </div>
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-600">카테고리</label>
        {categories.length === 0 ? (
          <p className="mt-1 text-sm text-gray-500">
            먼저 위의 카테고리 목록에서 카테고리를 추가해주세요.
          </p>
        ) : (
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-pink-500 focus:border-pink-500"
          >
            {categories.map((c) => (
              <option key={c._id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        )}
      </div>
      <button
        type="submit"
        disabled={isUploadingImage || categories.length === 0}
        className="w-full bg-pink-500 text-white py-2 px-4 rounded-md font-bold hover:bg-pink-600 transition-colors disabled:bg-gray-300"
      >
        추가하기
      </button>
    </form>
  );
}
