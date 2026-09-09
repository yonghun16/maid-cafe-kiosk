// @owner: ai
import { create } from 'zustand';
import axios from 'axios';
import toast from 'react-hot-toast';
import type { Ad } from '@repo/types';
import { getAds, createAd, updateAd, deleteAdById } from '../../../entities/ad';

/**
 * 서버가 응답에 실어 보낸 에러 메시지를 꺼냅니다. 없으면 기본 메시지를 씁니다.
 */
function getErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error) && typeof error.response?.data?.message === 'string') {
    return error.response.data.message;
  }
  return fallback;
}

// 광고 관리 스토어의 타입 정의
interface AdState {
  ads: Ad[];
  isLoading: boolean;
  fetchAds: () => Promise<void>;
  addAd: (imageUrl: string) => Promise<boolean>;
  editAd: (adId: string, imageUrl: string) => Promise<boolean>;
  deleteAd: (adId: string) => Promise<void>;
}

export const useAdStore = create<AdState>((set, get) => ({
  ads: [],
  isLoading: true,

  fetchAds: async () => {
    set({ isLoading: true });
    try {
      const ads = await getAds();
      set({ ads, isLoading: false });
    } catch (error) {
      console.error('광고 목록을 불러오는 중 오류가 발생했습니다:', error);
      toast.error('광고 목록을 불러오는 데 실패했습니다.');
      set({ isLoading: false });
    }
  },

  addAd: async (imageUrl) => {
    try {
      await createAd(imageUrl);
      toast.success('새 광고를 추가했습니다!');
      get().fetchAds();
      return true;
    } catch (error) {
      console.error('광고 추가 중 오류가 발생했습니다:', error);
      toast.error(getErrorMessage(error, '광고 추가에 실패했습니다.'));
      return false;
    }
  },

  editAd: async (adId, imageUrl) => {
    try {
      await updateAd(adId, imageUrl);
      toast.success('광고 이미지를 교체했습니다!');
      get().fetchAds();
      return true;
    } catch (error) {
      console.error('광고 수정 중 오류가 발생했습니다:', error);
      toast.error(getErrorMessage(error, '광고 수정에 실패했습니다.'));
      return false;
    }
  },

  deleteAd: async (adId) => {
    if (!window.confirm('이 광고를 삭제하시겠습니까?')) {
      return;
    }
    try {
      await deleteAdById(adId);
      toast.success('광고를 삭제했습니다.');
      get().fetchAds();
    } catch (error) {
      console.error('광고 삭제 중 오류가 발생했습니다:', error);
      toast.error(getErrorMessage(error, '광고 삭제에 실패했습니다.'));
    }
  },
}));
