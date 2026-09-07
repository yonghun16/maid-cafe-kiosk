// @owner: ai
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Product } from '@repo/types';
import { uploadProductImage } from '../../../entities/product';
import { useProductStore } from '../../../features/product-management';

interface EditProductFormProps {
  product: Product;
  onCancel: () => void;
}

export function EditProductForm({ product, onCancel }: EditProductFormProps) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(String(product.price));
  const [imageUrl, setImageUrl] = useState(product.imageUrl);
  const [category, setCategory] = useState<'coffee' | 'ade' | 'dessert'>(product.category);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const editProduct = useProductStore((state) => state.editProduct);

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
    if (!name || !price || !imageUrl) {
      toast.error('모든 필드를 입력해주세요.');
      return;
    }

    setIsSaving(true);
    const success = await editProduct(product._id, {
      name,
      price: Number(price),
      imageUrl,
      category,
    });
    setIsSaving(false);

    if (success) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-lg bg-pink-50 p-4">
      <div>
        <label htmlFor={`edit-name-${product._id}`} className="block text-sm font-medium text-gray-600">
          메뉴 이름
        </label>
        <input
          type="text"
          id={`edit-name-${product._id}`}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-pink-500 focus:outline-none focus:ring-pink-500"
        />
      </div>
      <div>
        <label htmlFor={`edit-price-${product._id}`} className="block text-sm font-medium text-gray-600">
          가격
        </label>
        <input
          type="number"
          id={`edit-price-${product._id}`}
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-pink-500 focus:outline-none focus:ring-pink-500"
        />
      </div>
      <div>
        <label htmlFor={`edit-image-${product._id}`} className="block text-sm font-medium text-gray-600">
          메뉴 이미지
        </label>
        <input
          type="file"
          id={`edit-image-${product._id}`}
          accept="image/*"
          onChange={handleImageChange}
          disabled={isUploadingImage}
          className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-pink-100 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-pink-600 hover:file:bg-pink-200"
        />
        {isUploadingImage && <p className="mt-1 text-sm text-gray-500">업로드 중...</p>}
        {!isUploadingImage && imageUrl && (
          <img src={imageUrl} alt="미리보기" className="mt-2 h-16 w-16 rounded-md object-cover" />
        )}
      </div>
      <div>
        <label htmlFor={`edit-category-${product._id}`} className="block text-sm font-medium text-gray-600">
          카테고리
        </label>
        <select
          id={`edit-category-${product._id}`}
          value={category}
          onChange={(e) => setCategory(e.target.value as 'coffee' | 'ade' | 'dessert')}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-pink-500 focus:outline-none focus:ring-pink-500"
        >
          <option value="coffee">커피</option>
          <option value="ade">에이드</option>
          <option value="dessert">디저트</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={isUploadingImage || isSaving}
          className="flex-1 rounded-md bg-pink-500 py-2 text-sm font-bold text-white transition-colors hover:bg-pink-600 disabled:bg-gray-300"
        >
          {isSaving ? '저장 중...' : '저장'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-md border border-gray-300 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100"
        >
          취소
        </button>
      </div>
    </form>
  );
}
