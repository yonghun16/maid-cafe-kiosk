// @owner: ai
import { create } from 'zustand';
import toast from 'react-hot-toast';
import type { Ad } from '@repo/types';
import { getAds, createAd, updateAd, deleteAdById, reorderAds } from '../../../entities/ad';
import { getErrorMessage, reorderArray } from '../../../shared/lib';

// 광고 관리 스토어의 타입 정의
interface AdState {
  ads: Ad[];
  isLoading: boolean;
  fetchAds: () => Promise<void>;
  addAd: (imageUrl: string) => Promise<boolean>;
  editAd: (adId: string, imageUrl: string) => Promise<boolean>;
  deleteAd: (adId: string) => Promise<void>;
  /** ◀▶ 버튼 등으로 앞/뒤 광고와 순서를 바꿉니다. */
  moveAd: (adId: string, direction: 'up' | 'down') => Promise<void>;
  /**
   * 서버 호출 없이 화면 상태만 즉시 재배치합니다. 포인터 기반 드래그
   * 중 프레임마다 불러도 API가 매번 나가지 않도록 분리했고, 실제
   * 저장은 `commitAdOrder`가 드롭 시점에 한 번만 합니다.
   */
  reorderLocally: (adId: string, toIndex: number) => void;
  /** `reorderLocally`로 바뀐 현재 화면 순서를 서버에 저장합니다. */
  commitAdOrder: () => Promise<void>;
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

  moveAd: async (adId, direction) => {
    const { ads } = get();
    const index = ads.findIndex((a) => a._id === adId);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;

    const reordered = reorderArray(ads, adId, targetIndex);
    if (!reordered) return;

    // 낙관적 업데이트: 서버 응답을 기다리지 않고 화면부터 바꿔서 버튼에
    // 바로 반응하게 합니다. 실패하면 원래 목록을 다시 불러옵니다.
    set({ ads: reordered });
    try {
      await reorderAds(reordered.map((a) => a._id));
    } catch (error) {
      console.error('광고 순서 변경 중 오류가 발생했습니다:', error);
      toast.error(getErrorMessage(error, '광고 순서 변경에 실패했습니다.'));
      get().fetchAds();
    }
  },

  reorderLocally: (adId, toIndex) => {
    const reordered = reorderArray(get().ads, adId, toIndex);
    if (!reordered) return;
    set({ ads: reordered });
  },

  commitAdOrder: async () => {
    const { ads } = get();
    try {
      await reorderAds(ads.map((a) => a._id));
    } catch (error) {
      console.error('광고 순서 저장 중 오류가 발생했습니다:', error);
      toast.error(getErrorMessage(error, '광고 순서 변경에 실패했습니다.'));
      get().fetchAds();
    }
  },
}));
