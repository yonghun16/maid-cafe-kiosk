// @owner: ai
'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import type { Ad } from '@repo/types';
import { uploadImage } from '../../../shared/api';
import { useAdStore } from '../../../features/ad-management';

interface AdFormProps {
  /** 있으면 이 광고를 수정, 없으면 새로 추가합니다. */
  ad?: Ad;
  onSuccess: () => void;
}

export function AdForm({ ad, onSuccess }: AdFormProps) {
  const [imageUrl, setImageUrl] = useState(ad?.imageUrl ?? '');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const addAd = useAdStore((state) => state.addAd);
  const editAd = useAdStore((state) => state.editAd);

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
    if (!imageUrl) {
      toast.error('광고 이미지를 선택해주세요.');
      return;
    }

    setIsSaving(true);
    const success = ad ? await editAd(ad._id, imageUrl) : await addAd(imageUrl);
    setIsSaving(false);

    if (success) {
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="ad-image" className="block text-sm font-medium text-gray-600">
          광고 이미지
        </label>
        <input
          type="file"
          id="ad-image"
          accept="image/*"
          onChange={handleImageChange}
          disabled={isUploadingImage}
          className="mt-1 block w-full text-sm text-gray-600 file:mr-4 file:rounded-md file:border-0 file:bg-pink-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-pink-600 hover:file:bg-pink-100"
        />
        {isUploadingImage && <p className="mt-1 text-sm text-gray-500">업로드 중...</p>}
        {!isUploadingImage && imageUrl && (
          <img src={imageUrl} alt="미리보기" className="mt-2 h-32 w-full rounded-md object-cover" />
        )}
      </div>
      <button
        type="submit"
        disabled={isUploadingImage || isSaving || !imageUrl}
        className="w-full rounded-md bg-pink-500 py-2 px-4 font-bold text-white transition-colors hover:bg-pink-600 disabled:bg-gray-300"
      >
        {isSaving ? '저장 중...' : ad ? '저장' : '추가하기'}
      </button>
    </form>
  );
}
