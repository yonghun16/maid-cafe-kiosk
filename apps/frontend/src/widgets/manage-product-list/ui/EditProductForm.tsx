// @owner: ai
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import toast from 'react-hot-toast';
import type { Product, ProductOption } from '@repo/types';
import { uploadImage } from '../../../shared/api';
import { useProductStore } from '../../../features/product-management';
import { useCategoryStore } from '../../../features/category-management';
import { ProductOptionsEditor } from '../../../entities/product';

interface EditProductFormProps {
  product: Product;
  onCancel: () => void;
}

export function EditProductForm({ product, onCancel }: EditProductFormProps) {
  const [name, setName] = useState(product.name);
  const [price, setPrice] = useState(String(product.price));
  const [imageUrl, setImageUrl] = useState(product.imageUrl);
  const [category, setCategory] = useState(product.category);
  // ✅ 비워두면 이 메뉴는 재고를 추적하지 않는 상품이 됩니다([[재고관리]] 참고).
  const [stock, setStock] = useState(product.stock != null ? String(product.stock) : '');
  const [options, setOptions] = useState<ProductOption[]>(product.options ?? []);
  const [hasTemperatureOption, setHasTemperatureOption] = useState(product.hasTemperatureOption ?? false);
  const [hasMagicSpellOption, setHasMagicSpellOption] = useState(product.hasMagicSpellOption ?? false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const editProduct = useProductStore((state) => state.editProduct);

  // ✅ 카테고리 목록은 관리자가 자유롭게 추가/수정/삭제할 수 있어 서버에서 불러옵니다.
  const categories = useCategoryStore((state) => state.categories);
  const fetchCategories = useCategoryStore((state) => state.fetchCategories);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploadingImage(true);
    try {
      const url = await uploadImage(file);
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

    // 이름을 안 채운 옵션 줄은 저장하지 않습니다.
    const cleanedOptions = options.filter((option) => option.name.trim());

    setIsSaving(true);
    const success = await editProduct(product._id, {
      name,
      price: Number(price),
      imageUrl,
      category,
      ...(stock.trim() ? { stock: Number(stock) } : {}),
      options: cleanedOptions,
      hasTemperatureOption,
      hasMagicSpellOption,
    });
    setIsSaving(false);

    if (success) {
      onCancel();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          <div className="relative mt-2 h-16 w-16">
            <Image src={imageUrl} alt="미리보기" fill sizes="64px" className="rounded-md object-cover" />
          </div>
        )}
      </div>
      <div>
        <label htmlFor={`edit-category-${product._id}`} className="block text-sm font-medium text-gray-600">
          카테고리
        </label>
        <select
          id={`edit-category-${product._id}`}
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-pink-500 focus:outline-none focus:ring-pink-500"
        >
          {/* 상품이 이미 가리키던 카테고리가 삭제/변경돼 목록에 없을 수 있어, 그 경우엔 현재 값도 옵션으로 끼워 넣습니다. */}
          {!categories.some((c) => c.name === category) && (
            <option value={category}>{category}</option>
          )}
          {categories.map((c) => (
            <option key={c._id} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor={`edit-stock-${product._id}`} className="block text-sm font-medium text-gray-600">
          재고 수량 (선택)
        </label>
        <input
          type="number"
          id={`edit-stock-${product._id}`}
          min={0}
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          placeholder="비워두면 재고를 추적하지 않음"
          className="mt-1 block w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-pink-500 focus:outline-none focus:ring-pink-500"
        />
      </div>
      <ProductOptionsEditor
        options={options}
        onChange={setOptions}
        hasTemperatureOption={hasTemperatureOption}
        onTemperatureOptionChange={setHasTemperatureOption}
        hasMagicSpellOption={hasMagicSpellOption}
        onMagicSpellOptionChange={setHasMagicSpellOption}
        idPrefix={`edit-option-${product._id}`}
      />
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
